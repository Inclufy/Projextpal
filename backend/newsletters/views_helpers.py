from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from django.db import transaction


def generate_html_content(newsletter):
    """Generate HTML content for newsletter"""
    project_name = newsletter.project.name if newsletter.project else "Company Newsletter"
    context = {
        "newsletter": newsletter,
        "project": newsletter.project,
        "project_name": project_name,
        "task_update_details": newsletter.task_update_details,
        "additional_content": newsletter.additional_content,
    }

    # Simple HTML template
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{{ newsletter.subject }}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #00308F; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .task-update { background-color: #EFF6FF; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Newsletter</h1>
                <h2>{{ project_name }}</h2>
            </div>
            <div class="content">
                <p>Hello team,</p>
                <p>Here's an update on our recent activities:</p>
                
                {% if task_update_details %}
                <div class="task-update">
                    {{ task_update_details|linebreaks }}
                </div>
                {% endif %}
                
                {% if additional_content %}
                <p>{{ additional_content|linebreaks }}</p>
                {% endif %}
                
                <p>Best regards,<br>The Team</p>
            </div>
            <div class="footer">
                <p>This newsletter was sent from {{ project_name }} project management system.</p>
            </div>
        </div>
    </body>
    </html>
    """

    from django.template import Template, Context

    template = Template(html_template)
    return template.render(Context(context))


def send_newsletter_email(subject, html_content, recipient_list, project_name):
    """Send email to recipients"""
    try:
        # Create email message
        # Use BCC to hide recipients from each other for privacy
        msg = EmailMultiAlternatives(
            subject=subject,
            body="Please view this email in HTML format.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[],  # Empty 'to' field
            bcc=recipient_list,  # All recipients in BCC for privacy
        )

        # Attach HTML content
        msg.attach_alternative(html_content, "text/html")

        # Send email
        msg.send()
        return True

    except Exception as e:
        print(f"Email sending error: {e}")
        return False


def send_newsletter_email_bcc(subject, html_content, recipient_list, project_name):
    """Send email to recipients using BCC with no-reply address"""
    try:
        # Create email message with no-reply address in 'to' field
        # Use BCC to hide recipients from each other for privacy
        msg = EmailMultiAlternatives(
            subject=subject,
            body="Please view this email in HTML format.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=["noreply@projexpal.com"],  # No-reply address in 'to' field
            bcc=recipient_list,  # All recipients in BCC for privacy
        )

        # Attach HTML content
        msg.attach_alternative(html_content, "text/html")

        # Send email
        msg.send()
        return True

    except Exception as e:
        print(f"Email sending error: {e}")
        return False


def log_newsletter_activity(newsletter, user, action):
    """Log newsletter activity"""
    try:
        from projects.models import ProjectActivity

        if newsletter.project:
            ProjectActivity.objects.create(
                project=newsletter.project,
                user=user,
                action=action,
                message=f"Newsletter '{newsletter.subject}' {action}",
                target=newsletter,
            )
    except Exception:
        pass  # Don't fail if logging fails
