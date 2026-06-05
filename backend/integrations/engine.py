"""Automation rule engine (IL-3).

The engine is the *real* part of the automation feature: it evaluates a rule's
condition against an event payload and, on a match, resolves the action config
and records an AutomationRun. Side-effect dispatch (HTTP webhook, cross-model
field write) is intentionally recorded as a resolved *intent* rather than fired
inline — a later dispatcher worker consumes matched runs — so evaluation is
deterministic, side-effect-free, and safe to run anywhere (incl. tests).

Public API:
    evaluate_event(tenant, trigger, payload, dry_run=False) -> list[result dict]
    evaluate_rule(rule, payload) -> (matched: bool, resolved_action: dict)
"""
from __future__ import annotations

import re
from django.utils import timezone


_MISSING = object()


def _resolve_path(payload, path):
    """Read a dotted path out of a nested dict/list payload. Missing -> _MISSING."""
    cur = payload
    for part in str(path).split('.'):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        elif isinstance(cur, (list, tuple)):
            try:
                cur = cur[int(part)]
            except (ValueError, IndexError):
                return _MISSING
        else:
            return _MISSING
    return cur


def _as_number(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _eval_clause(payload, clause):
    field = clause.get('field')
    op = clause.get('op', 'eq')
    expected = clause.get('value')

    if op == 'changed_to':
        changes = payload.get('changes') or {}
        change = changes.get(field)
        if not isinstance(change, dict):
            return False
        return change.get('to') == expected

    actual = _resolve_path(payload, field)

    if op == 'exists':
        present = actual is not _MISSING and actual is not None
        return present if expected in (True, None, 'true', 1) else not present

    if actual is _MISSING:
        return False

    if op == 'eq':
        return actual == expected
    if op == 'ne':
        return actual != expected
    if op == 'in':
        return actual in expected if isinstance(expected, (list, tuple, str)) else False
    if op == 'contains':
        try:
            return expected in actual
        except TypeError:
            return False
    if op in ('gt', 'gte', 'lt', 'lte'):
        a, e = _as_number(actual), _as_number(expected)
        if a is None or e is None:
            return False
        return {
            'gt': a > e, 'gte': a >= e, 'lt': a < e, 'lte': a <= e,
        }[op]
    return False


def condition_matches(condition, payload):
    """Empty condition always matches; otherwise all/any over clauses."""
    if not condition:
        return True
    clauses = condition.get('clauses') or []
    if not clauses:
        return True
    match = (condition.get('match') or 'all').lower()
    results = [_eval_clause(payload, c) for c in clauses]
    return any(results) if match == 'any' else all(results)


_TEMPLATE_RE = re.compile(r'\{\{\s*([^}]+?)\s*\}\}')


def _render(value, payload):
    """Resolve {{path}} placeholders in strings (recursively in dict/list)."""
    if isinstance(value, str):
        def repl(m):
            v = _resolve_path(payload, m.group(1))
            return '' if v is _MISSING else str(v)
        return _TEMPLATE_RE.sub(repl, value)
    if isinstance(value, dict):
        return {k: _render(v, payload) for k, v in value.items()}
    if isinstance(value, list):
        return [_render(v, payload) for v in value]
    return value


def resolve_action(rule, payload):
    """Produce the concrete action intent for a matched rule."""
    return {
        'type': rule.action_type,
        'config': _render(rule.action_config or {}, payload),
    }


def evaluate_rule(rule, payload):
    matched = condition_matches(rule.condition or {}, payload)
    resolved = resolve_action(rule, payload) if matched else {}
    return matched, resolved


def evaluate_event(tenant, trigger, payload, dry_run=False):
    """Evaluate all active rules for (tenant, trigger) against payload.

    Returns a list of result dicts. When dry_run is False, matched rules get an
    AutomationRun row + the rule's trigger_count/last_triggered_at are bumped.
    """
    from .models import AutomationRule, AutomationRun

    rules = AutomationRule.objects.filter(
        tenant=tenant, trigger=trigger, is_active=True,
    )
    results = []
    now = timezone.now()
    for rule in rules:
        try:
            matched, resolved = evaluate_rule(rule, payload)
            status = 'matched' if matched else 'skipped'
            error = ''
        except Exception as exc:  # defensive: a bad rule must not break the event
            matched, resolved, status, error = False, {}, 'failed', str(exc)

        result = {
            'rule_id': str(rule.id),
            'rule_name': rule.name,
            'status': status,
            'action': resolved,
            'error': error,
        }
        results.append(result)

        if dry_run:
            continue

        AutomationRun.objects.create(
            rule=rule, trigger=trigger, payload=payload, status=status,
            action_type=rule.action_type if matched else '',
            action_result=resolved, error=error,
        )
        if matched:
            rule.trigger_count = (rule.trigger_count or 0) + 1
            rule.last_triggered_at = now
            rule.save(update_fields=['trigger_count', 'last_triggered_at', 'updated_at'])
    return results
