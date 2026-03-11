import type { VisualType } from './types';

/**
 * Detect the visual topic type from the LESSON TITLE.
 * This is the most reliable signal — titles clearly indicate the topic.
 * Returns null if no match, so caller can fall back to content-based detection.
 *
 * Covers all 11 courses: PM Fundamentals, PRINCE2, Scrum, Waterfall,
 * Kanban, Agile, Lean Six Sigma, Leadership, Program Management, SAFe, MS Project.
 */
export const detectTopicFromTitle = (title: string): VisualType | null => {
  const lower = title.toLowerCase();

  // Skip quiz/exam/certificate — they use their own UI components
  if (lower.includes('quiz') || lower.includes('eindexamen') || lower.includes('exam') ||
      lower.includes('certificaat') || lower.includes('certificate') ||
      lower.includes('praktijkopdracht')) {
    return null;
  }

  // --- METHODOLOGY: frameworks, approaches, methodologies ---
  if (
    lower.includes('methodolog') ||
    lower.includes('kanban') ||
    lower.includes('prince2') ||
    lower.includes('lean') ||
    lower.includes('safe ') || lower.startsWith('safe') ||
    lower.includes('framework') ||
    lower.includes('manifesto') ||
    lower.includes('agile') || lower.includes('scrum') || lower.includes('waterfall') ||
    lower.includes('artefact') || lower.includes('artifact') ||
    lower.includes('event') // Scrum Events
  ) {
    return 'methodology';
  }

  // --- PLANNING TOOLS: WBS, Gantt, resource planning, etc. ---
  // These are planning techniques/tools, NOT lifecycle phases.
  // Return null so they get content-based rendering (generic) instead of the 5-phases diagram.
  if (
    lower.includes('wbs') || lower.includes('work breakdown') ||
    lower.includes('gantt') ||
    lower.includes('resource planning') || lower.includes('resource allocat') ||
    lower.includes('critical path') || lower.includes('roadmap')
  ) {
    return null;
  }

  // --- LIFECYCLE: specifically about project phases/lifecycle ---
  if (
    lower.includes('levenscyclus') || lower.includes('lifecycle') ||
    lower.includes('fase') || lower.includes('phase') ||
    lower.includes('plans thema') ||
    lower.includes('afsluiting') || lower.includes('closing') || lower.includes('closure') ||
    lower.includes('initiatie') || lower.includes('initiation') || lower.includes('starting up') ||
    lower.includes('directing') || lower.includes('controlling') || lower.includes('managing') ||
    lower.includes('tailoring') || lower.includes('sprint') ||
    lower.includes('cadans') || lower.includes('cadence') ||
    lower.includes('pi planning')
  ) {
    return 'lifecycle';
  }

  // --- PM ROLE: leadership, team, roles, responsibilities ---
  if (
    (lower.includes('rol') && lower.includes('projectmanager')) ||
    (lower.includes('role') && lower.includes('project manager')) ||
    lower.includes('kernrol') ||
    lower.includes('servant leadership') || lower.includes('leadership style') ||
    lower.includes('team') || lower.includes('leider') ||
    lower.includes('motivat') || lower.includes('delegat') || lower.includes('empowerment') ||
    lower.includes('tuckman') || lower.includes('impediment') ||
    lower.includes('accountabilit') || lower.includes('rollen') ||
    lower.includes('emotional intelligence') || lower.includes('self-awareness') ||
    lower.includes('conflict')
  ) {
    return 'pm_role';
  }

  // --- PROJECT DEFINITION: "Wat is X?", charter, scope, definitions ---
  if (
    lower.startsWith('wat is') || lower.startsWith('what is') ||
    lower.includes('charter') || lower.includes('scope') ||
    lower.includes('business case') || lower.includes('definitie') || lower.includes('definition') ||
    lower.includes('essentie') || lower.includes('oorsprong') ||
    lower.includes('introduct') || lower.includes('getting started') ||
    lower.includes('overzicht') || lower.includes('overview') ||
    lower.includes('configuration') || lower.includes('governance') ||
    lower.includes('principes') || lower.includes('principles') ||
    lower.includes('why scale')
  ) {
    return 'project_def';
  }

  // --- TRIPLE CONSTRAINT: budget, cost, resources, metrics ---
  if (
    lower.includes('triple constraint') || lower.includes('driehoek') ||
    lower.includes('budget') || lower.includes('kosten') || lower.includes('cost') ||
    lower.includes('resource') || lower.includes('earned value') ||
    lower.includes('metric') || lower.includes('kpi') || lower.includes('measurement') ||
    lower.includes('financial') || lower.includes('baseline') || lower.includes('tracking') ||
    lower.includes('wip') || lower.includes('flow metric') ||
    lower.includes('schatten') || lower.includes('estimat')
  ) {
    return 'triple_constraint';
  }

  // --- COMPARISON: vs, differences ---
  if (
    lower.includes(' vs') || lower.includes('vergelijk') ||
    lower.includes('combineren') || lower.includes('verschil')
  ) {
    return 'comparison';
  }

  // --- STAKEHOLDER: stakeholders, communication, engagement ---
  if (
    lower.includes('stakeholder') || lower.includes('belanghebbende') ||
    lower.includes('communicat') || lower.includes('negotiat') || lower.includes('onderhandel') ||
    lower.includes('present') || lower.includes('engagement') ||
    lower.includes('value stream')
  ) {
    return 'stakeholder';
  }

  // --- RISK: risk, quality, control, monitoring ---
  if (
    lower.includes('risico') || lower.includes('risk') ||
    lower.includes('quality') || lower.includes('kwaliteit') ||
    lower.includes('control') || lower.includes('change') ||
    lower.includes('bewaking') || lower.includes('monitoring') ||
    lower.includes('root cause') || lower.includes('statistical') ||
    lower.includes('lessons learned') || lower.includes('benefits') ||
    lower.includes('inspect') || lower.includes('verbetering') || lower.includes('improvement') ||
    lower.includes('transition') || lower.includes('acceptatie') || lower.includes('overdracht') ||
    lower.includes('uitdaging') || lower.includes('challenge')
  ) {
    return 'risk';
  }

  return null;
};

/**
 * Dynamically detect the visual topic type from lesson content/transcript.
 * Used as fallback when title-based detection returns null.
 *
 * IMPORTANT: Order matters — check specific topics BEFORE broad ones.
 * "projectmanager" appears in almost every PM lesson, so pm_role must
 * only match when the content is specifically about PM roles.
 */
export const detectTopicType = (text: string): VisualType => {
  const lower = text.toLowerCase();

  // 1. Methodology — check FIRST because methodology content also mentions "projectmanager"
  if (
    lower.includes('methodolog') ||
    (lower.includes('agile') && lower.includes('waterfall')) ||
    (lower.includes('scrum') && (lower.includes('sprint') || lower.includes('agile'))) ||
    lower.includes('prince2') ||
    (lower.includes('hybride') && lower.includes('aanpak'))
  ) {
    return 'methodology';
  }

  // 2. Project Definition
  if (
    (lower.includes('project') && (lower.includes('definitie') || lower.includes('definition'))) ||
    (lower.includes('tijdelijk') && lower.includes('uniek') && lower.includes('resultaat'))
  ) {
    return 'project_def';
  }

  // 3. Triple Constraint
  if (
    lower.includes('triple constraint') ||
    (lower.includes('tijd') && lower.includes('budget') && lower.includes('kwaliteit')) ||
    (lower.includes('time') && lower.includes('budget') && lower.includes('quality')) ||
    (lower.includes('tijd') && lower.includes('budget') && lower.includes('scope'))
  ) {
    return 'triple_constraint';
  }

  // 4. Lifecycle — check before pm_role (lifecycle content often mentions "projectmanager")
  if (
    lower.includes('levenscyclus') ||
    lower.includes('lifecycle') ||
    (lower.includes('fasen') && lower.includes('project')) ||
    (lower.includes('initiatie') && lower.includes('afsluiting')) ||
    (lower.includes('initiation') && lower.includes('closing'))
  ) {
    return 'lifecycle';
  }

  // 5. Comparison
  if (
    (lower.includes('project') && lower.includes('operatie')) ||
    (lower.includes('project') && lower.includes('operation')) ||
    lower.includes('verschil tussen')
  ) {
    return 'comparison';
  }

  // 6. Stakeholder
  if (lower.includes('stakeholder') || lower.includes('belanghebbende')) {
    return 'stakeholder';
  }

  // 7. Risk
  if (lower.includes('risico') || lower.includes('risk')) {
    return 'risk';
  }

  // 8. PM Role — LAST among specific topics, and require specific "role" context
  //    (not just "projectmanager" which appears everywhere in PM courses)
  if (
    lower.includes('rol van de projectmanager') ||
    lower.includes('role of the project manager') ||
    lower.includes('kernrol') ||
    lower.includes('core role') ||
    lower.includes('pm rol') ||
    lower.includes('pm role') ||
    (lower.includes('4 rollen') || lower.includes('vier rollen') || lower.includes('4 roles'))
  ) {
    return 'pm_role';
  }

  return 'generic';
};

/**
 * Get section title and subtitle based on detected topic type
 */
export const getTopicMeta = (
  topicType: VisualType,
  sectionText: string,
  index: number,
  isNL: boolean
): { title: string; subtitle: string } => {
  switch (topicType) {
    case 'project_def':
      return {
        title: isNL ? 'Wat is een Project?' : 'What is a Project?',
        subtitle: isNL ? 'De 3 kernkenmerken' : 'The 3 core characteristics',
      };
    case 'triple_constraint':
      return {
        title: isNL ? 'De Triple Constraint' : 'The Triple Constraint',
        subtitle: isNL ? 'Tijd, Budget & Scope' : 'Time, Budget & Scope',
      };
    case 'pm_role':
      return {
        title: isNL ? 'De Rol van de PM' : 'The Role of the PM',
        subtitle: isNL ? 'Verantwoordelijkheden' : 'Responsibilities',
      };
    case 'comparison':
      return {
        title: isNL ? 'Project vs. Operatie' : 'Project vs. Operation',
        subtitle: isNL ? 'Ken het verschil' : 'Know the difference',
      };
    case 'lifecycle':
      return {
        title: isNL ? 'Projectlevenscyclus' : 'Project Lifecycle',
        subtitle: isNL ? 'De fasen van een project' : 'The phases of a project',
      };
    case 'stakeholder':
      return {
        title: isNL ? 'Stakeholder Management' : 'Stakeholder Management',
        subtitle: isNL ? 'Belanghebbenden in kaart' : 'Mapping stakeholders',
      };
    case 'risk':
      return {
        title: isNL ? 'Risicomanagement' : 'Risk Management',
        subtitle: isNL ? 'Identificeer & beheers risico\'s' : 'Identify & manage risks',
      };
    case 'methodology':
      return {
        title: isNL ? 'PM Methodologieën' : 'PM Methodologies',
        subtitle: isNL ? 'Agile, Waterfall & meer' : 'Agile, Waterfall & more',
      };
    default: {
      const firstSentence = sectionText.split(/[.!?]/)[0]?.trim() || '';
      return {
        title: firstSentence.length > 60 ? firstSentence.substring(0, 60) + '...' : firstSentence,
        subtitle: `${isNL ? 'Deel' : 'Part'} ${index + 1}`,
      };
    }
  }
};
