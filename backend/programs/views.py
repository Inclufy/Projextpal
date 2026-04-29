from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from .models import Program, ProgramBenefit, ProgramRisk, ProgramMilestone, ProgramTeam
from .serializers import (
    ProgramListSerializer,
    ProgramDetailSerializer,
    ProgramCreateUpdateSerializer,
    ProgramBenefitSerializer,
    ProgramRiskSerializer,
    ProgramMilestoneSerializer,
    ProgramTeamSerializer,
)


class ProgramViewSet(viewsets.ModelViewSet):
    """ViewSet for Program CRUD operations."""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter programs by user's company."""
        user = self.request.user
        queryset = Program.objects.filter(company=user.company)
        
        # Optional filtering
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        methodology = self.request.query_params.get('methodology')
        if methodology:
            queryset = queryset.filter(methodology=methodology)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        portfolio = self.request.query_params.get('portfolio')
        if portfolio:
            queryset = queryset.filter(portfolio_id=portfolio)
        
        return queryset.select_related('program_manager', 'executive_sponsor', 'created_by')

    def get_serializer_class(self):
        if self.action == 'list':
            return ProgramListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProgramCreateUpdateSerializer
        return ProgramDetailSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "company", None) is None:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({
                "company": "Your account is not linked to a company. Contact your administrator."
            })
        serializer.save(
            company=user.company,
            created_by=user
        )

    @action(detail=True, methods=['get'])
    def projects(self, request, pk=None):
        """Get all projects linked to this program."""
        program = self.get_object()
        from projects.serializers import ProjectSerializer
        projects = program.projects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_project(self, request, pk=None):
        """Add a project to this program."""
        program = self.get_object()
        project_id = request.data.get('project_id')
        
        if not project_id:
            return Response(
                {'error': 'project_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from projects.models import Project
        try:
            project = Project.objects.get(id=project_id, company=program.company)
            program.projects.add(project)
            return Response({'status': 'project added'})
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['delete'], url_path='projects/(?P<project_id>[^/.]+)')
    def remove_project(self, request, pk=None, project_id=None):
        """Remove a project from this program."""
        program = self.get_object()
        from projects.models import Project
        try:
            project = Project.objects.get(id=project_id)
            program.projects.remove(project)
            return Response({'status': 'project removed'})
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def metrics(self, request, pk=None):
        """Get program metrics."""
        program = self.get_object()
        
        projects = program.projects.all()
        total_projects = projects.count()
        
        # Calculate project status distribution
        status_distribution = projects.values('status').annotate(count=Count('id'))
        
        # Calculate total budget from projects
        project_budget = projects.aggregate(total=Sum('budget'))['total'] or 0
        
        # Benefits metrics
        benefits = program.benefits.all()
        total_benefits = benefits.count()
        realized_benefits = benefits.filter(status='realized').count()
        
        # Risk metrics
        risks = program.risks.all()
        open_risks = risks.filter(status='open').count()
        high_risks = risks.filter(impact='high', status='open').count()
        
        return Response({
            'total_projects': total_projects,
            'status_distribution': list(status_distribution),
            'program_budget': float(program.total_budget),
            'spent_budget': float(program.spent_budget),
            'project_budget_total': float(project_budget),
            'progress': program.progress,
            'total_benefits': total_benefits,
            'realized_benefits': realized_benefits,
            'open_risks': open_risks,
            'high_risks': high_risks,
        })

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """Get dashboard data for program."""
        program = self.get_object()
        serializer = ProgramDetailSerializer(program)
        
        # Add additional dashboard data
        data = serializer.data
        data['metrics'] = self.metrics(request, pk).data

        return Response(data)

    @action(detail=True, methods=['get'])
    def roadmap(self, request, pk=None):
        """Get program roadmap with milestones and project timelines."""
        program = self.get_object()
        milestones = program.milestones.all().order_by('target_date')
        milestone_data = ProgramMilestoneSerializer(milestones, many=True).data

        projects_data = []
        for project in program.projects.all():
            projects_data.append({
                'id': project.id,
                'name': project.name,
                'status': project.status,
                'start_date': str(project.start_date) if project.start_date else None,
                'end_date': str(project.end_date) if project.end_date else None,
                'progress': project.progress if hasattr(project, 'progress') else 0,
            })

        return Response({
            'milestones': milestone_data,
            'projects': projects_data,
            'start_date': str(program.start_date) if program.start_date else None,
            'target_end_date': str(program.target_end_date) if program.target_end_date else None,
        })

    @action(detail=True, methods=['get'])
    def governance(self, request, pk=None):
        """Get program governance data."""
        program = self.get_object()
        return Response({
            'program_manager': {
                'id': program.program_manager.id,
                'name': program.program_manager.get_full_name() or program.program_manager.email,
            } if program.program_manager else None,
            'executive_sponsor': {
                'id': program.executive_sponsor.id,
                'name': program.executive_sponsor.get_full_name() or program.executive_sponsor.email,
            } if program.executive_sponsor else None,
            'methodology': program.methodology,
            'health_status': program.health_status,
            'status': program.status,
        })

    @action(detail=True, methods=['get'])
    def resources(self, request, pk=None):
        """Get program resource allocation across projects."""
        program = self.get_object()
        resources = []
        for project in program.projects.all():
            try:
                from projects.models import ProjectTeam
                team_members = ProjectTeam.objects.filter(project=project)
                for member in team_members:
                    resources.append({
                        'user_id': member.user.id,
                        'user_name': member.user.get_full_name() or member.user.email,
                        'project_id': project.id,
                        'project_name': project.name,
                        'role': member.role,
                    })
            except Exception:
                pass
        return Response(resources)

    @action(detail=True, methods=['get'], url_path='team')
    def get_team(self, request, pk=None):
        """List program team members."""
        program = self.get_object()
        members = program.team_members.filter(is_active=True).select_related('user', 'added_by')
        return Response(ProgramTeamSerializer(members, many=True).data)

    @action(detail=True, methods=['post'], url_path='team/add')
    def add_team_member(self, request, pk=None):
        """Assign a user to this program."""
        program = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', '') or ''

        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(id=user_id, company=request.user.company)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found or not in the same company'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if program.team_members.filter(user=user, is_active=True).exists():
            return Response(
                {'error': 'User is already a team member of this program'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            member = program.team_members.get(user=user, is_active=False)
            member.is_active = True
            member.role = role or member.role
            member.added_by = request.user
            member.save()
        except ProgramTeam.DoesNotExist:
            member = ProgramTeam.objects.create(
                program=program, user=user, role=role, added_by=request.user
            )

        return Response(ProgramTeamSerializer(member).data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=['delete'],
        url_path='team/remove/(?P<team_member_id>[^/.]+)',
    )
    def remove_team_member(self, request, pk=None, team_member_id=None):
        """Remove a user from this program (soft delete)."""
        program = self.get_object()
        try:
            member = program.team_members.get(id=team_member_id)
        except ProgramTeam.DoesNotExist:
            return Response({'error': 'Team member not found'}, status=status.HTTP_404_NOT_FOUND)
        member.is_active = False
        member.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProgramBenefitViewSet(viewsets.ModelViewSet):
    """ViewSet for Program Benefits."""
    serializer_class = ProgramBenefitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        program_id = self.kwargs.get('program_pk')
        return ProgramBenefit.objects.filter(
            program_id=program_id,
            program__company=self.request.user.company
        )

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_pk')
        program = Program.objects.get(id=program_id, company=self.request.user.company)
        serializer.save(program=program)


class ProgramRiskViewSet(viewsets.ModelViewSet):
    """ViewSet for Program Risks."""
    serializer_class = ProgramRiskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        program_id = self.kwargs.get('program_pk')
        return ProgramRisk.objects.filter(
            program_id=program_id,
            program__company=self.request.user.company
        )

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_pk')
        program = Program.objects.get(id=program_id, company=self.request.user.company)
        serializer.save(program=program)


class ProgramMilestoneViewSet(viewsets.ModelViewSet):
    """ViewSet for Program Milestones."""
    serializer_class = ProgramMilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        program_id = self.kwargs.get('program_pk')
        return ProgramMilestone.objects.filter(
            program_id=program_id,
            program__company=self.request.user.company
        )

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_pk')
        program = Program.objects.get(id=program_id, company=self.request.user.company)
        serializer.save(program=program)
# ========================================
# ADD THESE TO programs/views.py
# ========================================

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import (
    ProgramBudget,
    ProgramBudgetCategory,
    ProgramBudgetItem
)
from .serializers import (
    ProgramBudgetSerializer,
    ProgramBudgetCategorySerializer,
    ProgramBudgetItemSerializer,
    ProgramBudgetOverviewSerializer
)


class ProgramBudgetViewSet(viewsets.ModelViewSet):
    """ViewSet for program budgets"""
    serializer_class = ProgramBudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProgramBudget.objects.filter(
            program__company=self.request.user.company
        )


class ProgramBudgetCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for program budget categories"""
    serializer_class = ProgramBudgetCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ProgramBudgetCategory.objects.filter(
            program__company=self.request.user.company
        )

        # Filter by program
        program_id = self.request.query_params.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)

        return queryset

    def perform_create(self, serializer):
        """Ensure the program belongs to the user's company."""
        from rest_framework.exceptions import ValidationError
        program = serializer.validated_data.get('program')
        user = self.request.user
        if program is None:
            raise ValidationError({'program': 'This field is required.'})
        if getattr(user, 'company_id', None) != getattr(program, 'company_id', None):
            raise ValidationError({'program': 'Program not found in your company.'})
        serializer.save()


class ProgramBudgetItemViewSet(viewsets.ModelViewSet):
    """ViewSet for program budget items"""
    serializer_class = ProgramBudgetItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ProgramBudgetItem.objects.filter(
            program__company=self.request.user.company
        )
        
        # Filter by program
        program_id = self.request.query_params.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        
        # Filter by category
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a program budget item"""
        item = self.get_object()
        item.status = 'approved'
        item.approved_by = request.user
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a program budget item"""
        item = self.get_object()
        item.status = 'rejected'
        item.rejection_reason = request.data.get('reason', '')
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)


class ProgramBudgetOverviewViewSet(viewsets.ViewSet):
    """Budget overview for a specific program"""
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, pk=None):
        """GET /programs/{id}/budget/overview/"""
        try:
            from .models import Program
            program = Program.objects.get(
                id=pk,
                company=request.user.company
            )
            
            # Get or create budget
            budget, created = ProgramBudget.objects.get_or_create(
                program=program,
                defaults={'total_budget': 0, 'currency': 'EUR'}
            )
            
            # Get categories
            categories = ProgramBudgetCategory.objects.filter(program=program)
            
            # Return the dict directly. Wrapping it in
            # ProgramBudgetOverviewSerializer(data) would double-serialize
            # the nested categories list (which is already dicts), and
            # DRF's nested ModelSerializer then calls .pk on integer FK
            # values → "'int' object has no attribute 'pk'" 500.
            data = {
                'program_id': program.id,
                'program_name': program.name,
                'total_budget': budget.total_budget,
                'total_spent': budget.total_spent,
                'total_remaining': budget.total_remaining,
                'projects_budget': budget.projects_budget,
                'currency': budget.currency,
                'categories': ProgramBudgetCategorySerializer(categories, many=True).data
            }
            return Response(data)
            
        except Program.DoesNotExist:
            return Response(
                {'error': 'Program not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ============================================
# AI INSIGHTS ENDPOINTS
# ============================================

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .ai_utils import RiskDetector, BudgetForecaster, ProjectHealthScorer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_ai_insights(request, project_id):
    """
    Generate AI-powered insights for a specific project
    """
    try:
        from projects.models import Project
        project = Project.objects.get(id=project_id)
        
        # Get project metrics
        spent = project.budget_spent or 0
        allocated = project.budget_allocated or 0
        progress = project.progress or 0
        team_size = project.team_members.filter(is_active=True).count()
        
        # Run AI analysis
        budget_risk = RiskDetector.analyze_budget_risk(spent, allocated, progress)
        timeline_risk = RiskDetector.analyze_timeline_risk(
            project.start_date, 
            project.end_date, 
            progress
        )
        budget_forecast = BudgetForecaster.forecast_completion(spent, allocated, progress)
        health_score = ProjectHealthScorer.calculate_health_score(
            budget_risk['severity'],
            timeline_risk['severity'],
            progress,
            team_size
        )
        
        return Response({
            'project_id': project.id,
            'project_name': project.name,
            'analysis': {
                'budget_risk': budget_risk,
                'timeline_risk': timeline_risk,
                'budget_forecast': budget_forecast,
                'health_score': health_score
            },
            'recommendations': generate_recommendations(budget_risk, timeline_risk, health_score),
            'generated_at': datetime.now().isoformat()
        })
        
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def program_ai_insights(request, program_id):
    """
    Generate AI-powered insights for a specific program
    """
    try:
        program = Program.objects.get(id=program_id)
        
        # Aggregate metrics from program projects
        projects = program.projects.all()
        
        total_budget = sum(p.budget_allocated or 0 for p in projects)
        total_spent = sum(p.budget_spent or 0 for p in projects)
        avg_progress = sum(p.progress or 0 for p in projects) / len(projects) if projects else 0
        total_team = sum(p.team_members.filter(is_active=True).count() for p in projects)
        
        # Run AI analysis
        budget_risk = RiskDetector.analyze_budget_risk(total_spent, total_budget, int(avg_progress))
        budget_forecast = BudgetForecaster.forecast_completion(total_spent, total_budget, int(avg_progress))
        health_score = ProjectHealthScorer.calculate_health_score(
            budget_risk['severity'],
            0,  # No program-level timeline
            int(avg_progress),
            total_team
        )
        
        # Project-level insights
        project_insights = []
        for project in projects:
            p_budget_risk = RiskDetector.analyze_budget_risk(
                project.budget_spent or 0,
                project.budget_allocated or 0,
                project.progress or 0
            )
            
            if p_budget_risk['risk_level'] in ['high', 'medium']:
                project_insights.append({
                    'project_id': project.id,
                    'project_name': project.name,
                    'risk': p_budget_risk
                })
        
        return Response({
            'program_id': program.id,
            'program_name': program.name,
            'analysis': {
                'budget_risk': budget_risk,
                'budget_forecast': budget_forecast,
                'health_score': health_score,
                'projects_at_risk': len(project_insights)
            },
            'project_insights': project_insights[:5],  # Top 5 risky projects
            'recommendations': generate_program_recommendations(budget_risk, health_score, project_insights),
            'generated_at': datetime.now().isoformat()
        })
        
    except Program.DoesNotExist:
        return Response({'error': 'Program not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


def generate_recommendations(budget_risk, timeline_risk, health_score):
    """Generate actionable recommendations"""
    recommendations = []
    
    if budget_risk['risk_level'] == 'high':
        recommendations.append({
            'priority': 'high',
            'category': 'budget',
            'action': 'Review and reduce scope or request additional budget',
            'reason': budget_risk['message']
        })
    
    if timeline_risk['risk_level'] == 'high':
        recommendations.append({
            'priority': 'high',
            'category': 'timeline',
            'action': 'Accelerate critical path activities or adjust deadline',
            'reason': timeline_risk['message']
        })
    
    if health_score['status'] == 'critical':
        recommendations.append({
            'priority': 'critical',
            'category': 'overall',
            'action': 'Immediate executive review required',
            'reason': f"Project health score is {health_score['score']}/100"
        })
    
    if not recommendations:
        recommendations.append({
            'priority': 'low',
            'category': 'overall',
            'action': 'Continue current approach',
            'reason': 'All metrics within acceptable ranges'
        })
    
    return recommendations


def generate_program_recommendations(budget_risk, health_score, project_insights):
    """Generate program-level recommendations"""
    recommendations = []
    
    if len(project_insights) > 0:
        recommendations.append({
            'priority': 'high',
            'category': 'portfolio',
            'action': f'Review {len(project_insights)} at-risk projects',
            'reason': 'Multiple projects showing budget or timeline concerns'
        })
    
    if budget_risk['risk_level'] == 'high':
        recommendations.append({
            'priority': 'high',
            'category': 'budget',
            'action': 'Program-wide budget review needed',
            'reason': budget_risk['message']
        })
    
    if not recommendations:
        recommendations.append({
            'priority': 'low',
            'category': 'overall',
            'action': 'Program performing well',
            'reason': f"Health score: {health_score['score']}/100"
        })
    
    return recommendations


# =============================================================================
# DEMO SEED + CLEAR (program-level)
# =============================================================================
from rest_framework.views import APIView
from accounts.permissions import HasRole
from django.shortcuts import get_object_or_404

PROGRAM_DEMO_ROLES = HasRole("superadmin", "admin", "pm", "program_manager")


class ProgramSeedDemoView(APIView):
    """Seed demo data into a program: team, benefits, risks, milestones, budget."""
    permission_classes = [PROGRAM_DEMO_ROLES]

    def post(self, request, pk=None):
        from datetime import date, timedelta
        from django.db import transaction
        from django.contrib.auth import get_user_model
        from .models import (
            Program, ProgramTeam, ProgramBenefit, ProgramRisk, ProgramMilestone,
            ProgramBudget, ProgramBudgetCategory, ProgramBudgetItem,
        )
        User = get_user_model()
        program = get_object_or_404(Program, pk=pk, company=request.user.company)
        team_pool = list(User.objects.filter(company=program.company)[:6]) or [request.user]
        created = {}
        today = date.today()

        with transaction.atomic():
            # ---- Team ----
            team_count = 0
            roles = ['Program Manager', 'Programme Sponsor', 'Business Change Manager',
                     'Senior Responsible Owner', 'PMO Lead', 'Programme Architect']
            for idx, member in enumerate(team_pool):
                _, c = ProgramTeam.objects.get_or_create(
                    program=program, user=member,
                    defaults={'role': roles[idx % len(roles)], 'is_active': True,
                              'added_by': request.user},
                )
                if c:
                    team_count += 1
            created['team'] = team_count

            # ---- Benefits ----
            ben_count = 0
            if not ProgramBenefit.objects.filter(program=program).exists():
                bens_seed = [
                    ('Operational efficiency gain', 'operational', 'in_progress', 1500000, 580000, 'EUR', 90),
                    ('Customer NPS improvement', 'customer', 'identified', 20, 0, 'pts', 180),
                    ('Reduce time-to-market for new products', 'strategic', 'planned', 35, 0, '%', 270),
                    ('Employee engagement uplift', 'employee', 'identified', 15, 0, 'pts', 180),
                    ('Cost savings through consolidation', 'financial', 'in_progress', 800000, 250000, 'EUR', 150),
                ]
                for name, cat, status, target, actual, unit, off in bens_seed:
                    ProgramBenefit.objects.create(
                        program=program, name=name,
                        description=f"Programme-level benefit: {name}",
                        category=cat, status=status,
                        target_value=target, actual_value=actual, measurement_unit=unit,
                        expected_date=today + timedelta(days=off),
                        owner=team_pool[0],
                    )
                    ben_count += 1
            created['benefits'] = ben_count

            # ---- Risks ----
            risk_count = 0
            if not ProgramRisk.objects.filter(program=program).exists():
                risks_seed = [
                    ('Inter-project dependency slippage', 'high', 'high', 'mitigating',
                     'Project A delivery date slips, causing knock-on delay across 3 dependent projects.',
                     'Weekly cross-project sync; buffer in master schedule; clear owner per dependency.'),
                    ('Benefit realisation gap', 'medium', 'high', 'open',
                     'Realised benefits trail forecast by >20% in first 12 months.',
                     'Quarterly benefits review with Business Change Manager; corrective KPI tracking.'),
                    ('Resource contention across projects', 'high', 'medium', 'mitigating',
                     'Key SMEs requested by multiple projects simultaneously.',
                     'Centralised resource pool; PMO-led prioritisation calls; backup specialists.'),
                    ('Vendor lock-in', 'medium', 'medium', 'open',
                     'Programme-wide tooling concentrates on a single vendor.',
                     'Periodic vendor review; abstraction layers in architecture; multi-vendor RFP option.'),
                    ('Stakeholder fatigue', 'medium', 'low', 'open',
                     'Long programme duration leads to stakeholder disengagement.',
                     'Quarterly showcase; clear comms plan; visible quick wins.'),
                ]
                for name, impact, prob, status, desc, mit in risks_seed:
                    ProgramRisk.objects.create(
                        program=program, name=name, description=desc,
                        impact=impact, probability=prob, status=status,
                        mitigation_plan=mit, owner=team_pool[0],
                    )
                    risk_count += 1
            created['risks'] = risk_count

            # ---- Milestones ----
            ms_count = 0
            if not ProgramMilestone.objects.filter(program=program).exists():
                ms_seed = [
                    ('Programme charter approved', 'completed', -90, -90),
                    ('Tranche 1 — Foundation complete', 'completed', -30, -32),
                    ('Tranche 2 — Build kickoff', 'in_progress', 0, None),
                    ('Mid-programme benefits review', 'pending', 60, None),
                    ('Tranche 2 — Delivery', 'pending', 120, None),
                    ('Tranche 3 — Embed & sustain', 'pending', 240, None),
                    ('Programme close-out report', 'pending', 360, None),
                ]
                for name, status, target_off, actual_off in ms_seed:
                    ProgramMilestone.objects.create(
                        program=program, name=name,
                        description=f"Programme milestone: {name}",
                        target_date=today + timedelta(days=target_off),
                        actual_date=today + timedelta(days=actual_off) if actual_off is not None else None,
                        status=status,
                    )
                    ms_count += 1
            created['milestones'] = ms_count

            # ---- Budget + Categories + Items ----
            try:
                budget, _ = ProgramBudget.objects.get_or_create(
                    program=program,
                    defaults={'total_budget': 5000000, 'currency': 'EUR'},
                )
            except Exception:
                budget = None
            cat_count = 0
            item_count = 0
            if budget:
                if hasattr(budget, 'total_budget') and not budget.total_budget:
                    budget.total_budget = 5000000
                    budget.save()
                # Categories
                try:
                    if not ProgramBudgetCategory.objects.filter(budget=budget).exists():
                        cats_seed = [
                            ('Personnel', 2500000),
                            ('Vendor / External', 1200000),
                            ('Tooling & Licenses', 350000),
                            ('Infrastructure', 600000),
                            ('Training & Change', 150000),
                            ('Contingency', 200000),
                        ]
                        for name, allocated in cats_seed:
                            cat = ProgramBudgetCategory.objects.create(
                                budget=budget, name=name, allocated_amount=allocated,
                            )
                            cat_count += 1
                            ProgramBudgetItem.objects.create(
                                budget=budget, category=cat,
                                description=f"{name} — Q1+Q2 programme spend",
                                planned_amount=allocated * 0.5,
                                actual_amount=allocated * 0.35,
                                date=today - timedelta(days=30),
                            )
                            item_count += 1
                except Exception:
                    pass
            created['budget_categories'] = cat_count
            created['budget_items'] = item_count

        return Response({'success': True, 'program_id': program.id, 'created': created,
                         'message': f"Program demo data seeded for {program.name}"})


class ProgramClearDemoView(APIView):
    """Wipe all demo data from a program (team, benefits, risks, milestones, budget)."""
    permission_classes = [PROGRAM_DEMO_ROLES]

    def post(self, request, pk=None):
        from django.db import transaction
        from .models import (
            Program, ProgramTeam, ProgramBenefit, ProgramRisk, ProgramMilestone,
            ProgramBudget,
        )
        program = get_object_or_404(Program, pk=pk, company=request.user.company)
        deleted = {}
        with transaction.atomic():
            for label, qs in [
                ('team', ProgramTeam.objects.filter(program=program)),
                ('benefits', ProgramBenefit.objects.filter(program=program)),
                ('risks', ProgramRisk.objects.filter(program=program)),
                ('milestones', ProgramMilestone.objects.filter(program=program)),
            ]:
                deleted[label] = qs.count()
                qs.delete()
            try:
                budget = ProgramBudget.objects.filter(program=program).first()
                if budget:
                    deleted['budget_items'] = budget.items.count() if hasattr(budget, 'items') else 0
                    budget.delete()
                    deleted['budget'] = 1
                else:
                    deleted['budget'] = 0
                    deleted['budget_items'] = 0
            except Exception:
                deleted['budget'] = 0
                deleted['budget_items'] = 0
        return Response({'success': True, 'deleted': deleted})
