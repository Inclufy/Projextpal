# academy/models.py
"""
Academy Models
Courses, Enrollments, Quote Requests, and Payments
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class CourseCategory(models.Model):
    """Course categories like PM, Agile, Leadership"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Lucide icon name
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name_plural = "Course Categories"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class CourseInstructor(models.Model):
    """Course instructors/trainers"""
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200)  # e.g., "PMP, Senior PM Consultant"
    bio = models.TextField(blank=True)
    bio_nl = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='instructors/', blank=True)
    linkedin_url = models.URLField(blank=True)
    
    def __str__(self):
        return self.name


class Course(models.Model):
    """Training courses"""
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    title_nl = models.CharField(max_length=300, blank=True)
    slug = models.SlugField(unique=True)
    subtitle = models.CharField(max_length=500, blank=True)
    subtitle_nl = models.CharField(max_length=500, blank=True)
    description = models.TextField()
    description_nl = models.TextField(blank=True)
    
    category = models.ForeignKey(CourseCategory, on_delete=models.PROTECT, related_name='courses')
    instructor = models.ForeignKey(CourseInstructor, on_delete=models.SET_NULL, null=True, related_name='courses')
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stripe_price_id = models.CharField(max_length=100, blank=True)
    stripe_product_id = models.CharField(max_length=100, blank=True)
    
    # Course details
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    duration_hours = models.PositiveIntegerField(default=0)  # Estimated hours
    language = models.CharField(max_length=100, default='Nederlands & English')
    
    # Badges/Flags
    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    has_certificate = models.BooleanField(default=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Media
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', blank=True)
    preview_video_url = models.URLField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Lucide icon name
    color = models.CharField(max_length=20, blank=True)  # Hex color
    gradient = models.CharField(max_length=200, blank=True)  # CSS gradient
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Stats (can be denormalized for performance)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    review_count = models.PositiveIntegerField(default=0)
    student_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-is_featured', '-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def is_free(self):
        return self.price == 0
    
    @property
    def discount_percent(self):
        if self.original_price and self.original_price > self.price:
            return int((1 - self.price / self.original_price) * 100)
        return 0


class CourseModule(models.Model):
    """Course modules/chapters"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=300)
    title_nl = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class CourseLesson(models.Model):
    """Individual lessons within modules"""
    LESSON_TYPE_CHOICES = [
        ('video', 'Video'),
        ('text', 'Text/Article'),
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
        ('download', 'Downloadable Resource'),
        # Frontend TS course definitions also use these types; the importer
        # passes them through verbatim. Listed here so admin/forms render
        # them without "Choose a valid choice" errors.
        ('exam', 'Exam'),
        ('practice', 'Practice / Exercise'),
        ('pdf', 'PDF Document'),
        ('docx', 'DOCX Document'),
    ]

    VISUAL_TYPE_CHOICES = [
        ('auto', 'Auto-detect from content'),
        ('project_def', 'Project Definition (3 DNA Cards)'),
        ('triple_constraint', 'Triple Constraint (Triangle Diagram)'),
        ('pm_role', 'PM Role (Role Cards)'),
        ('comparison', 'Comparison (Table + Examples)'),
        ('lifecycle', 'Lifecycle (Phase Diagram)'),
        ('stakeholder', 'Stakeholder (Matrix)'),
        ('risk', 'Risk Management (Heat Map)'),
        ('generic', 'Generic (Rich Text + Icons)'),
    ]

    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=300)
    title_nl = models.CharField(max_length=300, blank=True)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE_CHOICES, default='video')
    duration_minutes = models.PositiveIntegerField(default=0)
    is_free_preview = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    # Content
    video_url = models.URLField(blank=True)
    content = models.TextField(blank=True)
    content_nl = models.TextField(blank=True)

    # Visual Template System
    visual_type = models.CharField(
        max_length=30,
        choices=VISUAL_TYPE_CHOICES,
        default='auto',
        help_text='Visual template to use for this lesson. "auto" will detect from content.'
    )
    visual_data = models.JSONField(
        null=True,
        blank=True,
        help_text='JSON config for the visual template (cards, labels, examples, colors)'
    )

    # AI Coach & Skills fields
    ai_profile = models.JSONField(null=True, blank=True)
    simulation_id = models.CharField(max_length=255, null=True, blank=True)
    practice_set_id = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class CourseRequirement(models.Model):
    """Course prerequisites/requirements"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='requirements')
    text = models.CharField(max_length=500)
    text_nl = models.CharField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']


class CourseLearningOutcome(models.Model):
    """What students will learn"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='learning_outcomes')
    text = models.CharField(max_length=500)
    text_nl = models.CharField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']


class CourseTargetAudience(models.Model):
    """Who the course is for"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='target_audience')
    text = models.CharField(max_length=500)
    text_nl = models.CharField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']


class Enrollment(models.Model):
    """Student enrollments in courses"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments', null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name='enrollments')
    
    # For non-registered users
    email = models.EmailField()
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    company = models.CharField(max_length=200, blank=True)
    
    # Status & Progress
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress = models.PositiveIntegerField(default=0)  # Percentage
    completed_lessons = models.ManyToManyField(CourseLesson, blank=True)
    
    # Payment info
    payment_id = models.CharField(max_length=200, blank=True)  # Stripe payment intent
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=50, blank=True)
    
    # Timestamps
    enrolled_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # For time-limited access
    
    class Meta:
        ordering = ['-enrolled_at']
        unique_together = ['email', 'course']
    
    def __str__(self):
        return f"{self.email} - {self.course.title}"
    
    def calculate_progress(self):
        """Calculate progress based on completed lessons"""
        total_lessons = CourseLesson.objects.filter(module__course=self.course).count()
        if total_lessons == 0:
            return 0
        return int((self.completed_lessons.count() / total_lessons) * 100)

    def certificate_eligibility(self):
        """Return a dict describing whether this enrollment can claim a
        certificate and WHY (or why not). Callers:
          - GET  /academy/enrollments/<id>/eligibility/  (learner checks)
          - POST /academy/certificate/generate/<id>/     (server gate)

        Eligibility rules (v1 of the gated LMS):
          1. All non-quiz/exam lessons must be marked completed
          2. Every quiz-type lesson must have a QuizAttempt where passed=True
          3. If the course has an Exam, the user must have an ExamAttempt
             on it with passed=True
        The `quizzes_total` count is 0 for courses without quizzes, in which
        case rule 2 is vacuously satisfied.
        """
        # Count total lessons + count per-type requirements
        all_lessons = CourseLesson.objects.filter(module__course=self.course)
        lessons_total = all_lessons.count()
        if lessons_total == 0:
            # A course with no lessons can't gate anything — treat as
            # not-eligible so we don't mint empty certs.
            return {
                'eligible': False,
                'reason': 'course_has_no_lessons',
                'progress_percent': 0,
                'lessons_total': 0,
                'lessons_completed': 0,
                'quizzes_total': 0,
                'quizzes_passed': 0,
                'exam_required': False,
                'exam_passed': False,
            }

        lessons_completed = self.completed_lessons.count()

        # Quizzes: lessons with lesson_type='quiz'
        quiz_lessons = all_lessons.filter(lesson_type='quiz')
        quizzes_total = quiz_lessons.count()
        # A quiz is "passed" if there's any QuizAttempt for this enrollment+lesson with passed=True
        quizzes_passed = self.quiz_attempts.filter(
            lesson__in=quiz_lessons, passed=True
        ).values_list('lesson_id', flat=True).distinct().count()

        # Exams: any Exam attached to this course (or its modules)
        # NB: ExamAttempt is user-scoped, not enrollment-scoped, so we need
        # to cross-reference self.user
        from django.db.models import Q
        course_exams = Exam.objects.filter(
            Q(course=self.course) | Q(module__course=self.course)
        )
        exam_required = course_exams.exists()
        if exam_required and self.user_id:
            exam_passed = ExamAttempt.objects.filter(
                user_id=self.user_id, exam__in=course_exams, passed=True
            ).exists()
        else:
            exam_passed = not exam_required  # vacuously true if no exam

        # Practice assignments (if any) — every practice attached to this
        # course requires at least one *approved* submission by this user.
        # 'pending' / 'needs_work' submissions don't unlock the gate; the
        # admin review is the quality control.
        practice_assignments = PracticeAssignment.objects.filter(course=self.course)
        practice_total = practice_assignments.count()
        if practice_total and self.user_id:
            approved_submissions = PracticeSubmission.objects.filter(
                assignment__in=practice_assignments,
                user_id=self.user_id,
                status='approved',
            ).values_list('assignment_id', flat=True).distinct().count()
        else:
            approved_submissions = 0
        all_practice_approved = approved_submissions >= practice_total

        non_quiz_completed = lessons_completed >= (lessons_total - quizzes_total)
        all_quizzes_passed = quizzes_passed >= quizzes_total

        eligible = (
            non_quiz_completed
            and all_quizzes_passed
            and exam_passed
            and all_practice_approved
        )

        # Compose a human-readable reason when not eligible
        if eligible:
            reason = 'eligible'
        elif not non_quiz_completed:
            reason = 'lessons_incomplete'
        elif not all_quizzes_passed:
            reason = 'quiz_not_passed'
        elif not exam_passed:
            reason = 'exam_not_passed'
        elif not all_practice_approved:
            reason = 'practice_not_approved'
        else:
            reason = 'unknown'

        return {
            'eligible': eligible,
            'reason': reason,
            'progress_percent': self.calculate_progress(),
            'lessons_total': lessons_total,
            'lessons_completed': lessons_completed,
            'quizzes_total': quizzes_total,
            'quizzes_passed': quizzes_passed,
            'exam_required': exam_required,
            'exam_passed': exam_passed,
            'practice_total': practice_total,
            'practice_approved': approved_submissions,
        }


class LessonProgress(models.Model):
    """Track individual lesson progress"""
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(CourseLesson, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    watch_time = models.PositiveIntegerField(default=0)  # Seconds watched
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['enrollment', 'lesson']


class CourseReview(models.Model):
    """Course reviews and ratings"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveSmallIntegerField()  # 1-5
    title = models.CharField(max_length=200, blank=True)
    text = models.TextField()
    is_verified = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']


class QuoteRequest(models.Model):
    """Enterprise/team quote requests"""
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('quoted', 'Quote Sent'),
        ('negotiating', 'Negotiating'),
        ('closed_won', 'Closed Won'),
        ('closed_lost', 'Closed Lost'),
    ]
    
    TEAM_SIZE_CHOICES = [
        ('5-10', '5-10'),
        ('11-25', '11-25'),
        ('26-50', '26-50'),
        ('51-100', '51-100'),
        ('100+', '100+'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Company info
    company_name = models.CharField(max_length=200)
    contact_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    job_title = models.CharField(max_length=200, blank=True)
    country = models.CharField(max_length=10, default='NL')
    
    # Request details
    courses = models.ManyToManyField(Course, related_name='quote_requests')
    team_size = models.CharField(max_length=20, choices=TEAM_SIZE_CHOICES, default='5-10')
    preferred_date = models.DateField(null=True, blank=True)
    message = models.TextField(blank=True)
    
    # Marketing
    newsletter = models.BooleanField(default=False)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_quotes')
    
    # Quote details
    quoted_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percent = models.PositiveIntegerField(null=True, blank=True)
    quote_valid_until = models.DateField(null=True, blank=True)
    
    # Notes
    internal_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    contacted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.company_name} - {self.contact_name}"


class CouponCode(models.Model):
    """Discount coupon codes"""
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    current_uses = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    
    # Restrictions
    courses = models.ManyToManyField(Course, blank=True, help_text="Leave empty for all courses")
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.code} ({self.discount_percent}%)"
    
    @property
    def is_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if self.valid_until and now > self.valid_until:
            return False
        if self.max_uses and self.current_uses >= self.max_uses:
            return False
        return True


class Payment(models.Model):
    """Payment records"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='payment')
    
    # Stripe info
    stripe_session_id = models.CharField(max_length=200, blank=True)
    stripe_payment_intent = models.CharField(max_length=200, blank=True)
    stripe_customer_id = models.CharField(max_length=200, blank=True)
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='EUR')
    payment_method = models.CharField(max_length=50, default='card')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Billing info
    billing_email = models.EmailField()
    billing_name = models.CharField(max_length=200, blank=True)
    billing_company = models.CharField(max_length=200, blank=True)
    billing_vat = models.CharField(max_length=50, blank=True)
    billing_country = models.CharField(max_length=10, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.billing_email} - €{self.amount}"


class Certificate(models.Model):
    """Course completion certificates with skills breakdown"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='certificate')
    
    certificate_number = models.CharField(max_length=50, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    
    # PDF storage (2 pages: front + skills breakdown)
    pdf_file = models.FileField(upload_to='certificates/', blank=True)
    
    # Skills snapshot at time of certification
    skills_data = models.JSONField(default=dict, blank=True, help_text="Skills breakdown at certification time")
    
    # Course completion stats
    total_score = models.IntegerField(default=0, help_text="Overall course score percentage")
    lessons_completed = models.IntegerField(default=0)
    quizzes_passed = models.IntegerField(default=0)
    exams_passed = models.IntegerField(default=0)
    simulations_completed = models.IntegerField(default=0)
    practice_submitted = models.IntegerField(default=0)
    
    # Verification
    verification_code = models.CharField(max_length=50, unique=True, blank=True)
    qr_code = models.ImageField(upload_to='certificates/qr/', blank=True)
    
    class Meta:
        ordering = ['-issued_at']
        indexes = [
            models.Index(fields=['certificate_number']),
            models.Index(fields=['verification_code']),
        ]
    
    def __str__(self):
        return f"{self.certificate_number} - {self.enrollment.course.title}"
    
    def generate_certificate_number(self):
        """Generate unique certificate number like PM-2026-001234"""
        from datetime import datetime
        year = datetime.now().year
        course_code = self.enrollment.course.slug[:2].upper()
        count = Certificate.objects.filter(issued_at__year=year).count() + 1
        return f"{course_code}-{year}-{count:06d}"
    
    def generate_verification_code(self):
        """Generate unique 12-char verification code"""
        import secrets
        return secrets.token_urlsafe(9)[:12].upper()


class QuizQuestion(models.Model):
    """Quiz questions for lessons"""
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('multiple_select', 'Multiple Select'),
    ]
    
    lesson = models.ForeignKey(CourseLesson, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_text_nl = models.TextField(blank=True)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='multiple_choice')
    explanation = models.TextField(blank=True)
    explanation_nl = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    points = models.PositiveIntegerField(default=1)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"


class QuizAnswer(models.Model):
    """Answer options for quiz questions"""
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='answers')
    answer_text = models.CharField(max_length=500)
    answer_text_nl = models.CharField(max_length=500, blank=True)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{'[V]' if self.is_correct else '[ ]'} {self.answer_text[:50]}"


class QuizAttempt(models.Model):
    """Track quiz attempts by students"""
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='quiz_attempts')
    lesson = models.ForeignKey(CourseLesson, on_delete=models.CASCADE, related_name='quiz_attempts')
    score = models.PositiveIntegerField(default=0)
    max_score = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)
    answers = models.JSONField(default=dict)  # {question_id: [selected_answer_ids]}
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-started_at']
    
    @property
    def percentage(self):
        if self.max_score == 0:
            return 0
        return int((self.score / self.max_score) * 100)


class LessonResource(models.Model):
    """Downloadable resources attached to lessons"""
    lesson = models.ForeignKey(CourseLesson, on_delete=models.CASCADE, related_name='resources')
    name = models.CharField(max_length=200)
    name_nl = models.CharField(max_length=200, blank=True)
    file = models.FileField(upload_to='academy/resources/')
    file_type = models.CharField(max_length=50, blank=True)  # PDF, XLSX, etc
    file_size = models.PositiveIntegerField(default=0)  # bytes
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.name

class SkillCategory(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    name_nl = models.CharField(max_length=100)
    icon = models.CharField(max_length=50)
    color = models.CharField(max_length=50)
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'academy_skill_categories'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Skill(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    name_nl = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    description_nl = models.TextField(blank=True)
    level_1_points = models.IntegerField(default=0)
    level_2_points = models.IntegerField(default=100)
    level_3_points = models.IntegerField(default=300)
    level_4_points = models.IntegerField(default=600)
    level_5_points = models.IntegerField(default=1000)
    
    class Meta:
        db_table = 'academy_skills'
        ordering = ['category__order', 'name']
    
    def __str__(self):
        return f"{self.category.name} - {self.name}"


class UserSkill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='academy_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='user_progress')
    points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'academy_user_skills'
        unique_together = ['user', 'skill']
        ordering = ['-points']
    
    def __str__(self):
        return f"{self.user.email} - {self.skill.name}: Level {self.level}"
    
    def calculate_level(self):
        if self.points >= self.skill.level_5_points:
            return 5
        elif self.points >= self.skill.level_4_points:
            return 4
        elif self.points >= self.skill.level_3_points:
            return 3
        elif self.points >= self.skill.level_2_points:
            return 2
        return 1
    
    def get_progress_to_next_level(self):
        if self.level == 5:
            return 100
        current_threshold = getattr(self.skill, f'level_{self.level}_points')
        next_threshold = getattr(self.skill, f'level_{self.level + 1}_points')
        points_in_level = self.points - current_threshold
        points_needed = next_threshold - current_threshold
        return int((points_in_level / points_needed) * 100)
    
    def add_points(self, points):
        old_level = self.level
        self.points += points
        self.level = self.calculate_level()
        self.save()
        return self.level > old_level


class SkillGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skill_goals')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='goals')
    target_level = models.IntegerField()
    deadline = models.DateField(null=True, blank=True)
    reason = models.TextField(blank=True)
    achieved = models.BooleanField(default=False)
    achieved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'academy_skill_goals'
        ordering = ['-created_at']


class LessonSkillMapping(models.Model):
    lesson_id = models.CharField(max_length=50, db_index=True)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='lesson_mappings')
    points_awarded = models.IntegerField()
    quiz_bonus = models.IntegerField(default=0)
    simulation_bonus = models.IntegerField(default=0)
    practice_bonus = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'academy_lesson_skill_mappings'
        unique_together = ['lesson_id', 'skill']


class SkillActivity(models.Model):
    ACTIVITY_TYPES = [
        ('lesson_complete', 'Lesson Completed'),
        ('quiz_pass', 'Quiz Passed'),
        ('simulation_correct', 'Simulation Correct'),
        ('practice_submit', 'Practice Submitted'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skill_activities')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    points = models.IntegerField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'academy_skill_activities'
        ordering = ['-created_at']



class Exam(models.Model):
    """Course/Module exams"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exams', null=True, blank=True)
    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name='exams', null=True, blank=True)
    
    title = models.CharField(max_length=200)
    title_nl = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    description_nl = models.TextField(blank=True)
    
    passing_score = models.IntegerField(default=80)
    time_limit = models.IntegerField(help_text="Time limit in minutes", default=45)
    max_attempts = models.IntegerField(default=3)
    
    questions = models.JSONField()  # Store questions data
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title


class ExamAttempt(models.Model):
    """Track exam attempts"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts')
    
    score = models.IntegerField()
    passed = models.BooleanField(default=False)
    answers = models.JSONField()
    time_taken = models.IntegerField()  # Seconds
    attempt_number = models.IntegerField(default=1)
    
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-completed_at']
        indexes = [
            models.Index(fields=['user', 'exam']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.exam.title} - Attempt {self.attempt_number} - {self.score}%"


class LessonVisual(models.Model):
    """AI-generated visual assignments for lessons with admin approval workflow"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    lesson = models.OneToOneField(
        CourseLesson, 
        on_delete=models.CASCADE, 
        related_name='visual'
    )
    visual_id = models.CharField(
        max_length=200,
        help_text='Visual identifier (e.g., project-definition, timeline, stakeholder)'
    )
    ai_confidence = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        help_text='AI confidence score (0-100)'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    custom_keywords = models.TextField(
        blank=True, 
        null=True,
        help_text='Custom keywords if AI suggestion was rejected'
    )
    ai_concepts = models.JSONField(
        blank=True, 
        null=True,
        help_text='AI-detected concepts from OpenAI'
    )
    ai_intent = models.TextField(
    blank=True, 
    null=True,
    help_text='AI-detected learning intent'
)

    ai_methodology = models.TextField(
    blank=True, 
    null=True,
    help_text='AI-detected methodology'
)
    preview_image_url = models.URLField(
        blank=True, 
        null=True,
        help_text='DALL-E generated preview image URL'
    )
    
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.ForeignKey(
        'accounts.CustomUser',
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    
    class Meta:
        verbose_name = 'Lesson Visual'
        verbose_name_plural = 'Lesson Visuals'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['lesson']),
        ]
    
    def __str__(self):
        return f"{self.lesson.title} - {self.visual_id} ({self.status})"
    
    # Mapping from LessonVisual.visual_id patterns → CourseLesson.visual_type.
    # Kept in sync with resolveVisualType() in visualService.ts
    VISUAL_ID_TO_TYPE = {
        # Direct VisualType matches
        'project_definition': 'project_def',
        'project-definition': 'project_def',
        'project_def': 'project_def',
        'constraint': 'triple_constraint',
        'triple_constraint': 'triple_constraint',
        'triple-constraint': 'triple_constraint',
        'triangle': 'triple_constraint',
        'pm_role': 'pm_role',
        'pm-role': 'pm_role',
        'comparison': 'comparison',
        'lifecycle': 'lifecycle',
        'levenscyclus': 'lifecycle',
        'stakeholder': 'stakeholder',
        'risk': 'risk',
        'risico': 'risk',
        # OpenAI-generated visual_ids → closest VisualType
        'charter': 'project_def',
        'initiation': 'project_def',
        'business_case': 'project_def',
        'timeline': 'lifecycle',
        'wbs': 'lifecycle',
        'communication': 'stakeholder',
        'change_control': 'risk',
        'issue_log': 'risk',
        'budget_variance': 'triple_constraint',
        'acceptance_checklist': 'lifecycle',
        'procurement': 'stakeholder',
        'raci': 'stakeholder',
        'swot': 'risk',
        'sprint': 'lifecycle',
        'backlog': 'lifecycle',
        'scrum_events': 'lifecycle',
        'velocity': 'triple_constraint',
        'manifesto': 'comparison',
        'principles': 'comparison',
        'methodologies': 'comparison',
    }

    # Regex patterns for substring matching (handles long OpenAI visual_ids)
    VISUAL_ID_PATTERNS = [
        (r'charter', 'project_def'),
        (r'initiat', 'project_def'),
        (r'business.?case|roi', 'project_def'),
        (r'project.?definition|scope.?definition', 'project_def'),
        (r'stakeholder|belanghebbend', 'stakeholder'),
        (r'risk|risico', 'risk'),
        (r'constraint|triangle|driehoek|triple', 'triple_constraint'),
        (r'budget|variance|earned.?value|cost', 'triple_constraint'),
        (r'velocity|burndown', 'triple_constraint'),
        (r'lifecycle|levenscyclus|project.?fase', 'lifecycle'),
        (r'timeline|tijdlijn|gantt|planning', 'lifecycle'),
        (r'wbs|breakdown|decomposit', 'lifecycle'),
        (r'sprint|backlog|scrum', 'lifecycle'),
        (r'acceptance|checklist|closure|closing', 'lifecycle'),
        (r'communicat', 'stakeholder'),
        (r'procurement|inkoop|vendor', 'stakeholder'),
        (r'raci|team.?matrix|responsibility', 'stakeholder'),
        (r'change.?control|wijziging', 'risk'),
        (r'issue.?log|issue.?track', 'risk'),
        (r'swot', 'risk'),
        (r'comparison|agile.?vs|traditional.?vs', 'comparison'),
        (r'manifesto', 'comparison'),
        (r'principles?|princip', 'comparison'),
        (r'methodolog|framework|prince2|pmbok', 'comparison'),
        (r'pm.?rol|project.?manager', 'pm_role'),
    ]

    def _resolve_visual_type(self):
        """Map visual_id to CourseLesson.visual_type"""
        import re
        vid = (self.visual_id or '').lower().strip()
        # Direct match
        if vid in self.VISUAL_ID_TO_TYPE:
            return self.VISUAL_ID_TO_TYPE[vid]
        # Substring match on direct keys
        for pattern, vtype in self.VISUAL_ID_TO_TYPE.items():
            if pattern in vid:
                return vtype
        # Regex pattern match (handles OpenAI's verbose visual_ids)
        for pattern, vtype in self.VISUAL_ID_PATTERNS:
            if re.search(pattern, vid):
                return vtype
        return 'generic'

    def approve(self, user):
        """Approve the visual and sync to CourseLesson"""
        from django.utils import timezone
        self.status = 'approved'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save()

        # Sync approved visual config to CourseLesson for unified player access
        lesson = self.lesson
        lesson.visual_type = self._resolve_visual_type()
        lesson.visual_data = {
            'visual_id': self.visual_id,
            'ai_concepts': self.ai_concepts or [],
            'ai_intent': self.ai_intent or '',
            'ai_methodology': self.ai_methodology or '',
            'ai_confidence': float(self.ai_confidence) if self.ai_confidence else 0,
            'preview_image_url': self.preview_image_url or '',
            'approved': True,
            'approved_at': self.approved_at.isoformat() if self.approved_at else '',
        }
        lesson.save(update_fields=['visual_type', 'visual_data'])

    def reject(self, custom_keywords=None):
        """Reject the visual and optionally provide custom keywords"""
        self.status = 'rejected'
        if custom_keywords:
            self.custom_keywords = custom_keywords
        self.save()
class PracticeAssignment(models.Model):
    """Practical exercises and assignments"""
    
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='practice_assignments', null=True, blank=True)
    lesson = models.ForeignKey('CourseLesson', on_delete=models.CASCADE, related_name='practice_assignments', null=True, blank=True)
    
    duration_minutes = models.IntegerField(default=60)
    points = models.IntegerField(default=10)
    criteria = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title


class PracticeSubmission(models.Model):
    """Student submissions for practice assignments"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('needs_work', 'Needs Work'),
    ]
    
    id = models.AutoField(primary_key=True)
    assignment = models.ForeignKey(PracticeAssignment, on_delete=models.CASCADE, related_name='submissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    submission_text = models.TextField(blank=True)
    submission_file = models.FileField(upload_to='practice_submissions/', null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    score = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_submissions')
    
    class Meta:
        ordering = ['-submitted_at']
        
    def __str__(self):
        return f"{self.user.email} - {self.assignment.title}"