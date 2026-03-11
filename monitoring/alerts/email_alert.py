"""Email alert sender with HTML-formatted notifications."""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

logger = logging.getLogger("monitor.alerts.email")

SEVERITY_COLORS = {
    "INFO": "#3498db",
    "WARNING": "#f39c12",
    "CRITICAL": "#e74c3c",
    "EMERGENCY": "#8e44ad",
    "RESOLVED": "#2ecc71",
}

SEVERITY_EMOJI = {
    "INFO": "ℹ️",
    "WARNING": "⚠️",
    "CRITICAL": "🔴",
    "EMERGENCY": "🚨",
    "RESOLVED": "✅",
}


def send_alert_email(email_config, app_name, severity, message, details=None):
    """Send an HTML-formatted alert email."""
    if not email_config.get("enabled", False):
        logger.debug("Email alerts disabled, skipping")
        return False

    color = SEVERITY_COLORS.get(severity, "#95a5a6")
    emoji = SEVERITY_EMOJI.get(severity, "")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    subject = f"{emoji} [{severity}] {app_name} — {message}"

    html_body = f"""
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: {color}; padding: 20px; color: white;">
                <h2 style="margin: 0; font-size: 18px;">{emoji} Inclufy Monitoring Alert</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">{severity} — {timestamp}</p>
            </div>
            <div style="padding: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666; width: 120px;">Application</td>
                        <td style="padding: 8px 0; font-weight: bold;">{app_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Severity</td>
                        <td style="padding: 8px 0;">
                            <span style="background: {color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 13px;">{severity}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Issue</td>
                        <td style="padding: 8px 0;">{message}</td>
                    </tr>
                    {"<tr><td style='padding: 8px 0; color: #666; vertical-align: top;'>Details</td><td style='padding: 8px 0;'><pre style='background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 13px; overflow-x: auto; margin: 0;'>" + str(details) + "</pre></td></tr>" if details else ""}
                </table>
            </div>
            <div style="padding: 15px 20px; background: #f8f9fa; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                Inclufy Monitoring Agent — Mac Studio
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = email_config.get("from_address", "monitoring@inclufy.com")
    msg["To"] = ", ".join(email_config.get("recipients", []))

    # Plain text fallback
    plain_text = f"""
[{severity}] Inclufy Monitoring Alert
Time: {timestamp}
Application: {app_name}
Issue: {message}
{"Details: " + str(details) if details else ""}
"""
    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        smtp_host = email_config.get("smtp_host", "smtp.gmail.com")
        smtp_port = email_config.get("smtp_port", 587)
        username = email_config.get("username", "")
        password = email_config.get("password", "")

        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
            if email_config.get("use_tls", True):
                server.starttls()
            if username and password:
                server.login(username, password)
            server.send_message(msg)

        logger.info("Alert email sent: %s — %s", app_name, message)
        return True
    except Exception as e:
        logger.error("Failed to send alert email: %s", e)
        return False


def send_daily_summary_email(email_config, summary_data):
    """Send a daily summary report email."""
    if not email_config.get("enabled", False):
        return False

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    date_str = datetime.now().strftime("%B %d, %Y")

    # Build uptime rows
    uptime_rows = ""
    for app_name, uptime in summary_data.get("app_uptimes", {}).items():
        color = "#2ecc71" if uptime >= 99 else "#f39c12" if uptime >= 95 else "#e74c3c"
        uptime_rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">{app_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
                <span style="color: {color}; font-weight: bold;">{uptime}%</span>
            </td>
        </tr>"""

    total_checks = summary_data.get("total_checks", 0)
    failed_checks = summary_data.get("failed_checks", 0)
    total_alerts = summary_data.get("total_alerts", 0)
    recoveries = summary_data.get("recovery_attempts", 0)
    recovery_successes = summary_data.get("recovery_successes", 0)

    subject = f"📊 Inclufy Daily Monitor Report — {date_str}"

    html_body = f"""
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: #2c3e50; padding: 20px; color: white;">
                <h2 style="margin: 0;">📊 Daily Monitoring Report</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">{date_str}</p>
            </div>
            <div style="padding: 20px;">
                <h3 style="margin-top: 0;">Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0;">Total Health Checks</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">{total_checks}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">Failed Checks</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: {'#e74c3c' if failed_checks > 0 else '#2ecc71'};">{failed_checks}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">Alerts Triggered</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">{total_alerts}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">Recovery Actions</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">{recoveries} ({recovery_successes} successful)</td>
                    </tr>
                </table>

                <h3>Application Uptime (24h)</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    {uptime_rows if uptime_rows else "<tr><td style='padding: 8px; color: #999;'>No data available yet</td></tr>"}
                </table>
            </div>
            <div style="padding: 15px 20px; background: #f8f9fa; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                Inclufy Monitoring Agent — Mac Studio — {timestamp}
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = email_config.get("from_address", "monitoring@inclufy.com")
    msg["To"] = ", ".join(email_config.get("recipients", []))
    msg.attach(MIMEText(html_body, "html"))

    try:
        smtp_host = email_config.get("smtp_host", "smtp.gmail.com")
        smtp_port = email_config.get("smtp_port", 587)
        username = email_config.get("username", "")
        password = email_config.get("password", "")

        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
            if email_config.get("use_tls", True):
                server.starttls()
            if username and password:
                server.login(username, password)
            server.send_message(msg)

        logger.info("Daily summary email sent")
        return True
    except Exception as e:
        logger.error("Failed to send daily summary: %s", e)
        return False
