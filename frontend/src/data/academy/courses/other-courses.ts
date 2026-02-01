// ============================================
// OTHER COURSES (Without full modules yet)
// ============================================
import { Users, Shield, Building2, GitBranch, FolderKanban, Award, Compass } from 'lucide-react';
import { Course } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// STAKEHOLDER MANAGEMENT
// ============================================
export const stakeholderManagementCourse: Course = {
  id: 'stakeholder-management',
  title: 'Stakeholder Management',
  titleNL: 'Stakeholder Management',
  description: 'Master the art of managing stakeholder expectations and building relationships.',
  descriptionNL: 'Beheers de kunst van stakeholder verwachtingen managen en relaties bouwen.',
  icon: Users,
  color: BRAND.emerald,
  gradient: `linear-gradient(135deg, ${BRAND.emerald}, #047857)`,
  category: 'leadership',
  methodology: 'generic',
  levels: 3,
  modules: 12,
  duration: 6,
  rating: 4.7,
  students: 3456,
  tags: ['Stakeholders', 'Communication', 'Influence', 'Engagement', 'Matrix'],
  tagsNL: ['Stakeholders', 'Communicatie', 'Invloed', 'Engagement', 'Matrix'],
  instructor: instructors.sarah,
  freeForCustomers: true,
  certificate: true,
  // courseModules: TODO - Add modules
};

// ============================================
// RISK MANAGEMENT
// ============================================
export const riskManagementCourse: Course = {
  id: 'risk-management',
  title: 'Risk Management Professional',
  titleNL: 'Risk Management Professional',
  description: 'Identify, analyze, and mitigate project risks like a pro.',
  descriptionNL: 'Identificeer, analyseer en mitigeer projectrisico\'s als een professional.',
  icon: Shield,
  color: BRAND.red,
  gradient: `linear-gradient(135deg, ${BRAND.red}, #DC2626)`,
  category: 'fundamentals',
  methodology: 'generic',
  levels: 3,
  modules: 15,
  duration: 8,
  rating: 4.6,
  students: 2890,
  tags: ['Risk', 'Analysis', 'Mitigation', 'Register', 'Response'],
  tagsNL: ['Risico', 'Analyse', 'Mitigatie', 'Register', 'Response'],
  instructor: instructors.peter,
  freeForCustomers: true,
  certificate: true,
};

// ============================================
// SAFe FUNDAMENTALS
// ============================================
export const safeFundamentalsCourse: Course = {
  id: 'safe-fundamentals',
  title: 'SAFe Fundamentals',
  titleNL: 'SAFe Fundamentals',
  description: 'Scale Agile across your enterprise with the Scaled Agile Framework.',
  descriptionNL: 'Schaal Agile in je organisatie met het Scaled Agile Framework.',
  icon: Building2,
  color: BRAND.blue,
  gradient: `linear-gradient(135deg, ${BRAND.blue}, #1D4ED8)`,
  category: 'agile',
  methodology: 'safe',
  levels: 4,
  modules: 24,
  duration: 16,
  rating: 4.5,
  students: 2345,
  tags: ['SAFe', 'Scaling', 'Enterprise', 'PI Planning', 'ART'],
  tagsNL: ['SAFe', 'Schalen', 'Enterprise', 'PI Planning', 'ART'],
  instructor: instructors.martijn,
  new: true,
  freeForCustomers: true,
  certificate: true,
};

// ============================================
// HYBRID PM
// ============================================
export const hybridPmCourse: Course = {
  id: 'hybrid-pm',
  title: 'Hybrid Project Management',
  titleNL: 'Hybride Projectmanagement',
  description: 'Combine the best of Agile and traditional approaches for maximum flexibility.',
  descriptionNL: 'Combineer het beste van Agile en traditionele aanpakken voor maximale flexibiliteit.',
  icon: GitBranch,
  color: BRAND.purple,
  gradient: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`,
  category: 'fundamentals',
  methodology: 'hybrid',
  levels: 3,
  modules: 18,
  duration: 10,
  rating: 4.7,
  students: 1987,
  tags: ['Hybrid', 'Agile', 'Waterfall', 'Flexibility', 'Adaptive'],
  tagsNL: ['Hybride', 'Agile', 'Waterfall', 'Flexibiliteit', 'Adaptief'],
  instructor: instructors.sarah,
  new: true,
  freeForCustomers: true,
  certificate: true,
};

// ============================================
// MSP PROGRAM MANAGEMENT
// ============================================
export const mspFoundationCourse: Course = {
  id: 'msp-foundation',
  title: 'MSP Program Management',
  titleNL: 'MSP Programmamanagement',
  description: 'Managing Successful Programmes - coordinate multiple projects for strategic outcomes.',
  descriptionNL: 'Managing Successful Programmes - coördineer meerdere projecten voor strategische resultaten.',
  icon: FolderKanban,
  color: BRAND.amber,
  gradient: `linear-gradient(135deg, ${BRAND.amber}, #B45309)`,
  category: 'traditional',
  methodology: 'msp',
  levels: 4,
  modules: 22,
  duration: 16,
  rating: 4.6,
  students: 1654,
  tags: ['MSP', 'Programme', 'Benefits', 'Governance', 'Transformation'],
  tagsNL: ['MSP', 'Programma', 'Benefits', 'Governance', 'Transformatie'],
  instructor: instructors.erik,
  freeForCustomers: true,
  certificate: true,
};

// ============================================
// PMP CERTIFICATION PREP
// ============================================
export const pmpCertificationCourse: Course = {
  id: 'pmi-pmp',
  title: 'PMI PMP Certification Prep',
  titleNL: 'PMI PMP Certificering Prep',
  description: 'Prepare for the Project Management Professional certification exam.',
  descriptionNL: 'Bereid je voor op het PMP certificeringsexamen.',
  icon: Award,
  color: BRAND.emerald,
  gradient: `linear-gradient(135deg, ${BRAND.emerald}, #065F46)`,
  category: 'fundamentals',
  methodology: 'pmi',
  levels: 4,
  modules: 30,
  duration: 35,
  rating: 4.8,
  students: 4567,
  tags: ['PMP', 'PMI', 'PMBOK', 'Certification', 'Exam Prep'],
  tagsNL: ['PMP', 'PMI', 'PMBOK', 'Certificering', 'Examenvoorbereiding'],
  instructor: instructors.sarah,
  bestseller: true,
  freeForCustomers: true,
  certificate: true,
};

// ============================================
// PROJECT LEADERSHIP
// ============================================
export const pmLeadershipCourse: Course = {
  id: 'pm-leadership',
  title: 'Project Leadership Excellence',
  titleNL: 'Project Leadership Excellence',
  description: 'Develop your leadership skills to inspire and motivate project teams.',
  descriptionNL: 'Ontwikkel je leiderschapsvaardigheden om projectteams te inspireren en motiveren.',
  icon: Compass,
  color: BRAND.orange,
  gradient: `linear-gradient(135deg, ${BRAND.orange}, #C2410C)`,
  category: 'leadership',
  methodology: 'generic',
  levels: 3,
  modules: 14,
  duration: 8,
  rating: 4.8,
  students: 3211,
  tags: ['Leadership', 'Motivation', 'Team', 'Influence', 'Communication'],
  tagsNL: ['Leiderschap', 'Motivatie', 'Team', 'Invloed', 'Communicatie'],
  instructor: instructors.martijn,
  featured: true,
  freeForCustomers: true,
  certificate: true,
};

// Export all
export const otherCourses = [
  stakeholderManagementCourse,
  riskManagementCourse,
  safeFundamentalsCourse,
  hybridPmCourse,
  mspFoundationCourse,
  pmpCertificationCourse,
  pmLeadershipCourse,
];
