"""System resource monitoring for Mac Studio host."""

import logging
import platform

import psutil

from monitoring.storage.db import record_system_metrics

logger = logging.getLogger("monitor.checkers.system")


def check_system_resources(thresholds=None):
    """
    Check CPU, memory, disk, and load on the Mac Studio.
    Returns dict with current metrics and any threshold violations.
    """
    if thresholds is None:
        thresholds = {
            "cpu_warning": 80,
            "cpu_critical": 95,
            "memory_warning": 85,
            "memory_critical": 95,
            "disk_warning": 80,
            "disk_critical": 95,
        }

    result = {
        "status": "healthy",
        "cpu_percent": 0.0,
        "memory_percent": 0.0,
        "disk_percent": 0.0,
        "disk_free_gb": 0.0,
        "load_avg": (0.0, 0.0, 0.0),
        "warnings": [],
        "criticals": [],
    }

    try:
        # CPU
        result["cpu_percent"] = psutil.cpu_percent(interval=1)
        if result["cpu_percent"] >= thresholds["cpu_critical"]:
            result["criticals"].append(f"CPU at {result['cpu_percent']}%")
        elif result["cpu_percent"] >= thresholds["cpu_warning"]:
            result["warnings"].append(f"CPU at {result['cpu_percent']}%")

        # Memory
        mem = psutil.virtual_memory()
        result["memory_percent"] = mem.percent
        if mem.percent >= thresholds["memory_critical"]:
            result["criticals"].append(f"Memory at {mem.percent}% ({mem.available / (1024**3):.1f}GB free)")
        elif mem.percent >= thresholds["memory_warning"]:
            result["warnings"].append(f"Memory at {mem.percent}% ({mem.available / (1024**3):.1f}GB free)")

        # Disk
        disk = psutil.disk_usage("/")
        result["disk_percent"] = disk.percent
        result["disk_free_gb"] = round(disk.free / (1024**3), 1)
        if disk.percent >= thresholds["disk_critical"]:
            result["criticals"].append(f"Disk at {disk.percent}% ({result['disk_free_gb']}GB free)")
        elif disk.percent >= thresholds["disk_warning"]:
            result["warnings"].append(f"Disk at {disk.percent}% ({result['disk_free_gb']}GB free)")

        # Load average
        try:
            result["load_avg"] = psutil.getloadavg()
        except (AttributeError, OSError):
            result["load_avg"] = (0.0, 0.0, 0.0)

        # Determine overall status
        if result["criticals"]:
            result["status"] = "critical"
            logger.error("System critical: %s", "; ".join(result["criticals"]))
        elif result["warnings"]:
            result["status"] = "warning"
            logger.warning("System warning: %s", "; ".join(result["warnings"]))

        # Store metrics
        record_system_metrics(
            cpu_percent=result["cpu_percent"],
            memory_percent=result["memory_percent"],
            disk_percent=result["disk_percent"],
            disk_free_gb=result["disk_free_gb"],
            load_avg=result["load_avg"],
        )

    except Exception as e:
        result["status"] = "error"
        result["criticals"].append(f"Failed to collect system metrics: {e}")
        logger.error("System check error: %s", e)

    return result


def get_process_info():
    """Get top processes by CPU and memory usage."""
    processes = []
    for proc in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent"]):
        try:
            info = proc.info
            if info["cpu_percent"] is not None and info["cpu_percent"] > 0.1:
                processes.append(info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    processes.sort(key=lambda p: p.get("cpu_percent", 0), reverse=True)
    return processes[:15]


def get_system_info():
    """Get static system information."""
    return {
        "platform": platform.platform(),
        "processor": platform.processor(),
        "cpu_count": psutil.cpu_count(),
        "total_memory_gb": round(psutil.virtual_memory().total / (1024**3), 1),
        "total_disk_gb": round(psutil.disk_usage("/").total / (1024**3), 1),
    }
