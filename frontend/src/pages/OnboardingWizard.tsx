// src/pages/OnboardingWizard.tsx
// ProjeXtPal Onboarding Wizard — Purpose, Governance, Programs, Projects, Academy & Certifications
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Building2,
  Shield,
  Layers,
  FolderKanban,
  GraduationCap,
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Rocket,
  Target,
  Users,
  Briefcase,
  BarChart3,
  Crown,
  Zap,
  GitMerge,
  Workflow,
  Kanban,
  Repeat,
  Droplets,
  BookOpen,
  FileText,
  Globe,
  TrendingUp,
} from 'lucide-react';

// ============================================
// Types
// ============================================
interface OnboardingData {
  // Step 1: Purpose
  organizationName: string;
  organizationSize: string;
  primaryPurpose: string;
  secondaryPurposes: string[];
  maturityLevel: string;
  // Step 2: Governance
  governanceNeeds: string[];
  portfolioManagement: boolean;
  boardStructure: string;
  stakeholderManagement: boolean;
  reportingFrequency: string;
  // Step 3: Programs (methodologies)
  programMethodologies: string[];
  programScale: string;
  programGoals: string[];
  // Step 4: Projects (methodologies)
  projectMethodologies: string[];
  projectTypes: string[];
  teamSize: string;
  // Step 5: Academy
  learningInterests: string[];
  learningFormat: string[];
  learningGoal: string;
  // Step 6: Certifications
  certificationInterests: string[];
  certificationTimeline: string;
  currentCertifications: string[];
}

// ============================================
// Bilingual translations
// ============================================
const translations = {
  nl: {
    steps: [
      { label: 'Doel', shortLabel: 'Doel' },
      { label: 'Governance', shortLabel: 'Governance' },
      { label: "Programma's", shortLabel: "Programma's" },
      { label: 'Projecten', shortLabel: 'Projecten' },
      { label: 'Academy', shortLabel: 'Academy' },
      { label: 'Certificeringen', shortLabel: 'Cert.' },
      { label: 'Klaar!', shortLabel: 'Klaar!' },
    ],
    step1: {
      title: 'Wat is het doel van uw organisatie?',
      subtitle: 'Help ons begrijpen waarom u ProjeXtPal wilt gebruiken, zodat we uw omgeving op maat kunnen inrichten',
      organizationName: 'Organisatienaam',
      organizationNamePlaceholder: 'bijv. Acme B.V.',
      organizationSize: 'Organisatiegrootte',
      primaryPurpose: 'Primair doel',
      secondaryPurposes: 'Aanvullende doelen',
      maturityLevel: 'Huidige volwassenheidsniveau',
    },
    step2: {
      title: 'Governance inrichten',
      subtitle: 'Bepaal hoe uw organisatie projecten en programma\'s bestuurt en bewaakt',
      governanceNeeds: 'Governance behoeften',
      portfolioManagement: 'Portfolio management inschakelen?',
      boardStructure: 'Bestuursstructuur',
      stakeholderManagement: 'Stakeholder management inschakelen?',
      reportingFrequency: 'Rapportagefrequentie',
    },
    step3: {
      title: 'Programma-methodologieën',
      subtitle: 'Selecteer de methodologieën die u wilt gebruiken voor programmabeheer',
      programMethodologies: 'Programma methodologieën',
      programScale: 'Programma schaal',
      programGoals: 'Programma doelen',
    },
    step4: {
      title: 'Project-methodologieën',
      subtitle: 'Kies de methodologieën voor uw projectmanagement aanpak',
      projectMethodologies: 'Project methodologieën',
      projectTypes: 'Projecttypen',
      teamSize: 'Gemiddelde teamgrootte',
    },
    step5: {
      title: 'Academy & Leren',
      subtitle: 'Configureer uw leertrajecten en trainingsprogramma\'s',
      learningInterests: 'Leerinteresses',
      learningFormat: 'Gewenst leerformaat',
      learningGoal: 'Leerdoel',
    },
    step6: {
      title: 'Certificeringen',
      subtitle: 'Selecteer de certificeringstrajecten die relevant zijn voor uw team',
      certificationInterests: 'Certificeringsinteresses',
      certificationTimeline: 'Wanneer wilt u beginnen?',
      currentCertifications: 'Huidige certificeringen',
    },
    step7: {
      title: 'U bent klaar!',
      subtitle: 'Uw ProjeXtPal omgeving is geconfigureerd en klaar voor gebruik',
      summary: 'Samenvatting',
      startButton: 'Start met ProjeXtPal',
      features: [
        'Governance dashboards op maat',
        'Programma- en projectmethodologieën geconfigureerd',
        'Academy leertrajecten geactiveerd',
        'Certificeringstrajecten klaargezet',
        'AI-gestuurde projectondersteuning',
      ],
    },
    required: 'verplicht',
    next: 'Volgende',
    previous: 'Vorige',
    skip: 'Overslaan',
    stepOf: 'Stap {current} van {total}',
    yes: 'Ja',
    no: 'Nee',
  },
  en: {
    steps: [
      { label: 'Purpose', shortLabel: 'Purpose' },
      { label: 'Governance', shortLabel: 'Governance' },
      { label: 'Programs', shortLabel: 'Programs' },
      { label: 'Projects', shortLabel: 'Projects' },
      { label: 'Academy', shortLabel: 'Academy' },
      { label: 'Certifications', shortLabel: 'Cert.' },
      { label: 'Done!', shortLabel: 'Done!' },
    ],
    step1: {
      title: 'What is your organization\'s purpose?',
      subtitle: 'Help us understand why you want to use ProjeXtPal so we can tailor your environment',
      organizationName: 'Organization Name',
      organizationNamePlaceholder: 'e.g. Acme Corp',
      organizationSize: 'Organization Size',
      primaryPurpose: 'Primary Purpose',
      secondaryPurposes: 'Additional Purposes',
      maturityLevel: 'Current Maturity Level',
    },
    step2: {
      title: 'Set up Governance',
      subtitle: 'Define how your organization governs and oversees projects and programs',
      governanceNeeds: 'Governance Needs',
      portfolioManagement: 'Enable portfolio management?',
      boardStructure: 'Board Structure',
      stakeholderManagement: 'Enable stakeholder management?',
      reportingFrequency: 'Reporting Frequency',
    },
    step3: {
      title: 'Program Methodologies',
      subtitle: 'Select the methodologies you want to use for program management',
      programMethodologies: 'Program Methodologies',
      programScale: 'Program Scale',
      programGoals: 'Program Goals',
    },
    step4: {
      title: 'Project Methodologies',
      subtitle: 'Choose the methodologies for your project management approach',
      projectMethodologies: 'Project Methodologies',
      projectTypes: 'Project Types',
      teamSize: 'Average Team Size',
    },
    step5: {
      title: 'Academy & Learning',
      subtitle: 'Configure your learning paths and training programs',
      learningInterests: 'Learning Interests',
      learningFormat: 'Preferred Learning Format',
      learningGoal: 'Learning Goal',
    },
    step6: {
      title: 'Certifications',
      subtitle: 'Select the certification tracks that are relevant for your team',
      certificationInterests: 'Certification Interests',
      certificationTimeline: 'When do you want to start?',
      currentCertifications: 'Current Certifications',
    },
    step7: {
      title: "You're all set!",
      subtitle: 'Your ProjeXtPal environment is configured and ready to go',
      summary: 'Summary',
      startButton: 'Start with ProjeXtPal',
      features: [
        'Custom governance dashboards',
        'Program & project methodologies configured',
        'Academy learning paths activated',
        'Certification tracks set up',
        'AI-powered project support',
      ],
    },
    required: 'required',
    next: 'Next',
    previous: 'Previous',
    skip: 'Skip',
    stepOf: 'Step {current} of {total}',
    yes: 'Yes',
    no: 'No',
  },
};

// ============================================
// Option data
// ============================================
const organizationSizes: Record<string, string[]> = {
  nl: ['1-10 medewerkers', '11-50 medewerkers', '51-200 medewerkers', '201-1000 medewerkers', '1000+ medewerkers'],
  en: ['1-10 employees', '11-50 employees', '51-200 employees', '201-1,000 employees', '1,000+ employees'],
};

const primaryPurposes: Record<string, string[]> = {
  nl: [
    'Projectmanagement professionaliseren',
    'Programma\'s en portfolio\'s centraal beheren',
    'Governance en compliance verbeteren',
    'Team vaardigheden ontwikkelen',
    'Certificeringen behalen',
    'Organisatie volwassenheid verhogen',
    'Kosten en risico\'s beheersen',
    'Digitale transformatie begeleiden',
  ],
  en: [
    'Professionalize project management',
    'Centrally manage programs & portfolios',
    'Improve governance & compliance',
    'Develop team capabilities',
    'Achieve certifications',
    'Increase organizational maturity',
    'Control costs & risks',
    'Guide digital transformation',
  ],
};

const maturityLevels: Record<string, string[]> = {
  nl: ['Beginnend — Weinig formele processen', 'Ontwikkelend — Enkele processen ingericht', 'Gedefinieerd — Processen gedocumenteerd', 'Beheerst — Processen gemeten en bewaakt', 'Geoptimaliseerd — Continue verbetering'],
  en: ['Initial — Few formal processes', 'Developing — Some processes in place', 'Defined — Processes documented', 'Managed — Processes measured & controlled', 'Optimizing — Continuous improvement'],
};

const governanceNeedsOptions: Record<string, string[]> = {
  nl: [
    'Portfolio overzicht & prioritering',
    'Stuurgroepen & besluitvorming',
    'Stakeholder management',
    'Risicomanagement op organisatieniveau',
    'Compliance & audit trails',
    'Resource allocatie',
    'Strategische alignment',
    'Prestatiemonitoring & KPI\'s',
  ],
  en: [
    'Portfolio overview & prioritization',
    'Steering committees & decision-making',
    'Stakeholder management',
    'Organization-level risk management',
    'Compliance & audit trails',
    'Resource allocation',
    'Strategic alignment',
    'Performance monitoring & KPIs',
  ],
};

const boardStructureOptions: Record<string, string[]> = {
  nl: ['Enkele stuurgroep', 'Meerdere stuurgroepen per domein', 'PMO-gestuurd', 'Portfoliobestuur met projectborden', 'Agile governance (Lean Portfolio)'],
  en: ['Single steering committee', 'Multiple domain steering committees', 'PMO-driven', 'Portfolio board with project boards', 'Agile governance (Lean Portfolio)'],
};

const reportingFrequencyOptions: Record<string, string[]> = {
  nl: ['Wekelijks', 'Tweewekelijks', 'Maandelijks', 'Per kwartaal', 'Op aanvraag'],
  en: ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'On demand'],
};

const programMethodologyOptions = [
  { id: 'safe', name: 'SAFe', description: { en: 'Scaled Agile Framework for enterprise agility', nl: 'Scaled Agile Framework voor organisatiebrede agility' }, icon: Zap, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { id: 'msp', name: 'MSP', description: { en: 'Managing Successful Programmes — structured program management', nl: 'Managing Successful Programmes — gestructureerd programmabeheer' }, icon: Crown, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { id: 'pmi', name: 'PMI / PgMP', description: { en: 'PMI Program Management — benefit-driven approach', nl: 'PMI Programma Management — batengestuurd aanpak' }, icon: BarChart3, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  { id: 'prince2_programme', name: 'PRINCE2 Programme', description: { en: 'PRINCE2 for programme-level governance', nl: 'PRINCE2 voor programmaniveau governance' }, icon: Shield, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  { id: 'hybrid_programme', name: 'Hybrid', description: { en: 'Combine elements from multiple frameworks', nl: 'Combineer elementen uit meerdere raamwerken' }, icon: GitMerge, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
];

const programScaleOptions: Record<string, string[]> = {
  nl: ['Klein (2-5 projecten)', 'Middel (5-15 projecten)', 'Groot (15-50 projecten)', 'Enterprise (50+ projecten)'],
  en: ['Small (2-5 projects)', 'Medium (5-15 projects)', 'Large (15-50 projects)', 'Enterprise (50+ projects)'],
};

const programGoalOptions: Record<string, string[]> = {
  nl: ['Strategische doelen realiseren', 'Batenbeheer en -realisatie', 'Resourceoptimalisatie', 'Risicospreiding', 'Time-to-market verbeteren', 'Organisatieverandering begeleiden'],
  en: ['Achieve strategic objectives', 'Benefits management & realization', 'Resource optimization', 'Risk diversification', 'Improve time-to-market', 'Facilitate organizational change'],
};

const projectMethodologyOptions = [
  { id: 'prince2', name: 'PRINCE2', description: { en: 'Structured project management with defined stages', nl: 'Gestructureerd projectmanagement met gedefinieerde fasen' }, icon: Crown, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { id: 'agile', name: 'Agile', description: { en: 'Iterative, flexible delivery approach', nl: 'Iteratieve, flexibele leveringsaanpak' }, icon: Zap, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { id: 'scrum', name: 'Scrum', description: { en: 'Sprint-based team collaboration framework', nl: 'Sprint-gebaseerd team samenwerkingsraamwerk' }, icon: Repeat, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  { id: 'kanban', name: 'Kanban', description: { en: 'Visual flow-based work management', nl: 'Visueel flow-gebaseerd werkbeheer' }, icon: Kanban, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  { id: 'waterfall', name: 'Waterfall', description: { en: 'Sequential phase-based approach', nl: 'Sequentiële fasegebaseerde aanpak' }, icon: Workflow, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
  { id: 'lean_six_sigma', name: 'Lean Six Sigma', description: { en: 'Data-driven process improvement', nl: 'Datagestuurde procesverbetering' }, icon: Droplets, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  { id: 'hybrid', name: 'Hybrid', description: { en: 'Combine methodologies to fit your needs', nl: 'Combineer methodologieën naar behoefte' }, icon: GitMerge, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
];

const projectTypeOptions: Record<string, string[]> = {
  nl: ['IT / Software ontwikkeling', 'Infrastructuur', 'Organisatieverandering', 'Product ontwikkeling', 'Marketing & Communicatie', 'Bouw & Constructie', 'Onderzoek & Innovatie', 'Compliance & Regelgeving'],
  en: ['IT / Software Development', 'Infrastructure', 'Organizational Change', 'Product Development', 'Marketing & Communications', 'Construction', 'Research & Innovation', 'Compliance & Regulatory'],
};

const teamSizeOptions: Record<string, string[]> = {
  nl: ['Klein (2-5 personen)', 'Middel (6-15 personen)', 'Groot (16-50 personen)', 'Enterprise (50+ personen)'],
  en: ['Small (2-5 people)', 'Medium (6-15 people)', 'Large (16-50 people)', 'Enterprise (50+ people)'],
};

const learningInterestOptions: Record<string, string[]> = {
  nl: [
    'Projectmanagement fundamenten',
    'Agile & Scrum',
    'PRINCE2 methodologie',
    'Programmabeheer',
    'Portfoliomanagement',
    'Risicomanagement',
    'Stakeholder management',
    'Lean Six Sigma',
    'Leiderschap & Soft Skills',
    'AI in projectmanagement',
  ],
  en: [
    'Project management fundamentals',
    'Agile & Scrum',
    'PRINCE2 methodology',
    'Program management',
    'Portfolio management',
    'Risk management',
    'Stakeholder management',
    'Lean Six Sigma',
    'Leadership & Soft Skills',
    'AI in project management',
  ],
};

const learningFormatOptions: Record<string, string[]> = {
  nl: ['Online zelfgestuurd', 'Live virtuele training', 'Blended learning', 'Micro-learning modules', 'Coaching & Mentoring', 'Workshops'],
  en: ['Self-paced online', 'Live virtual training', 'Blended learning', 'Micro-learning modules', 'Coaching & Mentoring', 'Workshops'],
};

const learningGoalOptions: Record<string, string[]> = {
  nl: ['Nieuwe vaardigheden leren', 'Certificering voorbereiden', 'Team versterken', 'Best practices toepassen', 'Carrière ontwikkeling'],
  en: ['Learn new skills', 'Prepare for certification', 'Strengthen team', 'Apply best practices', 'Career development'],
};

const certificationOptions: Record<string, string[]> = {
  nl: [
    'PRINCE2 Foundation',
    'PRINCE2 Practitioner',
    'PRINCE2 Agile',
    'PMP (Project Management Professional)',
    'CAPM (Certified Associate in PM)',
    'PMI-ACP (Agile Certified)',
    'PgMP (Program Management)',
    'SAFe Agilist',
    'SAFe Scrum Master',
    'Scrum Master (PSM I/II)',
    'Product Owner (PSPO I/II)',
    'Lean Six Sigma Green Belt',
    'Lean Six Sigma Black Belt',
    'MSP Foundation',
    'MSP Practitioner',
    'ITIL Foundation',
    'MoP (Management of Portfolios)',
  ],
  en: [
    'PRINCE2 Foundation',
    'PRINCE2 Practitioner',
    'PRINCE2 Agile',
    'PMP (Project Management Professional)',
    'CAPM (Certified Associate in PM)',
    'PMI-ACP (Agile Certified)',
    'PgMP (Program Management)',
    'SAFe Agilist',
    'SAFe Scrum Master',
    'Scrum Master (PSM I/II)',
    'Product Owner (PSPO I/II)',
    'Lean Six Sigma Green Belt',
    'Lean Six Sigma Black Belt',
    'MSP Foundation',
    'MSP Practitioner',
    'ITIL Foundation',
    'MoP (Management of Portfolios)',
  ],
};

const certificationTimelineOptions: Record<string, string[]> = {
  nl: ['Binnen 1 maand', '1-3 maanden', '3-6 maanden', '6-12 maanden', 'Later — eerst verkennen'],
  en: ['Within 1 month', '1-3 months', '3-6 months', '6-12 months', 'Later — explore first'],
};

const currentCertificationOptions: Record<string, string[]> = {
  nl: ['Geen certificeringen', 'PRINCE2 Foundation', 'PRINCE2 Practitioner', 'PMP', 'Scrum Master', 'SAFe', 'Lean Six Sigma', 'ITIL', 'Anders'],
  en: ['No certifications', 'PRINCE2 Foundation', 'PRINCE2 Practitioner', 'PMP', 'Scrum Master', 'SAFe', 'Lean Six Sigma', 'ITIL', 'Other'],
};

// ============================================
// Step Icons
// ============================================
const stepIcons = [Target, Shield, Layers, FolderKanban, GraduationCap, Award, CheckCircle2];

// ============================================
// Chip Selector Component
// ============================================
const ChipSelector = ({
  options,
  selected,
  onSelect,
  multi = false,
}: {
  options: string[];
  selected: string | string[];
  onSelect: (value: string | string[]) => void;
  multi?: boolean;
}) => {
  const handleClick = (option: string) => {
    if (multi) {
      const arr = selected as string[];
      if (arr.includes(option)) {
        onSelect(arr.filter((s) => s !== option));
      } else {
        onSelect([...arr, option]);
      }
    } else {
      onSelect(option);
    }
  };

  const isSelected = (option: string) =>
    multi ? (selected as string[]).includes(option) : selected === option;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleClick(option)}
          className={cn(
            'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border',
            isSelected(option)
              ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
              : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

// ============================================
// Methodology Card Selector
// ============================================
const MethodologyCardSelector = ({
  options,
  selected,
  onSelect,
  lang,
}: {
  options: typeof programMethodologyOptions;
  selected: string[];
  onSelect: (ids: string[]) => void;
  lang: 'en' | 'nl';
}) => {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((s) => s !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200',
              isActive
                ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/30 hover:border-slate-600'
            )}
          >
            <div className={cn('p-2 rounded-lg flex-shrink-0', opt.bgColor)}>
              <Icon className={cn('w-5 h-5', opt.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{opt.name}</span>
                {isActive && <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{opt.description[lang]}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ============================================
// Main Component
// ============================================
const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';
  const t = translations[lang];

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    organizationName: '',
    organizationSize: '',
    primaryPurpose: '',
    secondaryPurposes: [],
    maturityLevel: '',
    governanceNeeds: [],
    portfolioManagement: true,
    boardStructure: '',
    stakeholderManagement: true,
    reportingFrequency: '',
    programMethodologies: [],
    programScale: '',
    programGoals: [],
    projectMethodologies: [],
    projectTypes: [],
    teamSize: '',
    learningInterests: [],
    learningFormat: [],
    learningGoal: '',
    certificationInterests: [],
    certificationTimeline: '',
    currentCertifications: [],
  });

  const totalSteps = 7;

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep((s) => s + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_data', JSON.stringify(data));
    navigate('/dashboard');
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_skipped', 'true');
    navigate('/dashboard');
  };

  const stepOfText = t.stepOf
    .replace('{current}', String(currentStep + 1))
    .replace('{total}', String(totalSteps));

  // ============================================
  // Stepper
  // ============================================
  const renderStepper = () => (
    <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-4">
      {t.steps.map((step, index) => {
        const Icon = stepIcons[index];
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => index <= currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                  isActive
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : isCompleted
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-400'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </button>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  isActive ? 'text-white' : isCompleted ? 'text-purple-400' : 'text-slate-500'
                )}
              >
                {step.shortLabel}
              </span>
            </div>
            {index < t.steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mt-[-18px] rounded-full transition-all duration-300',
                  index < currentStep ? 'bg-purple-600/50' : 'bg-slate-700/50'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // ============================================
  // Step 1: Purpose
  // ============================================
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Purpose explanation banner */}
      <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-300">
              {lang === 'nl'
                ? 'ProjeXtPal is uw complete platform voor project-, programma- en portfoliomanagement. Door uw doel te delen, kunnen wij de juiste modules, methodologieën en leertrajecten voor u activeren.'
                : 'ProjeXtPal is your complete platform for project, program & portfolio management. By sharing your purpose, we can activate the right modules, methodologies, and learning paths for you.'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          {t.step1.organizationName} <span className="text-purple-400">*</span>
        </label>
        <Input
          value={data.organizationName}
          onChange={(e) => updateData('organizationName', e.target.value)}
          placeholder={t.step1.organizationNamePlaceholder}
          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl h-12"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step1.organizationSize}
        </label>
        <ChipSelector
          options={organizationSizes[lang]}
          selected={data.organizationSize}
          onSelect={(v) => updateData('organizationSize', v as string)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step1.primaryPurpose} <span className="text-purple-400">*</span>
        </label>
        <ChipSelector
          options={primaryPurposes[lang]}
          selected={data.primaryPurpose}
          onSelect={(v) => updateData('primaryPurpose', v as string)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step1.secondaryPurposes}
        </label>
        <ChipSelector
          options={primaryPurposes[lang].filter((p) => p !== data.primaryPurpose)}
          selected={data.secondaryPurposes}
          onSelect={(v) => updateData('secondaryPurposes', v as string[])}
          multi
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step1.maturityLevel}
        </label>
        <ChipSelector
          options={maturityLevels[lang]}
          selected={data.maturityLevel}
          onSelect={(v) => updateData('maturityLevel', v as string)}
        />
      </div>
    </div>
  );

  // ============================================
  // Step 2: Governance
  // ============================================
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step2.governanceNeeds}
        </label>
        <ChipSelector
          options={governanceNeedsOptions[lang]}
          selected={data.governanceNeeds}
          onSelect={(v) => updateData('governanceNeeds', v as string[])}
          multi
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step2.portfolioManagement}
        </label>
        <div className="flex gap-3">
          {[
            { label: t.yes, value: true },
            { label: t.no, value: false },
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => updateData('portfolioManagement', option.value)}
              className={cn(
                'px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border',
                data.portfolioManagement === option.value
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step2.boardStructure}
        </label>
        <ChipSelector
          options={boardStructureOptions[lang]}
          selected={data.boardStructure}
          onSelect={(v) => updateData('boardStructure', v as string)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step2.stakeholderManagement}
        </label>
        <div className="flex gap-3">
          {[
            { label: t.yes, value: true },
            { label: t.no, value: false },
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => updateData('stakeholderManagement', option.value)}
              className={cn(
                'px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border',
                data.stakeholderManagement === option.value
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step2.reportingFrequency}
        </label>
        <ChipSelector
          options={reportingFrequencyOptions[lang]}
          selected={data.reportingFrequency}
          onSelect={(v) => updateData('reportingFrequency', v as string)}
        />
      </div>
    </div>
  );

  // ============================================
  // Step 3: Programs (Methodologies)
  // ============================================
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step3.programMethodologies}
        </label>
        <MethodologyCardSelector
          options={programMethodologyOptions}
          selected={data.programMethodologies}
          onSelect={(ids) => updateData('programMethodologies', ids)}
          lang={lang}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step3.programScale}
        </label>
        <ChipSelector
          options={programScaleOptions[lang]}
          selected={data.programScale}
          onSelect={(v) => updateData('programScale', v as string)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step3.programGoals}
        </label>
        <ChipSelector
          options={programGoalOptions[lang]}
          selected={data.programGoals}
          onSelect={(v) => updateData('programGoals', v as string[])}
          multi
        />
      </div>
    </div>
  );

  // ============================================
  // Step 4: Projects (Methodologies)
  // ============================================
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step4.projectMethodologies}
        </label>
        <MethodologyCardSelector
          options={projectMethodologyOptions}
          selected={data.projectMethodologies}
          onSelect={(ids) => updateData('projectMethodologies', ids)}
          lang={lang}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step4.projectTypes}
        </label>
        <ChipSelector
          options={projectTypeOptions[lang]}
          selected={data.projectTypes}
          onSelect={(v) => updateData('projectTypes', v as string[])}
          multi
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step4.teamSize}
        </label>
        <ChipSelector
          options={teamSizeOptions[lang]}
          selected={data.teamSize}
          onSelect={(v) => updateData('teamSize', v as string)}
        />
      </div>
    </div>
  );

  // ============================================
  // Step 5: Academy
  // ============================================
  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step5.learningInterests}
        </label>
        <ChipSelector
          options={learningInterestOptions[lang]}
          selected={data.learningInterests}
          onSelect={(v) => updateData('learningInterests', v as string[])}
          multi
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step5.learningFormat}
        </label>
        <ChipSelector
          options={learningFormatOptions[lang]}
          selected={data.learningFormat}
          onSelect={(v) => updateData('learningFormat', v as string[])}
          multi
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step5.learningGoal}
        </label>
        <ChipSelector
          options={learningGoalOptions[lang]}
          selected={data.learningGoal}
          onSelect={(v) => updateData('learningGoal', v as string)}
        />
      </div>
    </div>
  );

  // ============================================
  // Step 6: Certifications
  // ============================================
  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step6.currentCertifications}
        </label>
        <ChipSelector
          options={currentCertificationOptions[lang]}
          selected={data.currentCertifications}
          onSelect={(v) => updateData('currentCertifications', v as string[])}
          multi
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step6.certificationInterests}
        </label>
        <ChipSelector
          options={certificationOptions[lang]}
          selected={data.certificationInterests}
          onSelect={(v) => updateData('certificationInterests', v as string[])}
          multi
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">
          {t.step6.certificationTimeline}
        </label>
        <ChipSelector
          options={certificationTimelineOptions[lang]}
          selected={data.certificationTimeline}
          onSelect={(v) => updateData('certificationTimeline', v as string)}
        />
      </div>
    </div>
  );

  // ============================================
  // Step 7: Summary / Done
  // ============================================
  const renderStep7 = () => (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center shadow-xl shadow-purple-500/30">
          <Rocket className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.organizationName && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">{t.steps[0].label}</span>
            </div>
            <p className="text-white font-semibold">{data.organizationName}</p>
            {data.primaryPurpose && <p className="text-slate-400 text-sm mt-1">{data.primaryPurpose}</p>}
          </div>
        )}
        {data.governanceNeeds.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">{t.steps[1].label}</span>
            </div>
            <p className="text-white font-semibold">
              {data.governanceNeeds.length} {lang === 'nl' ? 'governance gebieden' : 'governance areas'}
            </p>
            {data.boardStructure && <p className="text-slate-400 text-sm mt-1">{data.boardStructure}</p>}
          </div>
        )}
        {data.programMethodologies.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">{t.steps[2].label}</span>
            </div>
            <p className="text-white font-semibold">
              {data.programMethodologies.map((id) =>
                programMethodologyOptions.find((o) => o.id === id)?.name
              ).filter(Boolean).join(', ')}
            </p>
            {data.programScale && <p className="text-slate-400 text-sm mt-1">{data.programScale}</p>}
          </div>
        )}
        {data.projectMethodologies.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FolderKanban className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">{t.steps[3].label}</span>
            </div>
            <p className="text-white font-semibold">
              {data.projectMethodologies.map((id) =>
                projectMethodologyOptions.find((o) => o.id === id)?.name
              ).filter(Boolean).join(', ')}
            </p>
            {data.teamSize && <p className="text-slate-400 text-sm mt-1">{data.teamSize}</p>}
          </div>
        )}
        {data.learningInterests.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">{t.steps[4].label}</span>
            </div>
            <p className="text-white font-semibold">
              {data.learningInterests.length} {lang === 'nl' ? 'leeronderwerpen' : 'learning topics'}
            </p>
            {data.learningGoal && <p className="text-slate-400 text-sm mt-1">{data.learningGoal}</p>}
          </div>
        )}
        {data.certificationInterests.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">{t.steps[5].label}</span>
            </div>
            <p className="text-white font-semibold">
              {data.certificationInterests.length} {lang === 'nl' ? 'certificeringen' : 'certifications'}
            </p>
            {data.certificationTimeline && <p className="text-slate-400 text-sm mt-1">{data.certificationTimeline}</p>}
          </div>
        )}
      </div>

      {/* Features list */}
      <div className="bg-gradient-to-br from-purple-900/30 to-slate-800/50 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-white font-semibold">
            {lang === 'nl' ? 'Wat we voor u hebben klaargezet' : 'What we\'ve set up for you'}
          </span>
        </div>
        <ul className="space-y-3">
          {t.step7.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={handleComplete}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl h-14 text-lg font-semibold gap-3 shadow-xl shadow-purple-500/25"
      >
        <Rocket className="w-5 h-5" />
        {t.step7.startButton}
      </Button>
    </div>
  );

  const stepRenderers = [
    renderStep1, renderStep2, renderStep3, renderStep4,
    renderStep5, renderStep6, renderStep7,
  ];

  const stepTitles = [
    t.step1, t.step2, t.step3, t.step4,
    t.step5, t.step6, t.step7,
  ];

  const currentStepData = stepTitles[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">ProjeXtPal</span>
              <span className="text-xs block text-purple-400 font-semibold -mt-0.5 tracking-wider uppercase">
                {lang === 'nl' ? 'Omgeving instellen' : 'Setup Wizard'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{stepOfText}</span>
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-slate-400 hover:text-white text-sm"
            >
              {t.skip}
            </Button>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="border-b border-slate-800 bg-slate-900/50 py-4">
        {renderStepper()}
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Step Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            {(() => {
              const Icon = stepIcons[currentStep];
              return <Icon className="w-8 h-8 text-purple-400" />;
            })()}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {currentStepData.title}
          </h1>
          <p className="text-slate-400">{currentStepData.subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          {stepRenderers[currentStep]()}
        </div>

        {/* Navigation */}
        {!isLastStep && (
          <div className="flex justify-between mt-6">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="ghost"
              className="text-slate-400 hover:text-white gap-2 disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.previous}
            </Button>
            <Button
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 gap-2"
            >
              {t.next}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default OnboardingWizard;
