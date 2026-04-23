// ============================================
// Program Tab Header — URL-aware title/subtitle
// ============================================
// Four program container screens (ProgramDashboard, ProgramRoadmap,
// ProgramGovernance, ProgramBenefits) each serve multiple sidebar
// sub-tabs. Previously every sub-tab rendered identical content.
//
// This component reads the last URL segment and returns a
// title + subtitle + section-highlight hint so each tab AT LEAST
// has distinct framing, even when the underlying data view is shared.
//
// Full split into dedicated components is a future refactor (~25 new
// screens). This is the fast path.

import { useLocation } from 'react-router-dom';

// URL segment → { titleEn, titleNl, subtitleEn, subtitleNl, focus }
// `focus` is a hint the host component can use to conditionally
// highlight/scroll-to a section of its rendered content.
const TAB_MAP: Record<string, { en: [string, string]; nl: [string, string]; focus: string }> = {
  // Dashboard-family tabs
  dashboard:      { en: ['Program Dashboard',        'Summary of the program.'],
                    nl: ['Programma Dashboard',      'Samenvatting van het programma.'], focus: 'summary' },
  projects:       { en: ['Projects in Program',     'All projects under this program.'],
                    nl: ['Projecten in Programma',  'Alle projecten onder dit programma.'], focus: 'projects' },
  art:            { en: ['Agile Release Train',    'ART composition and member teams.'],
                    nl: ['Agile Release Train',    'ART-samenstelling en teams.'], focus: 'art' },
  charter:        { en: ['Programme Charter',      'Mandate, goals, and scope.'],
                    nl: ['Programma Charter',      'Mandaat, doelen en scope.'], focus: 'charter' },
  'business-case':{ en: ['Business Case',          'Justification and expected value.'],
                    nl: ['Business Case',          'Rechtvaardiging en verwachte waarde.'], focus: 'business-case' },
  blueprint:      { en: ['Programme Blueprint',    'Target operating model.'],
                    nl: ['Programma Blauwdruk',    'Doel-operating model.'], focus: 'blueprint' },
  stakeholders:   { en: ['Stakeholders',           'Engagement and influence map.'],
                    nl: ['Stakeholders',           'Betrokkenheid en invloed.'], focus: 'stakeholders' },
  communications: { en: ['Communications',         'Plan and recent messages.'],
                    nl: ['Communicatie',           'Plan en recente berichten.'], focus: 'communications' },
  risks:          { en: ['Program Risks',          'Risk register at program level.'],
                    nl: ['Programma Risico\'s',    'Risicoregister op programmaniveau.'], focus: 'risks' },
  features:       { en: ['Program Features',      'Features planned for this program.'],
                    nl: ['Programma Features',    'Geplande features voor dit programma.'], focus: 'features' },
  demos:          { en: ['System Demos',          'Integrated demo schedule and outcomes.'],
                    nl: ['Systeem Demos',         'Schema en uitkomsten.'], focus: 'demos' },
  'inspect-adapt':{ en: ['Inspect & Adapt',       'Continuous improvement workshops.'],
                    nl: ['Inspect & Adapt',       'Continue verbetering workshops.'], focus: 'inspect-adapt' },
  current:        { en: ['Current PI',            'Active program increment.'],
                    nl: ['Huidige PI',            'Actieve program increment.'], focus: 'pi-current' },
  planning:       { en: ['PI Planning',           'Upcoming program increment planning.'],
                    nl: ['PI Planning',           'Komende program increment planning.'], focus: 'pi-planning' },
  objectives:     { en: ['PI Objectives',         'Team-level PI objectives.'],
                    nl: ['PI Doelstellingen',     'PI-doelstellingen per team.'], focus: 'pi-objectives' },

  // Roadmap-family tabs
  roadmap:        { en: ['Program Roadmap',       'Long-term delivery roadmap.'],
                    nl: ['Programma Routekaart',  'Lange-termijn roadmap.'], focus: 'roadmap' },
  milestones:     { en: ['Program Milestones',   'Key delivery milestones.'],
                    nl: ['Programma Mijlpalen',   'Belangrijke mijlpalen.'], focus: 'milestones' },
  dependencies:   { en: ['Dependencies',          'Cross-project dependencies.'],
                    nl: ['Afhankelijkheden',      'Cross-project afhankelijkheden.'], focus: 'dependencies' },
  schedule:       { en: ['Schedule',              'Consolidated program schedule.'],
                    nl: ['Planning',              'Geconsolideerd programma-overzicht.'], focus: 'schedule' },
  tranches:       { en: ['Tranche Plan',         'MSP/P2 tranche breakdown.'],
                    nl: ['Tranche Plan',         'MSP/P2 tranche-indeling.'], focus: 'tranches' },
  transitions:    { en: ['Transitions',           'Handover from tranche to BAU.'],
                    nl: ['Transities',            'Overdracht van tranche naar BAU.'], focus: 'transitions' },

  // Governance-family tabs
  governance:     { en: ['Governance',            'Program board and decisions.'],
                    nl: ['Governance',            'Programma board en besluiten.'], focus: 'governance' },
  exceptions:     { en: ['Exception Reports',     'Tolerance breaches escalated to the board.'],
                    nl: ['Uitzonderingsrapporten','Overschrijdingen geëscaleerd naar de board.'], focus: 'exceptions' },
  highlights:     { en: ['Highlight Reports',     'Regular board updates.'],
                    nl: ['Highlight Rapporten',   'Reguliere board-updates.'], focus: 'highlights' },
  reports:        { en: ['Program Reports',       'Status and financial reports.'],
                    nl: ['Programma Rapporten',   'Status en financiële rapporten.'], focus: 'reports' },
  'stage-gates':  { en: ['Stage Gates',           'Tranche end-stage review and approval.'],
                    nl: ['Stage Gates',           'Tranche-end review en goedkeuring.'], focus: 'stage-gates' },

  // Benefits-family tabs
  benefits:       { en: ['Benefits Register',     'All benefits tracked for this program.'],
                    nl: ['Baten Register',        'Alle baten van dit programma.'], focus: 'benefits' },
  profiles:       { en: ['Benefit Profiles',      'Ownership and realization approach per benefit.'],
                    nl: ['Baten Profielen',       'Eigenaar en realisatie-aanpak.'], focus: 'profiles' },
  realization:    { en: ['Realization Plan',     'Timeline and milestones for benefits.'],
                    nl: ['Realisatieplan',       'Tijdlijn en mijlpalen voor baten.'], focus: 'realization' },
  kpis:           { en: ['Program KPIs',          'Quantitative performance indicators.'],
                    nl: ['Programma KPIs',        'Kwantitatieve prestatie-indicatoren.'], focus: 'kpis' },
  resources:      { en: ['Program Resources',     'People, skills, and capacity.'],
                    nl: ['Programma Middelen',    'Mensen, vaardigheden en capaciteit.'], focus: 'resources' },
};


export function useProgramTab() {
  const location = useLocation();
  // URL pattern: /programs/:id/<tab> OR /programs/:id/benefits/<subtab>
  const parts = location.pathname.split('/').filter(Boolean);
  // Take the LAST meaningful segment; but 'profiles' and 'realization' are
  // under /benefits/, so preserve their specific mapping.
  const last = parts[parts.length - 1] ?? 'dashboard';
  return last;
}


export interface ProgramTabHeaderProps {
  isNL?: boolean;
  /** Override the title entirely (for when the underlying component has
   *  a specific program name it wants to show as a subtitle). */
  programName?: string;
}

export function ProgramTabHeader({ isNL = false, programName }: ProgramTabHeaderProps) {
  const tab = useProgramTab();
  const info = TAB_MAP[tab] ?? TAB_MAP.dashboard;
  const [title, subtitle] = isNL ? info.nl : info.en;

  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {programName && (
            <p className="text-sm text-muted-foreground mt-1">{programName}</p>
          )}
        </div>
      </div>
      <p className="text-muted-foreground mt-2">{subtitle}</p>
    </div>
  );
}

// Exposes the focus hint so host components can highlight a section.
export function useProgramTabFocus(): string {
  const tab = useProgramTab();
  return TAB_MAP[tab]?.focus ?? 'summary';
}

export default ProgramTabHeader;
