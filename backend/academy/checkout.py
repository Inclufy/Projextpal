"""Stripe checkout for one-time course purchases.

Separate from the subscription checkout in subscriptions/checkout_views.py
because courses are a one-time payment (mode='payment'), not recurring.

Flow:
  1. Client calls POST /academy/checkout/create-session/ with {course_id}
  2. If the course is free (price=0), we enroll directly and return a
     {checkout_url: null, enrollment_id: ...} so the client can skip
     the Stripe redirect.
  3. If paid, we create a Stripe Checkout session in 'payment' mode and
     return {checkout_url, session_id}.
  4. Stripe redirects back to /academy/checkout/success?session_id=...
  5. The webhook (subscriptions/webhooks.py) creates the Enrollment on
     checkout.session.completed when metadata.purchase_type == 'course'.
"""
import stripe
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Course, Enrollment

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course_checkout(request):
    """Start a checkout for a course.

    Body: {course_id: <uuid or slug>}
    Response (free): {
        "checkout_url": null,
        "enrollment_id": "<uuid>",
        "free": true
    }
    Response (paid): {
        "checkout_url": "https://checkout.stripe.com/...",
        "session_id": "cs_...",
        "free": false
    }
    """
    course_id = request.data.get('course_id')
    if not course_id:
        return Response(
            {'error': 'course_id is required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Accept UUID or slug (matches CourseViewSet.get_object logic)
    import uuid as _uuid
    try:
        _uuid.UUID(str(course_id))
        course = get_object_or_404(Course, pk=course_id)
    except (ValueError, TypeError):
        course = get_object_or_404(Course, slug=course_id)

    user = request.user

    # --- Free courses: enroll directly, skip Stripe ---
    if course.price == 0:
        enrollment, created = Enrollment.objects.get_or_create(
            user=user,
            course=course,
            defaults={
                'email': user.email,
                'first_name': getattr(user, 'first_name', '') or 'Student',
                'last_name': getattr(user, 'last_name', '') or '',
                'company': getattr(getattr(user, 'company', None), 'name', ''),
                'status': 'active',
                'amount_paid': 0,
            },
        )
        return Response({
            'checkout_url': None,
            'enrollment_id': str(enrollment.id),
            'free': True,
            'already_enrolled': not created,
        })

    # --- Paid courses: create a one-time Stripe Checkout session ---
    frontend_url = settings.FRONTEND_URL or 'https://projextpal.com'

    try:
        session = stripe.checkout.Session.create(
            mode='payment',  # one-time, not recurring
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'unit_amount': int(course.price * 100),  # cents
                    'product_data': {
                        'name': course.title,
                        'description': course.subtitle or course.description[:300],
                        'metadata': {
                            'course_id': str(course.id),
                            'course_slug': course.slug,
                        },
                    },
                },
                'quantity': 1,
            }],
            success_url=f'{frontend_url}/academy/checkout/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{frontend_url}/academy/course/{course.slug}',
            customer_email=user.email,
            metadata={
                'purchase_type': 'course',
                'course_id': str(course.id),
                'course_slug': course.slug,
                'user_id': str(user.id),
                'user_email': user.email,
            },
            allow_promotion_codes=True,
        )
        return Response({
            'checkout_url': session.url,
            'session_id': session.id,
            'free': False,
        })
    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def checkout_success(request):
    """GET /academy/checkout/success/?session_id=...

    After Stripe redirects the learner back, this endpoint:
      1. Verifies the session was paid
      2. Returns the enrollment_id so the frontend can redirect to the
         learning player
    The actual Enrollment row is created by the webhook (so this endpoint
    is safe to poll — it just reads state).
    """
    session_id = request.query_params.get('session_id')
    if not session_id:
        return Response({'error': 'session_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    paid = session.get('payment_status') == 'paid'
    course_id = session.get('metadata', {}).get('course_id')

    if not paid or not course_id:
        return Response({
            'paid': paid,
            'enrollment_id': None,
            'message': 'Payment still processing — please retry in a moment.',
        })

    # Look up the enrollment the webhook should have created by now
    enrollment = Enrollment.objects.filter(
        user=request.user,
        course_id=course_id,
    ).first()

    return Response({
        'paid': True,
        'enrollment_id': str(enrollment.id) if enrollment else None,
        'course_id': course_id,
        'ready': enrollment is not None,
    })
