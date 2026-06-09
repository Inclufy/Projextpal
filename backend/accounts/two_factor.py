import pyotp
import qrcode
import base64
from io import BytesIO
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.plugins.otp_static.models import StaticDevice, StaticToken
import secrets


def _generate_recovery_codes(user, n=10):
    """(Re)generate `n` one-time recovery codes for the user. Replaces any
    existing set. Returns the plaintext codes ONCE (only shown at generation;
    django_otp stores them and consumes one on use)."""
    StaticDevice.objects.filter(user=user, name="recovery").delete()
    device = StaticDevice.objects.create(user=user, name="recovery", confirmed=True)
    codes = []
    for _ in range(n):
        code = f"{secrets.token_hex(2)}-{secrets.token_hex(2)}"  # e.g. "a1b2-c3d4"
        StaticToken.objects.create(device=device, token=code)
        codes.append(code)
    return codes


class Setup2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        TOTPDevice.objects.filter(user=user, confirmed=False).delete()
        
        device = TOTPDevice.objects.create(
            user=user,
            name=f"{user.email}'s device",
            confirmed=False
        )
        
        secret = base64.b32encode(device.bin_key).decode('utf-8')
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name="ProjextPal"
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return Response({
            'qr_code': f"data:image/png;base64,{qr_code_base64}",
            'secret': secret,
            'device_id': device.id
        })


class Verify2FASetupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('code')
        
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        device = TOTPDevice.objects.filter(user=user, confirmed=False).first()
        
        if not device:
            return Response({'error': 'No pending 2FA setup found'}, status=status.HTTP_400_BAD_REQUEST)
        
        if device.verify_token(code):
            device.confirmed = True
            device.save()
            codes = _generate_recovery_codes(user)
            return Response({
                'message': '2FA enabled successfully',
                'recovery_codes': codes,
                'recovery_codes_notice': 'Store these somewhere safe. Each can be used once if you lose your authenticator. They will not be shown again.',
            })
        else:
            return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)


class RecoveryCodesView(APIView):
    """GET → how many unused recovery codes remain. POST → regenerate (returns
    a fresh set once; invalidates the old set)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dev = StaticDevice.objects.filter(user=request.user, name="recovery").first()
        remaining = dev.token_set.count() if dev else 0
        return Response({"remaining": remaining, "enabled": TOTPDevice.objects.filter(user=request.user, confirmed=True).exists()})

    def post(self, request):
        if not TOTPDevice.objects.filter(user=request.user, confirmed=True).exists():
            return Response({"error": "Enable 2FA first"}, status=status.HTTP_400_BAD_REQUEST)
        codes = _generate_recovery_codes(request.user)
        try:
            from .models import audit
            audit(request.user, "2fa.recovery_codes_regenerated", summary="Regenerated 2FA recovery codes", request=request, severity="warning")
        except Exception:
            pass
        return Response({"recovery_codes": codes})


class Validate2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('code')
        
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
        
        if not device:
            return Response({'error': '2FA not enabled'}, status=status.HTTP_400_BAD_REQUEST)
        
        if device.verify_token(code):
            return Response({'message': '2FA verified', 'verified': True})
        else:
            return Response({'error': 'Invalid code', 'verified': False}, status=status.HTTP_400_BAD_REQUEST)


class Disable2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('code')
        
        device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
        
        if not device:
            return Response({'error': '2FA not enabled'}, status=status.HTTP_400_BAD_REQUEST)
        
        if device.verify_token(code):
            device.delete()
            return Response({'message': '2FA disabled successfully'})
        else:
            return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)


class Check2FAStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        has_2fa = TOTPDevice.objects.filter(user=user, confirmed=True).exists()
        return Response({'has_2fa': has_2fa})


class LoginWith2FAView(APIView):
    """Login with optional 2FA support"""
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        from django.contrib.auth import get_user_model
        from rest_framework_simplejwt.tokens import RefreshToken

        User = get_user_model()

        email = request.data.get('email')
        password = request.data.get('password')
        totp_code = request.data.get('totp_code')

        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authenticate user directly by email. Use .filter().first() so a duplicate
        # email row surfaces as 401, not a 500 from MultipleObjectsReturned.
        user = User.objects.filter(email=email).order_by('id').first()
        if user is None:
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'Account not verified. Please check your email.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user has 2FA enabled
        device = TOTPDevice.objects.filter(user=user, confirmed=True).first()

        if device:
            # 2FA is enabled - check if code was provided
            if not totp_code:
                return Response({
                    'requires_2fa': True,
                    'message': '2FA code required'
                }, status=status.HTTP_200_OK)

            # Verify the TOTP code; fall back to a one-time recovery code.
            if not device.verify_token(totp_code):
                recovery = StaticDevice.objects.filter(user=user, name="recovery").first()
                if not (recovery and recovery.verify_token(totp_code)):
                    return Response(
                        {'error': 'Invalid 2FA code'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                # Recovery code accepted (and consumed) — log it.
                try:
                    from .models import audit
                    audit(user, "2fa.recovery_code_used", summary="Logged in with a 2FA recovery code", request=request, severity="warning")
                except Exception:
                    pass

        # Generate tokens
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
