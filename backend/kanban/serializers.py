from rest_framework import serializers
from .models import (
    KanbanBoard, KanbanColumn, KanbanSwimlane, KanbanCard,
    CardHistory, CardComment, CardChecklist, ChecklistItem,
    CumulativeFlowData, KanbanMetrics, WipLimitViolation
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
    
    class Meta:
        model = KanbanCard
        fields = '__all__'
        read_only_fields = ['board', 'created_at', 'updated_at', 'entered_column_at']
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_checklists_count(self, obj):
        return obj.checklists.count()


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
