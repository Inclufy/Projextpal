"""Certificate Generation API"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.core.files.base import ContentFile
from .models import Enrollment, Certificate, UserSkill
from .certificate_generator import generate_certificate_pdf
import secrets
import os
from datetime import datetime

logger = logging.getLogger(__name__)


def _render_and_attach_pdf(cert):
    """Render the cert to PDF and persist to cert.pdf_file.

    Failures are logged but don't bubble up — the cert row still exists,
    and the download endpoint will surface a clear error. We don't want a
    transient PDF-rendering glitch (e.g. font cache) to roll back the cert
    creation, because the eligibility checks have already passed.
    """
    try:
        pdf_path, filename = generate_certificate_pdf(cert)
        with open(pdf_path, 'rb') as f:
            cert.pdf_file.save(filename, ContentFile(f.read()), save=True)
        try:
            os.unlink(pdf_path)
        except OSError:
            pass
        return True
    except Exception:  # noqa: BLE001 — broad catch is intentional here
        logger.exception('Certificate PDF render failed for cert %s', cert.id)
        return False


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enrollment_eligibility(request, enrollment_id):
    """GET /academy/enrollments/<id>/eligibility/

    Learner-facing endpoint: returns whether this enrollment can claim a
    certificate yet, and if not, which gate is still open. Frontend uses
    the `eligible` boolean to decide whether to show the "Download
    Certificate" button.
    """
    enrollment = get_object_or_404(
        Enrollment, id=enrollment_id, user=request.user
    )
    data = enrollment.certificate_eligibility()
    data['enrollment_id'] = str(enrollment.id)
    data['has_certificate'] = hasattr(enrollment, 'certificate')
    if data['has_certificate']:
        data['certificate_id'] = str(enrollment.certificate.id)
        data['certificate_number'] = enrollment.certificate.certificate_number
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_certificate(request, enrollment_id):
    """Generate certificate for enrollment — gated on eligibility.

    The client MUST call GET /enrollments/<id>/eligibility/ first to know
    whether to show the "Download Certificate" button; this endpoint is a
    server-side guard against forged or out-of-band POSTs.
    """
    try:
        enrollment = get_object_or_404(Enrollment, id=enrollment_id, user=request.user)

        # Check if already exists
        if hasattr(enrollment, 'certificate'):
            return Response({
                'exists': True,
                'certificate_id': str(enrollment.certificate.id),
                'certificate_number': enrollment.certificate.certificate_number
            })

        # === eligibility gate ===
        # Reject the request if this learner hasn't completed all the
        # lessons, passed all quizzes, and passed the final exam. Without
        # this, any enrolled user could mint a certificate immediately,
        # making the credential meaningless.
        eligibility = enrollment.certificate_eligibility()
        if not eligibility['eligible']:
            return Response({
                'error': 'certificate_not_earned',
                'detail': 'You have not completed all course requirements yet.',
                **eligibility,
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Aggregate skills data
        user_skills = UserSkill.objects.filter(user=request.user)
        skills_data = {'categories': {}}
        
        for us in user_skills:
            cat = us.skill.category.name if us.skill.category else 'General'
            if cat not in skills_data['categories']:
                skills_data['categories'][cat] = []
            
            skills_data['categories'][cat].append({
                'name': us.skill.name,
                'points': us.points,
                'level': us.level,
                'max_points': 1000
            })
        
        # Create certificate
        cert_number = f"PM-{datetime.now().year}-{Certificate.objects.count()+1:06d}"
        
        cert = Certificate.objects.create(
            enrollment=enrollment,
            certificate_number=cert_number,
            verification_code=secrets.token_urlsafe(9)[:12].upper(),
            skills_data=skills_data,
            total_score=85,
            lessons_completed=24,
            quizzes_passed=20,
            exams_passed=1,
            simulations_completed=15,
            practice_submitted=10
        )

        # Render PDF and attach to cert.pdf_file so /download/ returns a
        # real file rather than 404. See _render_and_attach_pdf() for
        # error handling.
        pdf_ok = _render_and_attach_pdf(cert)

        return Response({
            'success': True,
            'certificate_id': str(cert.id),
            'certificate_number': cert.certificate_number,
            'verification_code': cert.verification_code,
            'pdf_generated': pdf_ok,
            'download_url': f'/api/v1/academy/certificate/{cert.id}/download/'
        })
        
    except Http404:
        raise  # DRF converts to clean 404
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def download_certificate(request, certificate_id):
    """Download certificate PDF"""
    try:
        cert = get_object_or_404(Certificate, id=certificate_id)

        # Lazy backfill: if a cert was created before PDF generation was
        # wired up (or rendering failed last time), generate it on demand.
        if not cert.pdf_file:
            _render_and_attach_pdf(cert)
            cert.refresh_from_db()

        if cert.pdf_file:
            return FileResponse(cert.pdf_file, as_attachment=True,
                              filename=f"certificate_{cert.certificate_number}.pdf",
                              content_type='application/pdf')

        return Response({'error': 'PDF not yet generated'}, status=404)
        
    except Http404:
        raise  # DRF converts to clean 404
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_certificate(request, verification_code):
    """Verify certificate by code (public — used by employers without an account)."""
    try:
        cert = Certificate.objects.filter(verification_code=verification_code).first()
        
        if not cert:
            return Response({'valid': False, 'message': 'Certificate not found'})
        
        return Response({
            'valid': True,
            'certificate_number': cert.certificate_number,
            'issued_to': f"{cert.enrollment.user.first_name} {cert.enrollment.user.last_name}",
            'course': cert.enrollment.course.title,
            'issued_at': cert.issued_at.isoformat(),
            'total_score': cert.total_score,
            'skills_summary': len(cert.skills_data.get('categories', {}))
        })
        
    except Http404:
        raise  # DRF converts to clean 404
    except Exception as e:
        return Response({'error': str(e)}, status=500)
