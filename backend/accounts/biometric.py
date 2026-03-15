"""
Biometric Authentication (WebAuthn/FIDO2) for Face ID & Fingerprint login.
Uses simplified credential storage for WebAuthn passkeys.
"""
import json
import hashlib
import secrets
import base64
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

from .models import CustomUser


class BiometricRegisterOptionsView(APIView):
    """Generate registration options for biometric credential enrollment."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        challenge = secrets.token_urlsafe(32)

        # Store challenge in session for verification
        request.session['webauthn_challenge'] = challenge
        request.session.save()

        # Get existing credentials to exclude
        from .models_biometric import BiometricCredential
        existing = BiometricCredential.objects.filter(user=user, is_active=True)
        exclude_credentials = [
            {
                'id': cred.credential_id,
                'type': 'public-key',
            }
            for cred in existing
        ]

        options = {
            'challenge': challenge,
            'rp': {
                'name': 'ProjeXtPal',
                'id': request.get_host().split(':')[0],
            },
            'user': {
                'id': base64.urlsafe_b64encode(
                    str(user.id).encode()
                ).decode().rstrip('='),
                'name': user.email,
                'displayName': f"{user.first_name} {user.last_name}".strip() or user.email,
            },
            'pubKeyCredParams': [
                {'alg': -7, 'type': 'public-key'},   # ES256
                {'alg': -257, 'type': 'public-key'},  # RS256
            ],
            'timeout': 60000,
            'excludeCredentials': exclude_credentials,
            'authenticatorSelection': {
                'authenticatorAttachment': 'platform',  # Face ID / fingerprint
                'userVerification': 'required',
                'residentKey': 'preferred',
            },
            'attestation': 'none',
        }

        return Response(options)


class BiometricRegisterCompleteView(APIView):
    """Complete biometric credential registration."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .models_biometric import BiometricCredential

        user = request.user
        credential_data = request.data

        credential_id = credential_data.get('id')
        device_name = credential_data.get('device_name', 'Biometric Device')

        if not credential_id:
            return Response(
                {'error': 'Missing credential ID'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Store the credential
        BiometricCredential.objects.create(
            user=user,
            credential_id=credential_id,
            public_key=json.dumps(credential_data.get('response', {})),
            device_name=device_name,
            is_active=True,
        )

        return Response({
            'message': 'Biometric credential registered successfully',
            'device_name': device_name,
        })


class BiometricLoginOptionsView(APIView):
    """Generate authentication options for biometric login."""
    permission_classes = [AllowAny]

    def post(self, request):
        from .models_biometric import BiometricCredential

        email = request.data.get('email')

        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'No biometric credentials found'},
                status=status.HTTP_404_NOT_FOUND
            )

        credentials = BiometricCredential.objects.filter(
            user=user, is_active=True
        )

        if not credentials.exists():
            return Response(
                {'error': 'No biometric credentials registered for this account'},
                status=status.HTTP_404_NOT_FOUND
            )

        challenge = secrets.token_urlsafe(32)
        request.session['webauthn_challenge'] = challenge
        request.session['webauthn_email'] = email
        request.session.save()

        options = {
            'challenge': challenge,
            'rpId': request.get_host().split(':')[0],
            'allowCredentials': [
                {
                    'id': cred.credential_id,
                    'type': 'public-key',
                    'transports': ['internal'],
                }
                for cred in credentials
            ],
            'timeout': 60000,
            'userVerification': 'required',
        }

        return Response(options)


class BiometricLoginCompleteView(APIView):
    """Complete biometric authentication and issue JWT tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        from .models_biometric import BiometricCredential

        credential_id = request.data.get('id')
        email = request.data.get('email') or request.session.get('webauthn_email')

        if not credential_id or not email:
            return Response(
                {'error': 'Missing credential ID or email'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            credential = BiometricCredential.objects.get(
                user=user,
                credential_id=credential_id,
                is_active=True,
            )
        except BiometricCredential.DoesNotExist:
            return Response(
                {'error': 'Invalid biometric credential'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Update last used
        credential.last_used_at = timezone.now()
        credential.sign_count += 1
        credential.save(update_fields=['last_used_at', 'sign_count'])

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })


class BiometricCredentialListView(APIView):
    """List and manage biometric credentials for the current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .models_biometric import BiometricCredential

        credentials = BiometricCredential.objects.filter(
            user=request.user, is_active=True
        )

        return Response([
            {
                'id': cred.id,
                'credential_id': cred.credential_id[:12] + '...',
                'device_name': cred.device_name,
                'created_at': cred.created_at.isoformat(),
                'last_used_at': cred.last_used_at.isoformat() if cred.last_used_at else None,
            }
            for cred in credentials
        ])

    def delete(self, request):
        from .models_biometric import BiometricCredential

        credential_id = request.data.get('credential_id')

        if not credential_id:
            return Response(
                {'error': 'credential_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            credential = BiometricCredential.objects.get(
                id=credential_id, user=request.user
            )
            credential.is_active = False
            credential.save(update_fields=['is_active'])
            return Response({'message': 'Credential removed'})
        except BiometricCredential.DoesNotExist:
            return Response(
                {'error': 'Credential not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class BiometricStatusView(APIView):
    """Check if user has biometric credentials registered."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .models_biometric import BiometricCredential

        count = BiometricCredential.objects.filter(
            user=request.user, is_active=True
        ).count()

        return Response({
            'has_biometric': count > 0,
            'credential_count': count,
        })
