"""Auto-recovery actions with safety guards."""

import time
import logging
from collections import defaultdict

from monitoring.storage.db import record_recovery_action

logger = logging.getLogger("monitor.recovery")

try:
    import docker

    DOCKER_AVAILABLE = True
except ImportError:
    DOCKER_AVAILABLE = False


class RecoveryManager:
    """Handles auto-recovery with rate limiting and safety guards."""

    def __init__(self, config):
        self.enabled = config.get("auto_recovery_enabled", True)
        self.max_attempts = config.get("max_restart_attempts", 3)
        self.cooldown = config.get("restart_cooldown", 60)
        self._attempt_counts = defaultdict(int)  # (app, action) -> count
        self._last_attempt_time = {}  # (app, action) -> timestamp
        self._docker_client = None

    def _get_docker_client(self):
        if self._docker_client is None and DOCKER_AVAILABLE:
            try:
                self._docker_client = docker.from_env()
            except Exception as e:
                logger.error("Failed to connect to Docker: %s", e)
        return self._docker_client

    def _is_in_cooldown(self, app_name, action):
        key = (app_name, action)
        last = self._last_attempt_time.get(key, 0)
        return (time.time() - last) < self.cooldown

    def _can_attempt(self, app_name, action):
        """Check if we can attempt this recovery (within limits and cooldown)."""
        if not self.enabled:
            return False, "Auto-recovery disabled"

        key = (app_name, action)
        if self._attempt_counts[key] >= self.max_attempts:
            return False, f"Max attempts ({self.max_attempts}) reached — needs manual intervention"

        if self._is_in_cooldown(app_name, action):
            return False, "Recovery in cooldown period"

        return True, "OK"

    def attempt_recovery(self, app_name, app_config, check_result):
        """
        Decide and execute recovery based on check result.
        Returns dict with action taken, success, and details.
        """
        recovery_mode = app_config.get("recovery", "none")
        app_type = app_config.get("type", "web")
        status = check_result.get("status", "")

        result = {
            "app_name": app_name,
            "action": "none",
            "success": False,
            "details": None,
            "needs_manual": False,
        }

        if recovery_mode == "none":
            result["details"] = "Recovery disabled for this app"
            return result

        # Determine appropriate action
        if status in ("down", "dead", "not_found"):
            action = "restart_container"
        elif status == "timeout":
            action = "restart_container"
        elif status == "unhealthy" and app_type == "cache":
            action = "restart_container"
        elif status == "restarting":
            # Already restarting, don't interfere
            result["details"] = "Container is already restarting"
            return result
        elif recovery_mode == "auto" and status in ("slow", "degraded"):
            # For auto-recovery apps, try restart on degraded status after multiple failures
            action = "restart_container"
        else:
            result["needs_manual"] = True
            result["details"] = f"Status '{status}' requires manual investigation"
            return result

        # Check if we can attempt this action
        can, reason = self._can_attempt(app_name, action)
        if not can:
            result["needs_manual"] = True
            result["details"] = reason
            logger.warning("%s: recovery blocked — %s", app_name, reason)
            return result

        # Execute the recovery action
        if action == "restart_container":
            return self._restart_container(app_name, app_config.get("container", ""))
        elif action == "clear_cache":
            return self._clear_redis_cache(app_name, app_config)

        return result

    def _restart_container(self, app_name, container_name):
        """Restart a Docker container."""
        result = {
            "app_name": app_name,
            "action": "restart_container",
            "success": False,
            "details": None,
            "needs_manual": False,
        }

        key = (app_name, "restart_container")
        self._attempt_counts[key] += 1
        self._last_attempt_time[key] = time.time()

        if not container_name:
            result["details"] = "No container name configured"
            result["needs_manual"] = True
            record_recovery_action(app_name, "restart_container", False, "No container name")
            return result

        client = self._get_docker_client()
        if not client:
            result["details"] = "Cannot connect to Docker daemon"
            result["needs_manual"] = True
            record_recovery_action(app_name, "restart_container", False, "Docker unavailable")
            return result

        try:
            container = client.containers.get(container_name)
            logger.info("%s: restarting container '%s' (attempt %d/%d)",
                        app_name, container_name, self._attempt_counts[key], self.max_attempts)

            container.restart(timeout=30)

            # Wait briefly and verify
            time.sleep(5)
            container.reload()
            if container.status == "running":
                result["success"] = True
                result["details"] = f"Container restarted successfully (attempt {self._attempt_counts[key]})"
                logger.info("%s: container restarted successfully", app_name)
            else:
                result["details"] = f"Container restarted but status is '{container.status}'"
                logger.warning("%s: container restart — status: %s", app_name, container.status)

        except docker.errors.NotFound:
            result["details"] = f"Container '{container_name}' not found"
            result["needs_manual"] = True
        except docker.errors.APIError as e:
            result["details"] = f"Docker API error: {e}"
            result["needs_manual"] = True
        except Exception as e:
            result["details"] = f"Restart failed: {e}"
            result["needs_manual"] = True

        record_recovery_action(app_name, "restart_container", result["success"], result["details"])
        return result

    def _clear_redis_cache(self, app_name, app_config):
        """Flush stale Redis connections (for cache-type apps)."""
        result = {
            "app_name": app_name,
            "action": "clear_cache",
            "success": False,
            "details": None,
            "needs_manual": False,
        }

        # For safety, just restart the Redis container instead of flushing data
        container_name = app_config.get("container", "")
        return self._restart_container(app_name, container_name)

    def reset_attempts(self, app_name):
        """Reset attempt counters for an app (called when health recovers)."""
        keys_to_reset = [k for k in self._attempt_counts if k[0] == app_name]
        for key in keys_to_reset:
            self._attempt_counts[key] = 0

    def get_status(self):
        """Get current recovery status."""
        return {
            "enabled": self.enabled,
            "attempt_counts": {
                f"{k[0]}:{k[1]}": v for k, v in self._attempt_counts.items() if v > 0
            },
        }
