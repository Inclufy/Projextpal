// ============================================
// ACADEMY CATEGORIES
// ============================================

import { Category } from './types';

export const categories: Category[] = [
  {
    id: 'all',
    labelEN: 'All Courses',
    labelNL: 'Alle Cursussen',
    description: 'Browse all available courses',
    descriptionNL: 'Bekijk alle beschikbare cursussen',
  },
  {
    id: 'fundamentals',
    labelEN: 'Fundamentals',
    labelNL: 'Basis',
    description: 'Core project management concepts and skills',
    descriptionNL: 'Kernconcepten en vaardigheden voor projectmanagement',
  },
  {
    id: 'methodologies',
    labelEN: 'Methodologies',
    labelNL: 'Methodologieën',
    description: 'Learn specific PM frameworks and approaches',
    descriptionNL: 'Leer specifieke PM-frameworks en benaderingen',
  },
  {
    id: 'leadership',
    labelEN: 'Leadership',
    labelNL: 'Leiderschap',
    description: 'Develop leadership and soft skills',
    descriptionNL: 'Ontwikkel leiderschap en soft skills',
  },
  {
    id: 'tools',
    labelEN: 'Tools & Software',
    labelNL: 'Tools & Software',
    description: 'Master PM tools and software',
    descriptionNL: 'Beheers PM-tools en software',
  },
  {
    id: 'certification',
    labelEN: 'Certification Prep',
    labelNL: 'Certificering',
    description: 'Prepare for professional certifications',
    descriptionNL: 'Bereid je voor op professionele certificeringen',
  },
  {
    id: 'advanced',
    labelEN: 'Advanced',
    labelNL: 'Gevorderd',
    description: 'Advanced topics for experienced PMs',
    descriptionNL: 'Geavanceerde onderwerpen voor ervaren PMs',
  },
];

// Helper function to get category by ID
export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

// Helper function to get category label
export const getCategoryLabel = (id: string, language: 'en' | 'nl' = 'en'): string => {
  const category = getCategoryById(id);
  if (!category) return id;
  return language === 'nl' ? category.labelNL : category.labelEN;
};

export default categories;