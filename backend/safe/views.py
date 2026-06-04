from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from programs.models import Program

from .models import (
    AgileReleaseTrain, ARTSync, ProgramIncrement, PIObjective,
    Feature, Story, Dependency, SystemDemo, InspectAdapt,
)
from .serializers import (
    AgileReleaseTrainSerializer, ARTSyncSerializer,
    ProgramIncrementSerializer, PIObjectiveSerializer,
    FeatureSerializer, StorySerializer, DependencySerializer,
    SystemDemoSerializer, InspectAdaptSerializer,
)


def _get_company(user):
    return getattr(user, 'company', None)


def _verify_program_access(user, program_id):
    """Verify the user's company owns the target program."""
    company = _get_company(user)
    if not company or not Program.objects.filter(id=program_id, company=company).exists():
        raise PermissionDenied("You do not have access to this program.")


class AgileReleaseTrainViewSet(viewsets.ModelViewSet):
    serializer_class = AgileReleaseTrainSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['program', 'is_active']
    search_fields = ['name', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return AgileReleaseTrain.objects.none()
        queryset = AgileReleaseTrain.objects.select_related('program', 'rte').prefetch_related('syncs').filter(program__company=company)
        program_id = self.kwargs.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        return queryset

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        if program_id:
            _verify_program_access(self.request.user, program_id)
            serializer.save(program_id=program_id)
        else:
            serializer.save()


class ARTSyncViewSet(viewsets.ModelViewSet):
    serializer_class = ARTSyncSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return ARTSync.objects.none()
        queryset = ARTSync.objects.select_related('art', 'art__program').filter(art__program__company=company)
        program_id = self.kwargs.get('program_id')
        art_pk = self.kwargs.get('pk') or self.kwargs.get('art_pk')
        if program_id and art_pk:
            queryset = queryset.filter(art__program_id=program_id, art_id=art_pk)
        return queryset

    def perform_create(self, serializer):
        art_pk = self.kwargs.get('art_pk')
        if art_pk:
            serializer.save(art_id=art_pk)
        else:
            serializer.save()


class ProgramIncrementViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramIncrementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['program', 'status']
    ordering_fields = ['start_date', 'created_at']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return ProgramIncrement.objects.none()
        queryset = ProgramIncrement.objects.select_related('program').prefetch_related('objectives').filter(program__company=company)
        program_id = self.kwargs.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        return queryset

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        if program_id:
            _verify_program_access(self.request.user, program_id)
            serializer.save(program_id=program_id)
        else:
            serializer.save()


class PIObjectiveViewSet(viewsets.ModelViewSet):
    serializer_class = PIObjectiveSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['committed', 'achieved']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return PIObjective.objects.none()
        queryset = PIObjective.objects.select_related('pi', 'pi__program').filter(pi__program__company=company)
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            queryset = queryset.filter(pi_id=pi_id)
        return queryset

    def perform_create(self, serializer):
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            serializer.save(pi_id=pi_id)
        else:
            serializer.save()


class FeatureViewSet(viewsets.ModelViewSet):
    """SAFe Features on the Program Kanban, re-sorted by WSJF (highest first)."""
    serializer_class = FeatureSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['pi', 'art', 'state']
    search_fields = ['name', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return Feature.objects.none()
        qs = Feature.objects.select_related('pi', 'art', 'pi__program').prefetch_related('stories').filter(
            pi__program__company=company
        ) | Feature.objects.select_related('art').prefetch_related('stories').filter(
            pi__isnull=True, art__program__company=company
        )
        qs = qs.distinct()
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            qs = qs.filter(pi_id=pi_id)
        return qs

    def list(self, request, *args, **kwargs):
        # WSJF is computed, not a DB column. Filter in the DB, then re-sort in
        # Python so the Program Kanban surfaces in WSJF priority order (highest
        # first), then by stored order.
        queryset = self.filter_queryset(self.get_queryset())
        features = sorted(queryset, key=lambda f: (-f.wsjf, f.order))
        page = self.paginate_queryset(features)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(features, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            serializer.save(pi_id=pi_id)
        else:
            serializer.save()


class StoryViewSet(viewsets.ModelViewSet):
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['feature', 'team', 'state', 'iteration']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return Story.objects.none()
        qs = Story.objects.select_related('feature', 'team').filter(
            feature__pi__program__company=company
        ) | Story.objects.select_related('feature', 'team').filter(
            feature__pi__isnull=True, feature__art__program__company=company
        )
        qs = qs.distinct()
        feature_id = self.kwargs.get('feature_id')
        if feature_id:
            qs = qs.filter(feature_id=feature_id)
        return qs

    def perform_create(self, serializer):
        feature_id = self.kwargs.get('feature_id')
        if feature_id:
            serializer.save(feature_id=feature_id)
        else:
            serializer.save()


class DependencyViewSet(viewsets.ModelViewSet):
    """Program-board dependencies, ROAM-managed."""
    serializer_class = DependencySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pi', 'roam', 'is_resolved', 'source_feature', 'target_feature']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return Dependency.objects.none()
        qs = Dependency.objects.select_related(
            'pi', 'source_feature', 'target_feature', 'owner'
        ).filter(pi__program__company=company)
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            qs = qs.filter(pi_id=pi_id)
        return qs

    def perform_create(self, serializer):
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            serializer.save(pi_id=pi_id)
        else:
            serializer.save()


class SystemDemoViewSet(viewsets.ModelViewSet):
    serializer_class = SystemDemoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pi', 'iteration']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return SystemDemo.objects.none()
        qs = SystemDemo.objects.select_related('pi').prefetch_related('features_demoed').filter(
            pi__program__company=company
        )
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            qs = qs.filter(pi_id=pi_id)
        return qs

    def perform_create(self, serializer):
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            serializer.save(pi_id=pi_id)
        else:
            serializer.save()


class InspectAdaptViewSet(viewsets.ModelViewSet):
    serializer_class = InspectAdaptSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pi']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return InspectAdapt.objects.none()
        qs = InspectAdapt.objects.select_related('pi').filter(pi__program__company=company)
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            qs = qs.filter(pi_id=pi_id)
        return qs

    @action(detail=False, methods=['post'], url_path='snapshot')
    def snapshot(self, request, *args, **kwargs):
        """Snapshot live PI predictability into a (created/updated) I&A record.

        Predictability = sum(actual_value) / sum(business_value) across the PI's
        objectives, expressed as a percentage. Requires a pi_id (nested route or
        body)."""
        pi_id = self.kwargs.get('pi_id') or request.data.get('pi')
        if not pi_id:
            return Response({'detail': 'pi is required.', 'code': 'pi_required'}, status=400)
        company = _get_company(request.user)
        pi = ProgramIncrement.objects.filter(id=pi_id, program__company=company).first()
        if not pi:
            return Response({'detail': 'PI not found.', 'code': 'pi_not_found'}, status=404)
        planned = sum(o.business_value for o in pi.objectives.all())
        actual = sum(o.actual_value for o in pi.objectives.all())
        predictability = round(actual / planned * 100) if planned > 0 else None
        ia, _created = InspectAdapt.objects.get_or_create(pi=pi)
        ia.predictability = predictability
        ia.save(update_fields=['predictability', 'updated_at'])
        return Response(InspectAdaptSerializer(ia).data, status=200)

    def perform_create(self, serializer):
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            serializer.save(pi_id=pi_id)
        else:
            serializer.save()
