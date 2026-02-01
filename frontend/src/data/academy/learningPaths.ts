// ============================================
// LEARNING PATHS
// ============================================
import { Rocket, Zap, TrendingUp, Crown, Users } from 'lucide-react';
import { LearningPath } from './types';
import { BRAND } from './brand';

export const learningPaths: LearningPath[] = [
  {
    id: 'pm-career',
    title: 'Project Manager Career Path',
    titleNL: 'Project Manager Carrièrepad',
    description: 'From beginner to certified PM. All essential skills.',
    descriptionNL: 'Van beginner tot gecertificeerd PM. Alle essentiële vaardigheden.',
    icon: Rocket,
    gradient: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`,
    courses: ['pm-fundamentals', 'prince2-foundation', 'agile-fundamentals', 'stakeholder-management'],
    duration: 46,
  },
  {
    id: 'agile-master',
    title: 'Agile Master Path',
    titleNL: 'Agile Master Pad',
    description: 'Master all Agile frameworks from Scrum to SAFe.',
    descriptionNL: 'Beheers alle Agile frameworks van Scrum tot SAFe.',
    icon: Zap,
    gradient: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.emerald})`,
    courses: ['agile-fundamentals', 'scrum-master', 'kanban-practitioner', 'safe-fundamentals'],
    duration: 46,
  },
  {
    id: 'process-expert',
    title: 'Process Improvement Expert',
    titleNL: 'Procesverbetering Expert',
    description: 'Lean Six Sigma and continuous improvement.',
    descriptionNL: 'Lean Six Sigma en continue verbetering.',
    icon: TrendingUp,
    gradient: `linear-gradient(135deg, ${BRAND.cyan}, ${BRAND.blue})`,
    courses: ['lean-six-sigma', 'kanban-practitioner'],
    duration: 32,
  },
  {
    id: 'traditional-pm',
    title: 'Traditional PM Expert',
    titleNL: 'Traditioneel PM Expert',
    description: 'PRINCE2, Waterfall and governance.',
    descriptionNL: 'PRINCE2, Waterfall en governance.',
    icon: Crown,
    gradient: `linear-gradient(135deg, ${BRAND.amber}, ${BRAND.orange})`,
    courses: ['pm-fundamentals', 'prince2-foundation', 'waterfall-pm', 'msp-foundation'],
    duration: 58,
  },
  {
    id: 'leadership-path',
    title: 'PM Leadership Path',
    titleNL: 'PM Leiderschap Pad',
    description: 'Lead teams and manage stakeholders.',
    descriptionNL: 'Leid teams en manage stakeholders.',
    icon: Users,
    gradient: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.purple})`,
    courses: ['pm-leadership', 'stakeholder-management', 'risk-management'],
    duration: 22,
  },
];

export const getLearningPathById = (id: string): LearningPath | undefined => {
  return learningPaths.find(path => path.id === id);
};

export default learningPaths;
