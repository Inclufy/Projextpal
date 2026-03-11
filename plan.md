# Monitoring Agent — Implementation Plan

## Overview
A 24/7 Python monitoring daemon that watches all applications (6 web apps + 3 mobile backends) deployed on a Mac Studio. It detects errors, bugs, disconnections, and timeouts before clients experience them.

## Decisions
- **Alerts**: Email notifications
- **Recovery**: Auto-recover minor issues, alert for critical ones (human approval)
- **Dashboard**: Rich terminal UI (like htop)
- **Check interval**: Every 30 seconds

---

## Phase 1 — Foundation & Configuration

### 1.1 Create `monitoring/` module at repo root
```
monitoring/
├── config.yaml              # Multi-app configuration
├── agent.py                 # Main daemon entry point
├── requirements.txt         # Dependencies
├── Dockerfile               # Containerized deployment option
├── checkers/                # Health check modules
├── alerts/                  # Alert system
├── recovery/                # Auto-recovery actions
├── dashboard/               # Terminal dashboard
└── storage/                 # Metrics persistence
```

### 1.2 Multi-app YAML configuration (`config.yaml`)
Define all 9 applications with:
- App name, type (web/mobile-backend), URL, port
- Health endpoint path
- Expected response time threshold (ms)
- Docker container name
- Log file paths
- Custom check intervals (override default 30s if needed)
- Recovery actions allowed (restart, clear-cache, none)
- Alert recipients

Example:
```yaml
global:
  check_interval: 30          # seconds
  alert_cooldown: 300         # 5 min between repeat alerts
  max_response_time: 2000     # ms
  email:
    smtp_host: smtp.gmail.com
    smtp_port: 587
    from: monitoring@inclufy.com
    recipients:
      - team@inclufy.com

applications:
  - name: ProjeXtPal API
    type: web
    url: http://localhost:8001
    health_endpoint: /api/health/
    container: projextpal-backend
    log_path: /var/log/projextpal/backend.log
    max_response_time: 1500
    recovery: auto

  - name: ProjeXtPal Frontend
    type: web
    url: http://localhost:80
    health_endpoint: /health
    container: projextpal-frontend
    recovery: auto

  - name: ProjeXtPal DB
    type: database
    container: projextpal-postgres
    recovery: restart

  - name: ProjeXtPal Redis
    type: cache
    container: projextpal-redis
    recovery: restart

  # ... (other 5 apps + 3 mobile backends added as deployed)
```

### 1.3 Dependencies (`requirements.txt`)
- `requests` — HTTP health checks
- `docker` — Docker SDK for container management
- `psutil` — System metrics (CPU, memory, disk)
- `rich` — Terminal dashboard UI
- `pyyaml` — Config parsing
- `schedule` — Task scheduling
- `sqlite3` — Built-in, metrics persistence
- `smtplib` — Built-in, email alerts
- `dataclasses` — Built-in, structured data

---

## Phase 2 — Health Checkers

### 2.1 HTTP Health Checker (`checkers/health.py`)
- Hit each app's health endpoint every 30s
- Track: status code, response time, response body
- Detect: timeouts (>2s), 5xx errors, connection refused, DNS failures
- Store results in SQLite for historical tracking

### 2.2 Docker Container Checker (`checkers/docker.py`)
- Monitor container status via Docker SDK
- Detect: stopped, restarting, OOMKilled, unhealthy
- Track: container uptime, restart count, memory/CPU usage
- Works with Docker Desktop on Mac Studio

### 2.3 System Resource Checker (`checkers/system.py`)
- CPU usage (alert if >85% sustained)
- Memory usage (alert if >90%)
- Disk space (alert if >85%)
- Network connectivity
- Mac Studio specific: monitor all containers' combined resource usage

### 2.4 Log Watcher (`checkers/logs.py`)
- Tail application log files in real-time
- Pattern matching for: ERROR, CRITICAL, Exception, Traceback, TimeoutError, ConnectionRefused
- Rate detection: alert if error rate spikes (>10 errors/minute)
- Track: error frequency, unique error types, first/last occurrence

### 2.5 SSL Certificate Checker (`checkers/ssl.py`)
- Check SSL certificate expiry for all HTTPS endpoints
- Alert 30 days before expiry (warning), 7 days (critical)
- Runs once per hour (not every 30s)

### 2.6 External Services Checker (`checkers/services.py`)
- Stripe API connectivity
- OpenAI API connectivity and rate limits
- Redis connection pool health
- PostgreSQL connection pool health
- WebSocket/Channels availability

---

## Phase 3 — Alert System

### 3.1 Email Alerts (`alerts/email.py`)
- Send HTML-formatted alert emails
- Include: app name, issue type, severity, timestamp, details
- Support: immediate alerts (critical) and digest summaries (warnings)

### 3.2 Alert Manager (`alerts/manager.py`)
- Severity levels: INFO, WARNING, CRITICAL, EMERGENCY
- Cooldown: don't repeat same alert within 5 minutes
- Escalation: WARNING after 3 consecutive failures → CRITICAL
- De-duplication: group similar alerts
- Resolution notifications: "App X is back online"

---

## Phase 4 — Auto-Recovery

### 4.1 Recovery Actions (`recovery/actions.py`)
**Auto-recover (no approval needed):**
- Restart crashed Docker containers (max 3 attempts, then alert)
- Clear stale Redis connections
- Restart Gunicorn workers on high memory usage

**Alert only (human approval):**
- Database connection pool exhaustion
- Disk space critical (>95%)
- Repeated container crashes (>3 in 10 minutes)
- SSL certificate expiry
- External service failures (Stripe, OpenAI)

### 4.2 Recovery logging
- Log every recovery action taken
- Track success/failure of recovery attempts
- Include in daily summary report

---

## Phase 5 — Terminal Dashboard

### 5.1 Rich Terminal UI (`dashboard/terminal.py`)
Using the `rich` library to build a live-updating terminal dashboard:

```
╔══════════════════════════════════════════════════════════════╗
║           INCLUFY MONITORING AGENT — Mac Studio             ║
║                   ● ALL SYSTEMS OPERATIONAL                 ║
╠══════════════════════════════════════════════════════════════╣
║ APP                    STATUS    RESP    UPTIME    CONTAINER║
║ ─────────────────────────────────────────────────────────── ║
║ ProjeXtPal API         ● UP     142ms   99.9%     running  ║
║ ProjeXtPal Frontend    ● UP      38ms   99.9%     running  ║
║ App 2 API              ● UP     201ms   99.8%     running  ║
║ App 2 Frontend          ● UP      45ms   99.9%     running  ║
║ ...                                                         ║
╠══════════════════════════════════════════════════════════════╣
║ SYSTEM RESOURCES (Mac Studio)                               ║
║ CPU: ████████░░ 78%   MEM: ██████░░░░ 62%   DISK: ████░░ 41%║
╠══════════════════════════════════════════════════════════════╣
║ RECENT ALERTS                                               ║
║ [12:34:01] ⚠ App2 API response time >1500ms (1823ms)       ║
║ [12:30:15] ✓ ProjeXtPal Redis recovered (auto-restart)     ║
║ [12:28:42] ● App3 Backend container restarted               ║
╠══════════════════════════════════════════════════════════════╣
║ [Q]uit  [R]efresh  [D]etail  [A]lerts  [L]ogs              ║
╚══════════════════════════════════════════════════════════════╝
```

- Live refresh every 5 seconds
- Color-coded status (green=UP, yellow=SLOW, red=DOWN)
- Interactive: press keys to view details, logs, alert history
- Scrollable alert history

---

## Phase 6 — Metrics & Persistence

### 6.1 SQLite Database (`storage/db.py`)
Tables:
- `health_checks` — timestamp, app, status, response_time
- `alerts` — timestamp, app, severity, message, resolved
- `recovery_actions` — timestamp, app, action, success
- `system_metrics` — timestamp, cpu, memory, disk

### 6.2 Data Retention
- Keep detailed metrics for 30 days
- Keep daily summaries for 1 year
- Auto-cleanup old data

### 6.3 Daily Summary Email
- Sent every morning at 8:00 AM
- Includes: uptime %, incidents, recovery actions, resource trends

---

## Phase 7 — Backend Integration

### 7.1 Activate Performance Middleware
- Register `PerformanceLoggingMiddleware` in Django settings
- This enables response time tracking on all API requests

### 7.2 Add Django LOGGING Configuration
- Structured JSON logging to files
- Separate log files: application, error, security, performance
- Log rotation (10MB max, keep 5 backups)

### 7.3 Health Endpoint Enhancements
- Add WebSocket health check
- Add external service connectivity check (Stripe, OpenAI)
- Add worker count and queue depth metrics

---

## Implementation Order
1. **Phase 1** — Foundation (config, entry point, project structure)
2. **Phase 2** — Core checkers (health, docker, system)
3. **Phase 3** — Alert system (email + manager)
4. **Phase 4** — Auto-recovery with safety guards
5. **Phase 5** — Terminal dashboard
6. **Phase 6** — Metrics persistence + daily reports
7. **Phase 7** — Backend integration (logging, middleware)

Each phase is self-contained and testable independently.

---

## How to Run
```bash
# Direct
cd monitoring && python agent.py

# With Docker
docker compose -f docker-compose.monitoring.yml up -d

# View dashboard
python agent.py --dashboard

# Run in background (daemon mode)
python agent.py --daemon --log /var/log/inclufy/monitor.log
```
