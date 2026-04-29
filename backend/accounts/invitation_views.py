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


class CreateInvitationView(APIView):
    """Create and send team invitation"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
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
                'expires_at': invitation.expires_at
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
            
            # Mark as accepted
            invitation.status = 'accepted'
            invitation.accepted_by = request.user if request.user.is_authenticated else None
            invitation.accepted_at = timezone.now()
            invitation.save()
            
            # TODO: Add user to project/program team
            
            return Response({
                'message': 'Invitation accepted successfully',
                'redirect_to': f'/projects/{invitation.project.id}' if invitation.project else f'/programs/{invitation.program.id}'
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
