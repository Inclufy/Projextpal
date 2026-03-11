"""
Academy API Views - Stripe Integration
Handles course purchases, enrollments, and quote requests
"""

import stripe
import json
from decimal import Decimal
from django.conf import settings
from django.http import JsonResponse, HttpResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.core.mail import send_mail
from django.db import models
from django.template.loader import render_to_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from admin_portal.permissions import IsSuperAdmin
from rest_framework.response import Response
from rest_framework import status
from .models import CourseLesson, Enrollment
from .models import QuizAttempt
from .models import Course
from .models import Certificate
# # from .models import LessonContent
from .models import LessonResource
from rest_framework import viewsets
from rest_framework.decorators import action
from django.db.models import Sum, Avg
from .models import (
    SkillCategory, Skill, UserSkill, SkillGoal, 
    LessonSkillMapping, SkillActivity
)
from .serializers import (
    SkillCategorySerializer, SkillSerializer, UserSkillSerializer,
    SkillGoalSerializer, SkillActivitySerializer
)
from rest_framework.decorators import api_view
from openai import OpenAI
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)


# Initialize Stripe (safe)
stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", None)

# ============================================
# COURSE DATA (For Stripe/Public - maps to DB)
# ============================================
def get_course_stripe_data(course_id):
    """Get course data for Stripe checkout"""
    if not course_id:
        return None

    from .models import Course
    try:
        course = Course.objects.get(id=course_id)
        return {
            "id": str(course.id),
            "title": course.title,
            "price": int(course.price * 100),  # cents, avoids float issues
            "stripe_price_id": course.stripe_price_id or None,
        }
    except Course.DoesNotExist:
        return None

# ============================================
# ENROLLMENTS DATA (In production, use database)
# ============================================
ENROLLMENTS = [
    {'id': 'E001', 'user': 'Jan de Vries', 'email': 'jan@company.nl', 'course': 'Project Management Fundamentals', 'date': '2024-12-18', 'status': 'active', 'progress': 65},
    {'id': 'E002', 'user': 'Lisa Bakker', 'email': 'lisa@corp.com', 'course': 'Agile & Scrum Mastery', 'date': '2024-12-17', 'status': 'active', 'progress': 32},
    {'id': 'E003', 'user': 'Mark Jansen', 'email': 'mark@enterprise.nl', 'course': 'PRINCE2 Foundation', 'date': '2024-12-16', 'status': 'completed', 'progress': 100},
    {'id': 'E004', 'user': 'Sophie van Dijk', 'email': 'sophie@startup.io', 'course': 'SAFe & Scaling', 'date': '2024-12-15', 'status': 'active', 'progress': 78},
    {'id': 'E005', 'user': 'Tom Hendriks', 'email': 'tom@agency.nl', 'course': 'Six Sigma Green Belt', 'date': '2024-12-14', 'status': 'pending', 'progress': 0},
]

# ============================================
# QUOTE REQUESTS DATA (In production, use database)
# ============================================
QUOTE_REQUESTS = [
    {'id': 'Q001', 'company': 'TechCorp BV', 'contact': 'Peter Smit', 'email': 'peter@techcorp.nl', 'courses': 3, 'teamSize': '26-50', 'date': '2024-12-18', 'status': 'new'},
    {'id': 'Q002', 'company': 'InnovatieHub', 'contact': 'Anna de Groot', 'email': 'anna@innovatiehub.nl', 'courses': 2, 'teamSize': '11-25', 'date': '2024-12-17', 'status': 'contacted'},
    {'id': 'Q003', 'company': 'Enterprise Solutions', 'contact': 'Robert Visser', 'email': 'robert@enterprise.com', 'courses': 5, 'teamSize': '100+', 'date': '2024-12-16', 'status': 'quoted'},
    {'id': 'Q004', 'company': 'Startup Valley', 'contact': 'Emma Bakker', 'email': 'emma@startupvalley.io', 'courses': 1, 'teamSize': '5-10', 'date': '2024-12-15', 'status': 'closed'},
]

# ============================================
# COUPON CODES
# ============================================
COUPON_CODES = {
    'PROJEXTPAL20': {'discount_percent': 20, 'valid': True},
    'WELCOME10': {'discount_percent': 10, 'valid': True},
    'TEAM25': {'discount_percent': 25, 'valid': True},
}


# ============================================
# STRIPE CHECKOUT ENDPOINTS
# ============================================

@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def create_checkout_session(request):
    """
    Create a Stripe Checkout Session for course purchase
    """
    try:
        data = request.data
        course_id = data.get('course_id')
        email = data.get('email')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        company = data.get('company', '')
        vat_number = data.get('vat_number', '')
        country = data.get('country', 'NL')
        payment_method = data.get('payment_method', 'card')
        coupon_code = data.get('coupon_code')

        # Validate course
        course = get_course_stripe_data(course_id)
        if not course:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        # Free course - direct enrollment
        if course['price'] == 0:
            # Create enrollment directly
            enrollment = create_enrollment(
                email=email,
                first_name=first_name,
                last_name=last_name,
                course_id=course_id,
                company=company
            )
            return Response({
                'success': True,
                'message': 'Enrolled in free course',
                'redirect_url': f'/academy/course/{course_id}/learn'
            })

        # Calculate price with coupon
        price = course['price']
        discount_percent = 0
        
        if coupon_code and coupon_code.upper() in COUPON_CODES:
            coupon = COUPON_CODES[coupon_code.upper()]
            if coupon['valid']:
                discount_percent = coupon['discount_percent']
                price = int(price * (100 - discount_percent) / 100)

        # Determine payment method types based on selection
        payment_method_types = ['card']
        if payment_method == 'ideal':
            payment_method_types = ['ideal']
        elif payment_method == 'bancontact':
            payment_method_types = ['bancontact']
        elif payment_method == 'invoice':
            # For invoice, we create a quote request instead
            return Response({
                'success': True,
                'message': 'Invoice request created',
                'redirect_url': f'/academy/quote/{course_id}?invoice=true'
            })

        # Create Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=payment_method_types,
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': course['title'],
                        'description': f'ProjeXtPal Academy - {course["title"]}',
                        'images': ['https://projextpal.com/logo.png'],
                    },
                    'unit_amount': price,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'{settings.FRONTEND_URL}/academy/checkout/success?session_id={{CHECKOUT_SESSION_ID}}&course_id={course_id}',
            cancel_url=f'{settings.FRONTEND_URL}/academy/checkout/{course_id}?canceled=true',
            customer_email=email,
            metadata={
                'course_id': course_id,
                'course_title': course['title'],
                'first_name': first_name,
                'last_name': last_name,
                'company': company,
                'vat_number': vat_number,
                'country': country,
                'coupon_code': coupon_code or '',
                'discount_percent': discount_percent,
            },
            billing_address_collection='required',
            tax_id_collection={'enabled': True} if vat_number else {'enabled': False},
        )

        return Response({
            'success': True,
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id,
        })

    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@require_http_methods(['POST'])
def stripe_webhook(request):
    """
    Handle Stripe webhooks for payment events
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_successful_payment(session)
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        handle_failed_payment(payment_intent)

    return HttpResponse(status=200)


def handle_successful_payment(session):
    """
    Process successful payment and create enrollment
    """
    metadata = session.get('metadata', {})
    customer_email = session.get('customer_email')
    
    # Create enrollment
    enrollment = create_enrollment(
        email=customer_email,
        first_name=metadata.get('first_name', ''),
        last_name=metadata.get('last_name', ''),
        course_id=metadata.get('course_id'),
        company=metadata.get('company', ''),
        payment_id=session.get('payment_intent'),
        amount_paid=session.get('amount_total', 0) / 100,
    )
    
    # Send confirmation email
    send_enrollment_confirmation(
        email=customer_email,
        first_name=metadata.get('first_name', ''),
        course_title=metadata.get('course_title', ''),
    )
    
    return enrollment


def handle_failed_payment(payment_intent):
    """
    Handle failed payment
    """
    # Log the failure
    print(f"Payment failed: {payment_intent.get('id')}")
    # Could send notification email here


def create_enrollment(email, first_name, last_name, course_id, company='', payment_id=None, amount_paid=0):
    """
    Create a course enrollment record
    In production, this would create a database record
    """
    enrollment = {
        'id': f'ENR-{timezone.now().strftime("%Y%m%d%H%M%S")}',
        'email': email,
        'first_name': first_name,
        'last_name': last_name,
        'course_id': course_id,
        'company': company,
        'payment_id': payment_id,
        'amount_paid': amount_paid,
        'enrolled_at': timezone.now().isoformat(),
        'status': 'active',
        'progress': 0,
    }
    
    # In production: Enrollment.objects.create(**enrollment)
    print(f"Created enrollment: {enrollment}")
    
    return enrollment


def send_enrollment_confirmation(email, first_name, course_title):
    """
    Send enrollment confirmation email
    """
    subject = f'Welcome to {course_title} - ProjeXtPal Academy'
    
    message = f"""
    Hi {first_name},

    Welcome to ProjeXtPal Academy!

    You have successfully enrolled in: {course_title}

    You can start learning immediately by logging into your account:
    {settings.FRONTEND_URL}/academy

    If you have any questions, our support team is here to help.

    Happy learning!

    The ProjeXtPal Academy Team
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Failed to send email: {e}")


@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def request_quote(request):
    """
    Handle enterprise/team quote requests
    """
    try:
        data = request.data
        
        quote_request = {
            'id': f'QR-{timezone.now().strftime("%Y%m%d%H%M%S")}',
            'company_name': data.get('companyName'),
            'contact_name': data.get('contactName'),
            'email': data.get('email'),
            'phone': data.get('phone', ''),
            'job_title': data.get('jobTitle', ''),
            'country': data.get('country', 'NL'),
            'courses': data.get('courses', []),
            'team_size': data.get('team_size', '5-10'),
            'preferred_date': data.get('preferredDate', ''),
            'message': data.get('message', ''),
            'newsletter': data.get('newsletter', False),
            'created_at': timezone.now().isoformat(),
            'status': 'new',
        }
        
        # In production: QuoteRequest.objects.create(**quote_request)
        print(f"Created quote request: {quote_request}")
        
        # Send notification to sales team
        send_quote_notification(quote_request)
        
        # Send confirmation to customer
        send_quote_confirmation(quote_request)
        
        return Response({
            'success': True,
            'message': 'Quote request submitted successfully',
            'quote_id': quote_request['id'],
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def send_quote_notification(quote_request):
    """
    Send notification to sales team about new quote request
    """
    subject = f'New Quote Request: {quote_request["company_name"]}'
    
    message = f"""
    New quote request received!

    Company: {quote_request['company_name']}
    Contact: {quote_request['contact_name']}
    Email: {quote_request['email']}
    Phone: {quote_request['phone']}
    Team Size: {quote_request['team_size']}
    Courses: {', '.join(quote_request['courses'])}

    Message:
    {quote_request['message']}

    View in admin: {settings.FRONTEND_URL}/admin/training
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.SALES_EMAIL],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Failed to send notification: {e}")


def send_quote_confirmation(quote_request):
    """
    Send confirmation email to customer
    """
    subject = 'Quote Request Received - ProjeXtPal Academy'
    
    message = f"""
    Hi {quote_request['contact_name']},

    Thank you for your interest in ProjeXtPal Academy team training!

    We have received your quote request for {quote_request['team_size']} team members.

    One of our training consultants will contact you within 24 hours to discuss your requirements and provide a customized quote.

    Quote Reference: {quote_request['id']}

    If you have any immediate questions, please contact us at academy@projextpal.com

    Best regards,

    The ProjeXtPal Academy Team
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[quote_request['email']],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Failed to send confirmation: {e}")


@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def verify_payment(request):
    """
    Verify payment status after redirect from Stripe
    """
    session_id = request.query_params.get('session_id')
    
    if not session_id:
        return Response({'error': 'Session ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == 'paid':
            return Response({
                'success': True,
                'status': 'paid',
                'course_id': session.metadata.get('course_id'),
                'course_title': session.metadata.get('course_title'),
            })
        else:
            return Response({
                'success': False,
                'status': session.payment_status,
            })
            
    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def validate_coupon(request):
    """
    Validate a coupon code
    """
    coupon_code = request.data.get('coupon_code', '').upper()
    
    if coupon_code in COUPON_CODES:
        coupon = COUPON_CODES[coupon_code]
        if coupon['valid']:
            return Response({
                'valid': True,
                'discount_percent': coupon['discount_percent'],
            })
    
    return Response({
        'valid': False,
        'message': 'Invalid coupon code',
    })


# ============================================
# ADMIN API ENDPOINTS - Courses (DATABASE)
# ============================================

@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def admin_get_courses(request):
    """
    Get all courses for admin panel - FROM DATABASE
    """
    from .models import Course
    
    courses = Course.objects.all()
    courses_list = []
    
    for course in courses:
        courses_list.append({
            'id': str(course.id),
            'title': course.title,
            'category': course.category.slug.upper() if course.category else 'PM',
            'price': float(course.price),
            'students': course.student_count,
            'revenue': course.student_count * float(course.price),
            'rating': float(course.rating),
            'status': course.status,
            'is_featured': course.is_featured,
            'is_bestseller': course.is_bestseller,
        })
    
    return Response(courses_list)


@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def admin_get_course(request, course_id):
    """
    Get single course details for admin
    """
    from .models import Course
    
    try:
        course = Course.objects.get(id=course_id)
        return Response({
            'id': str(course.id),
            'title': course.title,
            'category': course.category.slug.upper() if course.category else 'PM',
            'price': float(course.price),
            'students': course.student_count,
            'revenue': course.student_count * float(course.price),
            'rating': float(course.rating),
            'status': course.status,
            'is_featured': course.is_featured,
            'is_bestseller': course.is_bestseller,
        })
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsSuperAdmin])
def admin_update_course(request, course_id):
    """
    Update course details
    """
    from .models import Course
    
    try:
        course = Course.objects.get(id=course_id)
        data = request.data
        
        if 'title' in data:
            course.title = data['title']
        if 'category' in data:
            # Update category by slug
            from .models import CourseCategory
            try:
                category = CourseCategory.objects.get(slug=data['category'].lower())
                course.category = category
            except CourseCategory.DoesNotExist:
                pass
        if 'price' in data:
            course.price = data['price']
        if 'status' in data:
            course.status = data['status']
        if 'is_featured' in data:
            course.is_featured = data['is_featured']
        if 'is_bestseller' in data:
            course.is_bestseller = data['is_bestseller']
        
        course.save()
        return Response({'success': True, 'message': 'Course updated'})
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)


# ============================================
# ADMIN API ENDPOINTS - Enrollments
# ============================================

@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def admin_get_enrollments(request):
    """
    Get all enrollments for admin panel
    """
    return Response(ENROLLMENTS)


@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def admin_get_enrollment(request, enrollment_id):
    """
    Get single enrollment details
    """
    for enrollment in ENROLLMENTS:
        if enrollment['id'] == enrollment_id:
            return Response(enrollment)
    
    return Response({'error': 'Enrollment not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsSuperAdmin])
def admin_update_enrollment(request, enrollment_id):
    """
    Update enrollment status/progress
    """
    for enrollment in ENROLLMENTS:
        if enrollment['id'] == enrollment_id:
            data = request.data
            if 'status' in data:
                enrollment['status'] = data['status']
            if 'progress' in data:
                enrollment['progress'] = data['progress']
            return Response({'success': True, 'message': 'Enrollment updated'})
    
    return Response({'error': 'Enrollment not found'}, status=status.HTTP_404_NOT_FOUND)


# ============================================
# ADMIN API ENDPOINTS - Quotes
# ============================================

@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def admin_get_quotes(request):
    """
    Get all quote requests for admin panel
    """
    return Response(QUOTE_REQUESTS)


@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def admin_get_quote(request, quote_id):
    """
    Get single quote details
    """
    for quote in QUOTE_REQUESTS:
        if quote['id'] == quote_id:
            return Response(quote)
    
    return Response({'error': 'Quote not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsSuperAdmin])
def admin_update_quote(request, quote_id):
    """
    Update quote status
    """
    for quote in QUOTE_REQUESTS:
        if quote['id'] == quote_id:
            data = request.data
            if 'status' in data:
                quote['status'] = data['status']
            if 'notes' in data:
                quote['notes'] = data['notes']
            return Response({'success': True, 'message': 'Quote updated'})
    
    return Response({'error': 'Quote not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def admin_quote_mark_contacted(request, quote_id):
    """
    Mark quote as contacted
    """
    for quote in QUOTE_REQUESTS:
        if quote['id'] == quote_id:
            quote['status'] = 'contacted'
            return Response({'success': True, 'message': 'Quote marked as contacted'})
    
    return Response({'error': 'Quote not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def admin_quote_send(request, quote_id):
    """
    Mark quote as sent
    """
    for quote in QUOTE_REQUESTS:
        if quote['id'] == quote_id:
            quote['status'] = 'quoted'
            return Response({'success': True, 'message': 'Quote sent'})
    
    return Response({'error': 'Quote not found'}, status=status.HTTP_404_NOT_FOUND)


# ============================================
# ADMIN API ENDPOINTS - Analytics & Dashboard
# ============================================

@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def admin_get_analytics(request):
    """
    Get analytics for admin panel - FROM DATABASE
    """
    from .models import Course
    
    total_courses = Course.objects.count()
    total_students = sum(c.student_count for c in Course.objects.all())
    total_revenue = sum(c.student_count * float(c.price) for c in Course.objects.all())
    
    ratings = [float(c.rating) for c in Course.objects.all() if c.rating > 0]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0
    
    new_quotes = sum(1 for q in QUOTE_REQUESTS if q['status'] == 'new')
    
    return Response({
        'total_courses': total_courses,
        'total_students': total_students,
        'total_revenue': int(total_revenue),
        'avg_rating': round(avg_rating, 1),
        'new_quotes': new_quotes,
        'monthly_revenue': [
            {'month': 'Jul', 'revenue': 180000},
            {'month': 'Aug', 'revenue': 220000},
            {'month': 'Sep', 'revenue': 280000},
            {'month': 'Oct', 'revenue': 350000},
            {'month': 'Nov', 'revenue': 420000},
            {'month': 'Dec', 'revenue': 380000},
        ],
    })


@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def admin_dashboard_summary(request):
    """
    Get dashboard summary for admin
    """
    from .models import Course
    
    total_courses = Course.objects.count()
    total_students = sum(c.student_count for c in Course.objects.all())
    total_revenue = sum(c.student_count * float(c.price) for c in Course.objects.all())
    
    ratings = [float(c.rating) for c in Course.objects.all() if c.rating > 0]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0
    
    new_quotes = sum(1 for q in QUOTE_REQUESTS if q['status'] == 'new')
    
    return Response({
        'total_courses': total_courses,
        'total_students': total_students,
        'total_revenue': int(total_revenue),
        'avg_rating': round(avg_rating, 1),
        'new_quotes': new_quotes,
        'recent_enrollments': ENROLLMENTS[:5],
        'recent_quotes': [q for q in QUOTE_REQUESTS if q['status'] == 'new'][:3],
    })
# ============================================
# ADMIN API ENDPOINTS - Modules & Lessons
# ============================================

@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def admin_get_modules(request, course_id):
    """Get all modules for a course"""
    from .models import CourseModule
    
    modules = CourseModule.objects.filter(course_id=course_id).prefetch_related('lessons')
    modules_list = []
    
    for module in modules:
        lessons_count = module.lessons.count()
        modules_list.append({
            'id': module.id,
            'title': module.title,
            'description': module.description,
            'order': module.order,
            'lessons_count': lessons_count,
        })
    
    return Response(modules_list)


@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def admin_create_module(request, course_id):
    """Create a new module"""
    from .models import CourseModule, Course
    
    try:
        course = Course.objects.get(id=course_id)
        data = request.data
        
        # Get highest order number
        max_order = CourseModule.objects.filter(course=course).aggregate(models.Max('order'))['order__max'] or 0
        
        module = CourseModule.objects.create(
            course=course,
            title=data.get('title', 'New Module'),
            description=data.get('description', ''),
            order=max_order + 1
        )
        
        return Response({
            'success': True,
            'module': {
                'id': module.id,
                'title': module.title,
                'description': module.description,
                'order': module.order,
                'lessons_count': 0,
            }
        })
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsSuperAdmin])
def admin_update_module(request, module_id):
    """Update a module"""
    from .models import CourseModule
    
    try:
        module = CourseModule.objects.get(id=module_id)
        data = request.data
        
        if 'title' in data:
            module.title = data['title']
        if 'description' in data:
            module.description = data['description']
        if 'order' in data:
            module.order = data['order']
        
        module.save()
        
        return Response({
            'success': True,
            'message': 'Module updated'
        })
    except CourseModule.DoesNotExist:
        return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsSuperAdmin])
def admin_delete_module(request, module_id):
    """Delete a module"""
    from .models import CourseModule
    
    try:
        module = CourseModule.objects.get(id=module_id)
        module_title = module.title
        module.delete()
        
        return Response({
            'success': True,
            'message': f'Module "{module_title}" deleted'
        })
    except CourseModule.DoesNotExist:
        return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def admin_get_lessons(request, module_id):
    """Get all lessons for a module"""
    from .models import CourseLesson
    
    lessons = CourseLesson.objects.filter(module_id=module_id)
    lessons_list = []
    
    for lesson in lessons:
        lessons_list.append({
            'id': lesson.id,
            'title': lesson.title,
            'lesson_type': lesson.lesson_type,
            'duration_minutes': lesson.duration_minutes,
            'is_free_preview': lesson.is_free_preview,
            'order': lesson.order,
            'video_url': lesson.video_url,
            'content': lesson.content[:200] if lesson.content else '',  # Preview
        })
    
    return Response(lessons_list)


@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def admin_create_lesson(request, module_id):
    """Create a new lesson"""
    from .models import CourseLesson, CourseModule
    
    try:
        module = CourseModule.objects.get(id=module_id)
        data = request.data
        
        # Get highest order number
        max_order = CourseLesson.objects.filter(module=module).aggregate(models.Max('order'))['order__max'] or 0
        
        lesson = CourseLesson.objects.create(
            module=module,
            title=data.get('title', 'New Lesson'),
            title_nl=data.get('title_nl', ''),
            lesson_type=data.get('lesson_type', 'video'),
            duration_minutes=data.get('duration_minutes', 0),
            is_free_preview=data.get('is_free_preview', False),
            video_url=data.get('video_url', ''),
            content=data.get('content', ''),
            content_nl=data.get('content_nl', ''),
            visual_type=data.get('visual_type', 'auto'),
            visual_data=data.get('visual_data', None),
            order=max_order + 1
        )

        return Response({
            'success': True,
            'lesson': {
                'id': lesson.id,
                'title': lesson.title,
                'title_nl': lesson.title_nl,
                'lesson_type': lesson.lesson_type,
                'duration_minutes': lesson.duration_minutes,
                'is_free_preview': lesson.is_free_preview,
                'order': lesson.order,
                'visual_type': lesson.visual_type,
                'visual_data': lesson.visual_data,
            }
        })
    except CourseModule.DoesNotExist:
        return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def admin_get_lesson(request, lesson_id):
    """Get lesson details"""
    from .models import CourseLesson

    try:
        lesson = CourseLesson.objects.get(id=lesson_id)
        return Response({
            'id': lesson.id,
            'title': lesson.title,
            'title_nl': lesson.title_nl,
            'lesson_type': lesson.lesson_type,
            'duration_minutes': lesson.duration_minutes,
            'is_free_preview': lesson.is_free_preview,
            'order': lesson.order,
            'video_url': lesson.video_url,
            'content': lesson.content,
            'content_nl': lesson.content_nl,
            'visual_type': lesson.visual_type,
            'visual_data': lesson.visual_data,
        })
    except CourseLesson.DoesNotExist:
        return Response({'error': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsSuperAdmin])
def admin_update_lesson(request, lesson_id):
    """Update a lesson"""
    from .models import CourseLesson
    
    try:
        lesson = CourseLesson.objects.get(id=lesson_id)
        data = request.data
        
        if 'title' in data:
            lesson.title = data['title']
        if 'lesson_type' in data:
            lesson.lesson_type = data['lesson_type']
        if 'duration_minutes' in data:
            lesson.duration_minutes = data['duration_minutes']
        if 'is_free_preview' in data:
            lesson.is_free_preview = data['is_free_preview']
        if 'video_url' in data:
            lesson.video_url = data['video_url']
        if 'content' in data:
            lesson.content = data['content']
        if 'content_nl' in data:
            lesson.content_nl = data['content_nl']
        if 'order' in data:
            lesson.order = data['order']
        if 'visual_type' in data:
            lesson.visual_type = data['visual_type']
        if 'visual_data' in data:
            lesson.visual_data = data['visual_data']

        lesson.save()

        return Response({
            'success': True,
            'message': 'Lesson updated'
        })
    except CourseLesson.DoesNotExist:
        return Response({'error': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsSuperAdmin])
def admin_update_lesson_visual(request, lesson_id):
    """Update visual template config for a lesson"""
    from .models import CourseLesson

    try:
        lesson = CourseLesson.objects.get(id=lesson_id)
        data = request.data

        if 'visual_type' in data:
            lesson.visual_type = data['visual_type']
        if 'visual_data' in data:
            lesson.visual_data = data['visual_data']

        lesson.save()

        return Response({
            'success': True,
            'lesson_id': lesson.id,
            'visual_type': lesson.visual_type,
            'visual_data': lesson.visual_data,
        })
    except CourseLesson.DoesNotExist:
        return Response({'error': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsSuperAdmin])
def admin_delete_lesson(request, lesson_id):
    """Delete a lesson"""
    from .models import CourseLesson
    
    try:
        lesson = CourseLesson.objects.get(id=lesson_id)
        lesson_title = lesson.title
        lesson.delete()
        
        return Response({
            'success': True,
            'message': f'Lesson "{lesson_title}" deleted'
        })
    except CourseLesson.DoesNotExist:
        return Response({'error': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)


# ============================================
# CONTENT API - For IQ Helix Integration
# ============================================

@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def api_content_courses(request):
    """Get all published courses for content consumption"""
    from .models import Course
    
    courses = Course.objects.filter(status='published')
    courses_list = []
    
    for course in courses:
        courses_list.append({
            'id': str(course.id),
            'title': course.title,
            'description': course.description,
            'category': course.category.name if course.category else None,
            'difficulty': course.difficulty,
            'duration_hours': course.duration_hours,
            'modules_count': course.modules.count(),
        })
    
    return Response(courses_list)


@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def api_content_course_structure(request, course_id):
    """Get complete course structure with modules and lessons"""
    from .models import Course
    
    try:
        course = Course.objects.get(id=course_id, status='published')
        
        modules_data = []
        for module in course.modules.all():
            lessons_data = []
            for lesson in module.lessons.all():
                lessons_data.append({
                    'id': lesson.id,
                    'title': lesson.title,
                    'type': lesson.lesson_type,
                    'duration_minutes': lesson.duration_minutes,
                    'content_url': lesson.video_url,
                    'content_text': lesson.content,
                    'order': lesson.order,
                })
            
            modules_data.append({
                'id': module.id,
                'title': module.title,
                'description': module.description,
                'order': module.order,
                'lessons': lessons_data,
            })
        
        return Response({
            'id': str(course.id),
            'title': course.title,
            'description': course.description,
            'modules': modules_data,
        })
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

# ============================================
# FILE UPLOAD ENDPOINTS
# ============================================

@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def upload_lesson_content(request, lesson_id):
    """Upload content file for a lesson"""
    from .models import CourseLesson  # LessonContent removed
    
    try:
        lesson = CourseLesson.objects.get(id=lesson_id)
        
        file = request.FILES.get('file')
        content_type = request.POST.get('content_type', 'file')
        title = request.POST.get('title', file.name if file else 'Untitled')
        
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get max order
        max_order = LessonContent.objects.filter(lesson=lesson).aggregate(
            models.Max('order')
        )['order__max'] or 0
        
        content = LessonContent.objects.create(
            lesson=lesson,
            content_type=content_type,
            title=title,
            file=file,
            file_size=file.size,
            order=max_order + 1
        )
        
        return Response({
            'success': True,
            'content': {
                'id': content.id,
                'title': content.title,
                'content_type': content.content_type,
                'file_url': content.file.url if content.file else None,
                'file_size': content.file_size,
            }
        })
    except CourseLesson.DoesNotExist:
        return Response({'error': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsSuperAdmin])
def delete_lesson_content(request, content_id):
    """Delete a content block"""
    # # from .models import LessonContent
    
    try:
        content = LessonContent.objects.get(id=content_id)
        content.delete()
        return Response({'success': True, 'message': 'Content deleted'})
    except LessonContent.DoesNotExist:
        return Response({'error': 'Content not found'}, status=status.HTTP_404_NOT_FOUND)

# ============================================
# ADMIN - CREATE & DELETE COURSES
# ============================================

@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def admin_create_course(request):
    """Create a new course"""
    from .models import Course
    
    try:
        data = request.data
        
        course = Course.objects.create(
            title=data.get('title', 'New Course'),
            subtitle=data.get('subtitle', ''),
            description=data.get('description', ''),
            difficulty=data.get('difficulty', 'Beginner'),
            price=data.get('price', 0),
            language=data.get('language', 'Nederlands'),
            is_featured=data.get('featured', False),
            is_bestseller=data.get('bestseller', False),
            certificate=data.get('certificate', True),
            status='draft'
        )
        
        return Response({
            'id': str(course.id),
            'title': course.title,
            'message': 'Course created successfully'
        }, status=201)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=400)


@api_view(['DELETE'])
@permission_classes([IsSuperAdmin])
def admin_delete_course(request, course_id):
    """Delete a course"""
    from .models import Course
    
    try:
        course = Course.objects.get(id=course_id)
        course_title = course.title
        course.delete()
        
        return Response({
            'message': f'Course "{course_title}" deleted successfully'
        }, status=200)
        
    except Course.DoesNotExist:
        return Response({
            'error': 'Course not found'
        }, status=404)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=400)

@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def get_lesson_content(request, lesson_id):
    """Get all content blocks for a lesson"""
    # # from .models import LessonContent
    
    try:
        contents = LessonContent.objects.filter(lesson_id=lesson_id).order_by('order')
        contents_list = []
        
        for content in contents:
            contents_list.append({
                'id': content.id,
                'title': content.title,
                'content_type': content.content_type,
                'file_url': content.file.url if content.file else None,
                'file_size': content.file_size,
                'order': content.order,
            })
        
        return Response(contents_list)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================
# QUIZ ENDPOINTS
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz(request, lesson_id):
    """Get quiz questions for a lesson"""
    try:
        lesson = CourseLesson.objects.get(id=lesson_id, lesson_type='quiz')
    except CourseLesson.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=404)
    
    questions = lesson.questions.prefetch_related('answers').all()
    data = []
    for q in questions:
        answers = [
            {
                'id': a.id,
                'text': a.answer_text_nl if request.GET.get('lang') == 'nl' and a.answer_text_nl else a.answer_text,
                'order': a.order,
            }
            for a in q.answers.all()
        ]
        data.append({
            'id': q.id,
            'question': q.question_text_nl if request.GET.get('lang') == 'nl' and q.question_text_nl else q.question_text,
            'type': q.question_type,
            'points': q.points,
            'answers': answers,
        })
    
    return Response({'questions': data, 'total_points': sum(q.points for q in questions)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, lesson_id):
    """Submit quiz answers and get results"""
    try:
        lesson = CourseLesson.objects.get(id=lesson_id, lesson_type='quiz')
    except CourseLesson.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=404)
    
    user_answers = request.data.get('answers', {})
    questions = lesson.questions.prefetch_related('answers').all()
    
    score = 0
    max_score = 0
    results = []
    
    for q in questions:
        max_score += q.points
        correct_ids = set(q.answers.filter(is_correct=True).values_list('id', flat=True))
        selected_ids = set(int(a) for a in user_answers.get(str(q.id), []))
        is_correct = correct_ids == selected_ids
        
        if is_correct:
            score += q.points
        
        results.append({
            'question_id': q.id,
            'correct': is_correct,
            'correct_answers': list(correct_ids),
            'selected_answers': list(selected_ids),
            'explanation': q.explanation_nl if request.data.get('lang') == 'nl' and q.explanation_nl else q.explanation,
        })
    
    passed = (score / max_score * 100) >= 70 if max_score > 0 else False
    
    # Save attempt
    enrollment = Enrollment.objects.filter(
        user=request.user,
        course=lesson.module.course
    ).first()
    
    if enrollment:
        from .models import QuizAttempt
        QuizAttempt.objects.create(
            enrollment=enrollment,
            lesson=lesson,
            score=score,
            max_score=max_score,
            passed=passed,
            answers=user_answers,
            completed_at=timezone.now(),
        )
        
        # Mark lesson as completed if passed
        if passed:
            enrollment.completed_lessons.add(lesson)
    
    return Response({
        'score': score,
        'max_score': max_score,
        'percentage': int(score / max_score * 100) if max_score > 0 else 0,
        'passed': passed,
        'results': results,
    })


# ============================================
# DOWNLOAD / RESOURCE ENDPOINTS
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lesson_resources(request, lesson_id):
    """Get downloadable resources for a lesson"""
    try:
        lesson = CourseLesson.objects.get(id=lesson_id)
    except CourseLesson.DoesNotExist:
        return Response({'error': 'Lesson not found'}, status=404)
    
    from .models import LessonResource
    resources = LessonResource.objects.filter(lesson=lesson)
    data = [
        {
            'id': r.id,
            'name': r.name_nl if request.GET.get('lang') == 'nl' and r.name_nl else r.name,
            'file_type': r.file_type,
            'file_size': r.file_size,
            'download_url': f'/api/v1/academy/resources/{r.id}/download/',
        }
        for r in resources
    ]
    return Response({'resources': data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_resource(request, resource_id):
    """Download a lesson resource file"""
    from .models import LessonResource
    try:
        resource = LessonResource.objects.get(id=resource_id)
    except LessonResource.DoesNotExist:
        return Response({'error': 'Resource not found'}, status=404)
    
    if resource.file:
        response = FileResponse(resource.file.open('rb'), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{resource.name}"'
        return response
    
    return Response({'error': 'File not available'}, status=404)


# ============================================
# CERTIFICATE ENDPOINT
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_certificate(request, course_id):
    """Generate a completion certificate"""
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    
    enrollment = Enrollment.objects.filter(
        user=request.user,
        course=course
    ).first()
    
    if not enrollment:
        return Response({'error': 'Not enrolled'}, status=403)
    
    # Check completion
    progress = enrollment.calculate_progress()
    if progress < 100:
        return Response({
            'error': 'Course not completed',
            'progress': progress,
        }, status=400)
    
    # Generate or get existing certificate
    from .models import Certificate
    import uuid
    
    cert, created = Certificate.objects.get_or_create(
        enrollment=enrollment,
        defaults={
            'certificate_number': f"PXP-{course.slug[:6].upper()}-{str(uuid.uuid4())[:8].upper()}",
        }
    )
    
    return Response({
        'certificate_number': cert.certificate_number,
        'course_title': course.title,
        'student_name': f"{enrollment.first_name} {enrollment.last_name}",
        'issued_at': cert.issued_at.isoformat(),
        'course_duration': course.duration_hours,
        'has_pdf': bool(cert.pdf_file),
        'pdf_url': cert.pdf_file.url if cert.pdf_file else None,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_certificate(request, certificate_number):
    """Verify a certificate by its number"""
    from .models import Certificate
    try:
        cert = Certificate.objects.select_related(
            'enrollment', 'enrollment__course'
        ).get(certificate_number=certificate_number)
    except Certificate.DoesNotExist:
        return Response({'valid': False, 'error': 'Certificate not found'}, status=404)
    
    return Response({
        'valid': True,
        'certificate_number': cert.certificate_number,
        'course_title': cert.enrollment.course.title,
        'student_name': f"{cert.enrollment.first_name} {cert.enrollment.last_name}",
        'issued_at': cert.issued_at.isoformat(),
    })
class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for browsing available skills
    """
    queryset = Skill.objects.all().select_related('category')
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]


class SkillCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for browsing skill categories with user progress
    """
    queryset = SkillCategory.objects.all().prefetch_related('skills')
    serializer_class = SkillCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UserSkillViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing user's skill progress
    """
    serializer_class = UserSkillSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSkill.objects.filter(
            user=self.request.user
        ).select_related('skill', 'skill__category').order_by('-points')
    
    @action(detail=False, methods=['post'])
    def award_points(self, request):
        """
        Award skill points to user
        POST /api/v1/academy/skills/user-skills/award_points/
        Body: {
            "lesson_id": "l1",
            "activity_type": "lesson_complete",  # optional
            "bonus_multiplier": 1.0  # optional
        }
        """
        lesson_id = request.data.get('lesson_id')
        activity_type = request.data.get('activity_type', 'lesson_complete')
        bonus_multiplier = float(request.data.get('bonus_multiplier', 1.0))
        
        if not lesson_id:
            return Response(
                {'error': 'lesson_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get skill mappings for this lesson
        mappings = LessonSkillMapping.objects.filter(
            lesson_id=lesson_id
        ).select_related('skill')
        
        if not mappings.exists():
            return Response(
                {'error': f'No skill mappings found for lesson {lesson_id}'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        awarded_skills = []
        level_ups = []
        
        for mapping in mappings:
            # Calculate points based on activity type
            points = mapping.points_awarded
            
            if activity_type == 'quiz_pass':
                points += mapping.quiz_bonus
            elif activity_type == 'simulation_correct':
                points += mapping.simulation_bonus
            elif activity_type == 'practice_submit':
                points += mapping.practice_bonus
            
            # Apply bonus multiplier (for streaks, etc.)
            points = int(points * bonus_multiplier)
            
            # Get or create user skill
            user_skill, created = UserSkill.objects.get_or_create(
                user=request.user,
                skill=mapping.skill,
                defaults={'points': 0, 'level': 1}
            )
            
            old_level = user_skill.level
            leveled_up = user_skill.add_points(points)
            
            # Log activity
            SkillActivity.objects.create(
                user=request.user,
                skill=mapping.skill,
                activity_type=activity_type,
                points=points,
                metadata={'lesson_id': lesson_id}
            )
            
            awarded_skills.append({
                'skill_id': mapping.skill.id,
                'skill_name': mapping.skill.name,
                'points_awarded': points,
                'total_points': user_skill.points,
                'level': user_skill.level,
                'leveled_up': leveled_up
            })
            
            if leveled_up:
                level_ups.append({
                    'skill_id': mapping.skill.id,
                    'skill_name': mapping.skill.name,
                    'old_level': old_level,
                    'new_level': user_skill.level
                })
                
                # Check if goal achieved
                goals = SkillGoal.objects.filter(
                    user=request.user,
                    skill=mapping.skill,
                    achieved=False
                )
                for goal in goals:
                    if user_skill.level >= goal.target_level:
                        goal.achieved = True
                        goal.achieved_at = timezone.now()
                        goal.save()
        
        return Response({
            'awarded_skills': awarded_skills,
            'level_ups': level_ups,
            'total_skills_updated': len(awarded_skills)
        })
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get overall skill progress summary
        GET /api/v1/academy/skills/user-skills/summary/
        """
        user_skills = UserSkill.objects.filter(user=request.user)
        
        total_skills = Skill.objects.count()
        skills_started = user_skills.count()
        total_points = user_skills.aggregate(Sum('points'))['points__sum'] or 0
        avg_level = user_skills.aggregate(Avg('level'))['level__avg'] or 0
        
        level_distribution = {
            'beginner': user_skills.filter(level=1).count(),
            'intermediate': user_skills.filter(level=2).count(),
            'advanced': user_skills.filter(level=3).count(),
            'expert': user_skills.filter(level=4).count(),
            'master': user_skills.filter(level=5).count(),
        }
        
        return Response({
            'total_skills': total_skills,
            'skills_started': skills_started,
            'total_points': total_points,
            'avg_level': round(avg_level, 2),
            'level_distribution': level_distribution,
            'completion_rate': round((skills_started / total_skills * 100), 1) if total_skills > 0 else 0
        })


class SkillGoalViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing skill goals
    """
    serializer_class = SkillGoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SkillGoal.objects.filter(
            user=self.request.user
        ).select_related('skill', 'skill__category')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active (not achieved) goals"""
        active_goals = self.get_queryset().filter(achieved=False)
        serializer = self.get_serializer(active_goals, many=True)
        return Response(serializer.data)


class SkillActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing skill activity log
    """
    serializer_class = SkillActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = SkillActivity.objects.filter(
            user=self.request.user
        ).select_related('skill').order_by('-created_at')
        
        # Filter by skill if provided
        skill_id = self.request.query_params.get('skill_id')
        if skill_id:
            queryset = queryset.filter(skill_id=skill_id)
        
        # Filter by activity type if provided
        activity_type = self.request.query_params.get('activity_type')
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get last 20 skill activities"""
        recent_activities = self.get_queryset()[:20]
        serializer = self.get_serializer(recent_activities, many=True)
        return Response(serializer.data)
@api_view(['POST'])
def analyze_lesson_for_visual(request):
    """
    Analyze lesson content using OpenAI to select best visual.
    
    POST /api/academy/analyze-lesson/
    Body: {
        "courseTitle": "...",
        "moduleTitle": "...",
        "lessonTitle": "...",
        "methodology": "..."
    }
    """
    try:
        # Get request data
        course_title = request.data.get('courseTitle', '')
        module_title = request.data.get('moduleTitle', '')
        lesson_title = request.data.get('lessonTitle', '')
        methodology = request.data.get('methodology', 'generic_pm')
        
        logger.info(f"Analyzing lesson: {lesson_title}")
        
        # Initialize OpenAI client
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Create prompt
        prompt = f"""Analyze this project management lesson and extract key concepts:

**Course:** {course_title}
**Module:** {module_title}
**Lesson:** {lesson_title}
**Methodology:** {methodology or 'generic PM'}

Extract (respond ONLY with valid JSON):

1. **primaryConcepts**: 3-5 core keywords/topics (lowercase)
2. **learningIntent**: Choose ONE:
   - explain_concept, compare_options, apply_template, measure_metric
   - analyze_data, flow_visualization, role_definition, governance
   - process_overview, decision_making, tooling

3. **conceptClass**: Choose ONE:
   - metric_visualization, diagram, template, framework, process_flow
   - role_matrix, governance, comparison, analysis, planning
   - tool_interface, definition

4. **methodologyDetected**: Detect if lesson is methodology-specific:
   - generic_pm, scrum, kanban, prince2, lean_six_sigma, safe
   - agile, waterfall, leadership, program_management

5. **confidence**: 0.0-1.0 score
6. **reasoning**: Brief 1-sentence explanation

Respond ONLY with JSON (no markdown):
{{
  "primaryConcepts": ["concept1", "concept2", "concept3"],
  "learningIntent": "role_definition",
  "conceptClass": "role_matrix",
  "methodologyDetected": "generic_pm",
  "confidence": 0.95,
  "reasoning": "Lesson focuses on project manager roles and responsibilities"
}}"""

        # Call OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in project management education. Extract semantic concepts accurately and respond ONLY with valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=300,
            response_format={"type": "json_object"}
        )
        
        # Parse result
        result_str = response.choices[0].message.content
        result = json.loads(result_str)
        
        logger.info(f"Analysis complete: {result.get('primaryConcepts', [])}")
        
        return Response(result, status=200)
        
    except Exception as e:
        logger.error(f"Error in analyze_lesson_for_visual: {str(e)}", exc_info=True)
        
        # Return fallback (still 200 to not break frontend)
        return Response({
            "primaryConcepts": [lesson_title.lower()] if lesson_title else ["unknown"],
            "learningIntent": "explain_concept",
            "conceptClass": "framework",
            "methodologyDetected": methodology or "generic_pm",
            "confidence": 0.5,
            "reasoning": f"Fallback due to error: {str(e)}"
        }, status=200)