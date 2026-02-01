from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Avg, F
from datetime import timedelta
from .models import (
    KanbanBoard, KanbanColumn, KanbanSwimlane, KanbanCard,
    CardHistory, CardComment, CardChecklist, ChecklistItem,
    CumulativeFlowData, KanbanMetrics, WipLimitViolation
)
from .serializers import (
    KanbanBoardSerializer, KanbanBoardDetailSerializer,
    KanbanColumnSerializer, KanbanColumnWithCardsSerializer,
    KanbanSwimlaneSerializer, KanbanCardSerializer, KanbanCardDetailSerializer,
    CardCommentSerializer, CardChecklistSerializer, ChecklistItemSerializer,
    CardHistorySerializer, CumulativeFlowDataSerializer, KanbanMetricsSerializer,
    WipLimitViolationSerializer
)


class ProjectFilterMixin:
    """Mixin to filter by project and company"""
    
    def get_project(self):
        from projects.models import Project
        project_id = self.kwargs.get('project_id')
        return get_object_or_404(
            Project,
            id=project_id,
            company=self.request.user.company
        )


# =============================================================================
# KANBAN BOARD
# =============================================================================

class KanbanBoardViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = KanbanBoardSerializer
    permission_classes = [IsAuthenticated]

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
        serializer.save(project=project)

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return KanbanColumn.objects.filter(
            board__project_id=project_id,
            board__project__company=self.request.user.company
        )

    def perform_create(self, serializer):
        project = self.get_project()
        board = KanbanBoard.objects.get(project=project)
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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return KanbanSwimlane.objects.filter(
            board__project_id=project_id,
            board__project__company=self.request.user.company
        )

    def perform_create(self, serializer):
        project = self.get_project()
        board = KanbanBoard.objects.get(project=project)
        serializer.save(board=board)


# =============================================================================
# CARDS
# =============================================================================

class KanbanCardViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = KanbanCardSerializer
    permission_classes = [IsAuthenticated]

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
        board = KanbanBoard.objects.get(project=project)
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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return CardComment.objects.filter(
            card__board__project_id=project_id,
            card__board__project__company=self.request.user.company
        )


class CardChecklistViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = CardChecklistSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
        if completed_cards.exists():
            lead_times = []
            for card in completed_cards:
                if card.completed_date and card.created_at:
                    lead_time = (card.completed_date - card.created_at.date()).total_seconds() / 3600
                    lead_times.append(lead_time)
            if lead_times:
                avg_lead_time = sum(lead_times) / len(lead_times)
        
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
    permission_classes = [IsAuthenticated]

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
