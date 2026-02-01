import stripe
import json
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils import timezone
from datetime import timezone as dt_timezone
from .models import CompanySubscription, SubscriptionPlan
from accounts.models import Company

stripe.api_key = settings.STRIPE_SECRET_KEY


@csrf_exempt
@require_POST
def stripe_webhook(request):
    """
    Handle Stripe webhook events for subscription management
    """
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        return HttpResponse(status=400)

    # Handle the event
    if event["type"] == "checkout.session.completed":
        handle_checkout_session_completed(event["data"]["object"])
    elif event["type"] == "customer.subscription.created":
        handle_subscription_created(event["data"]["object"])
    elif event["type"] == "customer.subscription.updated":
        handle_subscription_updated(event["data"]["object"])
    elif event["type"] == "customer.subscription.deleted":
        handle_subscription_deleted(event["data"]["object"])
    elif event["type"] == "invoice.payment_succeeded":
        handle_payment_succeeded(event["data"]["object"])
    elif event["type"] == "invoice.payment_failed":
        handle_payment_failed(event["data"]["object"])
    else:
        print(f'Unhandled event type {event["type"]}')

    return HttpResponse(status=200)


def handle_checkout_session_completed(session):
    """
    Handle successful checkout session completion
    """
    try:
        print(f"Processing checkout session: {session.get('id')}")
        metadata = session.get("metadata", {})
        print(f"Session metadata: {metadata}")

        user_id = metadata.get("user_id")
        company_id = metadata.get("company_id")
        plan_id = metadata.get("plan_id")

        if not all([user_id, company_id, plan_id]):
            print(
                f"Missing required metadata in checkout session. user_id: {user_id}, company_id: {company_id}, plan_id: {plan_id}"
            )
            return

        # Get the subscription from Stripe
        subscription_id = session.get("subscription")
        if not subscription_id:
            print("No subscription ID in checkout session")
            return

        print(f"Retrieving subscription: {subscription_id}")
        stripe_subscription = stripe.Subscription.retrieve(subscription_id)
        print(f"Subscription status: {stripe_subscription.get('status')}")

        # Create or update CompanySubscription
        create_or_update_subscription(
            user_id=user_id,
            company_id=company_id,
            plan_id=plan_id,
            stripe_subscription=stripe_subscription,
        )
        print("Successfully created/updated subscription")

    except Exception as e:
        print(f"Error handling checkout session completed: {str(e)}")
        import traceback

        traceback.print_exc()


def handle_subscription_created(subscription):
    """
    Handle new subscription creation
    """
    try:
        # For subscription.created events, we need to get metadata from the customer
        # or find the most recent checkout session for this customer
        customer_id = subscription.get("customer")

        if not customer_id:
            print("No customer ID in subscription")
            return

        # Try to get metadata from customer
        try:
            customer = stripe.Customer.retrieve(customer_id)
            metadata = customer.get("metadata", {})
            user_id = metadata.get("user_id")
            company_id = metadata.get("company_id")

            if not all([user_id, company_id]):
                print("Missing user_id or company_id in customer metadata")
                return

            # Get the plan from the subscription's price
            subscription_item = subscription.get("items", {}).get("data", [])
            if not subscription_item:
                print("No subscription items found")
                return

            price_id = subscription_item[0].get("price", {}).get("id")
            if not price_id:
                print("No price ID found in subscription")
                return

            # Find the plan by stripe_price_id
            try:
                plan = SubscriptionPlan.objects.get(stripe_price_id=price_id)
                plan_id = plan.id
            except SubscriptionPlan.DoesNotExist:
                print(f"No plan found with price ID: {price_id}")
                return

            create_or_update_subscription(
                user_id=user_id,
                company_id=company_id,
                plan_id=plan_id,
                stripe_subscription=subscription,
            )

        except stripe.error.StripeError as e:
            print(f"Error retrieving customer: {str(e)}")
            return

    except Exception as e:
        print(f"Error handling subscription created: {str(e)}")


def handle_subscription_updated(subscription):
    """
    Handle subscription updates (status changes, plan changes, etc.)
    """
    try:
        subscription_id = subscription["id"]

        # Find the local subscription
        company_subscription = CompanySubscription.objects.filter(
            stripe_subscription_id=subscription_id
        ).first()

        if not company_subscription:
            print(f"No local subscription found for Stripe ID: {subscription_id}")
            return

        # Update subscription details
        company_subscription.status = subscription["status"]
        current_period_start = subscription.get("current_period_start")
        current_period_end = subscription.get("current_period_end")

        print(f"Current period start: {current_period_start}")
        print(f"Current period end: {current_period_end}")

        company_subscription.current_period_start = (
            timezone.datetime.fromtimestamp(current_period_start, tz=dt_timezone.utc)
            if current_period_start is not None
            else None
        )
        company_subscription.current_period_end = (
            timezone.datetime.fromtimestamp(current_period_end, tz=dt_timezone.utc)
            if current_period_end is not None
            else None
        )

        print(f"Converted start: {company_subscription.current_period_start}")
        print(f"Converted end: {company_subscription.current_period_end}")
        company_subscription.cancel_at_period_end = subscription.get(
            "cancel_at_period_end", False
        )

        # If Stripe indicates cancellation is no longer scheduled, clear local canceled_at
        if company_subscription.cancel_at_period_end is False:
            company_subscription.canceled_at = None

        if subscription["status"] == "canceled":
            company_subscription.canceled_at = timezone.now()

        company_subscription.save()
        print(f"Saved to DB - start: {company_subscription.current_period_start}")
        print(f"Saved to DB - end: {company_subscription.current_period_end}")

        # Update company subscription status
        update_company_subscription_status(company_subscription.company)

    except Exception as e:
        print(f"Error handling subscription updated: {str(e)}")


def handle_subscription_deleted(subscription):
    """
    Handle subscription deletion/cancellation
    """
    try:
        subscription_id = subscription["id"]

        company_subscription = CompanySubscription.objects.filter(
            stripe_subscription_id=subscription_id
        ).first()

        if company_subscription:
            # Mark canceled and clear active flags so it won't be treated as active
            company_subscription.status = "canceled"
            company_subscription.cancel_at_period_end = False
            company_subscription.canceled_at = timezone.now()
            company_subscription.current_period_start = None
            company_subscription.current_period_end = None
            company_subscription.save()

            # Update company subscription status
            update_company_subscription_status(company_subscription.company)

    except Exception as e:
        print(f"Error handling subscription deleted: {str(e)}")


def handle_payment_succeeded(invoice):
    """
    Handle successful payment
    """
    try:
        subscription_id = invoice.get("subscription")
        if not subscription_id:
            return

        company_subscription = CompanySubscription.objects.filter(
            stripe_subscription_id=subscription_id
        ).first()

        if company_subscription:
            # Refresh subscription details from Stripe to capture timestamps
            stripe_subscription = stripe.Subscription.retrieve(subscription_id)

            company_subscription.status = "active"
            current_period_start = stripe_subscription.get("current_period_start")
            current_period_end = stripe_subscription.get("current_period_end")

            company_subscription.current_period_start = (
                timezone.datetime.fromtimestamp(
                    current_period_start, tz=dt_timezone.utc
                )
                if current_period_start is not None
                else None
            )
            company_subscription.current_period_end = (
                timezone.datetime.fromtimestamp(current_period_end, tz=dt_timezone.utc)
                if current_period_end is not None
                else None
            )
            company_subscription.cancel_at_period_end = stripe_subscription.get(
                "cancel_at_period_end", False
            )
            company_subscription.save()

            # Update company subscription status
            update_company_subscription_status(company_subscription.company)

    except Exception as e:
        print(f"Error handling payment succeeded: {str(e)}")


def handle_payment_failed(invoice):
    """
    Handle failed payment
    """
    try:
        subscription_id = invoice.get("subscription")
        if not subscription_id:
            return

        company_subscription = CompanySubscription.objects.filter(
            stripe_subscription_id=subscription_id
        ).first()

        if company_subscription:
            company_subscription.status = "past_due"
            company_subscription.save()

            # Update company subscription status
            update_company_subscription_status(company_subscription.company)

    except Exception as e:
        print(f"Error handling payment failed: {str(e)}")


def create_or_update_subscription(user_id, company_id, plan_id, stripe_subscription):
    """
    Create or update a CompanySubscription record
    """
    try:
        from django.contrib.auth import get_user_model

        User = get_user_model()

        print(
            f"Creating subscription for user_id: {user_id}, company_id: {company_id}, plan_id: {plan_id}"
        )

        user = User.objects.get(id=user_id)
        company = Company.objects.get(id=company_id)
        plan = SubscriptionPlan.objects.get(id=plan_id)

        print(f"Found user: {user.email}, company: {company.name}, plan: {plan.name}")

        # Check if there's an existing subscription with dummy IDs
        existing_subscription = CompanySubscription.objects.filter(
            company=company, stripe_subscription_id__startswith="sub_test_"
        ).first()

        if existing_subscription:
            # Update the existing test subscription with real Stripe data
            print(
                f"Updating existing test subscription {existing_subscription.id} with real Stripe data"
            )
            company_subscription = existing_subscription
            created = False
        else:
            # Get or create subscription normally
            company_subscription, created = CompanySubscription.objects.get_or_create(
                company=company,
                defaults={
                    "plan": plan,
                    "purchased_by": user,
                    "stripe_subscription_id": stripe_subscription["id"],
                    "stripe_customer_id": stripe_subscription["customer"],
                    "status": stripe_subscription["status"],
                    "current_period_start": (
                        timezone.datetime.fromtimestamp(
                            stripe_subscription.get("current_period_start"),
                            tz=dt_timezone.utc,
                        )
                        if stripe_subscription.get("current_period_start") is not None
                        else None
                    ),
                    "current_period_end": (
                        timezone.datetime.fromtimestamp(
                            stripe_subscription.get("current_period_end"),
                            tz=dt_timezone.utc,
                        )
                        if stripe_subscription.get("current_period_end") is not None
                        else None
                    ),
                    "cancel_at_period_end": stripe_subscription.get(
                        "cancel_at_period_end", False
                    ),
                },
            )

        print(
            f"Subscription {'created' if created else 'updated'}: {company_subscription.id}"
        )

        if not created:
            # Update existing subscription with real Stripe data
            company_subscription.plan = plan
            company_subscription.purchased_by = user
            company_subscription.stripe_subscription_id = stripe_subscription["id"]
            company_subscription.stripe_customer_id = stripe_subscription["customer"]
            company_subscription.status = stripe_subscription["status"]
            company_subscription.current_period_start = (
                timezone.datetime.fromtimestamp(
                    stripe_subscription.get("current_period_start"),
                    tz=dt_timezone.utc,
                )
                if stripe_subscription.get("current_period_start") is not None
                else None
            )
            company_subscription.current_period_end = (
                timezone.datetime.fromtimestamp(
                    stripe_subscription.get("current_period_end"), tz=dt_timezone.utc
                )
                if stripe_subscription.get("current_period_end") is not None
                else None
            )
            company_subscription.cancel_at_period_end = stripe_subscription.get(
                "cancel_at_period_end", False
            )
            company_subscription.save()
            print(
                f"Updated subscription with real Stripe IDs: customer={stripe_subscription['customer']}, subscription={stripe_subscription['id']}"
            )

        # Update company subscription status
        update_company_subscription_status(company)
        print(
            f"Updated company {company.name} subscription status to: {company.is_subscribed}"
        )

    except Exception as e:
        print(f"Error creating/updating subscription: {str(e)}")
        import traceback

        traceback.print_exc()


def update_company_subscription_status(company):
    """
    Update company's subscription status based on active subscriptions
    """
    try:
        # Check if company has any active subscriptions
        active_subscriptions = CompanySubscription.objects.filter(
            company=company, status__in=["active", "trialing"]
        ).exists()

        # Update company subscription status
        company.is_subscribed = active_subscriptions
        company.save()

    except Exception as e:
        print(f"Error updating company subscription status: {str(e)}")
