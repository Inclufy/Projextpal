"""Lightweight REST API for the monitoring dashboard."""

import json
import logging
import os
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

# Path to static dashboard files
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")


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


def _load_dashboard_html():
    """Load the dashboard HTML from static file."""
    html_path = os.path.join(STATIC_DIR, "index.html")
    try:
        with open(html_path, "r") as f:
            return f.read()
    except FileNotFoundError:
        return "<html><body><h1>Dashboard not found</h1><p>Missing: " + html_path + "</p></body></html>"


# Keep embedded HTML as fallback (empty — static file is used)
DASHBOARD_HTML = _load_dashboard_html()

_LEGACY_DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Inclufy Platform Monitoring</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#0a0a14;--bg2:#12121f;--bg3:#1a1a2e;--bg4:#222240;
    --text:#e2e8f0;--text2:#94a3b8;--text3:#64748b;
    --purple:#8B5CF6;--pink:#D946EF;--green:#22C55E;--green2:#16a34a;
    --red:#EF4444;--amber:#F59E0B;--blue:#3B82F6;--cyan:#06B6D4;
    --border:#1e1e3a;
  }
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}

  /* Header */
  .header{background:linear-gradient(135deg,var(--bg2),var(--bg3));border-bottom:1px solid var(--border);padding:16px 32px;display:flex;align-items:center;justify-content:space-between}
  .logo-area{display:flex;align-items:center;gap:14px}
  .logo-icon{width:44px;height:44px;background:linear-gradient(135deg,var(--purple),var(--pink));border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:white;letter-spacing:-1px}
  .logo-text{font-size:22px;font-weight:700;letter-spacing:-0.5px}
  .logo-text .highlight{background:linear-gradient(135deg,var(--purple),var(--pink));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .logo-text .sub{font-size:11px;color:var(--text3);font-weight:400;letter-spacing:2px;display:block;margin-top:2px;text-transform:uppercase}
  .header-right{display:flex;align-items:center;gap:16px}
  .overall-badge{display:flex;align-items:center;gap:10px;padding:10px 20px;border-radius:12px;font-weight:600;font-size:14px}
  .overall-badge.healthy{background:rgba(34,197,94,0.12);color:var(--green);border:1px solid rgba(34,197,94,0.25)}
  .overall-badge.degraded{background:rgba(245,158,11,0.12);color:var(--amber);border:1px solid rgba(245,158,11,0.25)}
  .overall-badge.critical{background:rgba(239,68,68,0.12);color:var(--red);border:1px solid rgba(239,68,68,0.25)}
  .overall-badge.unknown{background:rgba(100,116,139,0.12);color:var(--text3);border:1px solid rgba(100,116,139,0.25)}
  .pulse{width:10px;height:10px;border-radius:50%;animation:pulse 2s infinite}
  .pulse.healthy{background:var(--green);box-shadow:0 0 8px var(--green)}
  .pulse.degraded{background:var(--amber);box-shadow:0 0 8px var(--amber)}
  .pulse.critical{background:var(--red);box-shadow:0 0 8px var(--red)}
  .pulse.unknown{background:var(--text3)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  .server-badge{display:inline-flex;align-items:center;gap:6px;background:var(--bg3);padding:4px 12px 4px 8px;border-radius:8px;font-size:11px;color:var(--text2);border:1px solid var(--border)}
  .server-badge .dot{width:6px;height:6px;border-radius:50%;background:var(--green)}
  .last-update{font-size:12px;color:var(--text3)}

  /* Layout */
  .main{max-width:1400px;margin:0 auto;padding:24px 32px}
  .grid{display:grid;gap:20px}
  .grid-4{grid-template-columns:repeat(4,1fr)}
  .grid-2{grid-template-columns:repeat(2,1fr)}
  .grid-3{grid-template-columns:repeat(3,1fr)}

  /* Tabs */
  .tab-bar{display:flex;gap:4px;background:var(--bg2);padding:4px;border-radius:12px;border:1px solid var(--border);margin-bottom:24px;width:fit-content}
  .tab{padding:8px 18px;border-radius:8px;font-size:13px;font-weight:500;color:var(--text3);cursor:pointer;transition:all 0.2s;border:none;background:none}
  .tab.active{background:var(--purple);color:white}
  .tab:hover:not(.active){color:var(--text);background:var(--bg3)}

  /* Cards */
  .card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:24px;transition:border-color 0.2s}
  .card:hover{border-color:var(--bg4)}
  .card-title{font-size:13px;color:var(--text2);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;display:flex;align-items:center;gap:8px}
  .card-title svg{width:16px;height:16px;opacity:0.6}
  .stat-value{font-size:32px;font-weight:700;letter-spacing:-1px}
  .stat-label{font-size:12px;color:var(--text3);margin-top:4px}

  /* App Cards */
  .app-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
  .app-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:0;overflow:hidden;transition:all 0.2s}
  .app-card:hover{border-color:var(--purple);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}
  .app-card-header{padding:20px 24px 16px;display:flex;align-items:flex-start;justify-content:space-between}
  .app-card-info{flex:1}
  .app-card-name{font-size:18px;font-weight:700;margin-bottom:4px}
  .app-card-type{font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px}
  .app-card-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:0 24px 16px}
  .app-metric{text-align:center}
  .app-metric-value{font-size:20px;font-weight:700}
  .app-metric-label{font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px}

  /* Status pills */
  .status-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600}
  .status-pill.healthy{background:rgba(34,197,94,0.12);color:var(--green)}
  .status-pill.unhealthy,.status-pill.down,.status-pill.dead,.status-pill.error{background:rgba(239,68,68,0.12);color:var(--red)}
  .status-pill.slow,.status-pill.degraded,.status-pill.warning{background:rgba(245,158,11,0.12);color:var(--amber)}
  .status-pill.unknown{background:rgba(100,116,139,0.12);color:var(--text3)}
  .status-dot{width:7px;height:7px;border-radius:50%;background:currentColor}

  /* Container list inside app card */
  .container-list{border-top:1px solid var(--border);padding:12px 24px;background:var(--bg3)}
  .container-list-title{font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
  .container-row{display:flex;align-items:center;justify-content:space-between;padding:6px 0;font-size:13px}
  .container-row:not(:last-child){border-bottom:1px solid rgba(255,255,255,0.04)}
  .container-name{color:var(--text2);display:flex;align-items:center;gap:8px}
  .container-role{font-size:10px;color:var(--text3);background:var(--bg);padding:2px 8px;border-radius:4px}
  .container-status{display:flex;align-items:center;gap:6px}
  .container-dot{width:6px;height:6px;border-radius:50%}
  .container-dot.healthy{background:var(--green)}
  .container-dot.down,.container-dot.dead,.container-dot.error,.container-dot.not_found{background:var(--red)}
  .container-dot.unknown{background:var(--text3)}
  .container-dot.restarting{background:var(--amber)}

  /* Progress bars */
  .progress-bar{height:8px;background:var(--bg);border-radius:4px;overflow:hidden;margin-top:8px}
  .progress-fill{height:100%;border-radius:4px;transition:width 0.5s}
  .progress-fill.green{background:linear-gradient(90deg,var(--green),var(--green2))}
  .progress-fill.amber{background:linear-gradient(90deg,var(--amber),#d97706)}
  .progress-fill.red{background:linear-gradient(90deg,var(--red),#dc2626)}
  .sys-metric{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
  .sys-metric-label{font-size:13px;color:var(--text2)}
  .sys-metric-value{font-size:13px;font-weight:600}

  /* Alerts & Recovery */
  .alert-row{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-radius:10px;background:var(--bg3);margin-bottom:8px}
  .alert-sev{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;white-space:nowrap;min-width:70px;text-align:center}
  .alert-sev.CRITICAL,.alert-sev.EMERGENCY{background:rgba(239,68,68,0.15);color:var(--red)}
  .alert-sev.WARNING{background:rgba(245,158,11,0.15);color:var(--amber)}
  .alert-sev.INFO{background:rgba(59,130,246,0.15);color:var(--blue)}
  .alert-sev.RESOLVED{background:rgba(34,197,94,0.15);color:var(--green)}
  .alert-msg{font-size:13px;color:var(--text2);flex:1}
  .alert-app{font-size:12px;font-weight:600;color:var(--text)}
  .alert-time{font-size:11px;color:var(--text3);white-space:nowrap}
  .recovery-row{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;background:var(--bg3);margin-bottom:8px}
  .recovery-icon{font-size:16px}
  .recovery-info{flex:1}
  .recovery-action{font-size:13px;font-weight:500}
  .recovery-app{font-size:11px;color:var(--text3)}

  /* Section titles */
  .section-title{font-size:18px;font-weight:700;margin:28px 0 16px;display:flex;align-items:center;gap:10px}
  .section-title::after{content:'';flex:1;height:1px;background:var(--border)}
  .empty-state{text-align:center;padding:32px;color:var(--text3);font-size:13px}

  /* Footer */
  .footer{text-align:center;padding:24px;color:var(--text3);font-size:12px;border-top:1px solid var(--border);margin-top:40px}
  .footer a{color:var(--purple);text-decoration:none}

  /* App color accents */
  .app-accent-projextpal{border-top:3px solid var(--purple)}
  .app-accent-finance{border-top:3px solid var(--green)}
  .app-accent-marketing{border-top:3px solid var(--pink)}
  .app-accent-iqhelix{border-top:3px solid var(--cyan)}
  .app-accent-default{border-top:3px solid var(--blue)}

  @media(max-width:1024px){.grid-4{grid-template-columns:repeat(2,1fr)}.grid-3,.app-cards{grid-template-columns:1fr}}
  @media(max-width:768px){.grid-4,.grid-2,.grid-3,.app-cards{grid-template-columns:1fr}.header{flex-direction:column;gap:12px;text-align:center}}
</style>
</head>
<body>

<div class="header">
  <div class="logo-area">
    <div class="logo-icon">I</div>
    <div class="logo-text">
      <span class="highlight">Inclufy</span> Monitoring
      <span class="sub">Platform Health Dashboard</span>
    </div>
  </div>
  <div class="header-right">
    <div class="server-badge"><span class="dot"></span> Mac Studio</div>
    <div id="overallBadge" class="overall-badge unknown">
      <span class="pulse unknown" id="pulseIndicator"></span>
      <span id="overallText">Loading...</span>
    </div>
    <div class="last-update">Updated: <span id="lastUpdate">--</span></div>
  </div>
</div>

<div class="main">
  <div class="tab-bar">
    <button class="tab active" onclick="showTab('overview')">Overview</button>
    <button class="tab" onclick="showTab('alerts')">Alerts</button>
    <button class="tab" onclick="showTab('system')">System</button>
    <button class="tab" onclick="showTab('recovery')">Recovery</button>
  </div>

  <!-- OVERVIEW TAB -->
  <div id="tab-overview">
    <div class="grid grid-4" id="statsCards"></div>
    <div class="section-title">Applications</div>
    <div class="app-cards" id="appCards"></div>
    <div class="section-title">System Resources</div>
    <div class="grid grid-3" id="systemMetrics"></div>
  </div>

  <!-- ALERTS TAB -->
  <div id="tab-alerts" style="display:none">
    <div class="section-title">Active Alerts</div>
    <div id="activeAlerts"></div>
    <div class="section-title">Recent Alerts</div>
    <div id="recentAlerts"></div>
  </div>

  <!-- SYSTEM TAB -->
  <div id="tab-system" style="display:none">
    <div class="section-title">System Metrics History (24h)</div>
    <div class="card" id="systemHistory">
      <div class="empty-state">Loading metrics history...</div>
    </div>
  </div>

  <!-- RECOVERY TAB -->
  <div id="tab-recovery" style="display:none">
    <div class="section-title">Recent Recovery Actions</div>
    <div id="recoveryActions"></div>
  </div>
</div>

<div class="footer">
  <p>&copy; 2026 <a href="#">Inclufy</a> &mdash; Platform Monitoring v2.0</p>
</div>

<script>
const API = '';
let currentTab = 'overview';

function showTab(tab) {
  document.querySelectorAll('[id^=tab-]').forEach(el => el.style.display = 'none');
  document.getElementById('tab-' + tab).style.display = 'block';
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  event.target.classList.add('active');
  currentTab = tab;
  if (tab === 'alerts') fetchAlerts();
  if (tab === 'system') fetchSystemHistory();
  if (tab === 'recovery') fetchRecovery();
}

function statusLabel(s) {
  const map = {healthy:'Operational',unhealthy:'Down',down:'Down',dead:'Dead',slow:'Slow',
    degraded:'Degraded',warning:'Warning',error:'Error',timeout:'Timeout',unknown:'Waiting',
    restarting:'Restarting',critical:'Critical',not_found:'Not Found'};
  return map[s] || s;
}

function timeAgo(ts) {
  if (!ts) return '--';
  const d = new Date(ts.replace(' ','T')+'Z');
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
}

function formatTime(ts) {
  if (!ts) return '--';
  try {
    const d = new Date(ts.replace(' ','T')+'Z');
    return d.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  } catch(e) { return ts.slice(-8); }
}

function progressColor(val) {
  if (val >= 90) return 'red';
  if (val >= 75) return 'amber';
  return 'green';
}

function uptimeColor(val) {
  if (val >= 99) return 'var(--green)';
  if (val >= 95) return 'var(--amber)';
  return 'var(--red)';
}

function appAccentClass(name) {
  const n = name.toLowerCase();
  if (n.includes('projext')) return 'app-accent-projextpal';
  if (n.includes('finance')) return 'app-accent-finance';
  if (n.includes('marketing')) return 'app-accent-marketing';
  if (n.includes('helix') || n.includes('iq')) return 'app-accent-iqhelix';
  return 'app-accent-default';
}

async function fetchStatus() {
  try {
    const r = await fetch(API + '/api/status');
    const d = await r.json();
    updateOverall(d);
    updateStats(d);
    updateAppCards(d.apps);
    updateSystemCards(d.system);
    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('en-GB');
  } catch(e) { console.error('fetch status error', e); }
}

function updateOverall(d) {
  const badge = document.getElementById('overallBadge');
  const pulse = document.getElementById('pulseIndicator');
  const text = document.getElementById('overallText');
  const s = d.overall_status;
  badge.className = 'overall-badge ' + s;
  pulse.className = 'pulse ' + s;
  const labels = {healthy:'All Systems Operational',degraded:'Performance Degraded',critical:'Systems Critical',unknown:'Initializing...'};
  text.textContent = labels[s] || s;
}

function updateStats(d) {
  const apps = d.apps || [];
  const healthy = apps.filter(a => a.status === 'healthy').length;
  const totalContainers = apps.reduce((sum, a) => sum + (a.containers || []).length, 0);
  const healthyContainers = apps.reduce((sum, a) => sum + (a.containers || []).filter(c => c.status === 'healthy').length, 0);
  const sys = d.system || {};
  const html = `
    <div class="card">
      <div class="card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>Applications</div>
      <div class="stat-value" style="color:${healthy === apps.length ? 'var(--green)' : 'var(--amber)'}">${healthy}/${apps.length}</div>
      <div class="stat-label">Healthy applications</div>
    </div>
    <div class="card">
      <div class="card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M8 12h8M12 8v8"/></svg>Containers</div>
      <div class="stat-value" style="color:${healthyContainers === totalContainers ? 'var(--green)' : 'var(--amber)'}">${healthyContainers}/${totalContainers}</div>
      <div class="stat-label">Healthy containers</div>
    </div>
    <div class="card">
      <div class="card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Active Alerts</div>
      <div class="stat-value" style="color:${d.active_alerts_count > 0 ? 'var(--red)' : 'var(--text3)'}">${d.active_alerts_count}</div>
      <div class="stat-label">${d.active_alerts_count === 0 ? 'No active alerts' : 'Require attention'}</div>
    </div>
    <div class="card">
      <div class="card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>CPU / Memory</div>
      <div class="stat-value" style="font-size:24px"><span style="color:${sys.cpu_percent > 80 ? 'var(--red)' : 'var(--green)'}">${sys.cpu_percent ? sys.cpu_percent.toFixed(0) + '%' : '--'}</span> <span style="font-size:16px;color:var(--text3)">/</span> <span style="color:${sys.memory_percent > 85 ? 'var(--red)' : 'var(--green)'}">${sys.memory_percent ? sys.memory_percent.toFixed(0) + '%' : '--'}</span></div>
      <div class="stat-label">Processor / RAM usage</div>
    </div>`;
  document.getElementById('statsCards').innerHTML = html;
}

function updateAppCards(apps) {
  const container = document.getElementById('appCards');
  let html = '';

  for (const app of apps) {
    const accent = appAccentClass(app.name);
    const respTime = app.response_time_ms ? app.response_time_ms.toFixed(0) + 'ms' : '--';
    const uptime = app.uptime_24h !== null && app.uptime_24h !== undefined ? app.uptime_24h.toFixed(1) + '%' : '--';
    const avg = app.avg_response_1h ? app.avg_response_1h.toFixed(0) + 'ms' : '--';

    let containerHtml = '';
    if (app.containers && app.containers.length > 0) {
      containerHtml = '<div class="container-list"><div class="container-list-title">Containers</div>';
      for (const c of app.containers) {
        containerHtml += `<div class="container-row">
          <div class="container-name">
            <span class="container-dot ${c.status}"></span>
            ${c.name}
            <span class="container-role">${c.role}</span>
          </div>
          <div class="container-status" style="font-size:12px;color:var(--text3)">${statusLabel(c.status)}</div>
        </div>`;
      }
      containerHtml += '</div>';
    }

    html += `<div class="app-card ${accent}">
      <div class="app-card-header">
        <div class="app-card-info">
          <div class="app-card-name">${app.name}</div>
          <div class="app-card-type">${app.type}${app.group ? ' &middot; ' + app.group : ''}</div>
        </div>
        <span class="status-pill ${app.status}"><span class="status-dot"></span>${statusLabel(app.status)}</span>
      </div>
      <div class="app-card-metrics">
        <div class="app-metric">
          <div class="app-metric-value">${respTime}</div>
          <div class="app-metric-label">Response</div>
        </div>
        <div class="app-metric">
          <div class="app-metric-value" style="color:${uptimeColor(app.uptime_24h || 0)}">${uptime}</div>
          <div class="app-metric-label">Uptime 24h</div>
        </div>
        <div class="app-metric">
          <div class="app-metric-value">${avg}</div>
          <div class="app-metric-label">Avg 1h</div>
        </div>
      </div>
      ${containerHtml}
    </div>`;
  }

  container.innerHTML = html;
}

function updateSystemCards(sys) {
  if (!sys) return;
  const metrics = [
    {label:'CPU Usage',value:sys.cpu_percent||0,unit:'%'},
    {label:'Memory Usage',value:sys.memory_percent||0,unit:'%'},
    {label:'Disk Usage',value:sys.disk_percent||0,unit:'%',extra:sys.disk_free_gb ? sys.disk_free_gb.toFixed(1)+'GB free' : ''}
  ];
  let html = '';
  for (const m of metrics) {
    const col = progressColor(m.value);
    html += `<div class="card">
      <div class="sys-metric"><span class="sys-metric-label">${m.label}</span><span class="sys-metric-value" style="color:var(--${col})">${m.value.toFixed(1)}${m.unit}</span></div>
      <div class="progress-bar"><div class="progress-fill ${col}" style="width:${m.value}%"></div></div>
      ${m.extra ? '<div style="font-size:11px;color:var(--text3);margin-top:6px">'+m.extra+'</div>' : ''}
    </div>`;
  }
  document.getElementById('systemMetrics').innerHTML = html;
}

async function fetchAlerts() {
  try {
    const [activeR, recentR] = await Promise.all([
      fetch(API + '/api/alerts/active'), fetch(API + '/api/alerts')
    ]);
    const active = await activeR.json();
    const recent = await recentR.json();
    let ah = '';
    if (active.length === 0) ah = '<div class="empty-state">No active alerts - all clear!</div>';
    else for (const a of active) {
      ah += `<div class="alert-row">
        <span class="alert-sev ${a.severity}">${a.severity}</span>
        <div class="alert-msg"><div class="alert-app">${a.app_name}</div>${a.message || ''}</div>
        <div class="alert-time">${formatTime(a.timestamp)}</div></div>`;
    }
    document.getElementById('activeAlerts').innerHTML = ah;
    let rh = '';
    if (recent.length === 0) rh = '<div class="empty-state">No recent alerts</div>';
    else for (const a of recent.slice(0, 30)) {
      const resolved = a.resolved ? ' [Resolved]' : '';
      rh += `<div class="alert-row">
        <span class="alert-sev ${a.resolved ? 'RESOLVED' : a.severity}">${a.resolved ? 'RESOLVED' : a.severity}</span>
        <div class="alert-msg"><div class="alert-app">${a.app_name}${resolved}</div>${a.message || ''}</div>
        <div class="alert-time">${formatTime(a.timestamp)}</div></div>`;
    }
    document.getElementById('recentAlerts').innerHTML = rh;
  } catch(e) { console.error(e); }
}

async function fetchSystemHistory() {
  try {
    const r = await fetch(API + '/api/system/history');
    const data = await r.json();
    if (!data.length) {
      document.getElementById('systemHistory').innerHTML = '<div class="empty-state">No historical data yet</div>';
      return;
    }
    const W = 800, H = 200, P = 40;
    const latest = data.slice(-60);
    function sparkline(values, color) {
      const min = Math.min(...values), max = Math.max(...values, 1);
      const pts = values.map((v,i) => {
        const x = P + (i/(values.length-1||1)) * (W-P*2);
        const y = H-P - ((v-min)/(max-min||1)) * (H-P*2);
        return x+','+y;
      });
      const area = 'M'+P+','+(H-P)+' L'+pts.join(' L')+' L'+(P+(values.length-1)/(values.length-1||1)*(W-P*2))+','+(H-P)+' Z';
      return '<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+color+'" stroke-width="2"/><path d="'+area+'" fill="'+color+'" fill-opacity="0.08"/>';
    }
    const cpuVals = latest.map(d => d.cpu_percent||0);
    const memVals = latest.map(d => d.memory_percent||0);
    const diskVals = latest.map(d => d.disk_percent||0);
    let html = '<div style="display:flex;gap:16px;margin-bottom:16px">';
    html += '<span style="color:#8B5CF6;font-size:12px;font-weight:600">&#9644; CPU</span>';
    html += '<span style="color:#06B6D4;font-size:12px;font-weight:600">&#9644; Memory</span>';
    html += '<span style="color:#F59E0B;font-size:12px;font-weight:600">&#9644; Disk</span></div>';
    html += '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:220px">';
    html += '<line x1="'+P+'" y1="'+(H-P)+'" x2="'+(W-P)+'" y2="'+(H-P)+'" stroke="var(--border)" stroke-width="1"/>';
    html += '<line x1="'+P+'" y1="'+P+'" x2="'+(W-P)+'" y2="'+P+'" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4"/>';
    html += '<line x1="'+P+'" y1="'+(H/2)+'" x2="'+(W-P)+'" y2="'+(H/2)+'" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4"/>';
    html += '<text x="'+(P-4)+'" y="'+(H-P+4)+'" fill="var(--text3)" font-size="10" text-anchor="end">0%</text>';
    html += '<text x="'+(P-4)+'" y="'+(H/2+4)+'" fill="var(--text3)" font-size="10" text-anchor="end">50%</text>';
    html += '<text x="'+(P-4)+'" y="'+(P+4)+'" fill="var(--text3)" font-size="10" text-anchor="end">100%</text>';
    html += sparkline(cpuVals, '#8B5CF6');
    html += sparkline(memVals, '#06B6D4');
    html += sparkline(diskVals, '#F59E0B');
    html += '</svg>';
    document.getElementById('systemHistory').innerHTML = html;
  } catch(e) { console.error(e); }
}

async function fetchRecovery() {
  try {
    const r = await fetch(API + '/api/recovery');
    const data = await r.json();
    let html = '';
    if (!data.length) html = '<div class="empty-state">No recovery actions recorded</div>';
    else for (const a of data) {
      html += `<div class="recovery-row">
        <div class="recovery-icon">${a.success ? '&#10003;' : '&#10007;'}</div>
        <div class="recovery-info"><div class="recovery-action" style="color:${a.success ? 'var(--green)' : 'var(--red)'}">${a.action||'Unknown'}</div>
        <div class="recovery-app">${a.app_name} &mdash; ${formatTime(a.timestamp)}</div></div></div>`;
    }
    document.getElementById('recoveryActions').innerHTML = html;
  } catch(e) { console.error(e); }
}

// Initial fetch & auto-refresh every 30s
fetchStatus();
setInterval(fetchStatus, 30000);
</script>
</body>
</html>"""

# unused, kept for reference


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

    def _send_html(self, html, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(html.encode())

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/")

        # Serve dashboard UI at root
        if path in ("", "/"):
            self._handle_dashboard()
            return

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

    def _handle_dashboard(self):
        # Always read from disk so edits take effect without restart
        self._send_html(_load_dashboard_html())

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

            # Gather container statuses
            containers = app.get("containers", [])
            if not containers and app.get("container"):
                containers = [{"name": app["container"], "role": "main"}]

            container_statuses = []
            for c in containers:
                c_name = f"{name}:{c.get('role', 'main')}"
                c_checks = get_recent_health_checks(c_name, limit=1)
                c_latest = _row_to_dict(c_checks[0]) if c_checks else None
                container_statuses.append({
                    "name": c.get("name", ""),
                    "role": c.get("role", "main"),
                    "status": c_latest["status"] if c_latest else "unknown",
                    "last_check": c_latest["timestamp"] if c_latest else None,
                })

            app_statuses.append({
                "name": name,
                "group": app.get("group", ""),
                "type": app.get("type", "web"),
                "status": latest["status"] if latest else "unknown",
                "response_time_ms": latest.get("response_time_ms") if latest else None,
                "last_check": latest["timestamp"] if latest else None,
                "uptime_24h": get_uptime_percentage(name, 24),
                "avg_response_1h": get_avg_response_time(name, 1),
                "containers": container_statuses,
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
