"""Alert manager with cooldown, escalation, and de-duplication."""

import time
import logging
from collections import defaultdict
from datetime import datetime

from monitoring.storage.db import record_alert, resolve_alert, mark_alert_notified, get_active_alerts
from monitoring.alerts.email_alert import send_alert_email

logger = logging.getLogger("monitor.alerts.manager")

SEVERITY_ORDER = {"INFO": 0, "WARNING": 1, "CRITICAL": 2, "EMERGENCY": 3}


class AlertManager:
    """Manages alert lifecycle: creation, cooldown, escalation, resolution, and notification."""

    def __init__(self, email_config, cooldown_seconds=300):
        self.email_config = email_config
        self.cooldown_seconds = cooldown_seconds
        self._last_alert_time = {}  # (app_name, message_key) -> timestamp
        self._failure_counts = defaultdict(int)  # (app_name, check_type) -> consecutive failures
        self._active_issues = {}  # (app_name, check_type) -> alert_id

    def _alert_key(self, app_name, message):
        """Create a dedup key from app name and message prefix."""
        return (app_name, message[:80])

    def _is_in_cooldown(self, key):
        """Check if we recently sent an alert for this key."""
        last_time = self._last_alert_time.get(key, 0)
        return (time.time() - last_time) < self.cooldown_seconds

    def process_check_result(self, app_name, check_type, result):
        """
        Process a check result and decide whether to alert.
        Handles escalation (3 consecutive failures → CRITICAL) and resolution.
        """
        status = result.get("status", "unknown")
        details = result.get("details")
        failure_key = (app_name, check_type)

        if status in ("healthy", "skipped"):
            # Clear failure count and resolve active alerts
            if self._failure_counts.get(failure_key, 0) > 0:
                self._failure_counts[failure_key] = 0
                if failure_key in self._active_issues:
                    alert_id = self._active_issues.pop(failure_key)
                    resolve_alert(alert_id)
                    self._send_resolution(app_name, check_type)
            return

        # Increment failure count
        self._failure_counts[failure_key] += 1
        count = self._failure_counts[failure_key]

        # Determine severity based on status and failure count
        if status in ("down", "dead", "timeout") or count >= 5:
            severity = "CRITICAL"
        elif status in ("unhealthy", "critical") or count >= 3:
            severity = "CRITICAL" if count >= 3 else "WARNING"
        elif status in ("slow", "degraded", "warning"):
            severity = "WARNING"
        else:
            severity = "INFO"

        # Escalate after repeated failures
        if count == 3 and severity == "WARNING":
            severity = "CRITICAL"
            details = f"[ESCALATED after {count} consecutive failures] {details or ''}"

        if count >= 10:
            severity = "EMERGENCY"
            details = f"[EMERGENCY — {count} consecutive failures] {details or ''}"

        message = f"{check_type} check {status}"
        self.trigger_alert(app_name, severity, message, details, check_type)

    def trigger_alert(self, app_name, severity, message, details=None, check_type=None):
        """Create an alert and send notification if not in cooldown."""
        key = self._alert_key(app_name, message)

        # Record in database regardless of cooldown
        alert_id = record_alert(app_name, severity, message, details)

        if check_type:
            self._active_issues[(app_name, check_type)] = alert_id

        # Check cooldown before sending notification
        if self._is_in_cooldown(key):
            logger.debug("Alert in cooldown, skipping notification: %s — %s", app_name, message)
            return

        # Send email notification
        sent = send_alert_email(self.email_config, app_name, severity, message, details)
        if sent:
            mark_alert_notified(alert_id)
            self._last_alert_time[key] = time.time()

        logger.info("Alert [%s] %s: %s — %s", severity, app_name, message, details or "")

    def _send_resolution(self, app_name, check_type):
        """Send a resolution notification."""
        message = f"{check_type} check recovered"
        key = self._alert_key(app_name, message)

        if self._is_in_cooldown(key):
            return

        send_alert_email(
            self.email_config, app_name, "RESOLVED",
            message, f"{app_name} {check_type} is back to healthy"
        )
        self._last_alert_time[key] = time.time()
        logger.info("Resolved: %s %s", app_name, check_type)

    def get_status_summary(self):
        """Get current alert status summary."""
        return {
            "active_issues": {
                f"{k[0]}:{k[1]}": v for k, v in self._active_issues.items()
            },
            "failure_counts": {
                f"{k[0]}:{k[1]}": v for k, v in self._failure_counts.items() if v > 0
            },
        }
