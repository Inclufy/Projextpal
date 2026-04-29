from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Avg, F
from django.db import IntegrityError
from datetime import timedelta
from projects.permissions import MethodologyMatchesProjectPermission
from .models import (
    KanbanBoard, KanbanColumn, KanbanSwimlane, KanbanCard,
    CardHistory, CardComment, CardChecklist, ChecklistItem,
    CumulativeFlowData, KanbanMetrics, WipLimitViolation, WorkPolicy
)
from .serializers import (
    WorkPolicySerializer,
    KanbanBoardSerializer, KanbanBoardDetailSerializer,
    KanbanColumnSerializer, KanbanColumnWithCardsSerializer,
    KanbanSwimlaneSerializer, KanbanCardSerializer, KanbanCardDetailSerializer,
    CardCommentSerializer, CardChecklistSerializer, ChecklistItemSerializer,
    CardHistorySerializer, CumulativeFlowDataSerializer, KanbanMetricsSerializer,
    WipLimitViolationSerializer
)


class ProjectFilterMixin:
    """Mixin to filter by project membership (P2 fix — was company-only)."""

    def get_project(self):
        from django.db.models import Q
        from projects.models import Project
        user = self.request.user
        project_id = self.kwargs.get('project_id')
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return get_object_or_404(Project, id=project_id)
        return get_object_or_404(
            Project.objects.filter(
                Q(team_members__user=user, team_members__is_active=True)
                | Q(created_by=user)
            ).distinct(),
            id=project_id,
        )


# =============================================================================
# KANBAN BOARD
# =============================================================================

class KanbanBoardViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = KanbanBoardSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return KanbanBoard.objects.filter(
            project_id=project_id,
            project__company=self.request.user.company
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return KanbanBoardDetailSerializer
        return KanbanBoardSerializer

    def perform_create(self, serializer):
        project = self.get_project()
        # KanbanBoard.project is OneToOneField: second POST would raise
        # IntegrityError → 500. Make create idempotent.
        existing = KanbanBoard.objects.filter(project=project).first()
        if existing is not None:
            serializer.instance = existing
            return
        try:
            serializer.save(project=project)
        except IntegrityError:
            serializer.instance = KanbanBoard.objects.get(project=project)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        existed_before = KanbanBoard.objects.filter(
            project_id=self.kwargs.get('project_id')
        ).exists()
        self.perform_create(serializer)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK if existed_before else status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['post'])
    def initialize(self, request, project_id=None):
        """Initialize Kanban board with default columns"""
        project = self.get_project()
        board, created = KanbanBoard.objects.get_or_create(
            project=project,
            defaults={'name': f'{project.name} Board'}
        )
        
        if created:
            # Create default columns
            default_columns = [
                ('Backlog', 'backlog', None, False),
                ('To Do', 'todo', 5, False),
                ('In Progress', 'in_progress', 3, False),
                ('Review', 'review', 2, False),
                ('Done', 'done', None, True),
            ]
            for i, (name, col_type, wip, is_done) in enumerate(default_columns):
                KanbanColumn.objects.create(
                    board=board,
                    name=name,
                    column_type=col_type,
                    order=i,
                    wip_limit=wip,
                    is_done_column=is_done
                )
            
            # Create default swimlane
            KanbanSwimlane.objects.create(
                board=board,
                name='Default',
                order=0,
                is_default=True
            )
        
        return Response(KanbanBoardDetailSerializer(board).data)


# =============================================================================
# COLUMNS
# =============================================================================

class KanbanColumnViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = KanbanColumnSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return KanbanColumn.objects.filter(
            board__project_id=project_id,
            board__project__company=self.request.user.company
        )

    def perform_create(self, serializer):
        project = self.get_project()
        board, _ = KanbanBoard.objects.get_or_create(
            project=project,
            defaults={'name': f'{project.name} Board'}
        )
        serializer.save(board=board)

    @action(detail=False, methods=['post'])
    def reorder(self, request, project_id=None):
        """Reorder columns"""
        columns = request.data.get('columns', [])
        for col_data in columns:
            KanbanColumn.objects.filter(id=col_data['id']).update(order=col_data['order'])
        return Response({'status': 'reordered'})


# =============================================================================
# SWIMLANES
# =============================================================================

class KanbanSwimlaneViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = KanbanSwimlaneSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return KanbanSwimlane.objects.filter(
            board__project_id=project_id,
            board__project__company=self.request.user.company
        )

    def perform_create(self, serializer):
        project = self.get_project()
        board, _ = KanbanBoard.objects.get_or_create(
            project=project,
            defaults={'name': f'{project.name} Board'}
        )
        serializer.save(board=board)


# =============================================================================
# CARDS
# =============================================================================

class KanbanCardViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = KanbanCardSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        queryset = KanbanCard.objects.filter(
            board__project_id=project_id,
            board__project__company=self.request.user.company
        )
        
        # Filters
        column = self.request.query_params.get('column')
        swimlane = self.request.query_params.get('swimlane')
        assignee = self.request.query_params.get('assignee')
        priority = self.request.query_params.get('priority')
        is_blocked = self.request.query_params.get('is_blocked')
        
        if column:
            queryset = queryset.filter(column_id=column)
        if swimlane:
            queryset = queryset.filter(swimlane_id=swimlane)
        if assignee:
            queryset = queryset.filter(assignee_id=assignee)
        if priority:
            queryset = queryset.filter(priority=priority)
        if is_blocked:
            queryset = queryset.filter(is_blocked=is_blocked.lower() == 'true')
            
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return KanbanCardDetailSerializer
        return KanbanCardSerializer

    def perform_create(self, serializer):
        project = self.get_project()
        board, _ = KanbanBoard.objects.get_or_create(
            project=project,
            defaults={'name': f'{project.name} Board'}
        )
        serializer.save(board=board, reporter=self.request.user)

    @action(detail=True, methods=['post'])
    def move(self, request, project_id=None, pk=None):
        """Move card to different column/swimlane"""
        card = self.get_object()
        old_column = card.column
        
        new_column_id = request.data.get('column_id')
        new_swimlane_id = request.data.get('swimlane_id')
        new_order = request.data.get('order')
        
        if new_column_id:
            new_column = get_object_or_404(KanbanColumn, id=new_column_id)
            
            # Record history
            time_in_column = timezone.now() - card.entered_column_at
            CardHistory.objects.create(
                card=card,
                from_column=old_column,
                to_column=new_column,
                moved_by=request.user,
                time_in_column=time_in_column
            )
            
            card.column = new_column
            card.entered_column_at = timezone.now()
            
            # Check if moved to done column
            if new_column.is_done_column and not card.completed_date:
                card.completed_date = timezone.now().date()
            
            # Check WIP limit violation
            if new_column.wip_limit and new_column.cards.count() >= new_column.wip_limit:
                WipLimitViolation.objects.create(
                    column=new_column,
                    card_count=new_column.cards.count() + 1,
                    wip_limit=new_column.wip_limit
                )
        
        if new_swimlane_id:
            card.swimlane_id = new_swimlane_id
        
        if new_order is not None:
            card.order = new_order
        
        card.save()
        return Response(KanbanCardSerializer(card).data)

    @action(detail=True, methods=['post'])
    def toggle_blocked(self, request, project_id=None, pk=None):
        """Toggle blocked status"""
        card = self.get_object()
        card.is_blocked = not card.is_blocked
        card.blocked_reason = request.data.get('reason', '') if card.is_blocked else None
        card.save()
        return Response(KanbanCardSerializer(card).data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, project_id=None, pk=None):
        """Add comment to card"""
        card = self.get_object()
        serializer = CardCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(card=card, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_checklist(self, request, project_id=None, pk=None):
        """Add checklist to card"""
        card = self.get_object()
        serializer = CardChecklistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(card=card)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def reorder(self, request, project_id=None):
        """Reorder cards within column"""
        cards = request.data.get('cards', [])
        for card_data in cards:
            KanbanCard.objects.filter(id=card_data['id']).update(order=card_data['order'])
        return Response({'status': 'reordered'})


# =============================================================================
# COMMENTS & CHECKLISTS
# =============================================================================

class CardCommentViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = CardCommentSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return CardComment.objects.filter(
            card__board__project_id=project_id,
            card__board__project__company=self.request.user.company
        )


class CardChecklistViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = CardChecklistSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return CardChecklist.objects.filter(
            card__board__project_id=project_id,
            card__board__project__company=self.request.user.company
        )

    @action(detail=True, methods=['post'])
    def add_item(self, request, project_id=None, pk=None):
        """Add item to checklist"""
        checklist = self.get_object()
        serializer = ChecklistItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(checklist=checklist)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def toggle_item(self, request, project_id=None, pk=None):
        """Toggle checklist item completion"""
        item_id = request.data.get('item_id')
        item = get_object_or_404(ChecklistItem, id=item_id)
        item.is_completed = not item.is_completed
        item.save()
        return Response(ChecklistItemSerializer(item).data)


# =============================================================================
# METRICS
# =============================================================================

class KanbanMetricsViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = KanbanMetricsSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return KanbanMetrics.objects.filter(
            board__project_id=project_id,
            board__project__company=self.request.user.company
        )

    @action(detail=False, methods=['post'])
    def record_daily(self, request, project_id=None):
        """Record daily metrics snapshot"""
        project = self.get_project()
        board = get_object_or_404(KanbanBoard, project=project)
        today = timezone.now().date()
        
        # Count completed cards today
        completed_today = KanbanCard.objects.filter(
            board=board,
            completed_date=today
        ).count()
        
        # Calculate WIP
        in_progress_columns = board.columns.filter(
            column_type__in=['in_progress', 'review']
        )
        total_wip = KanbanCard.objects.filter(
            column__in=in_progress_columns
        ).count()
        
        # Calculate average lead time (cards completed in last 30 days)
        thirty_days_ago = today - timedelta(days=30)
        completed_cards = KanbanCard.objects.filter(
            board=board,
            completed_date__gte=thirty_days_ago,
            completed_date__isnull=False
        )
        
        avg_lead_time = None
        avg_cycle_time = None
        if completed_cards.exists():
            lead_times = []
            cycle_times = []
            for card in completed_cards:
                # Lead time = creation -> completion (Anderson "ready to done").
                if card.completed_date and card.created_at:
                    lead = (card.completed_date - card.created_at.date()).total_seconds() / 3600
                    lead_times.append(lead)
                # Cycle time = first time the card entered an in_progress
                # column -> completion. Falls back to entered_column_at if
                # history is missing.
                first_in_progress = card.history.filter(
                    to_column__column_type='in_progress'
                ).order_by('moved_at').first()
                started_at = first_in_progress.moved_at if first_in_progress else card.entered_column_at
                if card.completed_date and started_at:
                    cycle = (
                        card.completed_date - started_at.date()
                    ).total_seconds() / 3600
                    if cycle >= 0:
                        cycle_times.append(cycle)
            if lead_times:
                avg_lead_time = sum(lead_times) / len(lead_times)
            if cycle_times:
                avg_cycle_time = sum(cycle_times) / len(cycle_times)

        # Record CFD data
        for column in board.columns.all():
            CumulativeFlowData.objects.update_or_create(
                board=board,
                date=today,
                column=column,
                defaults={'card_count': column.cards.count()}
            )

        metrics, _ = KanbanMetrics.objects.update_or_create(
            board=board,
            date=today,
            defaults={
                'cards_completed': completed_today,
                'total_wip': total_wip,
                'avg_lead_time_hours': avg_lead_time,
                'avg_cycle_time_hours': avg_cycle_time,
            }
        )
        
        return Response(KanbanMetricsSerializer(metrics).data)

    @action(detail=False, methods=['get'])
    def cfd(self, request, project_id=None):
        """Get Cumulative Flow Diagram data"""
        project = self.get_project()
        board = get_object_or_404(KanbanBoard, project=project)
        
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)
        
        data = CumulativeFlowData.objects.filter(
            board=board,
            date__gte=start_date
        ).order_by('date', 'column__order')
        
        return Response(CumulativeFlowDataSerializer(data, many=True).data)

    @action(detail=False, methods=['get'])
    def throughput(self, request, project_id=None):
        """Get throughput data"""
        project = self.get_project()
        board = get_object_or_404(KanbanBoard, project=project)
        
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)
        
        metrics = KanbanMetrics.objects.filter(
            board=board,
            date__gte=start_date
        ).order_by('date')
        
        return Response(KanbanMetricsSerializer(metrics, many=True).data)


# =============================================================================
# DASHBOARD
# =============================================================================

class KanbanDashboardView(APIView):
    """Kanban Dashboard for a project"""
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get(self, request, project_id):
        from projects.models import Project
        
        project = get_object_or_404(
            Project,
            id=project_id,
            company=request.user.company
        )
        
        board = KanbanBoard.objects.filter(project=project).first()
        
        if not board:
            return Response({
                'project_id': project.id,
                'project_name': project.name,
                'has_board': False,
            })
        
        # Get column stats
        columns = board.columns.annotate(
            card_count=Count('cards')
        )
        
        # Get blocked cards
        blocked_count = board.cards.filter(is_blocked=True).count()
        
        # Get WIP violations
        wip_violations = []
        for col in columns:
            if col.wip_limit and col.card_count > col.wip_limit:
                wip_violations.append({
                    'column': col.name,
                    'count': col.card_count,
                    'limit': col.wip_limit
                })
        
        # Get recent metrics
        recent_metrics = KanbanMetrics.objects.filter(board=board).order_by('-date').first()
        
        # Get overdue cards
        today = timezone.now().date()
        overdue_count = board.cards.filter(
            due_date__lt=today
        ).exclude(
            column__is_done_column=True
        ).count()
        
        dashboard_data = {
            'project_id': project.id,
            'project_name': project.name,
            'has_board': True,
            'board': KanbanBoardSerializer(board).data,
            
            # Stats
            'total_cards': board.cards.count(),
            'blocked_count': blocked_count,
            'overdue_count': overdue_count,
            
            # WIP
            'wip_violations': wip_violations,
            
            # Columns summary
            'columns': KanbanColumnSerializer(columns, many=True).data,
            
            # Metrics
            'avg_lead_time': recent_metrics.avg_lead_time_hours if recent_metrics else None,
            'avg_cycle_time': recent_metrics.avg_cycle_time_hours if recent_metrics else None,
            'cards_completed_today': recent_metrics.cards_completed if recent_metrics else 0,
        }
        
        return Response(dashboard_data)

class WorkPolicyViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = WorkPolicySerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return WorkPolicy.objects.filter(project_id=project_id)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)


class KanbanSeedDemoView(APIView):
    """One-shot demo seeder for Kanban (board, columns, cards, policies).

    Restricted to admins, project managers and program managers.
    """
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def post(self, request, project_id=None):
        from datetime import date, timedelta
        from django.contrib.auth import get_user_model
        from django.db import transaction
        from projects.models import Project
        from .models import (
            KanbanBoard, KanbanColumn, KanbanSwimlane, KanbanCard,
            CardComment, CardChecklist, ChecklistItem, WorkPolicy,
        )

        User = get_user_model()
        project = get_object_or_404(Project, id=project_id, company=request.user.company)
        team_pool = list(User.objects.filter(company=project.company)[:5]) or [request.user]
        created = {}

        with transaction.atomic():
            board, _ = KanbanBoard.objects.get_or_create(
                project=project,
                defaults={'name': f'{project.name} Board', 'description': 'Single-team kanban board for current work-in-flight.'},
            )

            col_count = 0
            if not board.columns.exists():
                cols_seed = [
                    ('Backlog', 'backlog', None, '#94a3b8', False),
                    ('Ready', 'todo', 6, '#3b82f6', False),
                    ('In Progress', 'in_progress', 4, '#f59e0b', False),
                    ('Review', 'review', 3, '#a855f7', False),
                    ('Done', 'done', None, '#10b981', True),
                ]
                for order, (name, ctype, wip, color, is_done) in enumerate(cols_seed):
                    KanbanColumn.objects.create(
                        board=board, name=name, column_type=ctype, order=order,
                        wip_limit=wip, color=color, is_done_column=is_done,
                    )
                    col_count += 1
            created['columns'] = col_count

            sw_count = 0
            if not board.swimlanes.exists():
                for order, (name, color, default) in enumerate([
                    ('Default', '#f3f4f6', True),
                    ('Expedite', '#fee2e2', False),
                ]):
                    KanbanSwimlane.objects.create(board=board, name=name, color=color, is_default=default, order=order)
                    sw_count += 1
            created['swimlanes'] = sw_count

            cols = {c.column_type: c for c in board.columns.all()}
            default_lane = board.swimlanes.filter(is_default=True).first()
            expedite_lane = board.swimlanes.filter(is_default=False).first()

            card_count = 0
            if not board.cards.exists() and cols:
                cards_seed = [
                    ('Set up CI pipeline', 'task', 'high', 'done', 'default', 8, 7.5, -14, False, 'devops,ci'),
                    ('Login API contract', 'feature', 'high', 'done', 'default', 6, 5, -10, False, 'backend,auth'),
                    ('Design system tokens', 'task', 'medium', 'done', 'default', 12, 13, -8, False, 'design'),
                    ('OAuth integration', 'feature', 'high', 'in_progress', 'default', 16, 9, 4, False, 'backend,auth'),
                    ('Dashboard layout', 'feature', 'medium', 'in_progress', 'default', 10, 4, 6, False, 'frontend'),
                    ('Bug: timezone drift on reports', 'bug', 'critical', 'in_progress', 'expedite', 4, 2, 1, True, 'bug,backend'),
                    ('Cypress E2E for signup', 'task', 'medium', 'review', 'default', 6, 6, 2, False, 'qa'),
                    ('Update README + setup docs', 'task', 'low', 'review', 'default', 3, 2.5, 5, False, 'docs'),
                    ('Add export-to-PDF', 'feature', 'medium', 'todo', 'default', 8, None, 14, False, 'frontend'),
                    ('Performance audit (Lighthouse)', 'improvement', 'medium', 'todo', 'default', 4, None, 10, False, 'perf'),
                    ('Mobile responsive pass', 'task', 'medium', 'todo', 'default', 6, None, 12, False, 'frontend,mobile'),
                    ('Bug: 401 retry loop', 'bug', 'high', 'todo', 'expedite', 3, None, 2, False, 'bug,frontend'),
                    ('SSO with Google Workspace', 'feature', 'high', 'backlog', 'default', 12, None, 30, False, 'auth'),
                    ('Audit log viewer', 'feature', 'medium', 'backlog', 'default', 10, None, 45, False, 'admin'),
                    ('Notifications: digest emails', 'feature', 'low', 'backlog', 'default', 8, None, 60, False, 'notifications'),
                ]
                today = date.today()
                for order, (title, ctype, prio, col_type, lane, est, act, due_off, blocked, tags) in enumerate(cards_seed):
                    col = cols.get(col_type) or list(cols.values())[0]
                    swim = expedite_lane if lane == 'expedite' else default_lane
                    completed = today + timedelta(days=due_off - 5) if col.is_done_column else None
                    card = KanbanCard.objects.create(
                        board=board, column=col, swimlane=swim,
                        title=title, description=f"Auto-generated demo card for {title}.",
                        card_type=ctype, priority=prio, order=order,
                        assignee=team_pool[order % len(team_pool)],
                        reporter=team_pool[0],
                        start_date=today - timedelta(days=max(1, abs(due_off) // 2)) if act else None,
                        due_date=today + timedelta(days=due_off),
                        completed_date=completed,
                        estimated_hours=est, actual_hours=act,
                        is_blocked=blocked, blocked_reason='Awaiting upstream API fix' if blocked else None,
                        tags=tags,
                    )
                    if col_type == 'in_progress' and order < 6:
                        cl = CardChecklist.objects.create(card=card, title='Acceptance')
                        for i, item in enumerate(['Implementation', 'Unit tests', 'PR opened', 'Reviewed']):
                            ChecklistItem.objects.create(checklist=cl, text=item, is_completed=(i < 2), order=i)
                        CardComment.objects.create(
                            card=card, user=team_pool[0],
                            content='Picked this up — pairing with QA on edge cases.',
                        )
                    card_count += 1
            created['cards'] = card_count

            policy_count = 0
            if not WorkPolicy.objects.filter(project=project).exists():
                policies_seed = [
                    ('WIP limits enforced', 'Cards beyond column WIP cannot be added; pull policy applies.', 'workflow'),
                    ('Definition of Ready', 'Story has clear AC, sized < 3 days, dependencies resolved.', 'workflow'),
                    ('Definition of Done', 'Code reviewed, tests pass, deployed to staging, demoed.', 'quality'),
                    ('Expedite lane', 'Reserved for production incidents only — bypasses WIP.', 'process'),
                    ('Daily replenishment', 'Team pulls 1-2 ready cards every morning at standup.', 'team'),
                    ('Blocker escalation', 'Cards blocked >24h are flagged on the daily standup.', 'process'),
                ]
                for order, (title, desc, cat) in enumerate(policies_seed):
                    WorkPolicy.objects.create(
                        project=project, title=title, description=desc,
                        category=cat, is_active=True, order=order,
                    )
                    policy_count += 1
            created['policies'] = policy_count

        return Response({
            'success': True,
            'project_id': project.id,
            'created': created,
            'message': f"Kanban demo data seeded for {project.name}",
        })


class KanbanClearDemoView(APIView):
    """Wipe all Kanban data for a project (board, columns, cards, policies).

    Restricted to admins, project managers and program managers.
    """
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def post(self, request, project_id=None):
        from django.db import transaction
        from projects.models import Project
        from .models import KanbanBoard, WorkPolicy

        project = get_object_or_404(Project, id=project_id, company=request.user.company)
        deleted = {}
        with transaction.atomic():
            board = KanbanBoard.objects.filter(project=project).first()
            if board:
                deleted['cards'] = board.cards.count()
                deleted['columns'] = board.columns.count()
                deleted['swimlanes'] = board.swimlanes.count()
                board.delete()
            deleted['policies'] = WorkPolicy.objects.filter(project=project).count()
            WorkPolicy.objects.filter(project=project).delete()
        return Response({'success': True, 'deleted': deleted})
