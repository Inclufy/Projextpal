"""Canonical methodology vocabulary for Hybrid projects (backlog #33, P1-11).

A hybrid project blends *project-level* methodologies across its phases. The
valid set is the single-project methodologies from projects.Project
(excluding "program", which is programme-level, and "hybrid" itself).

Kept here — not as model `choices` — so enforcement is a serializer-level
validation that needs no migration. Both Hybrid frontend lists
(HybridConfiguration.tsx, HybridPhases.tsx) must mirror this list.
"""

HYBRID_METHODOLOGIES = [
    "prince2",
    "agile",
    "scrum",
    "kanban",
    "waterfall",
    "lean_six_sigma_green",
    "lean_six_sigma_black",
]

HYBRID_METHODOLOGY_SET = frozenset(HYBRID_METHODOLOGIES)

# Each phase methodology completes under one of three governance STRATEGIES.
# This is what makes the methodology label behaviour-changing (backlog #38):
#   predictive -> gate review must be signed off before the phase can complete
#   adaptive   -> Definition-of-Done checklist + all phase tasks done
#   flow       -> all phase tasks pulled to done (continuous flow drained)
STRATEGY_BY_METHODOLOGY = {
    "prince2": "predictive",
    "waterfall": "predictive",
    "lean_six_sigma_green": "predictive",
    "lean_six_sigma_black": "predictive",
    "agile": "adaptive",
    "scrum": "adaptive",
    "kanban": "flow",
}


def strategy_for(methodology):
    """Governance strategy for a phase methodology (defaults to predictive)."""
    return STRATEGY_BY_METHODOLOGY.get(methodology, "predictive")
