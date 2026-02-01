"""
Stripe Checkout views for subscription payments.
"""
import stripe
from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import SubscriptionPlan as Plan, CompanySubscription as Subscription
from accounts.models import Company
import json

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """
    Create a Stripe Checkout session for subscription.
    """
    plan_id = request.data.get('plan_id')
    include_academy = request.data.get('include_academy', False)
    billing_period = request.data.get('billing_period', 'monthly')  # monthly or yearly
    
    if not plan_id:
        return Response({'error': 'plan_id is required'}, status=400)
    
    try:
        plan = Plan.objects.get(id=plan_id, is_active=True)
    except Plan.DoesNotExist:
        return Response({'error': 'Plan not found'}, status=404)
    
    # Build line items
    line_items = []
    
    # Main plan
    if plan.stripe_price_id:
        line_items.append({
            'price': plan.stripe_price_id,
            'quantity': 1,
        })
    else:
        # For custom plans without Stripe price, create price on the fly
        line_items.append({
            'price_data': {
                'currency': 'eur',
                'unit_amount': int(plan.price * 100),
                'recurring': {'interval': 'month' if billing_period == 'monthly' else 'year'},
                'product_data': {
                    'name': plan.name,
                    'description': plan.description or f'{plan.name} subscription',
                },
            },
            'quantity': 1,
        })
    
    # Academy add-on if selected and not included in plan
    if include_academy and not getattr(plan, 'includes_academy', False):
        # Academy add-on price (€15/month)
        line_items.append({
            'price_data': {
                'currency': 'eur',
                'unit_amount': 1500,  # €15.00
                'recurring': {'interval': 'month' if billing_period == 'monthly' else 'year'},
                'product_data': {
                    'name': 'Learning Academy',
                    'description': 'Full access to all training courses and certifications',
                },
            },
            'quantity': 1,
        })
    
    # Get or create Stripe customer
    user = request.user
    company = user.company
    
    if not company:
        return Response({'error': 'User must belong to a company'}, status=400)
    
    customer_id = getattr(company, 'stripe_customer_id', None)
    
    if not customer_id:
        # Create Stripe customer
        customer = stripe.Customer.create(
            email=user.email,
            name=company.name,
            metadata={
                'company_id': company.id,
                'user_id': user.id,
            }
        )
        customer_id = customer.id
        company.stripe_customer_id = customer_id
        company.save()
    
    # Create checkout session
    frontend_url = settings.FRONTEND_URL or 'http://localhost:8081'
    
    try:
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=line_items,
            mode='subscription',
            success_url=f'{frontend_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{frontend_url}/checkout/cancel',
            metadata={
                'company_id': company.id,
                'plan_id': plan.id,
                'user_id': user.id,
                'include_academy': str(include_academy),
            },
            subscription_data={
                'metadata': {
                    'company_id': company.id,
                    'plan_id': plan.id,
                }
            },
            allow_promotion_codes=True,
            billing_address_collection='required',
            customer_update={
                'address': 'auto',
                'name': 'auto',
            },
        )
        
        return Response({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id,
        })
        
    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Handle Stripe webhook events.
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        return Response({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return Response({'error': 'Invalid signature'}, status=400)
    
    # Handle events
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_checkout_completed(session)
    
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        handle_subscription_updated(subscription)
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        handle_subscription_deleted(subscription)
    
    elif event['type'] == 'invoice.payment_failed':
        invoice = event['data']['object']
        handle_payment_failed(invoice)
    
    return Response({'status': 'success'})


def handle_checkout_completed(session):
    """Handle successful checkout."""
    company_id = session['metadata'].get('company_id')
    plan_id = session['metadata'].get('plan_id')
    include_academy = session['metadata'].get('include_academy') == 'True'
    
    if not company_id or not plan_id:
        return
    
    try:
        company = Company.objects.get(id=company_id)
        plan = Plan.objects.get(id=plan_id)
    except (Company.DoesNotExist, Plan.DoesNotExist):
        return
    
    # Create or update subscription
    subscription, created = Subscription.objects.update_or_create(
        company=company,
        defaults={
            'plan': plan,
            'stripe_subscription_id': session.get('subscription'),
            'status': 'active',
            'includes_academy': include_academy or getattr(plan, 'includes_academy', False),
        }
    )
    
    # Update company
    company.subscription_status = 'active'
    company.save()


def handle_subscription_updated(stripe_subscription):
    """Handle subscription updates."""
    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_subscription['id']
        )
        subscription.status = stripe_subscription['status']
        subscription.save()
        
        # Update company status
        subscription.company.subscription_status = stripe_subscription['status']
        subscription.company.save()
    except Subscription.DoesNotExist:
        pass


def handle_subscription_deleted(stripe_subscription):
    """Handle subscription cancellation."""
    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_subscription['id']
        )
        subscription.status = 'cancelled'
        subscription.save()
        
        subscription.company.subscription_status = 'cancelled'
        subscription.company.save()
    except Subscription.DoesNotExist:
        pass


def handle_payment_failed(invoice):
    """Handle failed payment."""
    subscription_id = invoice.get('subscription')
    if subscription_id:
        try:
            subscription = Subscription.objects.get(
                stripe_subscription_id=subscription_id
            )
            subscription.status = 'past_due'
            subscription.save()
        except Subscription.DoesNotExist:
            pass


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def checkout_success(request):
    """
    Verify checkout session and return subscription details.
    """
    session_id = request.GET.get('session_id')
    
    if not session_id:
        return Response({'error': 'session_id required'}, status=400)
    
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == 'paid':
            return Response({
                'status': 'success',
                'message': 'Subscription activated successfully!',
                'subscription_id': session.subscription,
            })
        else:
            return Response({
                'status': 'pending',
                'message': 'Payment is being processed...',
            })
    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_plans(request):
    """
    Get all active subscription plans.
    """
    plans = Plan.objects.filter(is_active=True).order_by('price')
    
    data = []
    for plan in plans:
        data.append({
            'id': plan.id,
            'name': plan.name,
            'description': plan.description,
            'price': float(plan.price),
            'billing_type': plan.billing_type,
            'max_users': plan.max_users,
            'max_projects': plan.max_projects,
            'storage_gb': plan.storage_gb,
            'includes_academy': getattr(plan, 'includes_academy', False),
            'features': getattr(plan, 'features', []),
            'is_popular': getattr(plan, 'is_popular', False),
            'level': plan.level,
        })
    
    return Response(data)
