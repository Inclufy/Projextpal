import uuid
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import TeamInvitation
from .invitation_utils import generate_invitation_token, verify_invitation_token
from django.contrib.auth import get_user_model

User = get_user_model()


# Roles allowed to invite teammates (no superadmin dependency). A guest /
# contributor / reviewer cannot pull new people into the tenant.
INVITER_ROLES = {'superadmin', 'admin', 'pm', 'program_manager'}


class CreateInvitationView(APIView):
    """Create and send team invitation"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Self-service, but scoped: only company admins / (programme) managers
        # may invite — so it never requires a superadmin, yet a guest can't
        # invite others.
        if not request.user.is_superuser and getattr(request.user, 'role', None) not in INVITER_ROLES:
            return Response(
                {'error': 'forbidden',
                 'message': 'Only administrators and (programme) managers can invite team members.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        email = request.data.get('email')
        role = request.data.get('role', 'guest')
        project_id = request.data.get('project_id')
        program_id = request.data.get('program_id')
        message = request.data.get('message', '')

        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Normalize empty-string ids from the form to None so the FK is nullable
        project_id = project_id or None
        program_id = program_id or None

        # Create invitation with a unique placeholder token. The real token is
        # generated below using the row id and overwrites this placeholder.
        # Without a unique placeholder, the second invite ever would crash with
        # IntegrityError on the unique constraint of token.
        invitation = TeamInvitation.objects.create(
            email=email,
            role=role,
            invited_by=request.user,
            project_id=project_id,
            program_id=program_id,
            message=message,
            token=f'pending-{uuid.uuid4()}',
        )

        # Generate the real token now that we have an id
        token = generate_invitation_token(invitation.id, email)
        invitation.token = token
        invitation.save()

        # Build invitation link
        invitation_link = f"{settings.FRONTEND_URL}/invite/{token}"

        # Resolve a human-readable target name for the email subject. If neither
        # project nor program is linked (a generic company invite), fall back to
        # the company name.
        target_name = None
        if invitation.project:
            target_name = invitation.project.name
        elif invitation.program:
            target_name = invitation.program.name
        else:
            company = getattr(request.user, 'company', None)
            target_name = getattr(company, 'name', None) or 'ProjeXtPal'

        try:
            send_mail(
                subject=f'Je bent uitgenodigd voor {target_name}',
                message=f'{request.user.get_full_name() or request.user.email} heeft je uitgenodigd. Klik op: {invitation_link}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email send error: {e}")
        
        return Response({
            'id': str(invitation.id),
            'email': invitation.email,
            'invitation_link': invitation_link,
            'message': 'Invitation created and sent successfully'
        }, status=status.HTTP_201_CREATED)


class AcceptInvitationView(APIView):
    """Accept invitation via token"""
    permission_classes = [AllowAny]
    
    def get(self, request, token):
        """View invitation details"""
        payload = verify_invitation_token(token)
        
        if not payload:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            invitation = TeamInvitation.objects.get(
                id=payload['invitation_id'],
                email=payload['email']
            )
            
            if not invitation.can_be_accepted:
                return Response({
                    'error': 'Invitation cannot be accepted',
                    'status': invitation.status
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'email': invitation.email,
                'role': invitation.role,
                'project': invitation.project.name if invitation.project else None,
                'program': invitation.program.name if invitation.program else None,
                'invited_by': invitation.invited_by.get_full_name() or invitation.invited_by.email,
                'message': invitation.message,
                'expires_at': invitation.expires_at,
                # Lets the accept screen show "set a password" (new person) vs a
                # plain "accept" (the email already has an account).
                'has_account': User.objects.filter(email__iexact=invitation.email).exists(),
            })
            
        except TeamInvitation.DoesNotExist:
            return Response({'error': 'Invitation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request, token):
        """Accept the invitation"""
        payload = verify_invitation_token(token)
        
        if not payload:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            invitation = TeamInvitation.objects.get(
                id=payload['invitation_id'],
                email=payload['email']
            )
            
            if not invitation.can_be_accepted:
                return Response({'error': 'Invitation cannot be accepted'}, status=status.HTTP_400_BAD_REQUEST)

            email = (invitation.email or '').strip().lower()
            inviter = invitation.invited_by
            company = getattr(inviter, 'company', None)

            # Resolve the accepting user — get the existing account or create a
            # brand-new ACTIVE member in the inviter's company (no superadmin
            # approval needed). A new person must set a password here.
            user = User.objects.filter(email__iexact=email).first()
            created = False
            if user is None:
                password = request.data.get('password') or ''
                if len(password) < 8:
                    return Response(
                        {'error': 'password_required',
                         'message': 'Choose a password of at least 8 characters to create your account.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                role = invitation.role if invitation.role in dict(User.ROLE_CHOICES) else 'guest'
                user = User.objects.create(
                    email=email,
                    username=email,
                    first_name=(request.data.get('first_name') or '').strip(),
                    last_name=(request.data.get('last_name') or '').strip(),
                    company=company,
                    role=role,
                    is_active=True,
                )
                user.set_password(password)
                user.save()
                created = True
            else:
                # Existing account: make sure they can log in, and attach to the
                # inviter's company if they don't have one yet (never override an
                # existing tenant).
                changed = []
                if not user.is_active:
                    user.is_active = True
                    changed.append('is_active')
                if company and getattr(user, 'company_id', None) is None:
                    user.company = company
                    changed.append('company')
                if changed:
                    user.save(update_fields=changed)

            # Link to the project / programme team (the bit that was a TODO).
            redirect_to = '/dashboard'
            if invitation.project_id:
                from projects.models import ProjectTeam
                ProjectTeam.objects.get_or_create(
                    project_id=invitation.project_id, user=user,
                    defaults={'added_by': inviter, 'is_active': True},
                )
                redirect_to = f'/projects/{invitation.project_id}'
            elif invitation.program_id:
                from programs.models import ProgramTeam
                ProgramTeam.objects.get_or_create(
                    program_id=invitation.program_id, user=user,
                    defaults={'added_by': inviter, 'role': invitation.role, 'is_active': True},
                )
                redirect_to = f'/programs/{invitation.program_id}'

            # Mark accepted.
            invitation.status = 'accepted'
            invitation.accepted_by = user
            invitation.accepted_at = timezone.now()
            invitation.save(update_fields=['status', 'accepted_by', 'accepted_at'])

            # Auto-login so the invitee lands straight in the project.
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Invitation accepted successfully',
                'created': created,
                'redirect_to': redirect_to,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {'email': user.email, 'role': user.role},
            })

        except TeamInvitation.DoesNotExist:
            return Response({'error': 'Invitation not found'}, status=status.HTTP_404_NOT_FOUND)


class ListInvitationsView(APIView):
    """List user's invitations"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Sent by user
        sent = TeamInvitation.objects.filter(invited_by=request.user)
        
        # Received by user
        received = TeamInvitation.objects.filter(email=request.user.email)
        
        return Response({
            'sent': [{
                'id': str(inv.id),
                'email': inv.email,
                'status': inv.status,
                'project': inv.project.name if inv.project else None,
                'created_at': inv.created_at
            } for inv in sent],
            'received': [{
                'id': str(inv.id),
                'project': inv.project.name if inv.project else None,
                'invited_by': inv.invited_by.get_full_name() or inv.invited_by.email,
                'status': inv.status,
                'created_at': inv.created_at
            } for inv in received]
        })
