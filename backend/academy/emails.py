# academy/emails.py
"""
Academy Email Templates and Sending Functions
Professional email templates for enrollment, quotes, and certificates
"""

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone


# ============================================
# EMAIL TEMPLATE STRINGS
# ============================================

ENROLLMENT_CONFIRMATION_HTML = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ProjeXtPal Academy</title>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }}
    .container {{ max-width: 600px; margin: 0 auto; background: white; }}
    .header {{ background: linear-gradient(135deg, #8B5CF6, #D946EF); padding: 40px 30px; text-align: center; }}
    .header h1 {{ color: white; margin: 0; font-size: 28px; }}
    .header p {{ color: rgba(255,255,255,0.9); margin: 10px 0 0 0; }}
    .content {{ padding: 40px 30px; }}
    .course-card {{ background: #f8f5ff; border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #8B5CF6; }}
    .course-title {{ font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0 0 8px 0; }}
    .course-meta {{ color: #666; font-size: 14px; }}
    .btn {{ display: inline-block; background: linear-gradient(135deg, #8B5CF6, #D946EF); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
    .steps {{ margin: 30px 0; }}
    .step {{ display: flex; align-items: flex-start; margin: 16px 0; }}
    .step-number {{ background: #8B5CF6; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 16px; flex-shrink: 0; }}
    .step-content {{ flex: 1; }}
    .step-title {{ font-weight: 600; color: #1a1a1a; margin: 0 0 4px 0; }}
    .step-desc {{ color: #666; font-size: 14px; margin: 0; }}
    .features {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0; }}
    .feature {{ display: flex; align-items: center; }}
    .feature-icon {{ color: #22C55E; margin-right: 8px; }}
    .footer {{ background: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #eee; }}
    .footer p {{ color: #666; font-size: 14px; margin: 4px 0; }}
    .social {{ margin: 20px 0; }}
    .social a {{ display: inline-block; margin: 0 8px; color: #8B5CF6; text-decoration: none; }}
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎓 Welcome to ProjeXtPal Academy!</h1>
      <p>Your learning journey starts now</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <p style="font-size: 16px; color: #333;">Hi <strong>{first_name}</strong>,</p>
      
      <p style="color: #555; line-height: 1.6;">
        Congratulations! You have successfully enrolled in your new course. 
        We're excited to have you join thousands of professionals advancing their careers with ProjeXtPal Academy.
      </p>
      
      <!-- Course Card -->
      <div class="course-card">
        <h2 class="course-title">{course_title}</h2>
        <p class="course-meta">
          📚 {modules} Modules • ⏱️ {duration} Hours • 🎓 Certificate Included
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="{course_url}" class="btn">Start Learning Now →</a>
      </div>
      
      <!-- Next Steps -->
      <div class="steps">
        <h3 style="color: #1a1a1a; margin-bottom: 20px;">📋 What's Next?</h3>
        
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <p class="step-title">Access Your Course</p>
            <p class="step-desc">Log in to your account and go to "My Courses" to start learning.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <p class="step-title">Complete Modules</p>
            <p class="step-desc">Work through each module at your own pace. Watch videos, complete quizzes.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <p class="step-title">Get Certified</p>
            <p class="step-desc">Pass the final assessment and download your professional certificate.</p>
          </div>
        </div>
      </div>
      
      <!-- Features -->
      <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h4 style="color: #166534; margin: 0 0 16px 0;">✅ What's Included:</h4>
        <div class="features">
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span>Lifetime access</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span>Downloadable resources</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span>AI assistant support</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span>Official certificate</span>
          </div>
        </div>
      </div>
      
      <!-- Support -->
      <p style="color: #555; line-height: 1.6;">
        Need help? Our support team is here for you. Just reply to this email or contact us at 
        <a href="mailto:support@projextpal.com" style="color: #8B5CF6;">support@projextpal.com</a>
      </p>
      
      <p style="color: #555; margin-top: 30px;">
        Happy learning!<br>
        <strong>The ProjeXtPal Academy Team</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="social">
        <a href="#">LinkedIn</a> • 
        <a href="#">Twitter</a> • 
        <a href="#">YouTube</a>
      </div>
      <p>ProjeXtPal Academy</p>
      <p>© 2025 ProjeXtPal. All rights reserved.</p>
      <p style="font-size: 12px; color: #999; margin-top: 16px;">
        You received this email because you enrolled in a course on ProjeXtPal Academy.
      </p>
    </div>
  </div>
</body>
</html>
"""

ENROLLMENT_CONFIRMATION_TEXT = """
Welcome to ProjeXtPal Academy!

Hi {first_name},

Congratulations! You have successfully enrolled in:

{course_title}
📚 {modules} Modules • ⏱️ {duration} Hours • 🎓 Certificate Included

Start Learning Now: {course_url}

WHAT'S NEXT?

1. Access Your Course
   Log in to your account and go to "My Courses" to start learning.

2. Complete Modules
   Work through each module at your own pace.

3. Get Certified
   Pass the final assessment and download your certificate.

WHAT'S INCLUDED:
✓ Lifetime access
✓ Downloadable resources
✓ AI assistant support
✓ Official certificate

Need help? Contact us at support@projextpal.com

Happy learning!
The ProjeXtPal Academy Team

---
© 2025 ProjeXtPal. All rights reserved.
"""


QUOTE_REQUEST_CONFIRMATION_HTML = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Request Received</title>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }}
    .container {{ max-width: 600px; margin: 0 auto; background: white; }}
    .header {{ background: linear-gradient(135deg, #8B5CF6, #D946EF); padding: 40px 30px; text-align: center; }}
    .header h1 {{ color: white; margin: 0; font-size: 24px; }}
    .content {{ padding: 40px 30px; }}
    .info-box {{ background: #f8f5ff; border-radius: 12px; padding: 24px; margin: 20px 0; }}
    .info-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e5e5; }}
    .info-row:last-child {{ border-bottom: none; }}
    .info-label {{ color: #666; }}
    .info-value {{ color: #1a1a1a; font-weight: 600; }}
    .footer {{ background: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #eee; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Quote Request Received</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #333;">Hi <strong>{contact_name}</strong>,</p>
      
      <p style="color: #555; line-height: 1.6;">
        Thank you for your interest in ProjeXtPal Academy team training! 
        We have received your quote request and one of our training consultants will contact you within 24 hours.
      </p>
      
      <div class="info-box">
        <h3 style="margin: 0 0 16px 0; color: #8B5CF6;">Request Summary</h3>
        <div class="info-row">
          <span class="info-label">Reference:</span>
          <span class="info-value">{quote_id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Company:</span>
          <span class="info-value">{company_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Team Size:</span>
          <span class="info-value">{team_size} people</span>
        </div>
        <div class="info-row">
          <span class="info-label">Courses:</span>
          <span class="info-value">{courses_count} selected</span>
        </div>
      </div>
      
      <p style="color: #555; line-height: 1.6;">
        In the meantime, feel free to explore our course catalog or contact us directly at 
        <a href="mailto:academy@projextpal.com" style="color: #8B5CF6;">academy@projextpal.com</a>
      </p>
      
      <p style="color: #555; margin-top: 30px;">
        Best regards,<br>
        <strong>ProjeXtPal Academy Sales Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p style="color: #666; font-size: 14px;">© 2025 ProjeXtPal Academy</p>
    </div>
  </div>
</body>
</html>
"""


CERTIFICATE_READY_HTML = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Certificate is Ready!</title>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }}
    .container {{ max-width: 600px; margin: 0 auto; background: white; }}
    .header {{ background: linear-gradient(135deg, #22C55E, #16A34A); padding: 40px 30px; text-align: center; }}
    .header h1 {{ color: white; margin: 0; font-size: 28px; }}
    .content {{ padding: 40px 30px; text-align: center; }}
    .certificate-preview {{ background: linear-gradient(135deg, #fef3c7, #fde68a); border: 3px solid #f59e0b; border-radius: 12px; padding: 30px; margin: 30px 0; }}
    .btn {{ display: inline-block; background: linear-gradient(135deg, #22C55E, #16A34A); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; }}
    .footer {{ background: #f8f8f8; padding: 30px; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Congratulations!</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 18px; color: #333;">
        <strong>{first_name}</strong>, you did it!
      </p>
      
      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        You have successfully completed <strong>{course_title}</strong> and your official certificate is ready!
      </p>
      
      <div class="certificate-preview">
        <p style="color: #92400e; font-size: 14px; margin: 0 0 10px 0;">CERTIFICATE OF COMPLETION</p>
        <h2 style="color: #78350f; margin: 0 0 10px 0;">{course_title}</h2>
        <p style="color: #92400e; margin: 0;">Issued to: {first_name} {last_name}</p>
        <p style="color: #92400e; font-size: 14px; margin: 10px 0 0 0;">Certificate ID: {certificate_id}</p>
      </div>
      
      <a href="{certificate_url}" class="btn">Download Certificate (PDF)</a>
      
      <p style="color: #555; margin-top: 30px; line-height: 1.6;">
        Share your achievement on LinkedIn and let the world know about your new skills!
      </p>
    </div>
    
    <div class="footer">
      <p style="color: #666; font-size: 14px;">© 2025 ProjeXtPal Academy</p>
    </div>
  </div>
</body>
</html>
"""


# ============================================
# EMAIL SENDING FUNCTIONS
# ============================================

def send_enrollment_confirmation_email(
    email: str,
    first_name: str,
    course_title: str,
    course_id: str,
    modules: int = 24,
    duration: int = 12
):
    """
    Send enrollment confirmation email to student
    """
    subject = f"🎓 Welcome! You're enrolled in {course_title}"
    course_url = f"{settings.FRONTEND_URL}/academy/course/{course_id}/learn"
    
    # Format HTML
    html_content = ENROLLMENT_CONFIRMATION_HTML.format(
        first_name=first_name,
        course_title=course_title,
        course_url=course_url,
        modules=modules,
        duration=duration
    )
    
    # Format plain text
    text_content = ENROLLMENT_CONFIRMATION_TEXT.format(
        first_name=first_name,
        course_title=course_title,
        course_url=course_url,
        modules=modules,
        duration=duration
    )
    
    # Create email
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email]
    )
    msg.attach_alternative(html_content, "text/html")
    
    try:
        msg.send()
        return True
    except Exception as e:
        print(f"Failed to send enrollment email: {e}")
        return False


def send_quote_confirmation_email(
    email: str,
    contact_name: str,
    company_name: str,
    quote_id: str,
    team_size: str,
    courses_count: int
):
    """
    Send quote request confirmation email
    """
    subject = f"📋 Quote Request Received - {quote_id}"
    
    html_content = QUOTE_REQUEST_CONFIRMATION_HTML.format(
        contact_name=contact_name,
        company_name=company_name,
        quote_id=quote_id,
        team_size=team_size,
        courses_count=courses_count
    )
    
    msg = EmailMultiAlternatives(
        subject=subject,
        body=f"Thank you for your quote request. Reference: {quote_id}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email]
    )
    msg.attach_alternative(html_content, "text/html")
    
    try:
        msg.send()
        return True
    except Exception as e:
        print(f"Failed to send quote confirmation email: {e}")
        return False


def send_certificate_email(
    email: str,
    first_name: str,
    last_name: str,
    course_title: str,
    certificate_id: str,
    certificate_url: str
):
    """
    Send certificate ready notification email
    """
    subject = f"🏆 Your Certificate is Ready - {course_title}"
    
    html_content = CERTIFICATE_READY_HTML.format(
        first_name=first_name,
        last_name=last_name,
        course_title=course_title,
        certificate_id=certificate_id,
        certificate_url=certificate_url
    )
    
    msg = EmailMultiAlternatives(
        subject=subject,
        body=f"Congratulations! Your certificate for {course_title} is ready.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email]
    )
    msg.attach_alternative(html_content, "text/html")
    
    try:
        msg.send()
        return True
    except Exception as e:
        print(f"Failed to send certificate email: {e}")
        return False


def send_sales_notification_email(quote_request: dict):
    """
    Send notification to sales team about new quote request
    """
    subject = f"🔔 New Quote Request: {quote_request['company_name']}"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #8B5CF6;">New Quote Request</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Company:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{quote_request['company_name']}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Contact:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{quote_request['contact_name']}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{quote_request['email']}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{quote_request.get('phone', 'N/A')}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Team Size:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{quote_request['team_size']}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Courses:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{len(quote_request.get('courses', []))} selected</td></tr>
        </table>
        <p style="margin-top: 20px;"><strong>Message:</strong></p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 8px;">{quote_request.get('message', 'No message provided')}</p>
        <p style="margin-top: 20px;">
            <a href="{settings.FRONTEND_URL}/admin/training" style="background: #8B5CF6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Portal</a>
        </p>
    </body>
    </html>
    """
    
    msg = EmailMultiAlternatives(
        subject=subject,
        body=f"New quote request from {quote_request['company_name']}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.SALES_EMAIL]
    )
    msg.attach_alternative(html_content, "text/html")
    
    try:
        msg.send()
        return True
    except Exception as e:
        print(f"Failed to send sales notification: {e}")
        return False
