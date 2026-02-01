# surveys/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Avg
from .models import (
    Survey, 
    Question, 
    ArchivedLesson, 
    SurveyResponse, 
    SurveyAnswer, 
    SurveyInvitation,
    SurveyAnalytics
)

User = get_user_model()


class QuestionSerializer(serializers.ModelSerializer):
    """Enhanced serializer for survey questions with question types"""

    class Meta:
        model = Question
        fields = [
            "id", "text", "question_type", "required", "order", "choices"
        ]

    def validate_choices(self, value):
        """Validate choices for multiple choice questions"""
        # FIX: Check if initial_data exists and is accessible
        # When used as nested serializer, initial_data might not be available
        question_type = None
        if hasattr(self, 'initial_data') and isinstance(self.initial_data, dict):
            question_type = self.initial_data.get('question_type')
        
        # Only validate if we know it's multiple_choice
        if question_type == 'multiple_choice':
            if not value or not isinstance(value, list) or len(value) < 2:
                raise serializers.ValidationError(
                    "Multiple choice questions must have at least 2 choices"
                )
        return value

    def validate(self, data):
        """Cross-field validation for question data"""
        question_type = data.get('question_type')
        choices = data.get('choices')
        
        # Validate choices for multiple_choice questions
        if question_type == 'multiple_choice':
            if not choices or not isinstance(choices, list) or len(choices) < 2:
                raise serializers.ValidationError({
                    'choices': "Multiple choice questions must have at least 2 choices"
                })
        
        return data


class SurveyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for survey listing"""
    project_name = serializers.CharField(source="project.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.first_name", read_only=True)
    can_respond = serializers.SerializerMethodField()
    
    class Meta:
        model = Survey
        fields = [
            "id", "project", "project_name", "name", "description", 
            "deadline", "recipients", "responses", "status", 
            "created_by_name", "created_at", "can_respond"
        ]

    def get_can_respond(self, obj):
        """Check if current user can respond to this survey"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_user_respond(request.user)
        return False


class SurveyDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for survey with questions and extra info"""
    project_name = serializers.CharField(source="project.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.first_name", read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    can_respond = serializers.SerializerMethodField()
    user_response = serializers.SerializerMethodField()
    analytics = serializers.SerializerMethodField()

    class Meta:
        model = Survey
        fields = [
            "id", "project", "project_name", "name", "description",
            "deadline", "recipients_emails", "recipients", "responses",
            "status", "questions", "allowed_roles", "is_anonymous",
            "created_by_name", "created_at", "updated_at",
            "can_respond", "user_response", "analytics"
        ]

    def get_can_respond(self, obj):
        """Check if current user can respond"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_user_respond(request.user)
        return False

    def get_user_response(self, obj):
        """Get current user's response if exists"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            response = obj.survey_responses.filter(user=request.user).first()
            if response:
                return {
                    'id': response.id,
                    'submitted_at': response.submitted_at,
                    'is_complete': response.is_complete
                }
        return None

    def get_analytics(self, obj):
        """Get basic analytics if user has permission"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if user can view analytics (PM and above)
            from .permissions import ROLE_HIERARCHY
            user_role_level = ROLE_HIERARCHY.get(request.user.role, -1)
            pm_level = ROLE_HIERARCHY.get('pm', 999)
            
            if user_role_level >= pm_level or request.user.role == 'superadmin':
                analytics, created = SurveyAnalytics.objects.get_or_create(survey=obj)
                # Always recalculate to ensure fresh data
                analytics.calculate_metrics()
                
                return {
                    'response_rate': float(analytics.response_rate),
                    'average_rating': float(analytics.average_rating) if analytics.average_rating else None,
                    'total_responses': analytics.total_responses,
                    'total_invited': analytics.total_invited
                }
        return None


class SurveyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating surveys"""
    questions = QuestionSerializer(many=True, required=False)

    class Meta:
        model = Survey
        fields = [
            "id", "project", "name", "description", "deadline",
            "recipients_emails", "recipients", "status", 
            "allowed_roles", "is_anonymous", "questions"
        ]
        read_only_fields = ["recipients", "responses"]

    def validate_allowed_roles(self, value):
        """Validate allowed roles"""
        if value:
            valid_roles = ['guest', 'contibuter', 'reviewer', 'pm', 'admin']
            for role in value:
                if role not in valid_roles:
                    raise serializers.ValidationError(f"Invalid role: {role}")
        return value

    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])
        
        # Set created_by from request
        request = self.context.get('request')
        if request:
            validated_data['created_by'] = request.user

        # Calculate recipients count from emails
        recipients_emails = validated_data.get('recipients_emails', '')
        if recipients_emails:
            email_list = [email.strip() for email in recipients_emails.split(',') if email.strip()]
            validated_data['recipients'] = len(email_list)

        survey = Survey.objects.create(**validated_data)

        # Create questions with proper ordering
        for i, question_data in enumerate(questions_data):
            question_data['order'] = i + 1
            Question.objects.create(survey=survey, **question_data)

        return survey

    def update(self, instance, validated_data):
        questions_data = validated_data.pop("questions", None)
        
        # Update recipients count if emails changed
        if 'recipients_emails' in validated_data:
            recipients_emails = validated_data['recipients_emails']
            if recipients_emails:
                email_list = [email.strip() for email in recipients_emails.split(',') if email.strip()]
                validated_data['recipients'] = len(email_list)
            else:
                validated_data['recipients'] = 0

        # Update survey fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update questions if provided
        if questions_data is not None:
            # Delete existing questions
            instance.questions.all().delete()
            
            # Create new questions
            for i, question_data in enumerate(questions_data):
                question_data['order'] = i + 1
                Question.objects.create(survey=instance, **question_data)

        return instance


# New serializers for survey responses
class SurveyAnswerSerializer(serializers.ModelSerializer):
    """Serializer for individual survey answers"""
    question_id = serializers.IntegerField(write_only=True)
    question_text = serializers.CharField(source='question.text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    display_answer = serializers.CharField(read_only=True)

    class Meta:
        model = SurveyAnswer
        fields = [
            'id', 'question_id', 'question_text', 'question_type',
            'answer_text', 'answer_rating', 'answer_choice', 'answer_boolean',
            'display_answer'
        ]

    def validate(self, data):
        """Validate answer based on question type"""
        question_id = data.get('question_id')
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            raise serializers.ValidationError("Invalid question ID")

        question_type = question.question_type

        # Check if required field is provided
        if question.required:
            if question_type in ['text', 'textarea'] and not data.get('answer_text'):
                raise serializers.ValidationError("This question requires a text answer")
            elif question_type == 'rating' and data.get('answer_rating') is None:
                raise serializers.ValidationError("This question requires a rating")
            elif question_type == 'multiple_choice' and not data.get('answer_choice'):
                raise serializers.ValidationError("This question requires a choice selection")
            elif question_type == 'yes_no' and data.get('answer_boolean') is None:
                raise serializers.ValidationError("This question requires a yes/no answer")

        # Validate answer values
        if data.get('answer_rating') is not None:
            if not (1 <= data['answer_rating'] <= 5):
                raise serializers.ValidationError("Rating must be between 1 and 5")

        if data.get('answer_choice') and question.choices:
            if data['answer_choice'] not in question.choices:
                raise serializers.ValidationError("Invalid choice selected")

        data['question'] = question
        return data


class SurveyResponseSerializer(serializers.ModelSerializer):
    """Serializer for survey responses"""
    answers = SurveyAnswerSerializer(many=True)
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = SurveyResponse
        fields = [
            'id', 'submitted_at', 'is_complete', 'user_name', 
            'user_email', 'user_role', 'anonymous_email', 
            'anonymous_role', 'answers'
        ]
        read_only_fields = ['submitted_at']

    def create(self, validated_data):
        """Create survey response with answers"""
        answers_data = validated_data.pop('answers')
        request = self.context.get('request')
        survey = self.context.get('survey')

        # Check if user can respond
        if not survey.can_user_respond(request.user):
            raise serializers.ValidationError(
                "You are not allowed to respond to this survey"
            )

        # Create response
        response = SurveyResponse.objects.create(
            survey=survey,
            user=request.user if not survey.is_anonymous else None,
            anonymous_email=request.user.email if survey.is_anonymous else None,
            anonymous_role=request.user.role if survey.is_anonymous else None,
            is_complete=True,
            **validated_data
        )

        # Create answers
        for answer_data in answers_data:
            question = answer_data.pop('question')
            SurveyAnswer.objects.create(
                response=response,
                question=question,
                **answer_data
            )

        return response


class ArchivedLessonSerializer(serializers.ModelSerializer):
    """Enhanced serializer for archived project lessons"""
    insights_list = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source="created_by.first_name", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)
    survey_name = serializers.CharField(source="survey.name", read_only=True)

    class Meta:
        model = ArchivedLesson
        fields = [
            "id", "project", "project_name", "date", "insights", 
            "insights_list", "created_by_name", "survey", "survey_name",
            "created_at"
        ]

    def create(self, validated_data):
        """Set created_by from request"""
        request = self.context.get('request')
        if request:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


# Results serializer for detailed analytics
class SurveyResultsSerializer(serializers.ModelSerializer):
    """Detailed survey results with responses and analytics"""
    questions = QuestionSerializer(many=True, read_only=True)
    survey_responses = SurveyResponseSerializer(many=True, read_only=True)
    analytics = serializers.SerializerMethodField()
    response_summary = serializers.SerializerMethodField()

    class Meta:
        model = Survey
        fields = [
            'id', 'name', 'description', 'project', 'deadline',
            'status', 'questions', 'survey_responses', 'analytics',
            'response_summary'
        ]

    def get_analytics(self, obj):
        """Get detailed analytics"""
        analytics, created = SurveyAnalytics.objects.get_or_create(survey=obj)
        # Always recalculate to ensure fresh data
        analytics.calculate_metrics()

        return {
            'total_invited': analytics.total_invited,
            'total_responses': analytics.total_responses,
            'response_rate': float(analytics.response_rate),
            'average_rating': float(analytics.average_rating) if analytics.average_rating else None,
            'completion_rate': float(analytics.completion_rate)
        }

    def get_response_summary(self, obj):
        """Get summary of responses by question"""
        summary = {}
        
        for question in obj.questions.all():
            question_summary = {
                'question_text': question.text,
                'question_type': question.question_type,
                'total_responses': 0,
                'responses': []
            }

            answers = SurveyAnswer.objects.filter(
                question=question,
                response__is_complete=True
            )

            question_summary['total_responses'] = answers.count()

            if question.question_type == 'rating':
                # Calculate rating distribution
                ratings = {}
                for i in range(1, 6):
                    ratings[str(i)] = answers.filter(answer_rating=i).count()
                question_summary['rating_distribution'] = ratings
                
                avg_rating = answers.aggregate(
                    avg=Avg('answer_rating')
                )['avg']
                question_summary['average_rating'] = round(avg_rating, 2) if avg_rating else None

            elif question.question_type == 'multiple_choice':
                # Calculate choice distribution
                choices = {}
                if question.choices:
                    for choice in question.choices:
                        choices[choice] = answers.filter(answer_choice=choice).count()
                question_summary['choice_distribution'] = choices

            elif question.question_type == 'yes_no':
                # Calculate yes/no distribution
                yes_count = answers.filter(answer_boolean=True).count()
                no_count = answers.filter(answer_boolean=False).count()
                question_summary['yes_no_distribution'] = {
                    'yes': yes_count,
                    'no': no_count
                }

            elif question.question_type in ['text', 'textarea']:
                # For text questions, just provide response count
                question_summary['text_responses'] = answers.filter(
                    answer_text__isnull=False
                ).count()

            summary[str(question.id)] = question_summary

        return summary


# Company users serializer for recipient selection
class CompanyUserSerializer(serializers.ModelSerializer):
    """Lightweight serializer for user selection"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'role', 'is_active']
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Combine first name and email for display
        display_name = f"{instance.first_name} ({instance.email})" if instance.first_name else instance.email
        data['display_name'] = display_name
        return data