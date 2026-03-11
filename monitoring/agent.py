#!/usr/bin/env python3
"""
Inclufy Monitoring Agent — 24/7 application monitoring daemon.

Monitors all applications deployed on Mac Studio for errors, bugs,
disconnections, and timeouts. Sends email alerts and auto-recovers
from minor issues.

Usage:
    python agent.py                    # Run with terminal dashboard
    python agent.py --daemon           # Run in background (no dashboard)
    python agent.py --check            # Run a single check cycle and exit
    python agent.py --status           # Print current status and exit
    python agent.py --config path.yaml # Use custom config file
"""

import argparse
import logging
import os
import signal
import sys
import threading
import time
from datetime import datetime

import yaml
import schedule

# Add parent directory to path so monitoring package can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from monitoring.storage.db import init_db, cleanup_old_data, get_daily_summary
from monitoring.checkers.health import check_http_health, check_redis_health
from monitoring.checkers.docker_checker import check_container
from monitoring.checkers.system import check_system_resources, get_system_info
from monitoring.checkers.logs import LogWatcher
from monitoring.checkers.ssl import check_ssl_certificate
from monitoring.checkers.services import check_all_services
from monitoring.alerts.manager import AlertManager
from monitoring.alerts.email_alert import send_daily_summary_email
from monitoring.recovery.actions import RecoveryManager
from monitoring.dashboard.terminal import TerminalDashboard
from monitoring.dashboard.api import start_api_server


def load_config(config_path=None):
    """Load and validate configuration."""
    if config_path is None:
        config_path = os.path.join(os.path.dirname(__file__), "config.yaml")

    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    # Resolve environment variables in email config
    email = config.get("global", {}).get("email", {})
    for key in ("username", "password", "smtp_host", "from_address"):
        val = email.get(key, "")
        if isinstance(val, str) and val.startswith("${") and val.endswith("}"):
            env_var = val[2:-1]
            email[key] = os.environ.get(env_var, "")

    return config


def setup_logging(log_level="INFO", log_file=None):
    """Configure logging."""
    handlers = [logging.StreamHandler()]
    if log_file:
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        handlers.append(logging.FileHandler(log_file))

    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=handlers,
    )


class MonitoringAgent:
    """Main monitoring agent that orchestrates all checks."""

    def __init__(self, config):
        self.config = config
        self.global_config = config.get("global", {})
        self.apps = [a for a in config.get("applications", []) if a.get("enabled", True)]
        self.check_interval = self.global_config.get("check_interval", 30)

        # Initialize components
        self.alert_manager = AlertManager(
            email_config=self.global_config.get("email", {}),
            cooldown_seconds=self.global_config.get("alert_cooldown", 300),
        )
        self.recovery_manager = RecoveryManager(self.global_config.get("recovery", {}))
        self.log_watcher = LogWatcher()
        self.dashboard = TerminalDashboard(self.apps)

        self._running = False
        self._check_count = 0
        self._ssl_check_counter = 0
        self._service_check_counter = 0
        self._startup_grace_cycles = self.global_config.get("startup_grace_cycles", 3)

        self.logger = logging.getLogger("monitor.agent")

    def run_check_cycle(self):
        """Run a complete check cycle across all applications."""
        self._check_count += 1
        self.logger.debug("Starting check cycle #%d", self._check_count)

        # System resources (every cycle)
        thresholds = self.global_config.get("system_thresholds", {})
        sys_result = check_system_resources(thresholds)
        if sys_result["status"] != "healthy":
            for warning in sys_result.get("warnings", []):
                self.alert_manager.trigger_alert("Mac Studio", "WARNING", warning)
            for critical in sys_result.get("criticals", []):
                self.alert_manager.trigger_alert("Mac Studio", "CRITICAL", critical)

        # Per-app checks
        for app in self.apps:
            app_name = app["name"]
            app_type = app.get("type", "web")

            # HTTP health check (web and mobile-backend types)
            if app_type in ("web", "mobile-backend") and app.get("url"):
                result = check_http_health(app)
                self.dashboard.update_app_result(app_name, "http", result)
                self.alert_manager.process_check_result(app_name, "http", result)

                # Auto-recovery if needed (skip during startup grace period)
                if result["status"] not in ("healthy", "slow", "skipped"):
                    if self._check_count > self._startup_grace_cycles:
                        recovery = self.recovery_manager.attempt_recovery(app_name, app, result)
                        if recovery["needs_manual"]:
                            self.alert_manager.trigger_alert(
                                app_name, "CRITICAL",
                                f"Manual intervention needed: {recovery['details']}",
                            )
                    else:
                        self.logger.info("%s: skipping recovery (startup grace period, cycle %d/%d)",
                                         app_name, self._check_count, self._startup_grace_cycles)
                elif result["status"] == "healthy":
                    self.recovery_manager.reset_attempts(app_name)

            # Redis health check
            if app_type == "cache" and app.get("url"):
                result = check_redis_health(app)
                self.dashboard.update_app_result(app_name, "http", result)
                self.alert_manager.process_check_result(app_name, "redis", result)

                if result["status"] not in ("healthy", "skipped"):
                    if self._check_count > self._startup_grace_cycles:
                        recovery = self.recovery_manager.attempt_recovery(app_name, app, result)
                        if recovery["needs_manual"]:
                            self.alert_manager.trigger_alert(
                                app_name, "CRITICAL",
                                f"Manual intervention needed: {recovery['details']}",
                            )
                    else:
                        self.logger.info("%s: skipping recovery (startup grace period)",
                                         app_name)

            # Docker container check
            if app.get("container"):
                result = check_container(app)
                self.dashboard.update_app_result(app_name, "docker", result)
                self.alert_manager.process_check_result(app_name, "docker", result)

                if result["status"] in ("down", "dead", "not_found"):
                    if self._check_count > self._startup_grace_cycles:
                        recovery = self.recovery_manager.attempt_recovery(app_name, app, result)
                        if recovery["needs_manual"]:
                            self.alert_manager.trigger_alert(
                                app_name, "CRITICAL",
                                f"Container recovery failed: {recovery['details']}",
                            )
                    else:
                        self.logger.info("%s: skipping recovery (startup grace period)",
                                         app_name)

            # Log file check
            if app.get("log_path"):
                result = self.log_watcher.check_log_file(app)
                if result["spike_detected"]:
                    self.alert_manager.trigger_alert(
                        app_name, "CRITICAL",
                        f"Error rate spike: {result['error_rate_per_min']} errors/min",
                        details="\n".join(
                            e.get("line", "") for e in result.get("recent_errors", [])[-5:]
                        ),
                    )
                elif result["new_errors"] > 0:
                    self.alert_manager.process_check_result(app_name, "logs", result)

        # SSL checks (every ~60 cycles = ~30 minutes)
        self._ssl_check_counter += 1
        if self._ssl_check_counter >= 60:
            self._ssl_check_counter = 0
            for app in self.apps:
                if app.get("url", "").startswith("https://"):
                    result = check_ssl_certificate(app)
                    self.alert_manager.process_check_result(app["name"], "ssl", result)

        # External service checks (every ~10 cycles = ~5 minutes)
        self._service_check_counter += 1
        if self._service_check_counter >= 10:
            self._service_check_counter = 0
            service_config = {
                "stripe_api_key": os.environ.get("STRIPE_SECRET_KEY"),
                "openai_api_key": os.environ.get("OPENAI_API_KEY"),
            }
            results = check_all_services(service_config)
            for result in results:
                if result["status"] not in ("healthy", "skipped"):
                    self.alert_manager.trigger_alert(
                        f"External:{result['service']}", "WARNING",
                        f"{result['service']} — {result['status']}: {result.get('details', '')}",
                    )

        self.logger.debug("Check cycle #%d complete", self._check_count)

    def send_daily_summary(self):
        """Send daily summary email."""
        summary = get_daily_summary(hours=24)
        email_config = self.global_config.get("email", {})
        send_daily_summary_email(email_config, summary)
        self.logger.info("Daily summary sent")

    def cleanup_data(self):
        """Clean up old monitoring data."""
        retention = self.global_config.get("data_retention_days", 30)
        cleanup_old_data(retention)
        self.logger.info("Old data cleaned up (retention: %d days)", retention)

    def start(self, daemon=False):
        """Start the monitoring agent."""
        self.logger.info("Inclufy Monitoring Agent starting...")
        self.logger.info("Monitoring %d applications every %ds", len(self.apps), self.check_interval)
        self.logger.info("System: %s", get_system_info())

        self._running = True

        # Schedule daily tasks
        summary_hour = self.global_config.get("daily_summary_hour", 8)
        schedule.every().day.at(f"{summary_hour:02d}:00").do(self.send_daily_summary)
        schedule.every().day.at("03:00").do(self.cleanup_data)

        # Set up signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

        if daemon:
            self._run_daemon()
        else:
            self._run_with_dashboard()

    def _run_daemon(self):
        """Run in daemon mode (no dashboard)."""
        self.logger.info("Running in daemon mode")

        # Start the dashboard API server in a background thread
        api_port = self.global_config.get("dashboard_api_port", 8555)
        try:
            start_api_server(port=api_port)
            self.logger.info("Dashboard API available on port %d", api_port)
        except Exception as e:
            self.logger.warning("Could not start dashboard API: %s", e)

        while self._running:
            try:
                self.run_check_cycle()
                schedule.run_pending()
            except Exception as e:
                self.logger.error("Check cycle error: %s", e, exc_info=True)
            time.sleep(self.check_interval)

        self.logger.info("Agent stopped")

    def _run_with_dashboard(self):
        """Run with terminal dashboard."""
        # Run checks in a background thread
        def check_loop():
            while self._running:
                try:
                    self.run_check_cycle()
                    schedule.run_pending()
                except Exception as e:
                    self.logger.error("Check cycle error: %s", e, exc_info=True)
                time.sleep(self.check_interval)

        check_thread = threading.Thread(target=check_loop, daemon=True)
        check_thread.start()

        # Run an initial check immediately
        try:
            self.run_check_cycle()
        except Exception as e:
            self.logger.error("Initial check error: %s", e)

        # Run dashboard in main thread
        try:
            self.dashboard.run(refresh_interval=5)
        except KeyboardInterrupt:
            pass
        finally:
            self._running = False
            self.logger.info("Agent stopped")

    def _signal_handler(self, signum, frame):
        self.logger.info("Received signal %d, shutting down...", signum)
        self._running = False
        self.dashboard.stop()

    def print_status(self):
        """Print current status (single check, no loop)."""
        self.run_check_cycle()
        self.dashboard.print_once()


def main():
    parser = argparse.ArgumentParser(
        description="Inclufy Monitoring Agent — 24/7 application monitoring",
    )
    parser.add_argument("--config", "-c", help="Path to config file", default=None)
    parser.add_argument("--daemon", "-d", action="store_true", help="Run in daemon mode (no dashboard)")
    parser.add_argument("--check", action="store_true", help="Run single check cycle and exit")
    parser.add_argument("--status", "-s", action="store_true", help="Print current status and exit")
    parser.add_argument("--log-file", help="Log file path")
    parser.add_argument("--log-level", default="INFO", help="Log level (DEBUG, INFO, WARNING, ERROR)")

    args = parser.parse_args()

    # Load config
    config = load_config(args.config)

    # Setup logging
    log_level = args.log_level or config.get("global", {}).get("log_level", "INFO")
    setup_logging(log_level, args.log_file)

    # Initialize database
    init_db()

    # Create and run agent
    agent = MonitoringAgent(config)

    if args.check:
        agent.run_check_cycle()
        print("Check cycle complete.")
    elif args.status:
        agent.print_status()
    else:
        agent.start(daemon=args.daemon)


if __name__ == "__main__":
    main()
