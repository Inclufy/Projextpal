"""
API views for AI-powered survey functionality.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .ai_survey import generate_project_survey, analyze_survey_results, generate_questionnaire_from_activities
from .models import Survey, SurveyResponse
from projects.models import Project


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_survey_for_project(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)
    
    project_data = {
        'name': project.name,
        'status': project.status,
        'description': getattr(project, 'description', ''),
    }
    
    result = generate_project_survey(project_data)
    
    if result['success']:
        return Response(result['survey'])
    return Response({'error': result['error']}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_survey_generic(request):
    project_data = request.data.get('project_data', {})
    if not project_data:
        return Response({'error': 'project_data is required'}, status=400)
    
    result = generate_project_survey(project_data)
    if result['success']:
        return Response(result['survey'])
    return Response({'error': result['error']}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_survey(request, survey_id):
    try:
        survey = Survey.objects.get(id=survey_id)
    except Survey.DoesNotExist:
        return Response({'error': 'Survey not found'}, status=404)
    
    responses = list(SurveyResponse.objects.filter(survey=survey).values())
    if not responses:
        return Response({'error': 'No responses to analyze'}, status=400)
    
    survey_data = {'title': survey.title}
    result = analyze_survey_results(survey_data, responses)
    
    if result['success']:
        return Response(result['analysis'])
    return Response({'error': result['error']}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_questionnaire(request):
    activities = request.data.get('activities', [])
    milestones = request.data.get('milestones', [])
    kpis = request.data.get('kpis', [])
    
    result = generate_questionnaire_from_activities(activities, milestones, kpis)
    if result['success']:
        return Response(result['questions'])
    return Response({'error': result['error']}, status=500)
