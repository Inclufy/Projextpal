"""Docker container status checker."""

import logging
import time

try:
    import docker

    DOCKER_AVAILABLE = True
except ImportError:
    DOCKER_AVAILABLE = False

from monitoring.storage.db import record_health_check

logger = logging.getLogger("monitor.checkers.docker")

_client = None


def get_docker_client():
    global _client
    if _client is None and DOCKER_AVAILABLE:
        try:
            _client = docker.from_env()
            _client.ping()
        except Exception as e:
            logger.error("Failed to connect to Docker: %s", e)
            _client = None
    return _client


def check_container(app_config):
    """
    Check Docker container status for an application.
    Returns a dict with container state, health, restart count, and resource usage.
    """
    app_name = app_config["name"]
    container_name = app_config.get("container", "")

    result = {
        "app_name": app_name,
        "check_type": "docker",
        "status": "unknown",
        "details": None,
        "container_state": None,
        "restart_count": 0,
        "memory_mb": None,
        "cpu_percent": None,
    }

    if not DOCKER_AVAILABLE:
        result["status"] = "error"
        result["details"] = "Docker SDK not installed"
        return result

    if not container_name:
        result["status"] = "skipped"
        result["details"] = "No container name configured"
        return result

    client = get_docker_client()
    if not client:
        result["status"] = "error"
        result["details"] = "Cannot connect to Docker daemon"
        record_health_check(app_name, "docker", result["status"], details=result["details"])
        return result

    try:
        container = client.containers.get(container_name)
        state = container.status  # running, exited, restarting, paused, dead
        result["container_state"] = state

        attrs = container.attrs
        restart_count = attrs.get("RestartCount", 0)
        result["restart_count"] = restart_count

        # Check health status if available
        health = attrs.get("State", {}).get("Health", {})
        health_status = health.get("Status", "none")

        if state == "running":
            if health_status == "unhealthy":
                result["status"] = "unhealthy"
                result["details"] = "Container running but health check failing"
                logger.warning("%s: container unhealthy", app_name)
            elif health_status == "starting":
                result["status"] = "starting"
                result["details"] = "Container is starting up"
            else:
                result["status"] = "healthy"

            # Get resource usage
            try:
                stats = container.stats(stream=False)
                memory_usage = stats.get("memory_stats", {}).get("usage", 0)
                memory_limit = stats.get("memory_stats", {}).get("limit", 1)
                result["memory_mb"] = round(memory_usage / (1024 * 1024), 1)

                cpu_delta = stats.get("cpu_stats", {}).get("cpu_usage", {}).get("total_usage", 0) - \
                            stats.get("precpu_stats", {}).get("cpu_usage", {}).get("total_usage", 0)
                system_delta = stats.get("cpu_stats", {}).get("system_cpu_usage", 0) - \
                               stats.get("precpu_stats", {}).get("system_cpu_usage", 0)
                num_cpus = stats.get("cpu_stats", {}).get("online_cpus", 1) or 1
                if system_delta > 0:
                    result["cpu_percent"] = round((cpu_delta / system_delta) * num_cpus * 100, 1)
            except Exception:
                pass  # Stats unavailable, non-critical

        elif state == "exited":
            exit_code = attrs.get("State", {}).get("ExitCode", -1)
            result["status"] = "down"
            result["details"] = f"Container exited with code {exit_code}"
            logger.error("%s: container exited (code %d)", app_name, exit_code)

        elif state == "restarting":
            result["status"] = "restarting"
            result["details"] = f"Container is restarting (restart count: {restart_count})"
            logger.warning("%s: container restarting (count: %d)", app_name, restart_count)

        elif state == "dead":
            result["status"] = "dead"
            result["details"] = "Container is in dead state"
            logger.error("%s: container dead", app_name)

        else:
            result["status"] = "unknown"
            result["details"] = f"Unknown container state: {state}"

        if restart_count > 5:
            result["details"] = (result["details"] or "") + f" — HIGH restart count: {restart_count}"
            logger.warning("%s: high restart count: %d", app_name, restart_count)

    except docker.errors.NotFound:
        result["status"] = "not_found"
        result["details"] = f"Container '{container_name}' not found"
        logger.error("%s: container not found: %s", app_name, container_name)
    except docker.errors.APIError as e:
        result["status"] = "error"
        result["details"] = f"Docker API error: {str(e)}"
        logger.error("%s: Docker API error: %s", app_name, e)
    except Exception as e:
        result["status"] = "error"
        result["details"] = str(e)
        logger.error("%s: unexpected error: %s", app_name, e)

    record_health_check(app_name, "docker", result["status"], details=result["details"])
    return result


def list_all_containers():
    """List all Docker containers with their status."""
    client = get_docker_client()
    if not client:
        return []

    try:
        containers = client.containers.list(all=True)
        return [
            {
                "name": c.name,
                "status": c.status,
                "image": c.image.tags[0] if c.image.tags else "unknown",
            }
            for c in containers
        ]
    except Exception as e:
        logger.error("Failed to list containers: %s", e)
        return []
