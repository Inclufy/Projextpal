import pyotp
import qrcode
import base64
from io import BytesIO
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_otp.plugins.otp_totp.models import TOTPDevice


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
            return Response({'message': '2FA enabled successfully'})
        else:
            return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)


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
    permission_classes = []
    authentication_classes = []

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

        # Authenticate user directly by email (bypass AUTHENTICATION_BACKENDS)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
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

            # Verify the TOTP code
            if not device.verify_token(totp_code):
                return Response(
                    {'error': 'Invalid 2FA code'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

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
