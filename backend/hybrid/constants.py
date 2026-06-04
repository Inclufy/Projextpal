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
