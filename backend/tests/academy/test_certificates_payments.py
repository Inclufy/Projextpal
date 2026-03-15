"""
Academy Tests - Certificates, Payments, Coupons & Practice
Tests each feature one by one.
"""
import pytest
from decimal import Decimal
from django.utils import timezone
from academy.models import (
    CourseCategory, CourseInstructor, Course, CourseModule, CourseLesson,
    Enrollment, Certificate, Payment, CouponCode, LessonResource,
    LessonVisual, PracticeAssignment, PracticeSubmission,
)
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def category(db):
    return CourseCategory.objects.create(name="PM", slug="pm-cert", order=1)


@pytest.fixture
def instructor(db):
    return CourseInstructor.objects.create(name="Cert Instructor", title="Expert")


@pytest.fixture
def course(db, category, instructor):
    return Course.objects.create(
        title="PM Certification Prep", slug="pm-cert-prep",
        description="Prepare for PM certification",
        category=category, instructor=instructor,
        price=Decimal("499.00"), status="published",
    )


@pytest.fixture
def module(db, course):
    return CourseModule.objects.create(course=course, title="Cert Module", order=1)


@pytest.fixture
def lesson(db, module):
    return CourseLesson.objects.create(module=module, title="Cert Lesson", order=1)


@pytest.fixture
def enrollment(db, user, course):
    return Enrollment.objects.create(
        user=user, course=course, email=user.email,
        first_name="Test", last_name="User", status="completed",
        amount_paid=Decimal("499.00"),
    )


# ── 1. Certificate Tests ────────────────────────────────────────────

@pytest.mark.django_db
class TestCertificate:
    """Test certificate generation and verification."""

    def test_create_certificate(self, enrollment):
        cert = Certificate.objects.create(
            enrollment=enrollment,
            certificate_number="PM-2026-000001",
            verification_code="ABC123DEF456",
            total_score=92,
            lessons_completed=20,
            quizzes_passed=5,
            exams_passed=1,
        )
        assert cert.pk is not None
        assert cert.certificate_number == "PM-2026-000001"

    def test_certificate_uuid_pk(self, enrollment):
        import uuid
        cert = Certificate.objects.create(
            enrollment=enrollment,
            certificate_number="PM-2026-000002",
            verification_code="XYZ789",
        )
        assert isinstance(cert.pk, uuid.UUID)

    def test_certificate_skills_data(self, enrollment):
        skills = {
            "planning": {"level": 3, "points": 350},
            "risk_mgmt": {"level": 2, "points": 180},
        }
        cert = Certificate.objects.create(
            enrollment=enrollment,
            certificate_number="PM-2026-000003",
            verification_code="SKL001",
            skills_data=skills,
        )
        assert cert.skills_data["planning"]["level"] == 3

    def test_certificate_completion_stats(self, enrollment):
        cert = Certificate.objects.create(
            enrollment=enrollment,
            certificate_number="PM-2026-000004",
            verification_code="STS001",
            total_score=88,
            lessons_completed=25,
            quizzes_passed=8,
            exams_passed=2,
            simulations_completed=3,
            practice_submitted=4,
        )
        assert cert.total_score == 88
        assert cert.lessons_completed == 25
        assert cert.quizzes_passed == 8
        assert cert.exams_passed == 2
        assert cert.simulations_completed == 3
        assert cert.practice_submitted == 4

    def test_generate_certificate_number(self, enrollment):
        cert = Certificate(enrollment=enrollment)
        number = cert.generate_certificate_number()
        assert "-2026-" in number
        assert len(number) > 8

    def test_generate_verification_code(self, enrollment):
        cert = Certificate(enrollment=enrollment)
        code = cert.generate_verification_code()
        assert len(code) == 12

    def test_certificate_unique_number(self, enrollment, db, course, category, instructor):
        Certificate.objects.create(
            enrollment=enrollment,
            certificate_number="PM-2026-UNIQUE1",
            verification_code="UNQ001",
        )
        c2 = Course.objects.create(
            title="C2", slug="c2-cert", description="C2",
            category=category, instructor=instructor,
        )
        e2 = Enrollment.objects.create(
            course=c2, email="cert2@test.com",
            first_name="C", last_name="2",
        )
        with pytest.raises(Exception):
            Certificate.objects.create(
                enrollment=e2,
                certificate_number="PM-2026-UNIQUE1",  # duplicate
                verification_code="UNQ002",
            )

    def test_certificate_str(self, enrollment):
        cert = Certificate.objects.create(
            enrollment=enrollment,
            certificate_number="PM-2026-000005",
            verification_code="STR001",
        )
        s = str(cert)
        assert "PM-2026-000005" in s

    def test_certificate_one_per_enrollment(self, enrollment):
        Certificate.objects.create(
            enrollment=enrollment,
            certificate_number="PM-2026-ONE1",
            verification_code="ONE001",
        )
        with pytest.raises(Exception):
            Certificate.objects.create(
                enrollment=enrollment,
                certificate_number="PM-2026-ONE2",
                verification_code="ONE002",
            )


# ── 2. Payment Tests ────────────────────────────────────────────────

@pytest.mark.django_db
class TestPayment:
    """Test payment records."""

    def test_create_payment(self, enrollment):
        payment = Payment.objects.create(
            enrollment=enrollment,
            amount=Decimal("499.00"),
            currency="EUR",
            payment_method="card",
            status="completed",
            billing_email="test@example.com",
            billing_name="Test User",
        )
        assert payment.amount == Decimal("499.00")
        assert payment.status == "completed"

    def test_payment_uuid_pk(self, enrollment):
        import uuid
        payment = Payment.objects.create(
            enrollment=enrollment,
            amount=Decimal("199.00"),
            billing_email="pay@test.com",
        )
        assert isinstance(payment.pk, uuid.UUID)

    def test_payment_stripe_fields(self, enrollment):
        payment = Payment.objects.create(
            enrollment=enrollment,
            amount=Decimal("499.00"),
            billing_email="stripe@test.com",
            stripe_session_id="cs_test_123",
            stripe_payment_intent="pi_test_456",
            stripe_customer_id="cus_test_789",
        )
        assert payment.stripe_session_id == "cs_test_123"
        assert payment.stripe_payment_intent == "pi_test_456"

    def test_payment_billing_info(self, enrollment):
        payment = Payment.objects.create(
            enrollment=enrollment,
            amount=Decimal("499.00"),
            billing_email="billing@company.com",
            billing_name="Company BV",
            billing_company="Test Company",
            billing_vat="NL123456789B01",
            billing_country="NL",
        )
        assert payment.billing_vat == "NL123456789B01"
        assert payment.billing_country == "NL"

    def test_payment_statuses(self, db, course, category, instructor):
        for status in ["pending", "completed", "failed", "refunded"]:
            e = Enrollment.objects.create(
                course=course, email=f"{status}-pay@test.com",
                first_name="P", last_name=status,
            )
            p = Payment.objects.create(
                enrollment=e, amount=Decimal("100.00"),
                billing_email=f"{status}-pay@test.com",
                status=status,
            )
            assert p.status == status

    def test_payment_str(self, enrollment):
        payment = Payment.objects.create(
            enrollment=enrollment,
            amount=Decimal("299.00"),
            billing_email="str@test.com",
        )
        s = str(payment)
        assert "299" in s


# ── 3. Coupon Code Tests ────────────────────────────────────────────

@pytest.mark.django_db
class TestCouponCode:
    """Test discount coupon codes."""

    def test_create_coupon(self, db):
        coupon = CouponCode.objects.create(
            code="SAVE20",
            discount_percent=20,
        )
        assert coupon.discount_percent == 20
        assert coupon.is_active is True

    def test_coupon_is_valid(self, db):
        coupon = CouponCode.objects.create(
            code="VALID100",
            discount_percent=10,
            is_active=True,
        )
        assert coupon.is_valid is True

    def test_coupon_inactive(self, db):
        coupon = CouponCode.objects.create(
            code="INACTIVE",
            discount_percent=15,
            is_active=False,
        )
        assert coupon.is_valid is False

    def test_coupon_expired(self, db):
        from datetime import timedelta
        coupon = CouponCode.objects.create(
            code="EXPIRED",
            discount_percent=25,
            valid_until=timezone.now() - timedelta(days=1),
        )
        assert coupon.is_valid is False

    def test_coupon_max_uses_reached(self, db):
        coupon = CouponCode.objects.create(
            code="MAXED",
            discount_percent=30,
            max_uses=5,
            current_uses=5,
        )
        assert coupon.is_valid is False

    def test_coupon_max_uses_not_reached(self, db):
        coupon = CouponCode.objects.create(
            code="NOTMAXED",
            discount_percent=30,
            max_uses=10,
            current_uses=3,
        )
        assert coupon.is_valid is True

    def test_coupon_no_max_uses(self, db):
        coupon = CouponCode.objects.create(
            code="UNLIMITED",
            discount_percent=10,
            max_uses=None,
            current_uses=9999,
        )
        assert coupon.is_valid is True

    def test_coupon_unique_code(self, db):
        CouponCode.objects.create(code="UNIQUE1", discount_percent=10)
        with pytest.raises(Exception):
            CouponCode.objects.create(code="UNIQUE1", discount_percent=20)

    def test_coupon_str(self, db):
        coupon = CouponCode.objects.create(code="STR50", discount_percent=50)
        s = str(coupon)
        assert "STR50" in s
        assert "50%" in s

    def test_coupon_course_restriction(self, db, course):
        coupon = CouponCode.objects.create(code="PMONLY", discount_percent=20)
        coupon.courses.add(course)
        assert course in coupon.courses.all()

    def test_coupon_min_order(self, db):
        coupon = CouponCode.objects.create(
            code="MIN100",
            discount_percent=15,
            min_order_amount=Decimal("100.00"),
        )
        assert coupon.min_order_amount == Decimal("100.00")


# ── 4. Lesson Resource Tests ────────────────────────────────────────

@pytest.mark.django_db
class TestLessonResource:
    """Test downloadable resources."""

    def test_create_resource(self, lesson):
        resource = LessonResource.objects.create(
            lesson=lesson,
            name="PM Template Pack",
            name_nl="PM Sjabloonpakket",
            file_type="PDF",
            file_size=1024000,
            order=1,
        )
        assert resource.name == "PM Template Pack"
        assert resource.file_type == "PDF"

    def test_resource_bilingual(self, lesson):
        resource = LessonResource.objects.create(
            lesson=lesson, name="Guide", name_nl="Gids",
            file_type="DOCX", file_size=500, order=1,
        )
        assert resource.name_nl == "Gids"

    def test_multiple_resources(self, lesson):
        LessonResource.objects.create(
            lesson=lesson, name="Template", file_type="PDF",
            file_size=100, order=1,
        )
        LessonResource.objects.create(
            lesson=lesson, name="Checklist", file_type="XLSX",
            file_size=200, order=2,
        )
        assert lesson.resources.count() == 2


# ── 5. Lesson Visual Tests ──────────────────────────────────────────

@pytest.mark.django_db
class TestLessonVisual:
    """Test AI-generated visual assignments."""

    def test_create_visual(self, lesson):
        visual = LessonVisual.objects.create(
            lesson=lesson,
            visual_id="project_definition",
            ai_confidence=Decimal("85.50"),
            status="pending",
        )
        assert visual.visual_id == "project_definition"
        assert visual.status == "pending"

    def test_visual_resolve_direct_match(self, lesson):
        visual = LessonVisual(lesson=lesson, visual_id="project_definition")
        assert visual._resolve_visual_type() == "project_def"

    def test_visual_resolve_triple_constraint(self, lesson):
        visual = LessonVisual(lesson=lesson, visual_id="triple_constraint")
        assert visual._resolve_visual_type() == "triple_constraint"

    def test_visual_resolve_risk(self, lesson):
        visual = LessonVisual(lesson=lesson, visual_id="risk")
        assert visual._resolve_visual_type() == "risk"

    def test_visual_resolve_stakeholder(self, lesson):
        visual = LessonVisual(lesson=lesson, visual_id="stakeholder")
        assert visual._resolve_visual_type() == "stakeholder"

    def test_visual_resolve_lifecycle(self, lesson):
        visual = LessonVisual(lesson=lesson, visual_id="lifecycle")
        assert visual._resolve_visual_type() == "lifecycle"

    def test_visual_resolve_regex_gantt(self, lesson):
        visual = LessonVisual(lesson=lesson, visual_id="gantt_chart_project_timeline")
        assert visual._resolve_visual_type() == "lifecycle"

    def test_visual_resolve_regex_budget(self, lesson):
        visual = LessonVisual(lesson=lesson, visual_id="budget_variance_analysis")
        assert visual._resolve_visual_type() == "triple_constraint"

    def test_visual_resolve_regex_scrum(self, lesson):
        visual = LessonVisual(lesson=lesson, visual_id="scrum_sprint_planning")
        assert visual._resolve_visual_type() == "lifecycle"

    def test_visual_resolve_regex_raci(self, lesson):
        visual = LessonVisual(lesson=lesson, visual_id="raci_matrix")
        assert visual._resolve_visual_type() == "stakeholder"

    def test_visual_resolve_unknown(self, lesson):
        visual = LessonVisual(lesson=lesson, visual_id="completely_unknown_type")
        assert visual._resolve_visual_type() == "generic"

    def test_visual_approve(self, lesson, admin_user):
        visual = LessonVisual.objects.create(
            lesson=lesson, visual_id="project_definition",
            ai_confidence=Decimal("90.00"), status="pending",
        )
        visual.approve(admin_user)
        visual.refresh_from_db()
        assert visual.status == "approved"
        assert visual.approved_by == admin_user
        assert visual.approved_at is not None
        # Check lesson was updated
        lesson.refresh_from_db()
        assert lesson.visual_type == "project_def"
        assert lesson.visual_data["approved"] is True

    def test_visual_reject(self, lesson):
        visual = LessonVisual.objects.create(
            lesson=lesson, visual_id="wrong_visual",
            ai_confidence=Decimal("40.00"), status="pending",
        )
        visual.reject(custom_keywords="use risk heatmap instead")
        visual.refresh_from_db()
        assert visual.status == "rejected"
        assert "risk heatmap" in visual.custom_keywords

    def test_visual_ai_fields(self, lesson):
        visual = LessonVisual.objects.create(
            lesson=lesson,
            visual_id="project_charter",
            ai_confidence=Decimal("75.00"),
            ai_concepts=["scope", "objectives", "stakeholders"],
            ai_intent="Teaching project initiation",
            ai_methodology="PMBOK",
        )
        assert "scope" in visual.ai_concepts
        assert visual.ai_methodology == "PMBOK"


# ── 6. Practice Assignment Tests ─────────────────────────────────────

@pytest.mark.django_db
class TestPracticeAssignment:
    """Test practical exercises."""

    def test_create_assignment(self, course):
        assignment = PracticeAssignment.objects.create(
            title="Create a WBS",
            description="Break down a project into work packages",
            course=course,
            duration_minutes=60,
            points=15,
            criteria={"min_levels": 3, "min_packages": 10},
        )
        assert assignment.title == "Create a WBS"
        assert assignment.points == 15

    def test_assignment_for_lesson(self, lesson):
        assignment = PracticeAssignment.objects.create(
            title="Lesson Exercise",
            description="Practice what you learned",
            lesson=lesson,
            duration_minutes=30,
            points=10,
        )
        assert assignment.lesson == lesson

    def test_assignment_criteria_json(self, course):
        criteria = {
            "rubric": [
                {"item": "Structure", "max_points": 5},
                {"item": "Completeness", "max_points": 5},
                {"item": "Creativity", "max_points": 5},
            ]
        }
        assignment = PracticeAssignment.objects.create(
            title="Rubric Assignment", description="Graded work",
            course=course, criteria=criteria,
        )
        assert len(assignment.criteria["rubric"]) == 3


# ── 7. Practice Submission Tests ─────────────────────────────────────

@pytest.mark.django_db
class TestPracticeSubmission:
    """Test student practice submissions."""

    def test_create_submission(self, user, course):
        assignment = PracticeAssignment.objects.create(
            title="WBS Exercise", description="Create WBS",
            course=course, points=10,
        )
        submission = PracticeSubmission.objects.create(
            assignment=assignment,
            user=user,
            submission_text="Here is my WBS breakdown...",
            status="pending",
        )
        assert submission.status == "pending"

    def test_submission_approved(self, user, admin_user, course):
        assignment = PracticeAssignment.objects.create(
            title="Exercise", description="Do it", course=course, points=10,
        )
        submission = PracticeSubmission.objects.create(
            assignment=assignment, user=user,
            submission_text="My work",
            status="approved",
            score=8,
            feedback="Good job!",
            reviewed_by=admin_user,
            reviewed_at=timezone.now(),
        )
        assert submission.status == "approved"
        assert submission.score == 8
        assert submission.reviewed_by == admin_user

    def test_submission_needs_work(self, user, course):
        assignment = PracticeAssignment.objects.create(
            title="Exercise", description="Do it", course=course, points=10,
        )
        submission = PracticeSubmission.objects.create(
            assignment=assignment, user=user,
            submission_text="Incomplete work",
            status="needs_work",
            feedback="Please add more detail to section 2.",
        )
        assert submission.status == "needs_work"
        assert "more detail" in submission.feedback

    def test_submission_str(self, user, course):
        assignment = PracticeAssignment.objects.create(
            title="PM Practice", description="Practice", course=course, points=10,
        )
        submission = PracticeSubmission.objects.create(
            assignment=assignment, user=user, submission_text="Work",
        )
        s = str(submission)
        assert user.email in s
        assert "PM Practice" in s
