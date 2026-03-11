"""Log file watcher — tails application logs for errors and anomalies."""

import os
import re
import time
import logging
import threading
from collections import defaultdict, deque
from datetime import datetime

logger = logging.getLogger("monitor.checkers.logs")

# Patterns to match in log files
ERROR_PATTERNS = [
    (re.compile(r"ERROR", re.IGNORECASE), "error"),
    (re.compile(r"CRITICAL", re.IGNORECASE), "critical"),
    (re.compile(r"Traceback \(most recent call last\)"), "traceback"),
    (re.compile(r"TimeoutError|ConnectionTimeout", re.IGNORECASE), "timeout"),
    (re.compile(r"ConnectionRefused|ConnectionReset|BrokenPipe", re.IGNORECASE), "connection"),
    (re.compile(r"OperationalError.*connection", re.IGNORECASE), "db_connection"),
    (re.compile(r"OOM|OutOfMemory|MemoryError", re.IGNORECASE), "memory"),
    (re.compile(r"PermissionError|403 Forbidden", re.IGNORECASE), "permission"),
    (re.compile(r"Internal Server Error|HTTP 5\d{2}", re.IGNORECASE), "server_error"),
]

# Spike detection: more than this many errors per minute triggers an alert
SPIKE_THRESHOLD = 10


class LogWatcher:
    """Watches log files for errors and rate spikes."""

    def __init__(self):
        self._watchers = {}  # app_name -> file position
        self._error_counts = defaultdict(lambda: deque(maxlen=200))  # app_name -> timestamps of errors
        self._recent_errors = defaultdict(lambda: deque(maxlen=50))  # app_name -> recent error lines
        self._lock = threading.Lock()

    def check_log_file(self, app_config):
        """
        Read new lines from an app's log file and detect errors.
        Returns dict with error count, spike detection, and recent errors.
        """
        app_name = app_config["name"]
        log_path = app_config.get("log_path", "")

        result = {
            "app_name": app_name,
            "check_type": "logs",
            "status": "healthy",
            "new_errors": 0,
            "error_rate_per_min": 0.0,
            "spike_detected": False,
            "recent_errors": [],
            "details": None,
        }

        if not log_path or not os.path.isfile(log_path):
            result["status"] = "skipped"
            result["details"] = f"Log file not found: {log_path}" if log_path else "No log path configured"
            return result

        try:
            with self._lock:
                # Track file position for incremental reading
                file_size = os.path.getsize(log_path)
                last_pos = self._watchers.get(app_name, 0)

                # If file was truncated/rotated, start from beginning
                if file_size < last_pos:
                    last_pos = 0

                if file_size == last_pos:
                    return result  # No new data

                with open(log_path, "r", errors="replace") as f:
                    f.seek(last_pos)
                    new_lines = f.readlines()
                    self._watchers[app_name] = f.tell()

            now = time.time()
            for line in new_lines:
                for pattern, error_type in ERROR_PATTERNS:
                    if pattern.search(line):
                        result["new_errors"] += 1
                        self._error_counts[app_name].append(now)
                        self._recent_errors[app_name].append({
                            "timestamp": datetime.now().isoformat(),
                            "type": error_type,
                            "line": line.strip()[:500],
                        })
                        break  # Only count each line once

            # Calculate error rate (errors in the last 60 seconds)
            one_min_ago = now - 60
            recent = [t for t in self._error_counts[app_name] if t > one_min_ago]
            result["error_rate_per_min"] = len(recent)

            if result["error_rate_per_min"] >= SPIKE_THRESHOLD:
                result["spike_detected"] = True
                result["status"] = "critical"
                result["details"] = f"Error rate spike: {result['error_rate_per_min']} errors/min"
                logger.error("%s: error rate spike: %d/min", app_name, result["error_rate_per_min"])
            elif result["new_errors"] > 0:
                result["status"] = "warning"
                result["details"] = f"{result['new_errors']} new errors detected"

            result["recent_errors"] = list(self._recent_errors[app_name])[-10:]

        except Exception as e:
            result["status"] = "error"
            result["details"] = f"Log watcher error: {e}"
            logger.error("%s: log watcher error: %s", app_name, e)

        return result

    def get_error_summary(self, app_name):
        """Get summary of recent errors for an app."""
        errors = list(self._recent_errors.get(app_name, []))
        type_counts = defaultdict(int)
        for err in errors:
            type_counts[err["type"]] += 1
        return {
            "total_recent": len(errors),
            "by_type": dict(type_counts),
            "latest": errors[-5:] if errors else [],
        }
