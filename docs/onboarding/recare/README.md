# Recare — Onboarding engagement

Werkmap voor de onboarding van Recare op ProjeXtPal. Beheerd door de agent
[`golive-coordinator`](../../../.claude/agents/golive-coordinator.md).

## Bestanden

| Bestand | Doel | Door wie |
|---|---|---|
| `checklist.md` | Implementatie-checklist tot go-live (7 fasen) | Agent + consultant |
| `action-log.md` | Acties en commitments per dag, per owner | Agent |
| `status.md` | Periodieke status snapshots (nieuwste bovenaan) | Agent |
| `decisions.md` | Vastgelegde besluiten van Recare en ProjeXtPal | Agent na bevestiging |

## Werken met de agent

Roep de agent aan met natuurlijke taal:

| Vraag | Wat de agent doet |
|---|---|
| "status Recare" | Genereert nieuwe snapshot in `status.md` |
| "wat is overdue" | Lijst overdue + due-this-week uit `action-log.md` |
| "mark phase 1.1 done" | Vinkt items af, voegt regel toe aan action log |
| "run technical setup phase 0" | Voert alle `(P)`-items in fase 0 uit (API calls / shell) |
| "digest voor Elise" | Filterde lijst van alle `(R)`-acties als copy-paste tekst |
| "log action: …" | Voegt nieuwe regel toe aan action log |
| "blocked: …" | Markeert blocker en de unblock-actie |

De agent **verstuurt niets zelf** — output is altijd tekst die de consultant
in Teams/email plakt. Destructieve acties (verwijderen tenant, users)
vereisen expliciete bevestiging in de prompt.

## Externe artefacten

- Kickoff presentatie: `../recare-kickoff-presentation.pdf` / `.html`
- Print versie checklist: `../recare-implementation-checklist.pdf`
