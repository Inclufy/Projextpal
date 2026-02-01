from __future__ import annotations

import calendar
import json
import logging
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from django.conf import settings
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone

from openai import OpenAI, OpenAIError

from .models import Expense, Project

logger = logging.getLogger(__name__)


@dataclass
class ForecastResult:
    project_id: int
    project_name: str
    window_months: int
    horizon_months: int
    actuals: List[Dict[str, object]]
    forecast: List[Dict[str, object]]
    variance: List[Dict[str, object]]
    generated_at: str


def _call_openai_predictions(
    *,
    project: Project,
    history_months: Sequence[date],
    history_values: Sequence[float],
    horizon_months: int,
) -> Optional[List[float]]:
    """
    Ask OpenAI to generate predictions for the upcoming months.

    Returns:
        A list of floats (length == horizon_months) or None on failure.

    The helper keeps the call wrapped in defensive logging so the caller can decide
    when to fall back to in-house heuristics without leaking the implementation details.
    """
    api_key = getattr(settings, "OPENAI_API_KEY", None)
    if not api_key:
        return None

    try:
        client = OpenAI(api_key=api_key)
    except Exception:
        logger.exception("Failed to initialise OpenAI client")
        return None

    model_name = getattr(settings, "OPENAI_FORECAST_MODEL", "gpt-4.1")

    history_payload = [
        {"month": month_key(month), "amount": round(value, 2)}
        for month, value in zip(history_months, history_values)
    ]

    prompt = (
        "You are a financial forecasting assistant. "
        "Given historical monthly spend data for a project, "
        "forecast the spend for the upcoming months. "
        "Return a JSON object with a `predictions` array containing exactly "
        f"{horizon_months} numeric values (floats) representing the projected spend "
        "for each future month in chronological order starting with the next month "
        "after the last historical entry. "
        "Do not include any additional commentary outside the JSON."
    )

    user_input = json.dumps(
        {
            "project_name": project.name,
            "history": history_payload,
            "horizon_months": horizon_months,
        }
    )

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": prompt,
                },
                {
                    "role": "user",
                    "content": user_input,
                },
            ],
            response_format={"type": "json_object"},
        )
    except OpenAIError:
        logger.exception("OpenAI request failed for project %s", project.id)
        return None
    except Exception:
        logger.exception("Unexpected error during OpenAI forecast request")
        return None

    message = response.choices[0].message.content
    if not message:
        logger.exception("Unexpected OpenAI response format: %s", response)
        return None

    try:
        data = json.loads(message)
    except json.JSONDecodeError:
        logger.exception("Failed to parse OpenAI JSON response")
        return None

    predictions = data.get("predictions")
    if not isinstance(predictions, list):
        logger.warning("OpenAI response missing predictions array: %s", data)
        return None

    cleaned: List[float] = []
    for value in predictions[:horizon_months]:
        try:
            cleaned.append(float(value))
        except (TypeError, ValueError):
            logger.warning("Non-numeric prediction value encountered: %s", value)
            return None

    if len(cleaned) != horizon_months:
        logger.warning(
            "OpenAI returned %s predictions but %s were required",
            len(cleaned),
            horizon_months,
        )
        return None

    return cleaned


def add_months(dt: date, months: int) -> date:
    """Return a date shifted by `months`, keeping day in range."""
    month_index = dt.month - 1 + months
    year = dt.year + month_index // 12
    month = month_index % 12 + 1
    day = min(dt.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def month_label(dt: date) -> str:
    return dt.strftime("%b %Y")


def month_key(dt: date) -> str:
    return dt.strftime("%Y-%m")


def _linear_regression(values: Sequence[float]) -> Tuple[float, float]:
    """Return (intercept, slope) for simple linear regression on sequential months."""
    n = len(values)
    if n == 0:
        return 0.0, 0.0
    xs = list(range(n))
    ys = list(values)
    if n == 1:
        # Single data point -> constant line
        return ys[0], 0.0

    sum_x = sum(xs)
    sum_y = sum(ys)
    sum_xy = sum(x * y for x, y in zip(xs, ys))
    sum_x2 = sum(x * x for x in xs)

    denominator = n * sum_x2 - sum_x * sum_x
    if denominator == 0:
        slope = 0.0
    else:
        slope = (n * sum_xy - sum_x * sum_y) / denominator
    intercept = (sum_y - slope * sum_x) / n
    return intercept, slope


def _round_amount(value: float) -> float:
    return float(round(Decimal(value), 2))


def _build_series(
    months: Iterable[date], values: Sequence[float]
) -> List[Dict[str, object]]:
    return [
        {
            "month": month_key(month),
            "label": month_label(month),
            "amount": _round_amount(val),
        }
        for month, val in zip(months, values)
    ]


def _prepare_months(end_month: date, count: int) -> List[date]:
    start_month = add_months(end_month, -(count - 1)) if count > 0 else end_month
    months: List[date] = []
    current = start_month
    for _ in range(count):
        months.append(current)
        current = add_months(current, 1)
    return months


def forecast_project_budget(
    project: Project,
    window_months: int = 4,
    horizon_months: int = 3,
) -> ForecastResult:
    """
    Compute a simple budget forecast for the given project using a linear trend over the
    last `window_months` (default 4). Forecast uses a basic linear regression on the
    aggregated monthly totals and projects `horizon_months` forward.
    """
    if window_months < 1:
        raise ValueError("window_months must be >= 1")
    if horizon_months < 1:
        raise ValueError("horizon_months must be >= 1")

    expense_qs = (
        Expense.objects.filter(project=project)
        .annotate(month=TruncMonth("date"))
        .values("month")
        .annotate(total=Sum("amount"))
        .order_by("month")
    )

    month_totals: Dict[date, float] = {}
    for row in expense_qs:
        month_value = row["month"]
        month_dt = month_value.date() if hasattr(month_value, "date") else month_value
        month_totals[month_dt] = float(row["total"])

    if month_totals:
        latest_month = max(month_totals.keys())
    else:
        latest_month = timezone.now().date().replace(day=1)

    # Build the month list for the historical window and ensure zero for missing months
    history_months = _prepare_months(latest_month, window_months)
    history_values = [month_totals.get(month, 0.0) for month in history_months]

    forecast_months = [
        add_months(latest_month, step) for step in range(1, horizon_months + 1)
    ]
    variance_values: List[float] = []

    predictions = _call_openai_predictions(
        project=project,
        history_months=history_months,
        history_values=history_values,
        horizon_months=horizon_months,
    )

    if predictions is not None:
        forecast_values = [max(0.0, value) for value in predictions]
    else:
        # Fallback to simple linear regression when OpenAI is unavailable/unconfigured.
        intercept, slope = _linear_regression(history_values)
        fitted_history = [
            max(0.0, intercept + slope * idx) for idx in range(len(history_values))
        ]
        variance_values = [
            history_values[idx] - fitted_history[idx]
            for idx in range(len(history_values))
        ]

        start_index = len(history_values) - 1
        forecast_values = []
        for step in range(1, horizon_months + 1):
            x = start_index + step
            y_hat = max(0.0, intercept + slope * x)
            forecast_values.append(y_hat)

    generated_at = timezone.now().isoformat()

    return ForecastResult(
        project_id=project.id,
        project_name=project.name,
        window_months=window_months,
        horizon_months=horizon_months,
        actuals=_build_series(history_months, history_values),
        forecast=_build_series(forecast_months, forecast_values),
        variance=_build_series(history_months, variance_values),
        generated_at=generated_at,
    )


def forecast_for_active_projects(
    *,
    window_months: int = 4,
    horizon_months: int = 3,
    company=None,
) -> List[ForecastResult]:
    """
    Generate forecasts for all active projects (pending or in-progress) using the same window.
    """
    active_projects = Project.objects.filter(
        status__in=["pending", "in_progress"]
    ).select_related("company")
    if company is not None:
        active_projects = active_projects.filter(company=company)

    results: List[ForecastResult] = []
    for project in active_projects:
        results.append(
            forecast_project_budget(
                project, window_months=window_months, horizon_months=horizon_months
            )
        )
    return results
