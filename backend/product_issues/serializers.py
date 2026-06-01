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
            "is_triage_step", "visibility", "created_at",
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
            # meta
            "created_at",
            "updated_at",
            "comments",
        ]
        read_only_fields = ["created_at", "updated_at"]


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
