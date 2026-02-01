from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model
from accounts.permissions import HasRole
from projects.views import CompanyScopedQuerysetMixin

User = get_user_model()
from .models import Newsletter, NewsletterTemplate, MailingList, ExternalSubscriber, MailingListMember
from .serializers import (
    NewsletterSerializer,
    NewsletterListSerializer,
    NewsletterTemplateSerializer,
    NewsletterSendSerializer,
    NewsletterPreviewSerializer,
    MailingListSerializer,
    MailingListMemberSerializer,
    ExternalSubscriberSerializer,
    ExternalSubscriberSubscribeSerializer,
    NewsletterGlobalSerializer,
    ProjectForNewsletterSerializer,
)


class NewsletterViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """ViewSet for managing newsletters"""

    queryset = Newsletter.objects.all().select_related(
        "project", "project__company", "created_by"
    )
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter newsletters by user's company and optionally by project"""
        qs = super().get_queryset()
        qs = qs.filter(project__company=self.request.user.company)

        # Filter by project if provided
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)

        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return NewsletterListSerializer
        return NewsletterSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "preview", "recipients"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), HasRole("admin", "pm", "contibuter")()]

    def perform_create(self, serializer):
        """Create newsletter with current user as creator"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["post"], url_path="preview")
    def preview(self, request):
        """Preview newsletter content and recipients"""
        serializer = NewsletterPreviewSerializer(
            data=request.data, context={"request": request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        project_id = data["project_id"]

        # Get project
        from projects.models import Project

        try:
            project = Project.objects.get(id=project_id, company=request.user.company)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Create temporary newsletter object for preview
        temp_newsletter = Newsletter(
            project=project,
            subject=data["subject"],
            task_update_details=data.get("task_update_details", ""),
            additional_content=data.get("additional_content", ""),
            recipient_type=data["recipient_type"],
        )

        # Get recipient details
        recipient_details = temp_newsletter.get_recipient_details()

        # Generate HTML content
        html_content = self._generate_html_content(temp_newsletter)

        return Response(
            {
                "recipients": recipient_details,
                "recipient_count": len(recipient_details),
                "html_content": html_content,
                "subject": data["subject"],
            }
        )

    @action(detail=True, methods=["post"], url_path="send")
    def send_newsletter(self, request, pk=None):
        """Send newsletter to recipients"""
        newsletter = self.get_object()

        if newsletter.status == "sent":
            return Response(
                {"error": "Newsletter has already been sent"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = NewsletterSendSerializer(
            data=request.data, context={"request": request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        test_email = data.get("test_email")

        try:
            with transaction.atomic():
                # Get recipient emails
                if test_email:
                    recipient_emails = [test_email]
                else:
                    recipient_emails = list(newsletter.get_recipient_emails())

                if not recipient_emails:
                    return Response(
                        {"error": "No recipients found"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Get detailed recipient information for logging
                recipient_details = newsletter.get_recipient_details()
                
                # Print recipients list to console/log
                print("\n" + "="*80)
                print(f"NEWSLETTER SENDING: {newsletter.subject}")
                if test_email:
                    print(f"Mode: TEST EMAIL to {test_email}")
                else:
                    print(f"Project: {newsletter.project.name if newsletter.project else 'N/A'}")
                print(f"Total Recipients: {len(recipient_emails)}")
                print("-" * 80)
                print("RECIPIENT LIST:")
                for i, detail in enumerate(recipient_details, 1):
                    print(f"  {i}. {detail.get('name', 'Unknown')} ({detail.get('email', 'No email')}) - {detail.get('role', 'N/A')}")
                
                # Also print CRM users if any
                if hasattr(newsletter, 'crm_users') and newsletter.crm_users:
                    print("\nCRM USERS:")
                    for i, crm_user in enumerate(newsletter.crm_users, 1):
                        name = f"{crm_user.get('first_name', '')} {crm_user.get('last_name', '')}".strip()
                        if not name:
                            name = crm_user.get('email', 'Unknown')
                        print(f"  {i}. {name} ({crm_user.get('email', 'No email')})")
                
                # Print project recipients if any
                if hasattr(newsletter, 'project_recipients') and newsletter.project_recipients:
                    print("\nPROJECT RECIPIENTS:")
                    for i, project_recipient in enumerate(newsletter.project_recipients, 1):
                        project_id = project_recipient.get('project_id')
                        recipient_type = project_recipient.get('type')
                        try:
                            from projects.models import Project
                            project = Project.objects.get(id=project_id)
                            if recipient_type == 'team':
                                count = project.team_members.filter(is_active=True).count()
                                print(f"  {i}. Project: {project.name} - Team Members ({count} members)")
                            elif recipient_type == 'stakeholders':
                                try:
                                    from execution.models import Stakeholder
                                    count = Stakeholder.objects.filter(
                                        project=project,
                                        contact__isnull=False
                                    ).exclude(contact='').count()
                                    print(f"  {i}. Project: {project.name} - Execution Stakeholders ({count} stakeholders)")
                                except ImportError:
                                    print(f"  {i}. Project: {project.name} - Stakeholders (0 stakeholders)")
                        except:
                            print(f"  {i}. Project ID: {project_id} - {recipient_type} (not found)")
                
                print(f"\nTotal Emails to Send: {len(recipient_emails)}")
                print("="*80 + "\n")

                # Generate HTML content
                from .views_helpers import (
                    generate_html_content,
                    send_newsletter_email,
                    log_newsletter_activity,
                )

                html_content = generate_html_content(newsletter)

                # Send email
                success = send_newsletter_email(
                    subject=newsletter.subject,
                    html_content=html_content,
                    recipient_list=recipient_emails,
                    project_name=newsletter.project.name,
                )

                if success:
                    # Update newsletter status
                    newsletter.status = "sent"
                    newsletter.sent_at = timezone.now()
                    newsletter.save()

                    # Log activity
                    log_newsletter_activity(newsletter, request.user, "sent")

                    return Response(
                        {
                            "message": "Newsletter sent successfully",
                            "recipient_count": len(recipient_emails),
                            "sent_at": newsletter.sent_at,
                        }
                    )
                else:
                    newsletter.status = "failed"
                    newsletter.save()
                    return Response(
                        {"error": "Failed to send newsletter"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

        except Exception as e:
            newsletter.status = "failed"
            newsletter.save()
            return Response(
                {"error": f"Failed to send newsletter: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["get"], url_path="recipients")
    def get_recipients(self, request):
        """Get available recipients for a project"""
        project_id = request.query_params.get("project")
        if not project_id:
            return Response(
                {"error": "project parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from projects.models import Project

            project = Project.objects.get(id=project_id, company=request.user.company)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Get different recipient groups
        project_team = []
        for team_member in project.team_members.filter(is_active=True):
            user = team_member.user
            name = user.get_full_name() or user.first_name or user.email
            project_team.append(
                {
                    "id": user.id,
                    "name": name,
                    "email": user.email,
                    "role": user.role,
                }
            )

        # Get company users (existing stakeholders)
        stakeholders = []
        from django.contrib.auth import get_user_model

        User = get_user_model()
        for user in User.objects.filter(company=project.company):
            name = user.get_full_name() or user.first_name or user.email
            stakeholders.append(
                {
                    "id": user.id,
                    "name": name,
                    "email": user.email,
                    "role": user.role,
                }
            )

        return Response(
            {
                "project_team": project_team,
                "stakeholders": stakeholders,
            }
        )

    def _generate_html_content(self, newsletter):
        """Generate HTML content for newsletter"""
        from .views_helpers import generate_html_content

        return generate_html_content(newsletter)


class NewsletterTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing newsletter templates"""

    queryset = NewsletterTemplate.objects.all()
    serializer_class = NewsletterTemplateSerializer
    permission_classes = [IsAuthenticated, HasRole("admin", "pm")]

    def perform_create(self, serializer):
        """Create template with current user as creator"""
        serializer.save(created_by=self.request.user)


class MailingListViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """ViewSet for managing mailing lists"""
    
    queryset = MailingList.objects.all().select_related(
        "company", "project", "created_by"
    )
    serializer_class = MailingListSerializer
    permission_classes = [IsAuthenticated, HasRole("admin", "pm")]
    
    def get_queryset(self):
        """Filter mailing lists by user's company"""
        qs = super().get_queryset()
        
        # Filter by project if provided
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        
        # Ensure external subscribers mailing list exists and is synced
        if self.request.user.is_authenticated and hasattr(self.request.user, 'company'):
            self._ensure_external_subscribers_mailing_list(self.request.user.company)
        
        return qs
    
    def _ensure_external_subscribers_mailing_list(self, company):
        """Ensure external subscribers mailing list exists and includes all active subscribers"""
        # Get or create the mailing list
        mailing_list, created = MailingList.objects.get_or_create(
            company=company,
            list_type='external',
            defaults={
                'name': 'External Subscribers',
                'description': 'Subscribers who signed up via the newsletter subscription form',
                'is_active': True,
            }
        )
        
        # Sync all active subscribers to the mailing list
        active_subscribers = ExternalSubscriber.objects.filter(
            company=company,
            is_subscribed=True
        )
        
        for subscriber in active_subscribers:
            MailingListMember.objects.get_or_create(
                mailing_list=mailing_list,
                external_subscriber=subscriber
            )
    
    def perform_create(self, serializer):
        """Create mailing list with current user's company and creator"""
        serializer.save(company=self.request.user.company, created_by=self.request.user)
    
    @action(detail=True, methods=["get"], url_path="members")
    def get_members(self, request, pk=None):
        """Get all members of a mailing list"""
        mailing_list = self.get_object()
        members = mailing_list.members.select_related(
            "external_subscriber", "user"
        ).all()
        
        serializer = MailingListMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"], url_path="sync-project-members")
    def sync_project_members(self, request, pk=None):
        """Sync project team and stakeholders to mailing list"""
        mailing_list = self.get_object()
        
        if not mailing_list.project:
            return Response(
                {"error": "Mailing list must be associated with a project"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        project = mailing_list.project
        
        # Clear existing members
        mailing_list.members.all().delete()
        
        # Add project team members
        for team_member in project.team_members.filter(is_active=True):
            MailingListMember.objects.create(
                mailing_list=mailing_list,
                user=team_member.user
            )
        
        # Add all company users as stakeholders
        from django.contrib.auth import get_user_model
        User = get_user_model()
        for user in User.objects.filter(company=project.company):
            MailingListMember.objects.get_or_create(
                mailing_list=mailing_list,
                user=user
            )
        
        return Response({"message": "Project members synced successfully"})


class ExternalSubscriberViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """ViewSet for managing external subscribers"""
    
    queryset = ExternalSubscriber.objects.all().select_related("company")
    serializer_class = ExternalSubscriberSerializer
    permission_classes = [IsAuthenticated, HasRole("admin", "pm")]
    
    def get_permissions(self):
        """Allow unauthenticated access for subscribe and unsubscribe actions"""
        if self.action in ['subscribe', 'unsubscribe']:
            return [AllowAny()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Create subscriber with current user's company"""
        serializer.save(company=self.request.user.company)
    
    @action(detail=False, methods=["post"], url_path="subscribe", permission_classes=[AllowAny])
    def subscribe(self, request):
        """Public endpoint for subscription"""
        serializer = ExternalSubscriberSubscribeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        company_id = data.get("company_id", 1)  # Default to company ID 1
        
        try:
            from accounts.models import Company
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response(
                {"error": "Company not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create or update subscriber
        subscriber, created = ExternalSubscriber.objects.update_or_create(
            email=data["email"],
            company=company,
            defaults={
                "first_name": data.get("first_name", ""),
                "last_name": data.get("last_name", ""),
                "is_subscribed": True,
                "unsubscribed_date": None,  # Clear unsubscription date on resubscribe
            }
        )
        
        # If subscriber already existed but was unsubscribed, mark as subscribed
        if not created and not subscriber.is_subscribed:
            subscriber.is_subscribed = True
            subscriber.unsubscribed_date = None
            subscriber.save()
        
        # Get or create default "External Subscribers" mailing list for the company
        mailing_list, _ = MailingList.objects.get_or_create(
            company=company,
            list_type='external',
            defaults={
                'name': 'External Subscribers',
                'description': 'Subscribers who signed up via the newsletter subscription form',
                'is_active': True,
            }
        )
        
        # Add subscriber to mailing list if subscribed and not already a member
        if subscriber.is_subscribed:
            MailingListMember.objects.get_or_create(
                mailing_list=mailing_list,
                external_subscriber=subscriber
            )
        
        if not created and subscriber.is_subscribed:
            return Response(
                {"message": "Email already subscribed"},
                status=status.HTTP_200_OK
            )
        
        return Response(
            {"message": "Successfully subscribed to newsletter"},
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=["post"], url_path="unsubscribe", permission_classes=[AllowAny])
    def unsubscribe(self, request):
        """Public endpoint for unsubscription"""
        email = request.data.get("email")
        company_id = request.data.get("company_id", 1)  # Default to company ID 1
        
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            subscriber = ExternalSubscriber.objects.get(
                email=email,
                company_id=company_id
            )
            subscriber.is_subscribed = False
            subscriber.unsubscribed_date = timezone.now()
            subscriber.save()
            
            # Remove subscriber from mailing list(s)
            MailingListMember.objects.filter(
                external_subscriber=subscriber
            ).delete()
            
            return Response({"message": "Successfully unsubscribed"})
        except ExternalSubscriber.DoesNotExist:
            return Response(
                {"error": "Subscriber not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class GlobalNewsletterViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """ViewSet for managing global newsletters (company-wide)"""
    
    queryset = Newsletter.objects.all().select_related(
        "project", "project__company", "created_by"
    ).prefetch_related("mailing_lists")
    permission_classes = [IsAuthenticated, HasRole("admin", "pm")]
    
    def get_queryset(self):
        """Filter newsletters by user's company"""
        qs = super().get_queryset()
        return qs.order_by("-created_at")
    
    def get_serializer_class(self):
        if self.action == "list":
            return NewsletterGlobalSerializer
        return NewsletterGlobalSerializer
    
    def perform_create(self, serializer):
        """Create newsletter with current user as creator"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=["post"], url_path="send")
    def send_newsletter(self, request, pk=None):
        """Send global newsletter to recipients"""
        newsletter = self.get_object()
        
        if newsletter.status == "sent":
            return Response(
                {"error": "Newsletter has already been sent"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            with transaction.atomic():
                # Get recipient emails
                recipient_emails = list(newsletter.get_recipient_emails())
                
                if not recipient_emails:
                    return Response(
                        {"error": "No recipients found"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Get detailed recipient information for logging
                recipient_details = newsletter.get_recipient_details()
                
                # Print recipients list to console/log
                print("\n" + "="*80)
                print(f"NEWSLETTER SENDING: {newsletter.subject}")
                print(f"Project: {newsletter.project.name if newsletter.project else 'Company Newsletter'}")
                print(f"Total Recipients: {len(recipient_emails)}")
                print("-" * 80)
                print("RECIPIENT LIST:")
                for i, detail in enumerate(recipient_details, 1):
                    print(f"  {i}. {detail.get('name', 'Unknown')} ({detail.get('email', 'No email')}) - {detail.get('role', 'N/A')}")
                
                # Also print CRM users if any
                if newsletter.crm_users:
                    print("\nCRM USERS:")
                    for i, crm_user in enumerate(newsletter.crm_users, 1):
                        name = f"{crm_user.get('first_name', '')} {crm_user.get('last_name', '')}".strip()
                        if not name:
                            name = crm_user.get('email', 'Unknown')
                        print(f"  {i}. {name} ({crm_user.get('email', 'No email')})")
                
                # Print project recipients if any
                if hasattr(newsletter, 'project_recipients') and newsletter.project_recipients:
                    print("\nPROJECT RECIPIENTS:")
                    for i, project_recipient in enumerate(newsletter.project_recipients, 1):
                        project_id = project_recipient.get('project_id')
                        recipient_type = project_recipient.get('type')
                        try:
                            from projects.models import Project
                            project = Project.objects.get(id=project_id)
                            if recipient_type == 'team':
                                count = project.team_members.filter(is_active=True).count()
                                print(f"  {i}. Project: {project.name} - Team Members ({count} members)")
                            elif recipient_type == 'stakeholders':
                                try:
                                    from execution.models import Stakeholder
                                    count = Stakeholder.objects.filter(
                                        project=project,
                                        contact__isnull=False
                                    ).exclude(contact='').count()
                                    print(f"  {i}. Project: {project.name} - Execution Stakeholders ({count} stakeholders)")
                                except ImportError:
                                    print(f"  {i}. Project: {project.name} - Stakeholders (0 stakeholders)")
                        except:
                            print(f"  {i}. Project ID: {project_id} - {recipient_type} (not found)")
                
                print(f"\nTotal Emails to Send: {len(recipient_emails)}")
                print("="*80 + "\n")

                # Generate HTML content
                from .views_helpers import (
                    generate_html_content,
                    send_newsletter_email_bcc,
                    log_newsletter_activity,
                )

                html_content = generate_html_content(newsletter)

                # Get project name for email
                project_name = newsletter.project.name if newsletter.project else "Company Newsletter"

                # Send newsletter
                success = send_newsletter_email_bcc(
                    subject=newsletter.subject,
                    html_content=html_content,
                    recipient_list=recipient_emails,
                    project_name=project_name,
                )

                if success:
                    newsletter.status = "sent"
                    newsletter.sent_at = timezone.now()
                    newsletter.save()

                    # Log activity
                    log_newsletter_activity(newsletter, request.user, "sent")

                    return Response(
                        {"message": "Newsletter sent successfully"},
                        status=status.HTTP_200_OK,
                    )
                else:
                    return Response(
                        {"error": "Failed to send newsletter"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"Newsletter sending error: {error_trace}")  # Log full traceback to console
            
            newsletter.status = "failed"
            newsletter.save()
            return Response(
                {"error": f"Failed to send newsletter: {str(e)}", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    
    @action(detail=False, methods=["get"], url_path="projects")
    def get_projects_for_newsletter(self, request):
        """Get projects with team members and stakeholders for newsletter selection"""
        from projects.models import Project
        
        # Get projects for the user's company
        projects = Project.objects.filter(
            company=request.user.company
        ).select_related('company').prefetch_related('team_members__user')
        
        serializer = ProjectForNewsletterSerializer(projects, many=True)
        return Response(serializer.data)