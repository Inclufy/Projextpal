"""
ProductIssue — user-reported and CI-auto-captured product feedback.

Distinct from `projects.Issue` which is the RAID-log Issue (project-execution
problem like "DBA blocked"). This model is **product feedback**: the tool
itself misbehaves, a feature is missing, an error appears, or a user proposes
an improvement.

Source can be:
  - `user`              user submitted via AI Copilot or floating-button
  - `auto-test-ci`      CI test failure auto-POST (pytest, Playwright)
  - `auto-test-runtime` runtime exception captured by client/server
  - `agent-scan`        an agent (data-leak-hunter, pm-feature-validator)
                         flags a finding as a tracked issue

Triage is performed by the `issue-triage-validator` Claude-agent which:
  1. reads the issue and gathers code context
  2. attempts to **reproduce** the bug (run the actual flow)
  3. classifies it (bug / error / functionality / best-practice / missing-
     feature / duplicate)
  4. assigns priority (P0 / P1 / P2 / P3) based on impact
  5. POSTs the result back, updating `agent_triage_result`
"""
from django.conf import settings
from django.db import models


class ProductIssue(models.Model):
    SOURCE_CHOICES = [
        ("user", "User report (AI Copilot / floating-button)"),
        ("auto-test-ci", "Auto-test CI failure"),
        ("auto-test-runtime", "Auto runtime exception"),
        ("agent-scan", "Agent-detected (data-leak-hunter / pm-validator)"),
    ]
    CATEGORY_CHOICES = [
        ("ui", "UI / Frontend"),
        ("api", "API / Backend"),
        ("mobile", "Mobile App"),
        ("performance", "Performance"),
        ("security", "Security"),
        ("auth", "Auth / Permissions"),
        ("data", "Data / Database"),
        ("integration", "Integration (Stripe / Tink / etc.)"),
        ("documentation", "Documentation"),
        ("other", "Other"),
    ]
    CLASSIFICATION_CHOICES = [
        ("bug", "Bug — code defect"),
        ("error", "Error — runtime exception"),
        ("functionality", "Functionality — works but wrong behaviour"),
        ("best-practice", "Best-practice violation"),
        ("missing-feature", "Missing feature / enhancement"),
        ("duplicate", "Duplicate of another issue"),
        ("user-error", "User error / not a bug"),
        ("not-applicable", "Not applicable / out of scope"),
    ]
    SEVERITY_CHOICES = [
        ("blocker", "Blocker"),
        ("critical", "Critical"),
        ("major", "Major"),
        ("minor", "Minor"),
        ("trivial", "Trivial"),
    ]
    PRIORITY_CHOICES = [
        ("P0", "P0 — fix immediately"),
        ("P1", "P1 — next sprint"),
        ("P2", "P2 — backlog"),
        ("P3", "P3 — nice-to-have"),
    ]
    STATUS_CHOICES = [
        ("new", "New"),
        ("triaging", "Triaging (agent running)"),
        ("needs-info", "Needs more info from reporter"),
        ("accepted", "Accepted"),
        ("in-progress", "In progress"),
        ("resolved", "Resolved"),
        ("wont-fix", "Won't fix"),
        ("duplicate", "Duplicate"),
        ("closed", "Closed"),
    ]
    REPRO_RESULT_CHOICES = [
        ("not-attempted", "Not yet attempted"),
        ("reproduced", "Reproduced consistently"),
        ("intermittent", "Reproduced intermittently (flaky)"),
        ("cannot-reproduce", "Cannot reproduce"),
        ("not-applicable", "Reproduction not applicable"),
        ("already-fixed", "Reproduces in older version, fixed in current"),
        ("needs-data", "Needs production-like data sample"),
    ]
    CAPTURE_METHOD_CHOICES = [
        ("manual_form", "Filled in form manually"),
        ("paste_clipboard", "Pasted from clipboard"),
        ("upload", "Uploaded file"),
        ("auto_browser", "Browser auto-capture"),
        ("auto_mobile_shake", "Mobile shake-to-report"),
        ("auto_ci", "CI runner posted"),
        ("auto_runtime", "Runtime exception handler"),
    ]

    # --- Who + where ---------------------------------------------------------
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reported_product_issues",
    )
    company = models.ForeignKey(
        "accounts.Company",
        on_delete=models.CASCADE,
        related_name="product_issues",
    )
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="product_issues",
        help_text="Optional — set if reported from inside a project page",
    )
    source = models.CharField(max_length=32, choices=SOURCE_CHOICES, default="user")
    capture_method = models.CharField(
        max_length=32, choices=CAPTURE_METHOD_CHOICES, default="manual_form"
    )

    # --- What ----------------------------------------------------------------
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    reproduction_steps = models.TextField(
        blank=True, help_text="What did you do to make this happen?"
    )
    expected_behavior = models.TextField(blank=True)
    actual_behavior = models.TextField(blank=True)
    error_trace = models.TextField(
        blank=True,
        help_text="Stack trace, console errors, HTTP response body, or test output",
    )
    environment = models.JSONField(
        default=dict,
        blank=True,
        help_text="Page URL, browser, OS, app-version, viewport, build-SHA, etc.",
    )
    attachments = models.ManyToManyField(
        "projects.Upload",
        blank=True,
        related_name="+",
        help_text="Screenshots, HARs, recordings, log files",
    )
    category = models.CharField(
        max_length=32, choices=CATEGORY_CHOICES, default="other", db_index=True
    )

    # --- Triage (agent or human) --------------------------------------------
    classification = models.CharField(
        max_length=32, choices=CLASSIFICATION_CHOICES, blank=True, db_index=True
    )
    severity = models.CharField(
        max_length=16, choices=SEVERITY_CHOICES, blank=True, db_index=True
    )
    priority = models.CharField(
        max_length=4, choices=PRIORITY_CHOICES, blank=True, db_index=True
    )
    agent_triage_result = models.JSONField(
        default=dict,
        blank=True,
        help_text=(
            "Full agent output: reasoning, confidence, suggested-fix-area, "
            "code-references, fingerprint for de-dup, etc."
        ),
    )
    triaged_at = models.DateTimeField(null=True, blank=True)
    triaged_by = models.CharField(
        max_length=128,
        blank=True,
        help_text="'agent:issue-triage-validator' or auth.users.id of human triager",
    )
    duplicate_of = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="duplicates",
    )

    # --- Reproduction --------------------------------------------------------
    reproduction_attempted_at = models.DateTimeField(null=True, blank=True)
    reproduction_result = models.CharField(
        max_length=32,
        choices=REPRO_RESULT_CHOICES,
        default="not-attempted",
    )
    reproduction_log = models.JSONField(
        default=list,
        blank=True,
        help_text=(
            "List of {step, command, output, success} from agent's repro run; "
            "truncated to 4000 chars per output."
        ),
    )
    reproduction_evidence = models.ManyToManyField(
        "projects.Upload",
        blank=True,
        related_name="+",
        help_text="Screenshots / HAR files / videos generated DURING the agent's repro run",
    )

    # --- Lifecycle -----------------------------------------------------------
    status = models.CharField(
        max_length=24, choices=STATUS_CHOICES, default="new", db_index=True
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_product_issues",
    )
    linked_pr_url = models.URLField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_summary = models.TextField(blank=True)

    # --- Auto-meta -----------------------------------------------------------
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company", "status", "-created_at"]),
            models.Index(fields=["category", "priority"]),
            models.Index(fields=["source"]),
        ]

    def __str__(self) -> str:
        prio = self.priority or "?"
        return f"[{prio}] {self.title}"


class ProductIssueComment(models.Model):
    """Thread of comments / triage updates on an issue.

    Used both for human discussion and for the agent's incremental updates
    ('I started reproduction', 'I cannot find the click target', etc.).
    """

    VISIBILITY_PUBLIC = "public"
    VISIBILITY_INTERNAL = "internal"
    VISIBILITY_CHOICES = [
        (VISIBILITY_PUBLIC, "Public — reporter + all roles can see"),
        (VISIBILITY_INTERNAL, "Internal — admin + superadmin only"),
    ]

    issue = models.ForeignKey(
        ProductIssue, on_delete=models.CASCADE, related_name="comments"
    )
    author = models.CharField(
        max_length=128,
        help_text="auth.users.id, or 'agent:<name>' for an agent message",
    )
    body = models.TextField()
    is_triage_step = models.BooleanField(
        default=False,
        help_text="True if this comment is part of the agent's triage trace",
    )
    visibility = models.CharField(
        max_length=16,
        choices=VISIBILITY_CHOICES,
        default=VISIBILITY_PUBLIC,
        help_text=(
            "public = visible to the reporter and everyone with issue access. "
            "internal = admin + superadmin only — for dev-jargon triage notes "
            "(API mismatch, SQL fixes, stack traces) that would be useless or "
            "confusing for an end-user reporter."
        ),
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"Comment by {self.author} on issue #{self.issue_id}"
