from django.db.models import Count, Sum, Q, Value, DecimalField
from django.db.models.functions import TruncMonth, TruncWeek, ExtractWeekDay, Coalesce
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from accounts.models import CustomUser, Company
from accounts.permissions import HasRole
from accounts.serializers import AdminCreateUserSerializer, CustomUserSerializer
from projects.models import Project, Expense
from subscriptions.models import CompanySubscription


@api_view(["GET"])
@permission_classes([IsAuthenticated, HasRole("superadmin")])
def overview_stats(request):
    """
    Comprehensive admin dashboard stats with MoM deltas and chart data.
    Returns:
    - totals: users, projects, revenue, active_subscriptions
    - mom_change_pct: percentage change vs previous month for above metrics
    - series:
        * monthly_revenue: last 12 months [{month: 'YYYY-MM', value: number}]
        * weekly_projects: current week Mon-Sun [{day: 'Mon', value: number}]
    """
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    prev_month_end = start_of_month - timezone.timedelta(seconds=1)
    start_of_prev_month = prev_month_end.replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )

    # Totals (to-date)
    total_users = CustomUser.objects.count()
    total_projects = Project.objects.count()
    # Revenue proxy using active/trialing/past_due subscriptions' plan price
    total_revenue = (
        CompanySubscription.objects.filter(status__in=["active", "trialing", "past_due"])  # type: ignore
        .aggregate(
            total=Coalesce(
                Sum("plan__price"),
                Value(0, output_field=DecimalField(max_digits=12, decimal_places=2)),
            )
        )
        .get("total", 0)
    )
    active_subscriptions = CompanySubscription.objects.filter(
        status__in=["active", "trialing", "past_due"]
    ).count()

    # Month-over-month metrics
    def safe_pct(curr: float, prev: float) -> float:
        if prev == 0:
            return 0.0 if curr == 0 else 100.0
        return round(((curr - prev) / prev) * 100.0, 1)

    # Current month counts
    cm_users = CustomUser.objects.filter(
        date_joined__gte=start_of_month, date_joined__lte=now
    ).count()
    pm_users = CustomUser.objects.filter(
        date_joined__gte=start_of_prev_month, date_joined__lte=prev_month_end
    ).count()

    cm_projects = Project.objects.filter(
        created_at__gte=start_of_month, created_at__lte=now
    ).count()
    pm_projects = Project.objects.filter(
        created_at__gte=start_of_prev_month, created_at__lte=prev_month_end
    ).count()

    cm_revenue = (
        CompanySubscription.objects.filter(
            status__in=["active", "trialing", "past_due"],
            created_at__gte=start_of_month,
            created_at__lte=now,
        ).aggregate(
            total=Coalesce(
                Sum("plan__price"),
                Value(0, output_field=DecimalField(max_digits=12, decimal_places=2)),
            )
        )
    ).get("total", 0)
    pm_revenue = (
        CompanySubscription.objects.filter(
            status__in=["active", "trialing", "past_due"],
            created_at__gte=start_of_prev_month,
            created_at__lte=prev_month_end,
        ).aggregate(
            total=Coalesce(
                Sum("plan__price"),
                Value(0, output_field=DecimalField(max_digits=12, decimal_places=2)),
            )
        )
    ).get("total", 0)

    cm_active_subs = CompanySubscription.objects.filter(
        status__in=["active", "trialing", "past_due"],
        created_at__gte=start_of_month,
        created_at__lte=now,
    ).count()
    pm_active_subs = CompanySubscription.objects.filter(
        status__in=["active", "trialing", "past_due"],
        created_at__gte=start_of_prev_month,
        created_at__lte=prev_month_end,
    ).count()

    # Series: last 12 months revenue
    last_12_months_start = (start_of_month - timezone.timedelta(days=365)).replace(
        day=1
    )
    monthly_revenue_qs = (
        CompanySubscription.objects.filter(
            status__in=["active", "trialing", "past_due"],
            created_at__gte=last_12_months_start,
            created_at__lte=now,
        )
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(
            value=Coalesce(
                Sum("plan__price"),
                Value(0, output_field=DecimalField(max_digits=12, decimal_places=2)),
            )
        )
        .order_by("month")
    )
    # Ensure all months present
    series_months = {}
    for row in monthly_revenue_qs:
        series_months[row["month"].strftime("%Y-%m")] = float(row["value"])
    # Build ordered 12-month list up to current month
    months_series = []
    cursor = start_of_month.replace(day=1)
    # go back 11 months
    months = []
    for i in range(11, -1, -1):
        m = (cursor - timezone.timedelta(days=30 * i)).replace(day=1)
        months.append(m)
    for m in months:
        key = m.strftime("%Y-%m")
        months_series.append({"month": key, "value": series_months.get(key, 0.0)})

    # Series: current week Mon-Sun project creations
    # Django weekday: ExtractWeekDay -> 1=Sunday..7=Saturday; we map to Mon..Sun
    start_of_week = (now - timezone.timedelta(days=(now.weekday()))).replace(
        hour=0, minute=0, second=0, microsecond=0
    )  # Monday
    end_of_week = start_of_week + timezone.timedelta(
        days=6, hours=23, minutes=59, seconds=59
    )
    weekly_qs = (
        Project.objects.filter(
            created_at__gte=start_of_week, created_at__lte=end_of_week
        )
        .annotate(dow=ExtractWeekDay("created_at"))
        .values("dow")
        .annotate(value=Count("id"))
    )
    dow_map = {1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat"}
    # We want Mon..Sun order
    order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_counts = {dow_map.get(row["dow"]): row["value"] for row in weekly_qs}
    weekly_series = [{"day": d, "value": int(weekly_counts.get(d, 0))} for d in order]

    # Monthly projects series for last 12 months
    monthly_projects_qs = (
        Project.objects.filter(
            created_at__gte=last_12_months_start, created_at__lte=now
        )
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(value=Count("id"))
        .order_by("month")
    )
    mp_map = {
        row["month"].strftime("%Y-%m"): int(row["value"]) for row in monthly_projects_qs
    }
    monthly_projects_series = []
    for m in months:
        key = m.strftime("%Y-%m")
        monthly_projects_series.append({"month": key, "value": mp_map.get(key, 0)})

    return Response(
        {
            "totals": {
                "total_users": total_users,
                "total_projects": total_projects,
                "total_revenue": float(total_revenue),
                "active_subscriptions": active_subscriptions,
            },
            "mom_change_pct": {
                "users": safe_pct(cm_users, pm_users),
                "projects": safe_pct(cm_projects, pm_projects),
                "revenue": float(safe_pct(float(cm_revenue), float(pm_revenue))),
                "active_subscriptions": safe_pct(cm_active_subs, pm_active_subs),
            },
            "series": {
                "monthly_revenue": months_series,
                "weekly_projects": weekly_series,
                "monthly_projects": monthly_projects_series,
            },
        }
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, HasRole("superadmin")])
def users_list_create(request):
    """
    GET: list all users (basic fields)
    POST: create a new user anywhere (superadmin usage)
    """
    if request.method == "GET":
        q = request.query_params.get("q", "").strip()
        queryset = CustomUser.objects.all().select_related("company")
        if q:
            queryset = queryset.filter(
                Q(first_name__icontains=q)
                | Q(email__icontains=q)
                | Q(role__icontains=q)
                | Q(company__name__icontains=q)
            )

        paginator = PageNumberPagination()
        try:
            page_size = int(request.query_params.get("page_size", 10))
        except ValueError:
            page_size = 10
        paginator.page_size = page_size
        page = paginator.paginate_queryset(queryset, request)

        results = [
            {
                "id": u.id,
                "name": u.first_name,
                "email": u.email,
                "role": u.role,
                "last_login": u.last_login,
                "status": "Active" if u.is_active else "Inactive",
                "company": u.company.name if u.company else None,
            }
            for u in page
        ]
        return paginator.get_paginated_response(results)

    # POST: reuse AdminCreateUserSerializer but allow specifying company and role
    payload = request.data.copy()
    # If company id provided, attach company on instance creation
    company_id = payload.get("company_id")
    role = payload.get("role")

    serializer = AdminCreateUserSerializer(data=payload, context={"request": request})
    if serializer.is_valid():
        user = serializer.save()
        # If superadmin passed company_id, move the user to that company
        if company_id:
            try:
                company = Company.objects.get(id=company_id)
                user.company = company
                user.save(update_fields=["company"])
            except Company.DoesNotExist:
                pass

        return Response(CustomUserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, HasRole("superadmin")])
def user_delete(request, user_id: int):
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if user.role == "superadmin":
        return Response(
            {"detail": "Cannot delete a superadmin."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated, HasRole("superadmin")])
def subscriptions_list(request):
    q = request.query_params.get("q", "").strip()
    subs = (
        CompanySubscription.objects.select_related("company", "plan")
        .all()
        .order_by("-created_at")
    )
    if q:
        subs = subs.filter(
            Q(company__name__icontains=q)
            | Q(plan__name__icontains=q)
            | Q(status__icontains=q)
            | Q(stripe_subscription_id__icontains=q)
        )

    paginator = PageNumberPagination()
    try:
        page_size = int(request.query_params.get("page_size", 10))
    except ValueError:
        page_size = 10
    paginator.page_size = page_size
    page = paginator.paginate_queryset(subs, request)

    data = [
        {
            "company": s.company.name,
            "subscription_id": s.stripe_subscription_id,
            "plan": s.plan.name,
            "amount": float(s.plan.price),
            "status": s.status,
            "next_billing": s.current_period_end,
        }
        for s in page
    ]
    return paginator.get_paginated_response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, HasRole("superadmin")])
def notifications_list(request):
    """
    Basic placeholder notifications assembled from recent entities.
    """
    recent_projects = list(
        Project.objects.order_by("-created_at").values("id", "name")[:5]
    )
    recent_users = list(
        CustomUser.objects.order_by("-date_joined").values("id", "email")[:5]
    )

    items = []
    for p in recent_projects:
        items.append(
            {
                "id": f"project-{p['id']}",
                "title": f"New Project Created: {p['name']}",
                "time": "just now",
                "description": f"A new project '{p['name']}' has been created.",
            }
        )
    for u in recent_users:
        items.append(
            {
                "id": f"user-{u['id']}",
                "title": "New user registered",
                "time": "just now",
                "description": f"{u['email']} joined recently.",
            }
        )

    return Response({"items": items})


@api_view(["GET"])
@permission_classes([IsAuthenticated, HasRole("superadmin")])
def companies_list(request):
    """
    Lightweight list of companies for admin dropdowns.
    """
    companies = Company.objects.all().only("id", "name").order_by("name")
    data = [{"id": c.id, "name": c.name} for c in companies]
    return Response(data, status=status.HTTP_200_OK)
