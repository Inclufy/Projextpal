# surveys/views.py
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q, Prefetch
from django.utils import timezone

from .models import (
    Survey, 
    Question, 
    ArchivedLesson,
    SurveyResponse,
    SurveyAnswer,
    SurveyInvitation
)
from .serializers import (
    SurveyListSerializer,
    SurveyDetailSerializer,
    SurveyCreateUpdateSerializer,
    QuestionSerializer,
    ArchivedLessonSerializer,
    SurveyResponseSerializer,
    SurveyResultsSerializer,
    CompanyUserSerializer
)
from .permissions import (
    IsRoleAllowed,
    CanCreateSurvey,
    CanManageSurvey,
    CanRespondToSurvey,
    CanViewSurveyResults
)

User = get_user_model()


class SurveyViewSet(viewsets.ModelViewSet):
    """
    Enhanced ViewSet for surveys with role-based permissions
    """
    permission_classes = [IsAuthenticated, IsRoleAllowed]
    
    # Define role requirements for different actions
    required_roles = {
        "list": "guest",
        "retrieve": "guest",
        "create": "pm",
        "update": "pm",
        "partial_update": "pm",
        "destroy": "admin",
    }

    def get_queryset(self):
        """Filter surveys based on user's role and company"""
        user = self.request.user
        
        if user.role == 'superadmin':
            # Superadmin sees all surveys
            return Survey.objects.prefetch_related("questions").select_related("project", "created_by")
        
        # Base queryset - surveys from user's company projects
        queryset = Survey.objects.select_related("project", "created_by").prefetch_related("questions")
        
        if hasattr(user, 'company') and user.company:
            # Filter by company through project relationship
            company_surveys = queryset.filter(project__company=user.company)
            
            if user.role in ['admin']:
                # Admins see all surveys in their company
                return company_surveys
            else:
                # Regular users only see surveys they are specifically assigned to
                return company_surveys.filter(
                    Q(recipients_emails__icontains=user.email) |  # User's email in recipients
                    Q(invitations__user=user) |  # User has invitation
                    Q(created_by=user)  # User created the survey
                ).distinct()
        
        return queryset.none()

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return SurveyListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return SurveyCreateUpdateSerializer
        else:
            return SurveyDetailSerializer

    @action(detail=True, methods=['post'], permission_classes=[CanRespondToSurvey])
    def respond(self, request, pk=None):
        """Allow users to respond to surveys"""
        survey = self.get_object()
        
        # Check if user already responded
        if survey.survey_responses.filter(user=request.user).exists():
            return Response(
                {'error': 'You have already responded to this survey'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = SurveyResponseSerializer(
            data=request.data, 
            context={'request': request, 'survey': survey}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[CanViewSurveyResults])
    def results(self, request, pk=None):
        """Get detailed survey results and analytics"""
        survey = self.get_object()
        serializer = SurveyResultsSerializer(survey, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[CanManageSurvey])
    def activate(self, request, pk=None):
        """Activate a survey (change status to Active)"""
        survey = self.get_object()
        
        if survey.status == 'Active':
            return Response(
                {'message': 'Survey is already active'}, 
                status=status.HTTP_200_OK
            )
        
        survey.status = 'Active'
        survey.save()
        
        return Response({
            'message': 'Survey activated successfully',
            'survey': SurveyDetailSerializer(survey, context={'request': request}).data
        })

    @action(detail=True, methods=['post'], permission_classes=[CanManageSurvey])
    def close(self, request, pk=None):
        """Close a survey (change status to Closed)"""
        survey = self.get_object()
        
        if survey.status == 'Closed':
            return Response(
                {'message': 'Survey is already closed'}, 
                status=status.HTTP_200_OK
            )
        
        survey.status = 'Closed'
        survey.save()
        
        return Response({
            'message': 'Survey closed successfully',
            'survey': SurveyDetailSerializer(survey, context={'request': request}).data
        })

    @action(detail=False, methods=['get'])
    def my_surveys(self, request):
        """Get surveys created by the current user"""
        user_surveys = self.get_queryset().filter(created_by=request.user)
        serializer = SurveyListSerializer(user_surveys, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get surveys that the user can respond to"""
        available_surveys = []
        for survey in self.get_queryset():
            if survey.can_user_respond(request.user):
                available_surveys.append(survey)
        
        serializer = SurveyListSerializer(available_surveys, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[CanManageSurvey])
    def send_invitations(self, request, pk=None):
        """Send invitations to users based on recipients_emails"""
        survey = self.get_object()
        
        if not survey.recipients_emails:
            return Response(
                {'error': 'No recipient emails found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        email_list = [email.strip() for email in survey.recipients_emails.split(',') if email.strip()]
        
        # Find users with these emails in the same company
        users = User.objects.filter(
            email__in=email_list,
            company=request.user.company,
            is_active=True
        )
        
        invitations_created = 0
        for user in users:
            invitation, created = SurveyInvitation.objects.get_or_create(
                survey=survey,
                user=user
            )
            if created:
                invitations_created += 1
        
        return Response({
            'message': f'Created {invitations_created} invitations',
            'total_found_users': users.count(),
            'total_emails': len(email_list)
        })


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing survey questions"""
    queryset = Question.objects.select_related("survey__project")
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed]
    
    required_roles = {
        "list": "guest",
        "retrieve": "guest",
        "create": "pm",
        "update": "pm",
        "partial_update": "pm",
        "destroy": "admin",
    }

    def get_queryset(self):
        """Filter questions based on survey access"""
        user = self.request.user
        
        if user.role == 'superadmin':
            return self.queryset
        
        # Filter based on survey access
        if hasattr(user, 'company') and user.company:
            return self.queryset.filter(survey__project__company=user.company)
        
        return self.queryset.none()


class ArchivedLessonViewSet(viewsets.ModelViewSet):
    """ViewSet for archived lessons"""
    queryset = ArchivedLesson.objects.select_related("project", "created_by", "survey")
    serializer_class = ArchivedLessonSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed]
    
    required_roles = {
        "list": "guest",
        "retrieve": "guest",
        "create": "pm",
        "update": "pm",
        "partial_update": "pm",
        "destroy": "admin",
    }

    def get_queryset(self):
        """Filter lessons based on project access"""
        user = self.request.user
        
        if user.role == 'superadmin':
            return self.queryset
        
        if hasattr(user, 'company') and user.company:
            return self.queryset.filter(project__company=user.company)
        
        return self.queryset.none()

    @action(detail=False, methods=['post'], permission_classes=[IsRoleAllowed])
    def create_from_survey(self, request):
        """Create archived lesson from survey results"""
        survey_id = request.data.get('survey_id')
        insights = request.data.get('insights', '')
        
        if not survey_id:
            return Response(
                {'error': 'survey_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            survey = Survey.objects.get(id=survey_id)
            
            # Check permission to access this survey
            if not self.request.user.role == 'superadmin':
                if hasattr(self.request.user, 'company') and hasattr(survey.project, 'company'):
                    if survey.project.company != self.request.user.company:
                        return Response(
                            {'error': 'Permission denied'}, 
                            status=status.HTTP_403_FORBIDDEN
                        )
            
            lesson = ArchivedLesson.objects.create(
                project=survey.project,
                date=timezone.now().date(),
                insights=insights,
                created_by=request.user,
                survey=survey
            )
            
            serializer = ArchivedLessonSerializer(lesson, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Survey.DoesNotExist:
            return Response(
                {'error': 'Survey not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class SurveyResponseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing survey responses (read-only)"""
    serializer_class = SurveyResponseSerializer
    permission_classes = [IsAuthenticated, CanViewSurveyResults]
    
    def get_queryset(self):
        """Filter responses based on survey access"""
        user = self.request.user
        
        if user.role == 'superadmin':
            return SurveyResponse.objects.select_related('user', 'survey').prefetch_related('answers')
        
        # Filter based on survey access
        if hasattr(user, 'company') and user.company:
            return SurveyResponse.objects.filter(
                survey__project__company=user.company
            ).select_related('user', 'survey').prefetch_related('answers')
        
        return SurveyResponse.objects.none()

    @action(detail=False, methods=['get'])
    def my_responses(self, request):
        """Get current user's survey responses"""
        responses = SurveyResponse.objects.filter(user=request.user)
        serializer = self.get_serializer(responses, many=True)
        return Response(serializer.data)


# API view for getting company users (for recipient selection)
class CompanyUsersAPIView(generics.ListAPIView):
    """List users in the same company for recipient selection"""
    serializer_class = CompanyUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if not hasattr(user, 'company') or not user.company:
            return User.objects.none()
        
        return User.objects.filter(
            company=user.company,
            is_active=True
        ).exclude(id=user.id).order_by('first_name', 'email')