from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Portfolio, GovernanceBoard, BoardMember, GovernanceStakeholder,
    Decision, Meeting, DecisionAuditLog, MeetingAction,
    DecisionVote, ComponentFunding,
)


class PortfolioSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    owner_name = serializers.SerializerMethodField()
    total_boards = serializers.SerializerMethodField()
    total_funded = serializers.ReadOnlyField()
    remaining_budget = serializers.ReadOnlyField()

    class Meta:
        model = Portfolio
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name() or obj.owner.email
        return None
    
    def get_total_boards(self, obj):
        return obj.boards.filter(is_active=True).count()


class BoardMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BoardMember
        fields = '__all__'
        read_only_fields = ['id', 'joined_at']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email


class GovernanceBoardSerializer(serializers.ModelSerializer):
    chair_email = serializers.EmailField(source='chair.email', read_only=True)
    chair_name = serializers.SerializerMethodField()
    members = BoardMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = GovernanceBoard
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
    
    def get_chair_name(self, obj):
        if obj.chair:
            return obj.chair.get_full_name() or obj.chair.email
        return None
    
    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()


class GovernanceStakeholderSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    quadrant = serializers.CharField(source='stakeholder_quadrant', read_only=True)
    engagement_gap = serializers.ReadOnlyField()
    email = serializers.EmailField(write_only=True, required=False)
    name = serializers.CharField(write_only=True, required=False)
    organization = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = GovernanceStakeholder
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'user': {'required': False},
        }
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def validate(self, data):
        if not data.get('user') and not data.get('email'):
            raise serializers.ValidationError("Either 'user' or 'email' must be provided.")
        return data

    def create(self, validated_data):
        User = get_user_model()
        email = validated_data.pop('email', None)
        name = validated_data.pop('name', '')
        validated_data.pop('organization', None)
        
        if email and 'user' not in validated_data:
            first_name = name.split()[0] if name else ''
            last_name = ' '.join(name.split()[1:]) if name and len(name.split()) > 1 else ''
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': first_name,
                    'last_name': last_name,
                }
            )
            validated_data['user'] = user

        return super().create(validated_data)


class DecisionSerializer(serializers.ModelSerializer):
    decided_by_name = serializers.SerializerMethodField()
    decided_by_email = serializers.EmailField(source='decided_by.email', read_only=True)
    target = serializers.SerializerMethodField()

    class Meta:
        model = Decision
        fields = '__all__'
        # applied_at is stamped server-side by the `apply` action only.
        read_only_fields = ['id', 'created_at', 'updated_at', 'applied_at']

    def get_decided_by_name(self, obj):
        if obj.decided_by:
            return obj.decided_by.get_full_name() or obj.decided_by.email
        return None

    def get_target(self, obj):
        kind, instance = obj.get_target()
        if instance is None:
            return None
        return {
            'kind': kind,
            'id': str(instance.id),
            'name': getattr(instance, 'name', str(instance)),
            'status': getattr(instance, 'status', None),
        }


class DecisionAuditLogSerializer(serializers.ModelSerializer):
    applied_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DecisionAuditLog
        fields = '__all__'
        read_only_fields = [f.name for f in DecisionAuditLog._meta.fields]

    def get_applied_by_name(self, obj):
        if obj.applied_by:
            return obj.applied_by.get_full_name() or obj.applied_by.email
        return None


class MeetingSerializer(serializers.ModelSerializer):
    facilitator_name = serializers.SerializerMethodField()
    attendee_count = serializers.SerializerMethodField()

    class Meta:
        model = Meeting
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_facilitator_name(self, obj):
        if obj.facilitator:
            return obj.facilitator.get_full_name() or obj.facilitator.email
        return None

    def get_attendee_count(self, obj):
        return obj.attendees.count()


class MeetingActionSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    meeting_title = serializers.CharField(source='meeting.title', read_only=True)

    class Meta:
        model = MeetingAction
        fields = '__all__'
        # closed_at is stamped server-side when the action enters a terminal state.
        read_only_fields = ['id', 'created_at', 'updated_at', 'closed_at']

    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name() or obj.owner.email
        return None

    def validate_meeting(self, meeting):
        """An action may only be attached to a meeting in the caller's tenant —
        otherwise a user could plant follow-ups inside another tenant's minutes."""
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        is_superadmin = getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False)
        if is_superadmin:
            return meeting
        company_id = getattr(getattr(user, 'company', None), 'id', None)
        owner_company_ids = {
            getattr(getattr(meeting.program, 'company', None), 'id', None),
            getattr(getattr(getattr(meeting.board, 'portfolio', None), 'company', None), 'id', None),
            getattr(getattr(getattr(meeting.board, 'program', None), 'company', None), 'id', None),
            getattr(getattr(getattr(meeting.board, 'project', None), 'company', None), 'id', None),
        }
        if company_id is None or company_id not in owner_company_ids:
            raise serializers.ValidationError("Meeting is not in your tenant.")
        return meeting


class DecisionVoteSerializer(serializers.ModelSerializer):
    voter_name = serializers.SerializerMethodField()
    voter_email = serializers.EmailField(source='voter.email', read_only=True)

    class Meta:
        model = DecisionVote
        fields = '__all__'
        read_only_fields = ['id', 'voter', 'created_at', 'updated_at']

    def get_voter_name(self, obj):
        return obj.voter.get_full_name() or obj.voter.email


class DecisionCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        from .models import DecisionComment
        model = DecisionComment
        fields = ['id', 'decision', 'author', 'author_name', 'body', 'created_at']
        read_only_fields = ['id', 'decision', 'author', 'author_name', 'created_at']

    def get_author_name(self, obj):
        if not obj.author:
            return None
        return obj.author.get_full_name() or obj.author.email


class DecisionEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    event_label = serializers.CharField(source='get_event_type_display', read_only=True)

    class Meta:
        from .models import DecisionEvent
        model = DecisionEvent
        fields = ['id', 'decision', 'actor', 'actor_name', 'event_type', 'event_label',
                  'from_tier', 'to_tier', 'detail', 'created_at']
        read_only_fields = fields

    def get_actor_name(self, obj):
        if not obj.actor:
            return None
        return obj.actor.get_full_name() or obj.actor.email


class ComponentFundingSerializer(serializers.ModelSerializer):
    portfolio_name = serializers.CharField(source='portfolio.name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ComponentFunding
        fields = '__all__'
        read_only_fields = [
            'id', 'status', 'approved_by', 'approved_at',
            'created_by', 'created_at', 'updated_at',
        ]

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.email
        return None
