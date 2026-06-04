from .models import WorkPolicy

from rest_framework import serializers
from .models import (
    KanbanBoard, KanbanColumn, KanbanSwimlane, KanbanCard,
    CardHistory, CardComment, CardChecklist, ChecklistItem,
    CumulativeFlowData, KanbanMetrics, WipLimitViolation,
    BlockEvent, KaizenAction, KanbanCadence,
)


class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = '__all__'
        read_only_fields = ['checklist']


class CardChecklistSerializer(serializers.ModelSerializer):
    items = ChecklistItemSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = CardChecklist
        fields = '__all__'
        read_only_fields = ['card']
    
    def get_progress(self, obj):
        total = obj.items.count()
        if total == 0:
            return 0
        completed = obj.items.filter(is_completed=True).count()
        return round((completed / total) * 100)


class CardCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = CardComment
        fields = '__all__'
        read_only_fields = ['card', 'user', 'created_at', 'updated_at']


class CardHistorySerializer(serializers.ModelSerializer):
    from_column_name = serializers.CharField(source='from_column.name', read_only=True)
    to_column_name = serializers.CharField(source='to_column.name', read_only=True)
    moved_by_name = serializers.CharField(source='moved_by.get_full_name', read_only=True)
    
    class Meta:
        model = CardHistory
        fields = '__all__'


class KanbanCardSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True)
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    column_name = serializers.CharField(source='column.name', read_only=True)
    swimlane_name = serializers.CharField(source='swimlane.name', read_only=True)
    comments_count = serializers.SerializerMethodField()
    checklists_count = serializers.SerializerMethodField()
    # Class-of-service + flow signals surfaced on every card.
    is_expedite = serializers.BooleanField(read_only=True)
    is_sle_breached = serializers.BooleanField(read_only=True)
    age_in_column_hours = serializers.FloatField(read_only=True)
    flow_age_hours = serializers.FloatField(read_only=True)
    blocked_hours = serializers.SerializerMethodField()

    class Meta:
        model = KanbanCard
        fields = '__all__'
        read_only_fields = ['board', 'created_at', 'updated_at', 'entered_column_at', 'blocked_at']

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_checklists_count(self, obj):
        return obj.checklists.count()

    def get_blocked_hours(self, obj):
        """Hours the card has been blocked in its currently-open block episode."""
        if not obj.is_blocked or not obj.blocked_at:
            return 0
        from django.utils import timezone
        return round((timezone.now() - obj.blocked_at).total_seconds() / 3600, 2)


class KanbanCardDetailSerializer(KanbanCardSerializer):
    comments = CardCommentSerializer(many=True, read_only=True)
    checklists = CardChecklistSerializer(many=True, read_only=True)
    history = CardHistorySerializer(many=True, read_only=True)


class KanbanColumnSerializer(serializers.ModelSerializer):
    cards_count = serializers.IntegerField(read_only=True)
    is_wip_exceeded = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = KanbanColumn
        fields = '__all__'
        read_only_fields = ['board', 'created_at', 'updated_at']


class KanbanColumnWithCardsSerializer(KanbanColumnSerializer):
    cards = KanbanCardSerializer(many=True, read_only=True)


class KanbanSwimlaneSerializer(serializers.ModelSerializer):
    class Meta:
        model = KanbanSwimlane
        fields = '__all__'
        read_only_fields = ['board', 'created_at']


class KanbanBoardSerializer(serializers.ModelSerializer):
    columns_count = serializers.SerializerMethodField()
    cards_count = serializers.SerializerMethodField()
    
    class Meta:
        model = KanbanBoard
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']
    
    def get_columns_count(self, obj):
        return obj.columns.count()
    
    def get_cards_count(self, obj):
        return obj.cards.count()


class KanbanBoardDetailSerializer(KanbanBoardSerializer):
    columns = KanbanColumnWithCardsSerializer(many=True, read_only=True)
    swimlanes = KanbanSwimlaneSerializer(many=True, read_only=True)


class CumulativeFlowDataSerializer(serializers.ModelSerializer):
    column_name = serializers.CharField(source='column.name', read_only=True)
    
    class Meta:
        model = CumulativeFlowData
        fields = '__all__'


class KanbanMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = KanbanMetrics
        fields = '__all__'
        read_only_fields = ['board', 'created_at']


class WipLimitViolationSerializer(serializers.ModelSerializer):
    column_name = serializers.CharField(source='column.name', read_only=True)
    
    class Meta:
        model = WipLimitViolation
        fields = '__all__'

class WorkPolicySerializer(serializers.ModelSerializer):
    column_name = serializers.CharField(source='column.name', read_only=True)

    class Meta:
        model = WorkPolicy
        fields = ['id', 'project', 'column', 'column_name', 'title', 'description',
                  'category', 'is_active', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']


class BlockEventSerializer(serializers.ModelSerializer):
    blocked_hours = serializers.FloatField(read_only=True)
    is_open = serializers.BooleanField(read_only=True)
    blocked_by_name = serializers.CharField(source='blocked_by.get_full_name', read_only=True)
    card_title = serializers.CharField(source='card.title', read_only=True)

    class Meta:
        model = BlockEvent
        fields = ['id', 'card', 'card_title', 'reason', 'blocked_at', 'unblocked_at',
                  'blocked_by', 'blocked_by_name', 'blocked_hours', 'is_open']
        read_only_fields = ['id', 'card', 'blocked_at', 'blocked_by']


class KaizenActionSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    source_card_title = serializers.CharField(source='source_card.title', read_only=True)

    class Meta:
        model = KaizenAction
        fields = ['id', 'project', 'board', 'title', 'description', 'trigger', 'status',
                  'owner', 'owner_name', 'source_card', 'source_card_title',
                  'created_by', 'created_at', 'updated_at', 'resolved_at']
        read_only_fields = ['id', 'project', 'created_by', 'created_at', 'updated_at']


class KanbanCadenceSerializer(serializers.ModelSerializer):
    cadence_type_display = serializers.CharField(source='get_cadence_type_display', read_only=True)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)

    class Meta:
        model = KanbanCadence
        fields = ['id', 'project', 'board', 'name', 'cadence_type', 'cadence_type_display',
                  'frequency', 'frequency_display', 'day_of_week', 'notes', 'is_active',
                  'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']
