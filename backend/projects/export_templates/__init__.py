"""
Pluggable export-template registry.

Each customer (or methodology) can pick a layout for Highlight Reports
and Project Plans. Built-in choices:

  - yanmar   : the YEU PRJ LEGO / Highlight / Minutes layout (default)
  - prince2  : PRINCE2 6th Edition canonical layouts
  - generic  : minimal cross-methodology layout (for new customers)

Customers can override at two levels:
  - Company.export_template_default  (set once, applies to all exports)
  - ?template=<name> query param     (overrides per request)

Adding a new template:
  1. Create `projects/export_templates/<name>.py` with two callables:
        render_highlight_pptx(report) -> bytes
        render_project_plan_docx(project) -> bytes
  2. Register it in TEMPLATES below.
  3. Add a choice to Company.EXPORT_TEMPLATE_CHOICES.
"""

from __future__ import annotations

from typing import Callable


# Lazy imports so optional template modules don't load until needed.
def _yanmar_highlight():
    from prince2.exports import render_highlight_pptx
    return render_highlight_pptx


def _yanmar_project_plan():
    from projects.exports_project_plan import render_project_plan_docx
    return render_project_plan_docx


TEMPLATES: dict[str, dict[str, Callable]] = {
    "yanmar": {
        "highlight_pptx": _yanmar_highlight,
        "project_plan_docx": _yanmar_project_plan,
    },
    # Aliases — until prince2/generic get bespoke renderers, they
    # share Yanmar's (which is itself PRINCE2-flavoured).
    "prince2": {
        "highlight_pptx": _yanmar_highlight,
        "project_plan_docx": _yanmar_project_plan,
    },
    "generic": {
        "highlight_pptx": _yanmar_highlight,
        "project_plan_docx": _yanmar_project_plan,
    },
}


def pick_template(company, name: str = "", *, kind: str = "highlight_pptx") -> Callable:
    """
    Resolve the renderer to use.

    Precedence: explicit `name` > company.export_template_default > 'yanmar'.
    """
    requested = (name or "").lower().strip()
    if not requested and company is not None:
        requested = (getattr(company, "export_template_default", "") or "").lower()
    if requested not in TEMPLATES:
        requested = "yanmar"
    factory = TEMPLATES[requested][kind]
    return factory()
