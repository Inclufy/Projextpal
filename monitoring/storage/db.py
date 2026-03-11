"""SQLite storage for monitoring metrics, alerts, and recovery actions."""

import sqlite3
import os
import time
from datetime import datetime, timedelta
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "monitor.db")


def ensure_db_dir():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


@contextmanager
def get_connection():
    ensure_db_dir()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_connection() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS health_checks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL DEFAULT (datetime('now')),
                app_name TEXT NOT NULL,
                check_type TEXT NOT NULL,
                status TEXT NOT NULL,
                response_time_ms REAL,
                details TEXT,
                http_status INTEGER
            );

            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL DEFAULT (datetime('now')),
                app_name TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                details TEXT,
                resolved INTEGER NOT NULL DEFAULT 0,
                resolved_at TEXT,
                notified INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS recovery_actions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL DEFAULT (datetime('now')),
                app_name TEXT NOT NULL,
                action TEXT NOT NULL,
                success INTEGER NOT NULL,
                details TEXT
            );

            CREATE TABLE IF NOT EXISTS system_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL DEFAULT (datetime('now')),
                cpu_percent REAL,
                memory_percent REAL,
                disk_percent REAL,
                disk_free_gb REAL,
                load_avg TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_health_app_ts ON health_checks(app_name, timestamp);
            CREATE INDEX IF NOT EXISTS idx_alerts_app_ts ON alerts(app_name, timestamp);
            CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
            CREATE INDEX IF NOT EXISTS idx_system_ts ON system_metrics(timestamp);
        """)


def record_health_check(app_name, check_type, status, response_time_ms=None, details=None, http_status=None):
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO health_checks (app_name, check_type, status, response_time_ms, details, http_status) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (app_name, check_type, status, response_time_ms, details, http_status),
        )


def record_alert(app_name, severity, message, details=None):
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO alerts (app_name, severity, message, details) VALUES (?, ?, ?, ?)",
            (app_name, severity, message, details),
        )
        return conn.execute("SELECT last_insert_rowid()").fetchone()[0]


def resolve_alert(alert_id):
    with get_connection() as conn:
        conn.execute(
            "UPDATE alerts SET resolved = 1, resolved_at = datetime('now') WHERE id = ?",
            (alert_id,),
        )


def mark_alert_notified(alert_id):
    with get_connection() as conn:
        conn.execute("UPDATE alerts SET notified = 1 WHERE id = ?", (alert_id,))


def record_recovery_action(app_name, action, success, details=None):
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO recovery_actions (app_name, action, success, details) VALUES (?, ?, ?, ?)",
            (app_name, action, int(success), details),
        )


def record_system_metrics(cpu_percent, memory_percent, disk_percent, disk_free_gb, load_avg):
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO system_metrics (cpu_percent, memory_percent, disk_percent, disk_free_gb, load_avg) "
            "VALUES (?, ?, ?, ?, ?)",
            (cpu_percent, memory_percent, disk_percent, disk_free_gb, str(load_avg)),
        )


def get_recent_health_checks(app_name=None, limit=50):
    with get_connection() as conn:
        if app_name:
            return conn.execute(
                "SELECT * FROM health_checks WHERE app_name = ? ORDER BY timestamp DESC LIMIT ?",
                (app_name, limit),
            ).fetchall()
        return conn.execute(
            "SELECT * FROM health_checks ORDER BY timestamp DESC LIMIT ?", (limit,)
        ).fetchall()


def get_active_alerts(app_name=None):
    with get_connection() as conn:
        if app_name:
            return conn.execute(
                "SELECT * FROM alerts WHERE resolved = 0 AND app_name = ? ORDER BY timestamp DESC",
                (app_name,),
            ).fetchall()
        return conn.execute(
            "SELECT * FROM alerts WHERE resolved = 0 ORDER BY timestamp DESC"
        ).fetchall()


def get_recent_alerts(limit=50):
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?", (limit,)
        ).fetchall()


def get_recent_recovery_actions(limit=20):
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM recovery_actions ORDER BY timestamp DESC LIMIT ?", (limit,)
        ).fetchall()


def get_uptime_percentage(app_name, hours=24):
    with get_connection() as conn:
        since = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        total = conn.execute(
            "SELECT COUNT(*) FROM health_checks WHERE app_name = ? AND timestamp > ? AND check_type = 'http'",
            (app_name, since),
        ).fetchone()[0]
        if total == 0:
            return 100.0
        healthy = conn.execute(
            "SELECT COUNT(*) FROM health_checks WHERE app_name = ? AND timestamp > ? AND check_type = 'http' AND status = 'healthy'",
            (app_name, since),
        ).fetchone()[0]
        return round((healthy / total) * 100, 2)


def get_avg_response_time(app_name, hours=1):
    with get_connection() as conn:
        since = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        result = conn.execute(
            "SELECT AVG(response_time_ms) FROM health_checks "
            "WHERE app_name = ? AND timestamp > ? AND response_time_ms IS NOT NULL",
            (app_name, since),
        ).fetchone()[0]
        return round(result, 1) if result else 0.0


def get_latest_system_metrics():
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM system_metrics ORDER BY timestamp DESC LIMIT 1"
        ).fetchone()


def cleanup_old_data(retention_days=30):
    cutoff = (datetime.utcnow() - timedelta(days=retention_days)).isoformat()
    with get_connection() as conn:
        conn.execute("DELETE FROM health_checks WHERE timestamp < ?", (cutoff,))
        conn.execute("DELETE FROM system_metrics WHERE timestamp < ?", (cutoff,))
        conn.execute("DELETE FROM recovery_actions WHERE timestamp < ?", (cutoff,))
        conn.execute("DELETE FROM alerts WHERE resolved = 1 AND timestamp < ?", (cutoff,))
        conn.execute("VACUUM")


def get_daily_summary(hours=24):
    """Get summary stats for daily report."""
    with get_connection() as conn:
        since = (datetime.utcnow() - timedelta(hours=hours)).isoformat()

        total_checks = conn.execute(
            "SELECT COUNT(*) FROM health_checks WHERE timestamp > ?", (since,)
        ).fetchone()[0]

        failed_checks = conn.execute(
            "SELECT COUNT(*) FROM health_checks WHERE timestamp > ? AND status != 'healthy'",
            (since,),
        ).fetchone()[0]

        total_alerts = conn.execute(
            "SELECT COUNT(*) FROM alerts WHERE timestamp > ?", (since,)
        ).fetchone()[0]

        recovery_attempts = conn.execute(
            "SELECT COUNT(*) FROM recovery_actions WHERE timestamp > ?", (since,)
        ).fetchone()[0]

        recovery_successes = conn.execute(
            "SELECT COUNT(*) FROM recovery_actions WHERE timestamp > ? AND success = 1",
            (since,),
        ).fetchone()[0]

        app_uptimes = {}
        apps = conn.execute(
            "SELECT DISTINCT app_name FROM health_checks WHERE timestamp > ? AND check_type = 'http'",
            (since,),
        ).fetchall()
        for row in apps:
            app_uptimes[row["app_name"]] = get_uptime_percentage(row["app_name"], hours)

        return {
            "total_checks": total_checks,
            "failed_checks": failed_checks,
            "total_alerts": total_alerts,
            "recovery_attempts": recovery_attempts,
            "recovery_successes": recovery_successes,
            "app_uptimes": app_uptimes,
        }
