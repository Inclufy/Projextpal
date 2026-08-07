"""Reusable DRF filter backends for data portability (Apeldoorn D2/D4).

``ModifiedSinceFilterBackend`` powers incremental refresh for BI consumers
(Power BI, etc.): clients pass ``?modified_since=<ISO8601>`` on list
endpoints and receive only rows whose ``updated_at`` is at or after that
timestamp. All projects-app models carry ``updated_at`` (auto_now) with
stable primary keys, so delta loads are safe to merge on PK.
"""
from django.utils.dateparse import parse_date, parse_datetime
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework.filters import BaseFilterBackend

MODIFIED_SINCE_PARAM = "modified_since"

MODIFIED_SINCE_DESCRIPTION = (
    "Return only records modified at or after this ISO 8601 timestamp "
    "(e.g. `2026-08-01T00:00:00Z` or `2026-08-01`). Compared against the "
    "record's `updated_at` field. Intended for incremental/delta exports "
    "(e.g. Power BI incremental refresh). Naive timestamps are interpreted "
    "in the server's default timezone (UTC)."
)


class ModifiedSinceFilterBackend(BaseFilterBackend):
    """Filter list endpoints on ``updated_at >= ?modified_since``.

    - Applies only to the ``list`` action, so detail routes are unaffected.
    - Invalid values yield a 400 with a clear error message.
    - Documented in the OpenAPI schema via
      ``get_schema_operation_parameters``.
    """

    #: Model field the filter compares against; override per-view if needed
    #: (e.g. ``modified_since_field = "modified_at"``).
    default_field = "updated_at"

    def filter_queryset(self, request, queryset, view):
        # Only meaningful on list endpoints; get_object() also runs
        # filter_queryset, and filtering there would turn stale-but-valid
        # detail lookups into 404s.
        if getattr(view, "action", None) not in (None, "list"):
            return queryset
        if getattr(view, "action", None) is None and request.method not in (
            "GET",
            "HEAD",
        ):
            return queryset

        raw = request.query_params.get(MODIFIED_SINCE_PARAM)
        if raw in (None, ""):
            return queryset

        value = parse_datetime(raw)
        if value is None:
            as_date = parse_date(raw)
            if as_date is not None:
                value = timezone.datetime(
                    as_date.year, as_date.month, as_date.day
                )
        if value is None:
            raise ValidationError(
                {
                    MODIFIED_SINCE_PARAM: (
                        f"Invalid value {raw!r}. Expected an ISO 8601 "
                        "datetime or date, e.g. '2026-08-01T00:00:00Z' "
                        "or '2026-08-01'."
                    )
                }
            )
        if timezone.is_naive(value):
            value = timezone.make_aware(value, timezone.get_default_timezone())

        field = getattr(view, "modified_since_field", self.default_field)
        return queryset.filter(**{f"{field}__gte": value})

    def get_schema_operation_parameters(self, view):
        """Expose ``modified_since`` in the OpenAPI schema (drf-spectacular)."""
        return [
            {
                "name": MODIFIED_SINCE_PARAM,
                "required": False,
                "in": "query",
                "description": MODIFIED_SINCE_DESCRIPTION,
                "schema": {"type": "string", "format": "date-time"},
            }
        ]
