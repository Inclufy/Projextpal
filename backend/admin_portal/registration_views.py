from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from accounts.models import Registration
from admin_portal.serializers import RegistrationSerializer, RegistrationStatsSerializer
from admin_portal.permissions import IsSuperAdmin

class RegistrationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing registrations in admin portal
    Read-only: list, retrieve, and stats
    """
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name', 'company_name']
    ordering_fields = ['registered_at', 'status', 'trial_days']
    ordering = ['-registered_at']

    def get_queryset(self):
        queryset = Registration.objects.select_related('user', 'user__company').all()
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by trial
        has_trial = self.request.query_params.get('has_trial')
        if has_trial == 'true':
            queryset = queryset.filter(trial_days__gt=0)
        elif has_trial == 'false':
            queryset = queryset.filter(trial_days=0)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(registered_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(registered_at__lte=end_date)
        
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get registration statistics"""
        now = timezone.now()
        
        # Overall stats
        total = Registration.objects.count()
        pending = Registration.objects.filter(status='pending').count()
        verified = Registration.objects.filter(status='verified').count()
        active = Registration.objects.filter(status='active').count()
        
        # Time-based stats
        today = Registration.objects.filter(
            registered_at__gte=now.date()
        ).count()
        
        this_week = Registration.objects.filter(
            registered_at__gte=now - timedelta(days=7)
        ).count()
        
        this_month = Registration.objects.filter(
            registered_at__gte=now - timedelta(days=30)
        ).count()
        
        # Trial stats
        with_trial = Registration.objects.filter(trial_days__gt=0).count()
        trial_active = Registration.objects.filter(
            status__in=['pending', 'verified', 'active'],
            trial_days__gt=0,
            trial_end_date__gte=now
        ).count()
        
        trial_expired = Registration.objects.filter(
            trial_days__gt=0,
            trial_end_date__lt=now
        ).count()
        
        # Newsletter subscribers
        newsletter_subscribers = Registration.objects.filter(
            subscribe_newsletter=True
        ).count()
        
        # Conversion rate (verified/active vs total)
        conversion_rate = 0
        if total > 0:
            converted = verified + active
            conversion_rate = round((converted / total) * 100, 2)
        
        data = {
            "total_registrations": total,
            "by_status": {
                "pending": pending,
                "verified": verified,
                "active": active,
            },
            "time_based": {
                "today": today,
                "this_week": this_week,
                "this_month": this_month,
            },
            "trial_stats": {
                "with_trial": with_trial,
                "trial_active": trial_active,
                "trial_expired": trial_expired,
            },
            "marketing": {
                "newsletter_subscribers": newsletter_subscribers,
            },
            "conversion_rate_percent": conversion_rate,
        }
        
        return Response(data)

    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a note to a registration"""
        registration = self.get_object()
        note = request.data.get('note', '')
        
        if note:
            if registration.notes:
                registration.notes += f"\n\n---\n{timezone.now()}: {note}"
            else:
                registration.notes = f"{timezone.now()}: {note}"
            registration.save()
        
        serializer = self.get_serializer(registration)
        return Response(serializer.data)