from django.contrib import admin, messages
from django.http import HttpResponseRedirect
from django.urls import path, reverse
from django.utils.html import format_html

from .claude_triage import ClaudeAutoTriage, TriageError
from .models import ProductIssue, ProductIssueComment


@admin.register(ProductIssue)
class ProductIssueAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "company",
        "source",
        "category",
        "classification",
        "priority",
        "status",
        "reproduction_result",
        "claude_agent_badge",
        "created_at",
    )
    list_filter = (
        "source",
        "category",
        "classification",
        "priority",
        "severity",
        "status",
        "reproduction_result",
        "company",
    )
    search_fields = ("title", "description", "error_trace")
    readonly_fields = ("created_at", "updated_at", "metadata")
    raw_id_fields = ("reporter", "assigned_to", "duplicate_of", "project")
    filter_horizontal = ("attachments", "reproduction_evidence")
    actions = ["admin_trigger_claude_auto_triage"]
    fieldsets = (
        ("Wie + waar", {
            "fields": ("reporter", "company", "project", "source", "capture_method"),
        }),
        ("Wat", {
            "fields": (
                "title",
                "description",
                "category",
                "reproduction_steps",
                "expected_behavior",
                "actual_behavior",
                "error_trace",
                "environment",
                "attachments",
            ),
        }),
        ("Triage", {
            "fields": (
                "classification",
                "severity",
                "priority",
                "agent_triage_result",
                "triaged_at",
                "triaged_by",
                "duplicate_of",
            ),
        }),
        ("Reproductie", {
            "fields": (
                "reproduction_attempted_at",
                "reproduction_result",
                "reproduction_log",
                "reproduction_evidence",
            ),
        }),
        ("Lifecycle", {
            "fields": (
                "status",
                "assigned_to",
                "linked_pr_url",
                "resolved_at",
                "resolution_summary",
            ),
        }),
        ("Claude Auto-Triage", {
            "fields": ("metadata",),
            "description": (
                "Opaque bag populated by the Claude auto-triage pipeline — "
                "agent id, PR url, commit sha, last error, attempt count. "
                "Use the 'Trigger Claude' row action to force a dispatch."
            ),
        }),
        ("Meta", {"fields": ("created_at", "updated_at")}),
    )

    # ------------------------------------------------------------------
    # Claude auto-triage — row-level "Trigger Claude" button
    # ------------------------------------------------------------------

    def get_urls(self):
        urls = super().get_urls()
        extra = [
            path(
                "<int:pk>/trigger-claude/",
                self.admin_site.admin_view(self.trigger_claude_view),
                name="product_issues_productissue_trigger_claude",
            ),
        ]
        return extra + urls

    def claude_agent_badge(self, obj):
        """Visible column: has a Claude run been triggered?"""
        meta = obj.metadata or {}
        agent_id = meta.get("claude_agent_id")
        pr_url = meta.get("claude_pr_url")
        if pr_url:
            return format_html(
                '<a href="{}" target="_blank" rel="noopener">PR</a>', pr_url
            )
        if agent_id:
            return format_html("<code>{}</code>", agent_id[:16])
        return "—"

    claude_agent_badge.short_description = "Claude"  # type: ignore[attr-defined]

    def trigger_claude_view(self, request, pk):
        """Row-level manual trigger — reachable via a per-row button added
        by overriding change_view's object-tools block below."""
        issue = self.get_object(request, pk)
        if issue is None:
            self.message_user(request, "Issue not found.", level=messages.ERROR)
            return HttpResponseRedirect(
                reverse("admin:product_issues_productissue_changelist")
            )
        triage = ClaudeAutoTriage()
        if not triage.webhook_url:
            self.message_user(
                request,
                "CLAUDE_FIX_AGENT_WEBHOOK is not configured — cannot trigger.",
                level=messages.ERROR,
            )
            return HttpResponseRedirect(
                reverse(
                    "admin:product_issues_productissue_change",
                    args=[issue.pk],
                )
            )
        try:
            agent_id = triage.trigger_fix_agent(issue)
            triage.mark_in_progress(issue, agent_id)
            self.message_user(
                request,
                f"Triggered Claude fix-agent {agent_id} for issue #{issue.id}.",
                level=messages.SUCCESS,
            )
        except TriageError as exc:
            triage.mark_failed(issue, str(exc))
            self.message_user(
                request,
                f"Failed to trigger Claude for #{issue.id}: {exc}",
                level=messages.ERROR,
            )
        return HttpResponseRedirect(
            reverse(
                "admin:product_issues_productissue_change", args=[issue.pk]
            )
        )

    @admin.action(description="Trigger Claude auto-triage (fix-agent)")
    def admin_trigger_claude_auto_triage(self, request, queryset):
        """Bulk action — attempt to trigger the fix-agent for every selected
        issue, regardless of the ``should_auto_triage`` heuristics."""
        triage = ClaudeAutoTriage()
        if not triage.webhook_url:
            self.message_user(
                request,
                "CLAUDE_FIX_AGENT_WEBHOOK is not configured — nothing done.",
                level=messages.ERROR,
            )
            return
        triggered = 0
        failed = 0
        for issue in queryset:
            try:
                agent_id = triage.trigger_fix_agent(issue)
                triage.mark_in_progress(issue, agent_id)
                triggered += 1
            except TriageError as exc:
                triage.mark_failed(issue, str(exc))
                failed += 1
        self.message_user(
            request,
            f"Claude trigger: {triggered} triggered, {failed} failed.",
            level=messages.SUCCESS if failed == 0 else messages.WARNING,
        )


@admin.register(ProductIssueComment)
class ProductIssueCommentAdmin(admin.ModelAdmin):
    list_display = ("id", "issue", "author", "is_triage_step", "created_at")
    list_filter = ("is_triage_step",)
    search_fields = ("body",)
    raw_id_fields = ("issue",)
