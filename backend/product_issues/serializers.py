from rest_framework import serializers

from .models import ProductIssue, ProductIssueComment


# Roles that are allowed to see ProductIssueComment rows with
# visibility='internal' (dev-jargon triage notes meant for staff, not
# the end-user reporter). Kept here so view + serializer share one
# definition.
_STAFF_ROLES = {"admin", "superadmin"}


def _user_can_see_internal_comments(user) -> bool:
    """True if `user` is admin / superadmin / Django superuser.

    Falls back to False for anonymous + plain authenticated users. The
    reporter who filed the issue does NOT get to see internal notes,
    even on their own issue — by design, since the internal note is the
    dev-jargon explanation the LLM wrote for staff.
    """
    if user is None or not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_superuser", False):
        return True
    return getattr(user, "role", None) in _STAFF_ROLES


class ProductIssueCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductIssueComment
        fields = [
            "id", "issue", "author", "body",
            "is_triage_step", "visibility", "attachments", "created_at",
        ]
        read_only_fields = ["created_at"]


class ProductIssueSerializer(serializers.ModelSerializer):
    """Full read/write serializer used by users + agent."""

    comments = serializers.SerializerMethodField()

    def get_comments(self, issue) -> list:
        """Return the comments thread, filtered by viewer role.

        `internal` comments (dev-jargon triage notes from the auto-triage
        LLM) are hidden from anyone who isn't admin / superadmin /
        Django superuser — including the original reporter of the issue.
        Reporters should only see the friendly `public` comments that
        the LLM produces alongside.
        """
        request = self.context.get("request")
        viewer = getattr(request, "user", None)
        qs = issue.comments.all()
        if not _user_can_see_internal_comments(viewer):
            qs = qs.exclude(visibility=ProductIssueComment.VISIBILITY_INTERNAL)
        return ProductIssueCommentSerializer(
            qs, many=True, context=self.context,
        ).data

    class Meta:
        model = ProductIssue
        fields = [
            "id",
            # who/where
            "reporter",
            "company",
            "project",
            "source",
            "capture_method",
            # what
            "title",
            "description",
            "category",
            "reproduction_steps",
            "expected_behavior",
            "actual_behavior",
            "error_trace",
            "environment",
            "attachments",
            # triage
            "classification",
            "severity",
            "priority",
            "agent_triage_result",
            "triaged_at",
            "triaged_by",
            "duplicate_of",
            # reproduction
            "reproduction_attempted_at",
            "reproduction_result",
            "reproduction_log",
            "reproduction_evidence",
            # lifecycle
            "status",
            "assigned_to",
            "linked_pr_url",
            "resolved_at",
            "resolution_summary",
            # Sprint 12 decision-request flow (read-only here; writes go
            # through dedicated /needs-decision/ and /answer-decision/
            # endpoints so permissions + audit stay strict)
            "decision_questions",
            "decision_answers",
            "decision_history",
            "decision_last_requested_at",
            # meta
            "created_at",
            "updated_at",
            "comments",
        ]
        read_only_fields = [
            "created_at",
            "updated_at",
            "decision_questions",
            "decision_answers",
            "decision_history",
            "decision_last_requested_at",
        ]


class ProductIssueAutoCISerializer(serializers.ModelSerializer):
    """Slim serializer used by the CI auto-POST endpoint.

    The CI runner has no logged-in user but does have an API token. The
    minimum data we need from CI is: the test that failed, the error trace,
    and the build context (commit-SHA, run-URL, branch).
    """

    class Meta:
        model = ProductIssue
        fields = [
            "title",
            "description",
            "category",
            "error_trace",
            "environment",
            "company",
            "project",
        ]

    def create(self, validated_data):
        # CI-posted issues are always source=auto-test-ci, capture=auto_ci
        validated_data.setdefault("source", "auto-test-ci")
        validated_data.setdefault("capture_method", "auto_ci")
        return super().create(validated_data)


_DECISION_QUESTION_TYPES = {"single_choice", "multi_choice", "text"}
MAX_DECISION_QUESTIONS = 5
MIN_DECISION_QUESTIONS = 1


class DecisionQuestionSerializer(serializers.Serializer):
    """Shape of ONE question posed by the auto-fix worker.

    ``id`` is a short, worker-generated token (letters/digits/underscore) so
    the answer-side can refer to it unambiguously; the worker owns id
    allocation so a rerun can keep the same ids for context continuity.
    """

    id = serializers.RegexField(regex=r"^[A-Za-z0-9_\-]{1,32}$")
    text = serializers.CharField(min_length=1, max_length=500, trim_whitespace=True)
    type = serializers.ChoiceField(choices=sorted(_DECISION_QUESTION_TYPES))
    choices = serializers.ListField(
        child=serializers.CharField(min_length=1, max_length=120),
        min_length=2,
        max_length=8,
        required=False,
    )
    help = serializers.CharField(
        max_length=1000, required=False, allow_blank=True,
    )

    def validate(self, attrs):
        qtype = attrs.get("type")
        choices = attrs.get("choices") or []
        if qtype in {"single_choice", "multi_choice"} and not choices:
            raise serializers.ValidationError(
                {"choices": f"{qtype} requires at least 2 choices."}
            )
        if qtype == "text" and choices:
            raise serializers.ValidationError(
                {"choices": "text questions must not carry a choices list."}
            )
        return attrs


class NeedsDecisionRequestSerializer(serializers.Serializer):
    """Body for POST /product-issues/{id}/needs-decision/ (worker→backend)."""

    questions = DecisionQuestionSerializer(
        many=True,
        min_length=MIN_DECISION_QUESTIONS,
        max_length=MAX_DECISION_QUESTIONS,
    )
    worker_run_id = serializers.CharField(
        max_length=64,
        required=False,
        allow_blank=True,
        help_text="Opaque id of the worker run that produced these questions.",
    )
    reason = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
        help_text="Why the pipeline cannot one-shot this issue.",
    )

    def validate_questions(self, value):
        ids = [q["id"] for q in value]
        if len(set(ids)) != len(ids):
            raise serializers.ValidationError("question ids must be unique")
        return value


class AnswerDecisionSerializer(serializers.Serializer):
    """Body for POST /product-issues/{id}/answer-decision/ (user→backend).

    answers maps question_id → value. For single_choice this is one of the
    choices; for multi_choice a list of them; for text a free-form string.
    Shape-validation against the issue's open questions happens in the view
    (needs the question-list, not available in the serializer).
    """

    answers = serializers.DictField(
        child=serializers.JSONField(),
        allow_empty=False,
    )
    free_text = serializers.CharField(
        max_length=4000,
        required=False,
        allow_blank=True,
        help_text="Optional extra context the reporter wants to send along.",
    )


class ProductIssueTriageUpdateSerializer(serializers.ModelSerializer):
    """Used by the triage agent to update an issue with classification."""

    class Meta:
        model = ProductIssue
        fields = [
            "classification",
            "severity",
            "priority",
            "agent_triage_result",
            "triaged_at",
            "triaged_by",
            "duplicate_of",
            "reproduction_attempted_at",
            "reproduction_result",
            "reproduction_log",
            "status",
        ]
