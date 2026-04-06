import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import nl from '../i18n/nl.json';
import en from '../i18n/en.json';

// ===== i18n INITIALIZATION =====
let i18nInitialized = false; // Module-level flag

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@projextpal_language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      const deviceLanguage = Localization.locale.split('-')[0];
      callback(deviceLanguage);
    } catch (error) {
      callback('nl');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('@projextpal_language', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};

// Initialize only once using module flag
if (!i18nInitialized) {
  try {
    i18n
      .use(languageDetector)
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v3',
        resources: {
          nl: { translation: nl },
          en: { translation: en },
        },
        fallbackLng: 'nl',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
    
    i18nInitialized = true;
    console.log('✅ i18n initialized');
  } catch (error) {
    console.log('⚠️ i18n init error (might already be initialized):', error);
  }
}
// ===== END i18n INITIALIZATION =====

type Language = 'nl' | 'en';

interface Translations {
  // Navigation
  home: string;
  dashboard: string;
  projects: string;
  programs: string;
  budget: string;
  risks: string;
  team: string;
  academy: string;
  courses: string;
  profile: string;
  settings: string;
  aiChat: string;
  timeTracking: string;
  admin: string;
  
  // Common
  loading: string;
  error: string;
  retry: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
  all: string;
  active: string;
  completed: string;
  pending: string;
  inProgress: string;
  
  // Dashboard
  welcome: string;
  overview: string;
  totalProjects: string;
  totalPrograms: string;
  atRisk: string;
  onTrack: string;
  
  // Projects
  projectDetails: string;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: string;
  tasks: string;
  teamMembers: string;
  
  // Programs
  programDetails: string;
  programName: string;
  methodology: string;
  projectCount: string;
  totalBudget: string;
  
  // Budget
  budgetOverview: string;
  allocated: string;
  spent: string;
  remaining: string;
  categories: string;
  
  // Risks
  riskDetails: string;
  riskLevel: string;
  probability: string;
  impact: string;
  mitigation: string;
  high: string;
  medium: string;
  low: string;
  
  // Academy/Courses
  courseDetails: string;
  duration: string;
  lessons: string;
  enrolled: string;
  certificate: string;
  startCourse: string;
  continueCourse: string;
  
  // Profile
  personalInfo: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  logout: string;
  
  // Settings
  language: string;
  notifications: string;
  darkMode: string;
  about: string;
  version: string;
  
  // Time Tracking
  timeEntries: string;
  hours: string;
  today: string;
  thisWeek: string;
  thisMonth: string;
  logTime: string;
}

const translations: Record<Language, Translations> = {
  nl: {
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    projects: 'Projecten',
    programs: "Programma's",
    budget: 'Budget',
    risks: "Risico's",
    team: 'Team',
    academy: 'Academy',
    courses: 'Cursussen',
    profile: 'Profiel',
    settings: 'Instellingen',
    aiChat: 'AI Chat',
    timeTracking: 'Urenregistratie',
    admin: 'Admin',
    
    // Common
    loading: 'Laden...',
    error: 'Er is een fout opgetreden',
    retry: 'Opnieuw proberen',
    save: 'Opslaan',
    cancel: 'Annuleren',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    add: 'Toevoegen',
    search: 'Zoeken',
    filter: 'Filter',
    all: 'Alles',
    active: 'Actief',
    completed: 'Voltooid',
    pending: 'In afwachting',
    inProgress: 'In uitvoering',
    
    // Dashboard
    welcome: 'Welkom',
    overview: 'Overzicht',
    totalProjects: 'Totaal projecten',
    totalPrograms: "Totaal programma's",
    atRisk: 'Risico',
    onTrack: 'Op schema',
    
    // Projects
    projectDetails: 'Projectdetails',
    projectName: 'Projectnaam',
    description: 'Beschrijving',
    startDate: 'Startdatum',
    endDate: 'Einddatum',
    status: 'Status',
    progress: 'Voortgang',
    tasks: 'Taken',
    teamMembers: 'Teamleden',
    
    // Programs
    programDetails: 'Programmadetails',
    programName: 'Programmanaam',
    methodology: 'Methodologie',
    projectCount: 'Aantal projecten',
    totalBudget: 'Totaal budget',
    
    // Budget
    budgetOverview: 'Budget overzicht',
    allocated: 'Toegewezen',
    spent: 'Uitgegeven',
    remaining: 'Resterend',
    categories: 'Categorieën',
    
    // Risks
    riskDetails: 'Risicodetails',
    riskLevel: 'Risiconiveau',
    probability: 'Waarschijnlijkheid',
    impact: 'Impact',
    mitigation: 'Mitigatie',
    high: 'Hoog',
    medium: 'Gemiddeld',
    low: 'Laag',
    
    // Academy/Courses
    courseDetails: 'Cursusdetails',
    duration: 'Duur',
    lessons: 'Lessen',
    enrolled: 'Ingeschreven',
    certificate: 'Certificaat',
    startCourse: 'Start cursus',
    continueCourse: 'Ga verder',
    
    // Profile
    personalInfo: 'Persoonlijke informatie',
    email: 'E-mail',
    phone: 'Telefoon',
    role: 'Rol',
    department: 'Afdeling',
    logout: 'Uitloggen',
    
    // Settings
    language: 'Taal',
    notifications: 'Meldingen',
    darkMode: 'Donkere modus',
    about: 'Over',
    version: 'Versie',
    
    // Time Tracking
    timeEntries: 'Tijdregistraties',
    hours: 'Uren',
    today: 'Vandaag',
    thisWeek: 'Deze week',
    thisMonth: 'Deze maand',
    logTime: 'Tijd registreren',
  },
  en: {
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    projects: 'Projects',
    programs: 'Programs',
    budget: 'Budget',
    risks: 'Risks',
    team: 'Team',
    academy: 'Academy',
    courses: 'Courses',
    profile: 'Profile',
    settings: 'Settings',
    aiChat: 'AI Chat',
    timeTracking: 'Time Tracking',
    admin: 'Admin',
    
    // Common
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    pending: 'Pending',
    inProgress: 'In Progress',
    
    // Dashboard
    welcome: 'Welcome',
    overview: 'Overview',
    totalProjects: 'Total Projects',
    totalPrograms: 'Total Programs',
    atRisk: 'At Risk',
    onTrack: 'On Track',
    
    // Projects
    projectDetails: 'Project Details',
    projectName: 'Project Name',
    description: 'Description',
    startDate: 'Start Date',
    endDate: 'End Date',
    status: 'Status',
    progress: 'Progress',
    tasks: 'Tasks',
    teamMembers: 'Team Members',
    
    // Programs
    programDetails: 'Program Details',
    programName: 'Program Name',
    methodology: 'Methodology',
    projectCount: 'Project Count',
    totalBudget: 'Total Budget',
    
    // Budget
    budgetOverview: 'Budget Overview',
    allocated: 'Allocated',
    spent: 'Spent',
    remaining: 'Remaining',
    categories: 'Categories',
    
    // Risks
    riskDetails: 'Risk Details',
    riskLevel: 'Risk Level',
    probability: 'Probability',
    impact: 'Impact',
    mitigation: 'Mitigation',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    
    // Academy/Courses
    courseDetails: 'Course Details',
    duration: 'Duration',
    lessons: 'Lessons',
    enrolled: 'Enrolled',
    certificate: 'Certificate',
    startCourse: 'Start Course',
    continueCourse: 'Continue',
    
    // Profile
    personalInfo: 'Personal Information',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    department: 'Department',
    logout: 'Logout',
    
    // Settings
    language: 'Language',
    notifications: 'Notifications',
    darkMode: 'Dark Mode',
    about: 'About',
    version: 'Version',
    
    // Time Tracking
    timeEntries: 'Time Entries',
    hours: 'Hours',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    logTime: 'Log Time',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;  // ⬅️ Changed to i18n's t function
  isNL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = '@projextpal_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('nl');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage === 'nl' || savedLanguage === 'en') {
        setLanguageState(savedLanguage);
        await i18n.changeLanguage(savedLanguage); // ⬅️ Sync with i18n
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      await i18n.changeLanguage(lang); // ⬅️ Update i18n
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: (key: string, options?: any) => i18n.t(key, options), // ⬅️ Use i18n's t function
    isNL: language === 'nl',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default i18n; // ⬅️ Only ONE default export
