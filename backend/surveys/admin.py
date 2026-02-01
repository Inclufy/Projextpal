# surveys/admin.py
from django.contrib import admin
from .models import (
    Survey, 
    Question, 
    ArchivedLesson,
    SurveyResponse,
    SurveyAnswer,
    SurveyInvitation,
    SurveyAnalytics
)


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ('text', 'question_type', 'required', 'order', 'choices')
    ordering = ['order']


class SurveyAnswerInline(admin.TabularInline):
    model = SurveyAnswer
    extra = 0
    readonly_fields = ('question', 'answer_text', 'answer_rating', 'answer_choice', 'answer_boolean')
    can_delete = False


class SurveyInvitationInline(admin.TabularInline):
    model = SurveyInvitation
    extra = 0
    readonly_fields = ('user', 'invited_at')
    fields = ('user', 'invited_at', 'reminder_sent', 'reminder_sent_at')


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = (
        "id", "name", "project", "created_by", "status", 
        "recipients", "responses", "deadline", "created_at"
    )
    list_filter = (
        "project", "status", "deadline", "created_by", 
        "allowed_roles", "is_anonymous", "created_at"
    )
    search_fields = ("name", "project__name", "created_by__email", "description")
    ordering = ("-created_at",)
    inlines = [QuestionInline, SurveyInvitationInline]
    readonly_fields = ("created_at", "updated_at", "responses")
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("name", "project", "description", "created_by")
        }),
        ("Survey Settings", {
            "fields": ("status", "deadline", "allowed_roles", "is_anonymous")
        }),
        ("Recipients", {
            "fields": ("recipients_emails", "recipients", "responses")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        })
    )

    def get_queryset(self, request):
        """Filter surveys based on user permissions"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, 'company') and request.user.company:
            return qs.filter(project__company=request.user.company)
        return qs.none()

    def save_model(self, request, obj, form, change):
        """Set created_by when creating new survey"""
        if not change:  # Only when creating
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "text", "survey", "question_type", "required", "order")
    list_filter = ("question_type", "required", "survey__project")
    search_fields = ("text", "survey__name")
    ordering = ["survey", "order"]
    
    def get_queryset(self, request):
        """Filter questions based on survey access"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, 'company') and request.user.company:
            return qs.filter(survey__project__company=request.user.company)
        return qs.none()


@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = (
        "id", "survey", "user", "anonymous_email", "submitted_at", "is_complete"
    )
    list_filter = ("is_complete", "submitted_at", "survey__project", "user__role")
    search_fields = ("user__email", "anonymous_email", "survey__name")
    ordering = ("-submitted_at",)
    inlines = [SurveyAnswerInline]
    readonly_fields = ("submitted_at",)

    def get_queryset(self, request):
        """Filter responses based on survey access"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, 'company') and request.user.company:
            return qs.filter(survey__project__company=request.user.company)
        return qs.none()


@admin.register(SurveyAnswer)
class SurveyAnswerAdmin(admin.ModelAdmin):
    list_display = ("id", "response", "question", "get_answer_display")
    list_filter = ("question__question_type", "response__survey")
    search_fields = ("question__text", "answer_text", "response__user__email")
    ordering = ("response", "question__order")

    def get_answer_display(self, obj):
        """Display the answer in readable format"""
        return obj.display_answer
    get_answer_display.short_description = "Answer"

    def get_queryset(self, request):
        """Filter answers based on survey access"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, 'company') and request.user.company:
            return qs.filter(response__survey__project__company=request.user.company)
        return qs.none()


@admin.register(SurveyInvitation)
class SurveyInvitationAdmin(admin.ModelAdmin):
    list_display = ("id", "survey", "user", "invited_at", "reminder_sent")
    list_filter = ("reminder_sent", "invited_at", "survey__project")
    search_fields = ("user__email", "survey__name")
    ordering = ("-invited_at",)

    def get_queryset(self, request):
        """Filter invitations based on survey access"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, 'company') and request.user.company:
            return qs.filter(survey__project__company=request.user.company)
        return qs.none()


@admin.register(ArchivedLesson)
class ArchivedLessonAdmin(admin.ModelAdmin):
    list_display = ("id", "project", "date", "created_by", "survey", "created_at")
    list_filter = ("project", "date", "created_by", "created_at")
    search_fields = ("project__name", "insights", "created_by__email")
    ordering = ("-date", "-created_at")
    readonly_fields = ("created_at",)

    fieldsets = (
        ("Basic Information", {
            "fields": ("project", "survey", "date", "created_by")
        }),
        ("Insights", {
            "fields": ("insights",)
        }),
        ("Metadata", {
            "fields": ("created_at",),
            "classes": ("collapse",)
        })
    )

    def get_queryset(self, request):
        """Filter lessons based on project access"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, 'company') and request.user.company:
            return qs.filter(project__company=request.user.company)
        return qs.none()

    def save_model(self, request, obj, form, change):
        """Set created_by when creating new lesson"""
        if not change:  # Only when creating
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(SurveyAnalytics)
class SurveyAnalyticsAdmin(admin.ModelAdmin):
    list_display = (
        "id", "survey", "total_invited", "total_responses", 
        "response_rate", "average_rating", "last_calculated"
    )
    list_filter = ("last_calculated", "survey__project")
    search_fields = ("survey__name",)
    readonly_fields = (
        "total_invited", "total_responses", "response_rate",
        "average_rating", "completion_rate", "last_calculated"
    )
    ordering = ("-last_calculated",)

    def get_queryset(self, request):
        """Filter analytics based on survey access"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, 'company') and request.user.company:
            return qs.filter(survey__project__company=request.user.company)
        return qs.none()

    actions = ['recalculate_metrics']

    def recalculate_metrics(self, request, queryset):
        """Admin action to recalculate analytics"""
        count = 0
        for analytics in queryset:
            analytics.calculate_metrics()
            count += 1
        
        self.message_user(
            request,
            f"Successfully recalculated metrics for {count} surveys."
        )
    recalculate_metrics.short_description = "Recalculate survey metrics"