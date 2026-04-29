from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Portfolio, GovernanceBoard, BoardMember, GovernanceStakeholder,
    Decision, Meeting,
)


class PortfolioSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    owner_name = serializers.SerializerMethodField()
    total_boards = serializers.SerializerMethodField()
    
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

    class Meta:
        model = Decision
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_decided_by_name(self, obj):
        if obj.decided_by:
            return obj.decided_by.get_full_name() or obj.decided_by.email
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
