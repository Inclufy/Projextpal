"""Lightweight REST API for the monitoring dashboard."""

import json
import logging
import threading
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler

from monitoring.storage.db import (
    get_recent_health_checks,
    get_active_alerts,
    get_recent_alerts,
    get_recent_recovery_actions,
    get_latest_system_metrics,
    get_uptime_percentage,
    get_avg_response_time,
    get_daily_summary,
    get_connection,
)

logger = logging.getLogger("monitor.api")

# Default port for the dashboard API
DEFAULT_PORT = 8555


def _row_to_dict(row):
    """Convert a sqlite3.Row to a plain dict."""
    if row is None:
        return None
    return dict(row)


def _rows_to_list(rows):
    """Convert a list of sqlite3.Row to a list of dicts."""
    return [dict(r) for r in rows]


def _get_system_metrics_history(hours=24, limit=500):
    """Get system metrics over time for charting."""
    since = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT timestamp, cpu_percent, memory_percent, disk_percent, disk_free_gb "
            "FROM system_metrics WHERE timestamp > ? ORDER BY timestamp ASC LIMIT ?",
            (since, limit),
        ).fetchall()
    return _rows_to_list(rows)


def _get_response_time_history(app_name, hours=24, limit=500):
    """Get response time history for an app."""
    since = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT timestamp, response_time_ms, status FROM health_checks "
            "WHERE app_name = ? AND timestamp > ? AND response_time_ms IS NOT NULL "
            "ORDER BY timestamp ASC LIMIT ?",
            (app_name, since, limit),
        ).fetchall()
    return _rows_to_list(rows)


def _get_app_configs():
    """Read app configs from config.yaml."""
    import yaml
    import os

    config_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "config.yaml"
    )
    try:
        with open(config_path, "r") as f:
            config = yaml.safe_load(f)
        return config.get("applications", [])
    except Exception:
        return []


class DashboardAPIHandler(BaseHTTPRequestHandler):
    """HTTP request handler for the monitoring dashboard API."""

    def log_message(self, format, *args):
        logger.debug(format, *args)

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/")

        routes = {
            "/api/status": self._handle_status,
            "/api/apps": self._handle_apps,
            "/api/alerts": self._handle_alerts,
            "/api/alerts/active": self._handle_active_alerts,
            "/api/recovery": self._handle_recovery,
            "/api/system": self._handle_system,
            "/api/system/history": self._handle_system_history,
            "/api/summary": self._handle_summary,
        }

        # Dynamic route: /api/apps/<name>/history
        if path.startswith("/api/apps/") and path.endswith("/history"):
            app_name = path[len("/api/apps/"):-len("/history")]
            app_name = app_name.replace("%20", " ")
            self._handle_app_history(app_name)
            return

        handler = routes.get(path)
        if handler:
            try:
                handler()
            except Exception as e:
                logger.error("API error on %s: %s", path, e, exc_info=True)
                self._send_json({"error": str(e)}, 500)
        else:
            self._send_json({"error": "Not found"}, 404)

    def _handle_status(self):
        """Overall system status overview."""
        apps = _get_app_configs()
        app_statuses = []

        for app in apps:
            if not app.get("enabled", True):
                continue
            name = app["name"]
            checks = get_recent_health_checks(name, limit=1)
            latest = _row_to_dict(checks[0]) if checks else None

            app_statuses.append({
                "name": name,
                "type": app.get("type", "web"),
                "status": latest["status"] if latest else "unknown",
                "response_time_ms": latest.get("response_time_ms") if latest else None,
                "last_check": latest["timestamp"] if latest else None,
                "uptime_24h": get_uptime_percentage(name, 24),
                "avg_response_1h": get_avg_response_time(name, 1),
            })

        active_alerts = _rows_to_list(get_active_alerts())
        system = _row_to_dict(get_latest_system_metrics())

        # Determine overall status
        statuses = [a["status"] for a in app_statuses]
        if any(s in ("down", "dead", "timeout", "error") for s in statuses):
            overall = "critical"
        elif any(s in ("slow", "degraded", "warning", "unhealthy") for s in statuses):
            overall = "degraded"
        elif all(s in ("healthy", "unknown") for s in statuses):
            overall = "healthy"
        else:
            overall = "unknown"

        self._send_json({
            "overall_status": overall,
            "timestamp": datetime.utcnow().isoformat(),
            "apps": app_statuses,
            "active_alerts_count": len(active_alerts),
            "system": system,
        })

    def _handle_apps(self):
        """Detailed app information."""
        apps = _get_app_configs()
        result = []
        for app in apps:
            if not app.get("enabled", True):
                continue
            name = app["name"]
            checks = _rows_to_list(get_recent_health_checks(name, limit=20))
            result.append({
                "name": name,
                "type": app.get("type", "web"),
                "url": app.get("url"),
                "container": app.get("container"),
                "uptime_24h": get_uptime_percentage(name, 24),
                "avg_response_1h": get_avg_response_time(name, 1),
                "recent_checks": checks,
            })
        self._send_json(result)

    def _handle_app_history(self, app_name):
        """Response time history for a specific app."""
        history = _get_response_time_history(app_name, hours=24)
        self._send_json(history)

    def _handle_alerts(self):
        """All recent alerts."""
        alerts = _rows_to_list(get_recent_alerts(limit=100))
        self._send_json(alerts)

    def _handle_active_alerts(self):
        """Active (unresolved) alerts only."""
        alerts = _rows_to_list(get_active_alerts())
        self._send_json(alerts)

    def _handle_recovery(self):
        """Recent recovery actions."""
        actions = _rows_to_list(get_recent_recovery_actions(limit=50))
        self._send_json(actions)

    def _handle_system(self):
        """Latest system metrics."""
        metrics = _row_to_dict(get_latest_system_metrics())
        self._send_json(metrics or {})

    def _handle_system_history(self):
        """System metrics history for charts."""
        history = _get_system_metrics_history(hours=24)
        self._send_json(history)

    def _handle_summary(self):
        """Daily summary statistics."""
        summary = get_daily_summary(hours=24)
        self._send_json(summary)


def start_api_server(port=DEFAULT_PORT, blocking=False):
    """Start the dashboard API server.

    Args:
        port: Port to listen on.
        blocking: If True, run in the current thread (blocks).
                  If False, run in a daemon thread.
    """
    server = HTTPServer(("0.0.0.0", port), DashboardAPIHandler)
    logger.info("Dashboard API server starting on port %d", port)

    if blocking:
        server.serve_forever()
    else:
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        return server
