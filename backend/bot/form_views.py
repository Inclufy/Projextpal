"""
Form submission endpoints for AI chat CRUD operations.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal
import traceback

from projects.models import Project, Milestone, Task


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_form(request):
    form_type = request.data.get('form_type')
    form_data = request.data.get('data', {})
    entity_id = request.data.get('entity_id')
    user = request.user
    
    if not form_type:
        return Response({"error": "form_type is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        handlers = {
            'project_creation': lambda: create_project(form_data, user),
            'project_update': lambda: update_project(entity_id, form_data, user),
            'task_creation': lambda: create_task(form_data, user),
            'task_update': lambda: update_task(entity_id, form_data, user),
            'milestone_creation': lambda: create_milestone(form_data, user),
            'milestone_update': lambda: update_milestone(entity_id, form_data, user),
            'program_creation': lambda: create_program(form_data, user),
        }
        
        handler = handlers.get(form_type)
        if handler:
            return handler()
        return Response({"error": f"Unknown form type: {form_type}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Form submission error: {traceback.format_exc()}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def create_project(data, user):
    required = ['name', 'methodology', 'start_date', 'end_date']
    for field in required:
        if not data.get(field):
            return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    project = Project.objects.create(
        name=data['name'],
        description=data.get('description', ''),
        methodology=data['methodology'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        budget=Decimal(str(data.get('budget', 0))) if data.get('budget') else Decimal('0'),
        company=user.company,
        created_by=user,
        status='planning'
    )
    return Response({"success": True, "message": f"Project '{project.name}' created successfully!",
                     "data": {"id": project.id, "name": project.name, "status": project.status}}, status=status.HTTP_201_CREATED)


def update_project(entity_id, data, user):
    if not entity_id:
        return Response({"error": "entity_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    project = Project.objects.filter(id=entity_id, company=user.company).first()
    if not project:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
    
    for field in ['name', 'description', 'methodology', 'start_date', 'end_date', 'status']:
        if field in data:
            setattr(project, field, data[field])
    if 'budget' in data:
        project.budget = Decimal(str(data['budget'])) if data['budget'] else Decimal('0')
    project.save()
    
    return Response({"success": True, "message": f"Project '{project.name}' updated successfully!",
                     "data": {"id": project.id, "name": project.name, "status": project.status}})


def create_task(data, user):
    required = ['title', 'milestone_id', 'due_date']
    for field in required:
        if not data.get(field):
            return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    milestone = Milestone.objects.filter(id=data['milestone_id'], project__company=user.company).first()
    if not milestone:
        return Response({"error": "Milestone not found"}, status=status.HTTP_404_NOT_FOUND)
    
    task = Task.objects.create(
        title=data['title'],
        description=data.get('description', ''),
        milestone=milestone,
        priority=data.get('priority', 'medium'),
        start_date=data.get('start_date'),
        due_date=data['due_date'],
        status='todo',
        created_by=user
    )
    
    if data.get('assigned_to'):
        from accounts.models import CustomUser
        assigned_user = CustomUser.objects.filter(id=data['assigned_to'], company=user.company).first()
        if assigned_user:
            task.assigned_to = assigned_user
            task.save()
    
    return Response({"success": True, "message": f"Task '{task.title}' created successfully!",
                     "data": {"id": task.id, "title": task.title, "status": task.status}}, status=status.HTTP_201_CREATED)


def update_task(entity_id, data, user):
    if not entity_id:
        return Response({"error": "entity_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    task = Task.objects.filter(id=entity_id, milestone__project__company=user.company).first()
    if not task:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    
    for field in ['title', 'description', 'priority', 'start_date', 'due_date', 'status']:
        if field in data:
            setattr(task, field, data[field])
    
    if 'assigned_to' in data:
        from accounts.models import CustomUser
        if data['assigned_to']:
            task.assigned_to = CustomUser.objects.filter(id=data['assigned_to'], company=user.company).first()
        else:
            task.assigned_to = None
    task.save()
    
    return Response({"success": True, "message": f"Task '{task.title}' updated successfully!",
                     "data": {"id": task.id, "title": task.title, "status": task.status}})


def create_milestone(data, user):
    required = ['name', 'project_id', 'start_date', 'end_date']
    for field in required:
        if not data.get(field):
            return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    project = Project.objects.filter(id=data['project_id'], company=user.company).first()
    if not project:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
    
    milestone = Milestone.objects.create(
        name=data['name'],
        description=data.get('description', ''),
        project=project,
        start_date=data['start_date'],
        end_date=data['end_date'],
        status='pending'
    )
    return Response({"success": True, "message": f"Milestone '{milestone.name}' created successfully!",
                     "data": {"id": milestone.id, "name": milestone.name, "status": milestone.status}}, status=status.HTTP_201_CREATED)


def update_milestone(entity_id, data, user):
    if not entity_id:
        return Response({"error": "entity_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    milestone = Milestone.objects.filter(id=entity_id, project__company=user.company).first()
    if not milestone:
        return Response({"error": "Milestone not found"}, status=status.HTTP_404_NOT_FOUND)
    
    for field in ['name', 'description', 'start_date', 'end_date', 'status']:
        if field in data:
            setattr(milestone, field, data[field])
    milestone.save()
    
    return Response({"success": True, "message": f"Milestone '{milestone.name}' updated successfully!",
                     "data": {"id": milestone.id, "name": milestone.name, "status": milestone.status}})


def create_program(data, user):
    from programs.models import Program
    
    required = ['name', 'start_date', 'target_end_date']
    for field in required:
        if not data.get(field):
            return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    program = Program.objects.create(
        name=data['name'],
        description=data.get('description', ''),
        strategic_objective=data.get('strategic_objective', ''),
        methodology=data.get('methodology', 'agile'),
        start_date=data['start_date'],
        target_end_date=data['target_end_date'],
        total_budget=Decimal(str(data.get('total_budget', 0))) if data.get('total_budget') else Decimal('0'),
        company=user.company,
        created_by=user,
        status='planning'
    )
    
    return Response({"success": True, "message": f"Program '{program.name}' created successfully!",
                     "data": {"id": program.id, "name": program.name}}, status=status.HTTP_201_CREATED)
