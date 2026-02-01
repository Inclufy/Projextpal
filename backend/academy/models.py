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
    """Course completion certificates"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='certificate')
    
    certificate_number = models.CharField(max_length=50, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    
    # PDF storage
    pdf_file = models.FileField(upload_to='certificates/', blank=True)
    
    def __str__(self):
        return f"{self.certificate_number} - {self.enrollment.course.title}"
