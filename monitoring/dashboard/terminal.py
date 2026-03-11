"""Rich terminal dashboard for monitoring all applications."""

import time
import logging
from datetime import datetime

from rich.console import Console
from rich.layout import Layout
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.align import Align
from rich import box

from monitoring.storage.db import (
    get_recent_alerts,
    get_uptime_percentage,
    get_avg_response_time,
    get_latest_system_metrics,
    get_recent_recovery_actions,
)

logger = logging.getLogger("monitor.dashboard")

STATUS_STYLES = {
    "healthy": ("● UP", "bold green"),
    "slow": ("● SLOW", "bold yellow"),
    "degraded": ("● DEGRADED", "bold yellow"),
    "warning": ("▲ WARN", "bold yellow"),
    "unhealthy": ("● DOWN", "bold red"),
    "down": ("● DOWN", "bold red"),
    "dead": ("✖ DEAD", "bold red"),
    "timeout": ("● TIMEOUT", "bold red"),
    "error": ("● ERROR", "bold red"),
    "restarting": ("↻ RESTART", "bold cyan"),
    "starting": ("◐ START", "bold cyan"),
    "not_found": ("? MISSING", "bold magenta"),
    "skipped": ("- SKIP", "dim"),
    "unknown": ("? UNKNOWN", "dim"),
    "critical": ("● CRIT", "bold red"),
}


def _progress_bar(percent, width=20):
    """Create a text-based progress bar."""
    filled = int(width * percent / 100)
    empty = width - filled
    if percent >= 95:
        color = "red"
    elif percent >= 80:
        color = "yellow"
    else:
        color = "green"
    bar = f"[{color}]{'█' * filled}[/{color}]{'░' * empty}"
    return f"{bar} {percent:.0f}%"


class TerminalDashboard:
    """Live-updating terminal dashboard for monitoring."""

    def __init__(self, app_configs):
        self.console = Console()
        self.app_configs = [a for a in app_configs if a.get("enabled", True)]
        self._app_results = {}  # app_name -> latest check results
        self._running = False

    def update_app_result(self, app_name, check_type, result):
        """Update the latest result for an app check."""
        if app_name not in self._app_results:
            self._app_results[app_name] = {}
        self._app_results[app_name][check_type] = result

    def _build_header(self):
        """Build the header panel."""
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Determine overall status
        all_healthy = True
        any_critical = False
        for app_results in self._app_results.values():
            for result in app_results.values():
                status = result.get("status", "unknown")
                if status not in ("healthy", "skipped"):
                    all_healthy = False
                if status in ("down", "dead", "critical", "timeout"):
                    any_critical = True

        if any_critical:
            status_text = Text("● ISSUES DETECTED", style="bold red")
        elif all_healthy:
            status_text = Text("● ALL SYSTEMS OPERATIONAL", style="bold green")
        else:
            status_text = Text("▲ SOME WARNINGS", style="bold yellow")

        header = Table.grid(padding=1)
        header.add_row(
            Text("INCLUFY MONITORING AGENT", style="bold white"),
            Text(f"Mac Studio — {now}", style="dim"),
        )
        header.add_row(status_text, Text(""))

        return Panel(header, style="bold blue", box=box.DOUBLE)

    def _build_app_table(self):
        """Build the application status table."""
        table = Table(
            title="Applications",
            box=box.SIMPLE_HEAVY,
            show_lines=False,
            padding=(0, 1),
            expand=True,
        )
        table.add_column("Application", style="bold", min_width=22)
        table.add_column("Status", min_width=10)
        table.add_column("Response", justify="right", min_width=8)
        table.add_column("Uptime 24h", justify="right", min_width=10)
        table.add_column("Container", min_width=10)
        table.add_column("CPU", justify="right", min_width=6)
        table.add_column("MEM", justify="right", min_width=8)

        for app in self.app_configs:
            name = app["name"]
            results = self._app_results.get(name, {})

            # HTTP status
            http = results.get("http", {})
            docker_res = results.get("docker", {})

            http_status = http.get("status", "unknown")
            docker_status = docker_res.get("status", "unknown")

            # Use worst status between http and docker
            if http_status in ("down", "dead", "timeout", "error"):
                display_status = http_status
            elif docker_status in ("down", "dead", "not_found"):
                display_status = docker_status
            elif http_status != "healthy" and http_status != "unknown":
                display_status = http_status
            elif docker_status != "healthy" and docker_status != "unknown":
                display_status = docker_status
            else:
                display_status = http_status if http_status != "unknown" else docker_status

            status_text, style = STATUS_STYLES.get(display_status, ("? UNKNOWN", "dim"))

            # Response time
            resp_time = http.get("response_time_ms")
            resp_str = f"{resp_time:.0f}ms" if resp_time else "-"
            resp_style = ""
            if resp_time and resp_time > 1500:
                resp_style = "bold red"
            elif resp_time and resp_time > 1000:
                resp_style = "yellow"

            # Uptime
            uptime = get_uptime_percentage(name, 24)
            uptime_str = f"{uptime}%"
            uptime_style = "green" if uptime >= 99 else "yellow" if uptime >= 95 else "red"

            # Container info
            container_state = docker_res.get("container_state", "-")
            container_style = "green" if container_state == "running" else "red" if container_state else "dim"

            # Resource usage from docker stats
            cpu = docker_res.get("cpu_percent")
            cpu_str = f"{cpu:.1f}%" if cpu is not None else "-"
            mem_mb = docker_res.get("memory_mb")
            mem_str = f"{mem_mb:.0f}MB" if mem_mb is not None else "-"

            table.add_row(
                name,
                Text(status_text, style=style),
                Text(resp_str, style=resp_style),
                Text(uptime_str, style=uptime_style),
                Text(container_state or "-", style=container_style),
                cpu_str,
                mem_str,
            )

        return table

    def _build_system_panel(self):
        """Build system resources panel."""
        metrics = get_latest_system_metrics()

        if not metrics:
            return Panel("No system data yet", title="System Resources")

        cpu = metrics["cpu_percent"] or 0
        mem = metrics["memory_percent"] or 0
        disk = metrics["disk_percent"] or 0
        disk_free = metrics["disk_free_gb"] or 0

        grid = Table.grid(padding=(0, 2))
        grid.add_row(
            f"CPU:  {_progress_bar(cpu)}",
            f"MEM:  {_progress_bar(mem)}",
            f"DISK: {_progress_bar(disk)}  ({disk_free}GB free)",
        )

        return Panel(grid, title="System Resources — Mac Studio", box=box.SIMPLE)

    def _build_alerts_panel(self):
        """Build recent alerts panel."""
        alerts = get_recent_alerts(limit=8)

        if not alerts:
            return Panel(Text("No recent alerts", style="dim green"), title="Recent Alerts")

        table = Table(box=None, show_header=False, padding=(0, 1), expand=True)
        table.add_column("Time", style="dim", width=10)
        table.add_column("Sev", width=8)
        table.add_column("App", width=20)
        table.add_column("Message")

        severity_styles = {
            "INFO": "blue",
            "WARNING": "yellow",
            "CRITICAL": "bold red",
            "EMERGENCY": "bold magenta",
            "RESOLVED": "green",
        }

        for alert in alerts:
            ts = alert["timestamp"]
            if ts:
                try:
                    ts = datetime.fromisoformat(ts).strftime("%H:%M:%S")
                except (ValueError, TypeError):
                    ts = str(ts)[-8:]

            sev = alert["severity"]
            style = severity_styles.get(sev, "white")
            resolved = " ✓" if alert["resolved"] else ""

            table.add_row(
                ts,
                Text(sev, style=style),
                alert["app_name"] + resolved,
                (alert["message"] or "")[:60],
            )

        return Panel(table, title="Recent Alerts", box=box.SIMPLE)

    def _build_recovery_panel(self):
        """Build recent recovery actions panel."""
        actions = get_recent_recovery_actions(limit=5)

        if not actions:
            return Panel(Text("No recovery actions", style="dim"), title="Recovery Actions")

        table = Table(box=None, show_header=False, padding=(0, 1), expand=True)
        table.add_column("Time", style="dim", width=10)
        table.add_column("Status", width=4)
        table.add_column("App", width=20)
        table.add_column("Action")

        for action in actions:
            ts = action["timestamp"]
            if ts:
                try:
                    ts = datetime.fromisoformat(ts).strftime("%H:%M:%S")
                except (ValueError, TypeError):
                    ts = str(ts)[-8:]

            success = "✓" if action["success"] else "✗"
            style = "green" if action["success"] else "red"

            table.add_row(
                ts,
                Text(success, style=style),
                action["app_name"],
                (action["action"] or "")[:40],
            )

        return Panel(table, title="Recovery Actions", box=box.SIMPLE)

    def build_layout(self):
        """Build the full dashboard layout."""
        layout = Layout()
        layout.split_column(
            Layout(name="header", size=5),
            Layout(name="apps", ratio=3),
            Layout(name="system", size=4),
            Layout(name="bottom", ratio=2),
            Layout(name="footer", size=1),
        )
        layout["bottom"].split_row(
            Layout(name="alerts", ratio=2),
            Layout(name="recovery", ratio=1),
        )

        layout["header"].update(self._build_header())
        layout["apps"].update(self._build_app_table())
        layout["system"].update(self._build_system_panel())
        layout["alerts"].update(self._build_alerts_panel())
        layout["recovery"].update(self._build_recovery_panel())
        layout["footer"].update(
            Text("  [Q]uit  [R]efresh  Press Ctrl+C to exit", style="dim")
        )

        return layout

    def run(self, refresh_interval=5):
        """Run the live dashboard."""
        self._running = True
        try:
            with Live(self.build_layout(), console=self.console, refresh_per_second=1, screen=True) as live:
                while self._running:
                    time.sleep(refresh_interval)
                    live.update(self.build_layout())
        except KeyboardInterrupt:
            self._running = False
            self.console.print("\n[dim]Dashboard stopped.[/dim]")

    def stop(self):
        self._running = False

    def print_once(self):
        """Print the dashboard once (non-live mode)."""
        self.console.print(self.build_layout())
