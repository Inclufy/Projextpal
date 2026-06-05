import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Sparkles,
  Loader2,
  X,
  Maximize2,
  Minimize2,
  FolderKanban,
  Building2,
  ListChecks,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Plus,
  MessageSquare,
  HelpCircle,
  Play,
  Info,
  ArrowRight,
  Lightbulb,
  Target,
  Users,
  Settings,
  Shield,
  BookOpen,
  Calendar,
  Compass,
  Map,
  ExternalLink,
  Layout,
  FileText,
  Clock,
  GraduationCap,
  Kanban,
  Layers,
  GitBranch,
  Workflow,
  CheckCircle2,
  Brain,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import DynamicForm from "@/components/chat/DynamicForm";
import { AIMessageRenderer } from "@/components/AIMessageRenderer";
import { useCopilot } from "@/contexts/CopilotContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";
import { GuidedTour, type TourStep } from "@/components/GuidedTour";
import { IssuesTab } from "@/components/copilot/IssuesTab";

/* ─── Types ─── */
type CopilotTab = "chat" | "guide" | "setup" | "issues";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  formSchema?: any;
}

interface ChatResponse {
  id: number;
  title: string;
  updated_at: string;
  messages: Array<{
    id: number;
    role: string;
    content: string;
    created_at: string;
    original_ai_response?: string;
  }>;
}

interface SendMessageResponse {
  user_message: { id: number; content: string };
  ai_response: { id: number; content: string; original_ai_response?: string };
}

/* ═══════════════════════════════════════════════════════════════════
   GUIDE CONTENT — per-page user guide with features, how-tos, tips
   ═══════════════════════════════════════════════════════════════════ */

interface GuideFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Optional in-app navigation target; when set the feature card becomes clickable. */
  path?: string;
}

interface GuideHowTo {
  title: string;
  steps: string[];
}

interface GuideContent {
  pageTitle: string;
  pageDescription: string;
  features: GuideFeature[];
  howTos: GuideHowTo[];
  tips: string[];
  tourSteps: TourStep[];
}

/* ─── Multilingual source shapes ───
   Guides are authored once with NL/EN/FR variants per string, then resolved to
   a single language at render time via resolveGuide(). This keeps icons + deep
   links defined once (single source of truth) while supporting all 3 languages. */
type GuideLang = "nl" | "en" | "fr";
/** Localized string: { nl, en, fr }. */
type L = { nl: string; en: string; fr: string };

interface RawFeature { icon: LucideIcon; title: L; description: L; path?: string; }
interface RawHowTo { title: L; steps: L[]; }
interface RawTourStep { title: L; description: L; }
interface RawGuide {
  pageTitle: L;
  pageDescription: L;
  features: RawFeature[];
  howTos: RawHowTo[];
  tips: L[];
  tourSteps: RawTourStep[];
}

const pickL = (l: L, lang: GuideLang): string => l[lang] || l.en || l.nl;
const resolveGuide = (raw: RawGuide, lang: GuideLang): GuideContent => ({
  pageTitle: pickL(raw.pageTitle, lang),
  pageDescription: pickL(raw.pageDescription, lang),
  features: raw.features.map((f) => ({ icon: f.icon, title: pickL(f.title, lang), description: pickL(f.description, lang), path: f.path })),
  howTos: raw.howTos.map((h) => ({ title: pickL(h.title, lang), steps: h.steps.map((s) => pickL(s, lang)) })),
  tips: raw.tips.map((t) => pickL(t, lang)),
  tourSteps: raw.tourSteps.map((t) => ({ title: pickL(t.title, lang), description: pickL(t.description, lang) })),
});

const GUIDE_MAP: Record<string, RawGuide> = {
  "/dashboard": {
    pageTitle: { nl: "Dashboard", en: "Dashboard", fr: "Tableau de bord" },
    pageDescription: {
      nl: "Uw centrale project cockpit met overzicht van alle projecten, programma's en taken.",
      en: "Your central project cockpit with an overview of all projects, programmes and tasks.",
      fr: "Votre cockpit de projet central avec une vue d'ensemble de tous les projets, programmes et tâches.",
    },
    features: [
      { icon: BarChart3, title: { nl: "Project overzicht", en: "Project overview", fr: "Aperçu des projets" }, description: { nl: "Status van al uw projecten in één oogopslag", en: "Status of all your projects at a glance", fr: "Statut de tous vos projets en un coup d'œil" } },
      { icon: ListChecks, title: { nl: "Taken & deadlines", en: "Tasks & deadlines", fr: "Tâches et échéances" }, description: { nl: "Openstaande taken en naderende deadlines", en: "Open tasks and upcoming deadlines", fr: "Tâches en cours et échéances à venir" } },
      { icon: TrendingUp, title: { nl: "Voortgang", en: "Progress", fr: "Progression" }, description: { nl: "Voortgangsgrafieken en burndown charts", en: "Progress graphs and burndown charts", fr: "Graphiques de progression et burndown" } },
      { icon: AlertTriangle, title: { nl: "Risico's & alerts", en: "Risks & alerts", fr: "Risques et alertes" }, description: { nl: "Waarschuwingen voor projectrisico's", en: "Warnings for project risks", fr: "Alertes pour les risques du projet" } },
    ],
    howTos: [
      { title: { nl: "Dashboard gebruiken", en: "Using the dashboard", fr: "Utiliser le tableau de bord" }, steps: [
        { nl: "Bekijk projectstatus kaarten bovenaan", en: "Review the project status cards at the top", fr: "Consultez les cartes de statut des projets en haut" },
        { nl: "Scroll voor taak- en deadlineoverzicht", en: "Scroll for the task and deadline overview", fr: "Faites défiler pour l'aperçu des tâches et échéances" },
        { nl: "Klik op een project voor details", en: "Click a project for details", fr: "Cliquez sur un projet pour les détails" },
        { nl: "Gebruik filters voor specifieke weergaven", en: "Use filters for specific views", fr: "Utilisez les filtres pour des vues spécifiques" },
      ] },
    ],
    tips: [
      { nl: "Check uw dashboard dagelijks voor actuele projectstatus.", en: "Check your dashboard daily for the current project status.", fr: "Consultez votre tableau de bord quotidiennement pour le statut actuel des projets." },
      { nl: "Klik op risico-alerts voor directe actie.", en: "Click risk alerts for immediate action.", fr: "Cliquez sur les alertes de risque pour une action immédiate." },
      { nl: "Gebruik de AI Copilot voor snelle projectinzichten.", en: "Use the AI Copilot for quick project insights.", fr: "Utilisez l'AI Copilot pour des analyses de projet rapides." },
    ],
    tourSteps: [
      { title: { nl: "Welkom op het Dashboard", en: "Welcome to the Dashboard", fr: "Bienvenue sur le tableau de bord" }, description: { nl: "Dit is uw centrale project cockpit. Hier ziet u alle belangrijke projectinformatie.", en: "This is your central project cockpit. Here you see all key project information.", fr: "Voici votre cockpit de projet central. Vous y trouvez toutes les informations clés du projet." } },
    ],
  },
  "/projects": {
    pageTitle: { nl: "Projecten", en: "Projects", fr: "Projets" },
    pageDescription: {
      nl: "Beheer al uw projecten met ondersteuning voor Scrum, Kanban, PRINCE2, Waterfall en meer.",
      en: "Manage all your projects with support for Scrum, Kanban, PRINCE2, Waterfall and more.",
      fr: "Gérez tous vos projets avec la prise en charge de Scrum, Kanban, PRINCE2, Waterfall et plus.",
    },
    features: [
      { icon: FolderKanban, title: { nl: "Project portfolio", en: "Project portfolio", fr: "Portefeuille de projets" }, description: { nl: "Overzicht van alle projecten met status en voortgang", en: "Overview of all projects with status and progress", fr: "Aperçu de tous les projets avec statut et progression" } },
      { icon: Layers, title: { nl: "Methodologie keuze", en: "Methodology choice", fr: "Choix de méthodologie" }, description: { nl: "Kies de juiste methodologie per project", en: "Choose the right methodology per project", fr: "Choisissez la bonne méthodologie par projet" } },
      { icon: Users, title: { nl: "Team toewijzing", en: "Team assignment", fr: "Affectation d'équipe" }, description: { nl: "Wijs teamleden toe aan projecten", en: "Assign team members to projects", fr: "Affectez des membres d'équipe aux projets" } },
      { icon: Target, title: { nl: "Doelen & KPI's", en: "Goals & KPIs", fr: "Objectifs et KPI" }, description: { nl: "Stel projectdoelen en meetbare KPI's in", en: "Set project goals and measurable KPIs", fr: "Définissez des objectifs et des KPI mesurables" } },
    ],
    howTos: [
      { title: { nl: "Project aanmaken", en: "Create a project", fr: "Créer un projet" }, steps: [
        { nl: "Klik op '+ Nieuw Project'", en: "Click '+ New Project'", fr: "Cliquez sur '+ Nouveau projet'" },
        { nl: "Vul projectnaam en beschrijving in", en: "Enter the project name and description", fr: "Saisissez le nom et la description du projet" },
        { nl: "Selecteer de methodologie (Scrum, Kanban, etc.)", en: "Select the methodology (Scrum, Kanban, etc.)", fr: "Sélectionnez la méthodologie (Scrum, Kanban, etc.)" },
        { nl: "Stel het team en de planning in", en: "Set up the team and the schedule", fr: "Configurez l'équipe et le planning" },
        { nl: "Klik op Aanmaken", en: "Click Create", fr: "Cliquez sur Créer" },
      ] },
      { title: { nl: "Project bekijken", en: "View a project", fr: "Consulter un projet" }, steps: [
        { nl: "Klik op een project in de lijst", en: "Click a project in the list", fr: "Cliquez sur un projet dans la liste" },
        { nl: "Bekijk de project details en voortgang", en: "Review the project details and progress", fr: "Consultez les détails et la progression du projet" },
        { nl: "Navigeer via het submenu naar specifieke onderdelen", en: "Navigate via the submenu to specific sections", fr: "Naviguez via le sous-menu vers des sections spécifiques" },
        { nl: "Gebruik de methodologie-specifieke tools", en: "Use the methodology-specific tools", fr: "Utilisez les outils propres à la méthodologie" },
      ] },
    ],
    tips: [
      { nl: "Kies de juiste methodologie bij aanvang — later wijzigen is complex.", en: "Choose the right methodology at the start — changing it later is complex.", fr: "Choisissez la bonne méthodologie dès le départ — la changer ensuite est complexe." },
      { nl: "Stel altijd een project charter op als fundament.", en: "Always draft a project charter as a foundation.", fr: "Rédigez toujours une charte de projet comme fondation." },
      { nl: "Gebruik de AI Copilot voor risico-analyse en advies.", en: "Use the AI Copilot for risk analysis and advice.", fr: "Utilisez l'AI Copilot pour l'analyse des risques et des conseils." },
    ],
    tourSteps: [
      { title: { nl: "Projecten", en: "Projects", fr: "Projets" }, description: { nl: "Hier beheert u al uw projecten en kiest u de juiste aanpak.", en: "Here you manage all your projects and choose the right approach.", fr: "Ici, vous gérez tous vos projets et choisissez la bonne approche." } },
    ],
  },
  "/programs": {
    pageTitle: { nl: "Programma's", en: "Programmes", fr: "Programmes" },
    pageDescription: {
      nl: "Beheer programma's die meerdere gerelateerde projecten bundelen (SAFe, MSP, PMI, PRINCE2).",
      en: "Manage programmes that bundle multiple related projects (SAFe, MSP, PMI, PRINCE2).",
      fr: "Gérez des programmes regroupant plusieurs projets liés (SAFe, MSP, PMI, PRINCE2).",
    },
    features: [
      { icon: Building2, title: { nl: "Programma portfolio", en: "Programme portfolio", fr: "Portefeuille de programmes" }, description: { nl: "Overzicht van alle programma's", en: "Overview of all programmes", fr: "Aperçu de tous les programmes" } },
      { icon: GitBranch, title: { nl: "Project bundeling", en: "Project bundling", fr: "Regroupement de projets" }, description: { nl: "Groepeer gerelateerde projecten", en: "Group related projects", fr: "Regroupez les projets liés" } },
      { icon: Target, title: { nl: "Benefits management", en: "Benefits management", fr: "Gestion des bénéfices" }, description: { nl: "Track programma-baten en waarderealisatie", en: "Track programme benefits and value realisation", fr: "Suivez les bénéfices du programme et la réalisation de valeur" } },
      { icon: Users, title: { nl: "Stakeholder management", en: "Stakeholder management", fr: "Gestion des parties prenantes" }, description: { nl: "Beheer stakeholders op programmaniveau", en: "Manage stakeholders at programme level", fr: "Gérez les parties prenantes au niveau du programme" } },
    ],
    howTos: [
      { title: { nl: "Programma aanmaken", en: "Create a programme", fr: "Créer un programme" }, steps: [
        { nl: "Klik op '+ Nieuw Programma'", en: "Click '+ New Programme'", fr: "Cliquez sur '+ Nouveau programme'" },
        { nl: "Kies de programma-methodologie (SAFe, MSP, etc.)", en: "Choose the programme methodology (SAFe, MSP, etc.)", fr: "Choisissez la méthodologie du programme (SAFe, MSP, etc.)" },
        { nl: "Vul naam en doelstelling in", en: "Enter the name and objective", fr: "Saisissez le nom et l'objectif" },
        { nl: "Wijs projecten toe aan het programma", en: "Assign projects to the programme", fr: "Affectez des projets au programme" },
        { nl: "Klik op Aanmaken", en: "Click Create", fr: "Cliquez sur Créer" },
      ] },
    ],
    tips: [
      { nl: "Gebruik programma's voor strategische initiatieven met meerdere projecten.", en: "Use programmes for strategic initiatives spanning multiple projects.", fr: "Utilisez les programmes pour les initiatives stratégiques à plusieurs projets." },
      { nl: "Track benefits op programmaniveau voor strategisch inzicht.", en: "Track benefits at programme level for strategic insight.", fr: "Suivez les bénéfices au niveau du programme pour une vision stratégique." },
      { nl: "Stel regelmatige governance reviews in.", en: "Set up regular governance reviews.", fr: "Planifiez des revues de gouvernance régulières." },
    ],
    tourSteps: [
      { title: { nl: "Programma's", en: "Programmes", fr: "Programmes" }, description: { nl: "Hier beheert u strategische programma's met meerdere projecten.", en: "Here you manage strategic programmes with multiple projects.", fr: "Ici, vous gérez des programmes stratégiques à plusieurs projets." } },
    ],
  },
  "/governance": {
    pageTitle: { nl: "Governance", en: "Governance", fr: "Gouvernance" },
    pageDescription: {
      nl: "Portfolio governance, boards en stakeholder management.",
      en: "Portfolio governance, boards and stakeholder management.",
      fr: "Gouvernance de portefeuille, comités et gestion des parties prenantes.",
    },
    features: [
      { icon: Shield, title: { nl: "Portfolio's", en: "Portfolios", fr: "Portefeuilles" }, description: { nl: "Beheer project portfolio's en prioritering", en: "Manage project portfolios and prioritisation", fr: "Gérez les portefeuilles de projets et la priorisation" } },
      { icon: Briefcase, title: { nl: "Boards", en: "Boards", fr: "Comités" }, description: { nl: "Governance boards en besluitvorming", en: "Governance boards and decision-making", fr: "Comités de gouvernance et prise de décision" } },
      { icon: Users, title: { nl: "Stakeholders", en: "Stakeholders", fr: "Parties prenantes" }, description: { nl: "Stakeholder analyse en communicatie", en: "Stakeholder analysis and communication", fr: "Analyse et communication des parties prenantes" } },
      { icon: BarChart3, title: { nl: "Rapportages", en: "Reports", fr: "Rapports" }, description: { nl: "Governance rapportages en dashboards", en: "Governance reports and dashboards", fr: "Rapports et tableaux de bord de gouvernance" } },
    ],
    howTos: [
      { title: { nl: "Portfolio beheren", en: "Manage a portfolio", fr: "Gérer un portefeuille" }, steps: [
        { nl: "Ga naar Governance → Portfolio's", en: "Go to Governance → Portfolios", fr: "Allez dans Gouvernance → Portefeuilles" },
        { nl: "Bekijk de portfolio matrix", en: "Review the portfolio matrix", fr: "Consultez la matrice de portefeuille" },
        { nl: "Prioriteer projecten op basis van waarde en risico", en: "Prioritise projects by value and risk", fr: "Priorisez les projets selon la valeur et le risque" },
        { nl: "Neem portfolio-beslissingen", en: "Make portfolio decisions", fr: "Prenez des décisions de portefeuille" },
      ] },
    ],
    tips: [
      { nl: "Gebruik portfolio management voor strategische projectselectie.", en: "Use portfolio management for strategic project selection.", fr: "Utilisez la gestion de portefeuille pour la sélection stratégique des projets." },
      { nl: "Houd governance boards regelmatig (maandelijks) bij.", en: "Hold governance boards regularly (monthly).", fr: "Tenez des comités de gouvernance régulièrement (mensuellement)." },
      { nl: "Documenteer alle governance-beslissingen.", en: "Document all governance decisions.", fr: "Documentez toutes les décisions de gouvernance." },
    ],
    tourSteps: [
      { title: { nl: "Governance", en: "Governance", fr: "Gouvernance" }, description: { nl: "Hier beheert u portfolio governance en besluitvorming.", en: "Here you manage portfolio governance and decision-making.", fr: "Ici, vous gérez la gouvernance de portefeuille et la prise de décision." } },
    ],
  },
  "/reports": {
    pageTitle: { nl: "Rapportages", en: "Reports", fr: "Rapports" },
    pageDescription: {
      nl: "Genereer project- en programmarapportages met analyses en inzichten.",
      en: "Generate project and programme reports with analyses and insights.",
      fr: "Générez des rapports de projet et de programme avec analyses et insights.",
    },
    features: [
      { icon: FileText, title: { nl: "Standaard rapporten", en: "Standard reports", fr: "Rapports standard" }, description: { nl: "Voorgedefinieerde rapportage templates", en: "Predefined reporting templates", fr: "Modèles de rapport prédéfinis" } },
      { icon: BarChart3, title: { nl: "Dashboards", en: "Dashboards", fr: "Tableaux de bord" }, description: { nl: "Visuele project dashboards", en: "Visual project dashboards", fr: "Tableaux de bord de projet visuels" } },
      { icon: TrendingUp, title: { nl: "Trendanalyse", en: "Trend analysis", fr: "Analyse des tendances" }, description: { nl: "Projectprestaties over tijd", en: "Project performance over time", fr: "Performance du projet dans le temps" } },
      { icon: FileText, title: { nl: "Export", en: "Export", fr: "Export" }, description: { nl: "Exporteer naar PDF, Excel of PowerPoint", en: "Export to PDF, Excel or PowerPoint", fr: "Exportez vers PDF, Excel ou PowerPoint" } },
    ],
    howTos: [
      { title: { nl: "Rapport genereren", en: "Generate a report", fr: "Générer un rapport" }, steps: [
        { nl: "Open Rapportages", en: "Open Reports", fr: "Ouvrez Rapports" },
        { nl: "Selecteer het rapporttype", en: "Select the report type", fr: "Sélectionnez le type de rapport" },
        { nl: "Kies projecten en periode", en: "Choose projects and period", fr: "Choisissez les projets et la période" },
        { nl: "Genereer het rapport", en: "Generate the report", fr: "Générez le rapport" },
        { nl: "Download of deel met stakeholders", en: "Download or share with stakeholders", fr: "Téléchargez ou partagez avec les parties prenantes" },
      ] },
    ],
    tips: [
      { nl: "Genereer wekelijks statusrapporten voor stakeholders.", en: "Generate weekly status reports for stakeholders.", fr: "Générez des rapports de statut hebdomadaires pour les parties prenantes." },
      { nl: "Gebruik trendanalyses om problemen vroegtijdig te signaleren.", en: "Use trend analyses to spot problems early.", fr: "Utilisez les analyses de tendances pour repérer les problèmes tôt." },
      { nl: "Pas rapporten aan per doelgroep (stuurgroep vs. team).", en: "Tailor reports per audience (steering group vs. team).", fr: "Adaptez les rapports selon le public (comité de pilotage vs. équipe)." },
    ],
    tourSteps: [
      { title: { nl: "Rapportages", en: "Reports", fr: "Rapports" }, description: { nl: "Hier genereert u project- en programmarapportages.", en: "Here you generate project and programme reports.", fr: "Ici, vous générez des rapports de projet et de programme." } },
    ],
  },
  "/team": {
    pageTitle: { nl: "Team", en: "Team", fr: "Équipe" },
    pageDescription: {
      nl: "Beheer uw teamleden, rollen en capaciteit.",
      en: "Manage your team members, roles and capacity.",
      fr: "Gérez les membres de votre équipe, les rôles et la capacité.",
    },
    features: [
      { icon: Users, title: { nl: "Teamoverzicht", en: "Team overview", fr: "Aperçu de l'équipe" }, description: { nl: "Alle teamleden en hun rollen", en: "All team members and their roles", fr: "Tous les membres de l'équipe et leurs rôles" } },
      { icon: Target, title: { nl: "Capaciteitsplanning", en: "Capacity planning", fr: "Planification des capacités" }, description: { nl: "Beschikbaarheid en allocatie per teamlid", en: "Availability and allocation per team member", fr: "Disponibilité et allocation par membre" } },
      { icon: BarChart3, title: { nl: "Werklast", en: "Workload", fr: "Charge de travail" }, description: { nl: "Werklast verdeling over het team", en: "Workload distribution across the team", fr: "Répartition de la charge dans l'équipe" } },
      { icon: Calendar, title: { nl: "Beschikbaarheid", en: "Availability", fr: "Disponibilité" }, description: { nl: "Vakanties, verlof en beschikbaarheid", en: "Holidays, leave and availability", fr: "Congés, absences et disponibilité" } },
    ],
    howTos: [
      { title: { nl: "Teamlid toevoegen", en: "Add a team member", fr: "Ajouter un membre" }, steps: [
        { nl: "Open het Team overzicht", en: "Open the Team overview", fr: "Ouvrez l'aperçu de l'équipe" },
        { nl: "Klik op '+ Teamlid uitnodigen'", en: "Click '+ Invite team member'", fr: "Cliquez sur '+ Inviter un membre'" },
        { nl: "Vul e-mail en rol in", en: "Enter email and role", fr: "Saisissez l'e-mail et le rôle" },
        { nl: "Wijs projecten toe", en: "Assign projects", fr: "Affectez des projets" },
        { nl: "Verstuur de uitnodiging", en: "Send the invitation", fr: "Envoyez l'invitation" },
      ] },
    ],
    tips: [
      { nl: "Houd capaciteitsplanning actueel voor realistische planning.", en: "Keep capacity planning current for realistic scheduling.", fr: "Maintenez la planification des capacités à jour pour un planning réaliste." },
      { nl: "Verdeel taken gelijkmatig om overbelasting te voorkomen.", en: "Distribute tasks evenly to prevent overload.", fr: "Répartissez les tâches uniformément pour éviter la surcharge." },
      { nl: "Gebruik rollen voor duidelijke verantwoordelijkheden.", en: "Use roles for clear responsibilities.", fr: "Utilisez les rôles pour des responsabilités claires." },
    ],
    tourSteps: [
      { title: { nl: "Team", en: "Team", fr: "Équipe" }, description: { nl: "Hier beheert u uw team, rollen en capaciteit.", en: "Here you manage your team, roles and capacity.", fr: "Ici, vous gérez votre équipe, les rôles et la capacité." } },
    ],
  },
  "/time-tracking": {
    pageTitle: { nl: "Tijdregistratie", en: "Time tracking", fr: "Suivi du temps" },
    pageDescription: {
      nl: "Registreer en analyseer tijdsbesteding per project, taak en teamlid.",
      en: "Record and analyse time spent per project, task and team member.",
      fr: "Enregistrez et analysez le temps passé par projet, tâche et membre d'équipe.",
    },
    features: [
      { icon: Clock, title: { nl: "Uren registreren", en: "Log hours", fr: "Saisir les heures" }, description: { nl: "Log uren per project en taak", en: "Log hours per project and task", fr: "Saisissez les heures par projet et tâche" } },
      { icon: BarChart3, title: { nl: "Urenanalyse", en: "Hours analysis", fr: "Analyse des heures" }, description: { nl: "Analyse van tijdsbesteding per categorie", en: "Analysis of time spent per category", fr: "Analyse du temps passé par catégorie" } },
      { icon: Target, title: { nl: "Budget tracking", en: "Budget tracking", fr: "Suivi du budget" }, description: { nl: "Vergelijk bestede vs. geplande uren", en: "Compare spent vs. planned hours", fr: "Comparez les heures réelles vs. planifiées" } },
      { icon: FileText, title: { nl: "Urenstaten", en: "Timesheets", fr: "Feuilles de temps" }, description: { nl: "Genereer urenstaten en overzichten", en: "Generate timesheets and overviews", fr: "Générez des feuilles de temps et aperçus" } },
    ],
    howTos: [
      { title: { nl: "Uren loggen", en: "Log hours", fr: "Saisir des heures" }, steps: [
        { nl: "Open Tijdregistratie", en: "Open Time tracking", fr: "Ouvrez Suivi du temps" },
        { nl: "Selecteer het project en de taak", en: "Select the project and task", fr: "Sélectionnez le projet et la tâche" },
        { nl: "Vul de datum en het aantal uren in", en: "Enter the date and number of hours", fr: "Saisissez la date et le nombre d'heures" },
        { nl: "Voeg een notitie toe (optioneel)", en: "Add a note (optional)", fr: "Ajoutez une note (facultatif)" },
        { nl: "Klik op Opslaan", en: "Click Save", fr: "Cliquez sur Enregistrer" },
      ] },
    ],
    tips: [
      { nl: "Log uren dagelijks voor de meest nauwkeurige registratie.", en: "Log hours daily for the most accurate records.", fr: "Saisissez les heures chaque jour pour des relevés précis." },
      { nl: "Gebruik categorieën voor betere analyse (development, meetings, etc.).", en: "Use categories for better analysis (development, meetings, etc.).", fr: "Utilisez des catégories pour une meilleure analyse (développement, réunions, etc.)." },
      { nl: "Review wekelijks of de registratie compleet is.", en: "Review weekly whether the records are complete.", fr: "Vérifiez chaque semaine que les relevés sont complets." },
    ],
    tourSteps: [
      { title: { nl: "Tijdregistratie", en: "Time tracking", fr: "Suivi du temps" }, description: { nl: "Hier registreert en analyseert u tijdsbesteding.", en: "Here you record and analyse time spent.", fr: "Ici, vous enregistrez et analysez le temps passé." } },
    ],
  },
  "/ai-assistant": {
    pageTitle: { nl: "AI Assistent", en: "AI Assistant", fr: "Assistant IA" },
    pageDescription: {
      nl: "Uw persoonlijke AI project management assistent voor analyses en advies.",
      en: "Your personal AI project management assistant for analyses and advice.",
      fr: "Votre assistant IA personnel de gestion de projet pour analyses et conseils.",
    },
    features: [
      { icon: Brain, title: { nl: "AI Analyses", en: "AI analyses", fr: "Analyses IA" }, description: { nl: "Automatische project analyses en inzichten", en: "Automatic project analyses and insights", fr: "Analyses et insights de projet automatiques" } },
      { icon: AlertTriangle, title: { nl: "Risico detectie", en: "Risk detection", fr: "Détection des risques" }, description: { nl: "AI identificeert risico's proactief", en: "AI proactively identifies risks", fr: "L'IA identifie les risques de manière proactive" } },
      { icon: Lightbulb, title: { nl: "Advies", en: "Advice", fr: "Conseils" }, description: { nl: "AI-gestuurde aanbevelingen per project", en: "AI-driven recommendations per project", fr: "Recommandations basées sur l'IA par projet" } },
      { icon: FileText, title: { nl: "Rapportage", en: "Reporting", fr: "Rapports" }, description: { nl: "Automatisch gegenereerde rapporten", en: "Automatically generated reports", fr: "Rapports générés automatiquement" } },
    ],
    howTos: [
      { title: { nl: "AI Assistent gebruiken", en: "Using the AI Assistant", fr: "Utiliser l'assistant IA" }, steps: [
        { nl: "Open de AI Assistent pagina", en: "Open the AI Assistant page", fr: "Ouvrez la page Assistant IA" },
        { nl: "Stel een vraag over uw project", en: "Ask a question about your project", fr: "Posez une question sur votre projet" },
        { nl: "AI analyseert uw data en geeft advies", en: "AI analyses your data and gives advice", fr: "L'IA analyse vos données et donne des conseils" },
        { nl: "Pas het advies toe in uw projectmanagement", en: "Apply the advice in your project management", fr: "Appliquez les conseils dans votre gestion de projet" },
      ] },
    ],
    tips: [
      { nl: "Stel specifieke vragen voor de beste resultaten.", en: "Ask specific questions for the best results.", fr: "Posez des questions précises pour de meilleurs résultats." },
      { nl: "Gebruik AI voor risico-scans vóór belangrijke milestones.", en: "Use AI for risk scans before key milestones.", fr: "Utilisez l'IA pour des analyses de risque avant les jalons clés." },
      { nl: "Laat AI statusrapporten genereren om tijd te besparen.", en: "Let AI generate status reports to save time.", fr: "Laissez l'IA générer des rapports de statut pour gagner du temps." },
    ],
    tourSteps: [
      { title: { nl: "AI Assistent", en: "AI Assistant", fr: "Assistant IA" }, description: { nl: "Hier gebruikt u AI voor project analyses en advies.", en: "Here you use AI for project analyses and advice.", fr: "Ici, vous utilisez l'IA pour des analyses et conseils de projet." } },
    ],
  },
  "/post-project": {
    pageTitle: { nl: "Post Project", en: "Post Project", fr: "Post-projet" },
    pageDescription: {
      nl: "Evalueer afgeronde projecten en documenteer lessons learned.",
      en: "Evaluate completed projects and document lessons learned.",
      fr: "Évaluez les projets terminés et documentez les leçons apprises.",
    },
    features: [
      { icon: CheckCircle2, title: { nl: "Project evaluatie", en: "Project evaluation", fr: "Évaluation du projet" }, description: { nl: "Systematische evaluatie van afgeronde projecten", en: "Systematic evaluation of completed projects", fr: "Évaluation systématique des projets terminés" } },
      { icon: BookOpen, title: { nl: "Lessons learned", en: "Lessons learned", fr: "Leçons apprises" }, description: { nl: "Documenteer en deel geleerde lessen", en: "Document and share lessons learned", fr: "Documentez et partagez les leçons apprises" } },
      { icon: BarChart3, title: { nl: "Prestatie-analyse", en: "Performance analysis", fr: "Analyse de performance" }, description: { nl: "Vergelijk planning vs. realisatie", en: "Compare plan vs. actual", fr: "Comparez le plan vs. la réalisation" } },
      { icon: Target, title: { nl: "Benefits realisatie", en: "Benefits realisation", fr: "Réalisation des bénéfices" }, description: { nl: "Meet of verwachte baten zijn gerealiseerd", en: "Measure whether expected benefits were realised", fr: "Mesurez si les bénéfices attendus ont été réalisés" } },
    ],
    howTos: [
      { title: { nl: "Post-project review", en: "Post-project review", fr: "Revue post-projet" }, steps: [
        { nl: "Selecteer het afgeronde project", en: "Select the completed project", fr: "Sélectionnez le projet terminé" },
        { nl: "Doorloop de evaluatiechecklist", en: "Work through the evaluation checklist", fr: "Parcourez la liste de contrôle d'évaluation" },
        { nl: "Documenteer lessons learned", en: "Document lessons learned", fr: "Documentez les leçons apprises" },
        { nl: "Beoordeel de benefits realisatie", en: "Assess the benefits realisation", fr: "Évaluez la réalisation des bénéfices" },
        { nl: "Deel resultaten met stakeholders", en: "Share results with stakeholders", fr: "Partagez les résultats avec les parties prenantes" },
      ] },
    ],
    tips: [
      { nl: "Voer de review uit binnen 2 weken na projectafsluiting.", en: "Run the review within 2 weeks of project closure.", fr: "Réalisez la revue dans les 2 semaines suivant la clôture du projet." },
      { nl: "Betrek het hele team bij lessons learned sessies.", en: "Involve the whole team in lessons-learned sessions.", fr: "Impliquez toute l'équipe dans les sessions de leçons apprises." },
      { nl: "Gebruik lessons learned in toekomstige projecten.", en: "Use lessons learned in future projects.", fr: "Utilisez les leçons apprises dans les projets futurs." },
    ],
    tourSteps: [
      { title: { nl: "Post Project", en: "Post Project", fr: "Post-projet" }, description: { nl: "Hier evalueert u projecten en documenteert lessons learned.", en: "Here you evaluate projects and document lessons learned.", fr: "Ici, vous évaluez les projets et documentez les leçons apprises." } },
    ],
  },
  "/profile": {
    pageTitle: { nl: "Profiel", en: "Profile", fr: "Profil" },
    pageDescription: {
      nl: "Beheer uw persoonlijke instellingen, profielfoto en voorkeuren.",
      en: "Manage your personal settings, profile photo and preferences.",
      fr: "Gérez vos paramètres personnels, photo de profil et préférences.",
    },
    features: [
      { icon: Users, title: { nl: "Profielgegevens", en: "Profile details", fr: "Données de profil" }, description: { nl: "Naam, foto en contactgegevens", en: "Name, photo and contact details", fr: "Nom, photo et coordonnées" } },
      { icon: Settings, title: { nl: "Voorkeuren", en: "Preferences", fr: "Préférences" }, description: { nl: "Taal, thema en notificatie-instellingen", en: "Language, theme and notification settings", fr: "Langue, thème et paramètres de notification" } },
      { icon: Shield, title: { nl: "Beveiliging", en: "Security", fr: "Sécurité" }, description: { nl: "Wachtwoord en authenticatie", en: "Password and authentication", fr: "Mot de passe et authentification" } },
      { icon: BarChart3, title: { nl: "Activiteit", en: "Activity", fr: "Activité" }, description: { nl: "Uw recente activiteiten overzicht", en: "Overview of your recent activity", fr: "Aperçu de votre activité récente" } },
    ],
    howTos: [
      { title: { nl: "Profiel bijwerken", en: "Update profile", fr: "Mettre à jour le profil" }, steps: [
        { nl: "Open uw Profiel", en: "Open your Profile", fr: "Ouvrez votre profil" },
        { nl: "Klik op 'Bewerken'", en: "Click 'Edit'", fr: "Cliquez sur 'Modifier'" },
        { nl: "Pas uw gegevens aan", en: "Adjust your details", fr: "Modifiez vos données" },
        { nl: "Upload een profielfoto", en: "Upload a profile photo", fr: "Téléchargez une photo de profil" },
        { nl: "Klik op Opslaan", en: "Click Save", fr: "Cliquez sur Enregistrer" },
      ] },
    ],
    tips: [
      { nl: "Houd uw contactgegevens up-to-date.", en: "Keep your contact details up to date.", fr: "Gardez vos coordonnées à jour." },
      { nl: "Stel notificatie-voorkeuren in voor relevante meldingen.", en: "Set notification preferences for relevant alerts.", fr: "Configurez les préférences de notification pour les alertes pertinentes." },
      { nl: "Kies een thema (licht/donker) dat prettig werkt.", en: "Choose a theme (light/dark) that works comfortably.", fr: "Choisissez un thème (clair/sombre) qui vous convient." },
    ],
    tourSteps: [
      { title: { nl: "Profiel", en: "Profile", fr: "Profil" }, description: { nl: "Hier beheert u uw persoonlijke instellingen.", en: "Here you manage your personal settings.", fr: "Ici, vous gérez vos paramètres personnels." } },
    ],
  },
  "/settings": {
    pageTitle: { nl: "Instellingen", en: "Settings", fr: "Paramètres" },
    pageDescription: {
      nl: "Configureer systeem-, team- en projectinstellingen.",
      en: "Configure system, team and project settings.",
      fr: "Configurez les paramètres système, d'équipe et de projet.",
    },
    features: [
      { icon: Settings, title: { nl: "Systeeminstellingen", en: "System settings", fr: "Paramètres système" }, description: { nl: "Algemene configuratie en voorkeuren", en: "General configuration and preferences", fr: "Configuration générale et préférences" } },
      { icon: Users, title: { nl: "Gebruikersbeheer", en: "User management", fr: "Gestion des utilisateurs" }, description: { nl: "Rollen, rechten en uitnodigingen", en: "Roles, permissions and invitations", fr: "Rôles, droits et invitations" } },
      { icon: Workflow, title: { nl: "Workflows", en: "Workflows", fr: "Flux de travail" }, description: { nl: "Aangepaste workflows en goedkeuringsprocessen", en: "Custom workflows and approval processes", fr: "Flux personnalisés et processus d'approbation" } },
      { icon: Shield, title: { nl: "Beveiliging", en: "Security", fr: "Sécurité" }, description: { nl: "Beveiligingsinstellingen en audit trails", en: "Security settings and audit trails", fr: "Paramètres de sécurité et pistes d'audit" } },
    ],
    howTos: [
      { title: { nl: "Instellingen aanpassen", en: "Adjust settings", fr: "Modifier les paramètres" }, steps: [
        { nl: "Open Instellingen", en: "Open Settings", fr: "Ouvrez Paramètres" },
        { nl: "Navigeer naar de gewenste sectie", en: "Navigate to the desired section", fr: "Naviguez vers la section souhaitée" },
        { nl: "Pas de configuratie aan", en: "Adjust the configuration", fr: "Modifiez la configuration" },
        { nl: "Klik op Opslaan", en: "Click Save", fr: "Cliquez sur Enregistrer" },
      ] },
    ],
    tips: [
      { nl: "Stel rollen en rechten zorgvuldig in voor goede governance.", en: "Set roles and permissions carefully for good governance.", fr: "Configurez les rôles et droits avec soin pour une bonne gouvernance." },
      { nl: "Configureer notificaties per project voor relevante updates.", en: "Configure notifications per project for relevant updates.", fr: "Configurez les notifications par projet pour les mises à jour pertinentes." },
      { nl: "Review instellingen periodiek na organisatiewijzigingen.", en: "Review settings periodically after organisational changes.", fr: "Revoyez les paramètres régulièrement après des changements organisationnels." },
    ],
    tourSteps: [
      { title: { nl: "Instellingen", en: "Settings", fr: "Paramètres" }, description: { nl: "Hier configureert u alle systeem- en projectinstellingen.", en: "Here you configure all system and project settings.", fr: "Ici, vous configurez tous les paramètres système et de projet." } },
    ],
  },
  "/surveys": {
    pageTitle: { nl: "Enquêtes", en: "Surveys", fr: "Enquêtes" },
    pageDescription: {
      nl: "Maak en verstuur enquêtes voor projectfeedback en teamtevredenheid.",
      en: "Create and send surveys for project feedback and team satisfaction.",
      fr: "Créez et envoyez des enquêtes pour le feedback projet et la satisfaction d'équipe.",
    },
    features: [
      { icon: FileText, title: { nl: "Enquête builder", en: "Survey builder", fr: "Créateur d'enquête" }, description: { nl: "Maak enquêtes met diverse vraagtypen", en: "Build surveys with various question types", fr: "Créez des enquêtes avec divers types de questions" } },
      { icon: Users, title: { nl: "Verspreiding", en: "Distribution", fr: "Diffusion" }, description: { nl: "Verstuur naar teams en stakeholders", en: "Send to teams and stakeholders", fr: "Envoyez aux équipes et parties prenantes" } },
      { icon: BarChart3, title: { nl: "Resultaten", en: "Results", fr: "Résultats" }, description: { nl: "Analyseer antwoorden en trends", en: "Analyse answers and trends", fr: "Analysez les réponses et tendances" } },
      { icon: TrendingUp, title: { nl: "Inzichten", en: "Insights", fr: "Insights" }, description: { nl: "AI-gestuurde analyse van feedback", en: "AI-driven analysis of feedback", fr: "Analyse du feedback basée sur l'IA" } },
    ],
    howTos: [
      { title: { nl: "Enquête maken", en: "Create a survey", fr: "Créer une enquête" }, steps: [
        { nl: "Klik op '+ Nieuwe Enquête'", en: "Click '+ New Survey'", fr: "Cliquez sur '+ Nouvelle enquête'" },
        { nl: "Voeg vragen toe (multiple choice, schaal, open)", en: "Add questions (multiple choice, scale, open)", fr: "Ajoutez des questions (choix multiple, échelle, ouvertes)" },
        { nl: "Stel de doelgroep in", en: "Set the target audience", fr: "Définissez le public cible" },
        { nl: "Verstuur de enquête", en: "Send the survey", fr: "Envoyez l'enquête" },
        { nl: "Bekijk resultaten in het dashboard", en: "View results in the dashboard", fr: "Consultez les résultats dans le tableau de bord" },
      ] },
    ],
    tips: [
      { nl: "Houd enquêtes kort (max 10 vragen) voor hogere response rates.", en: "Keep surveys short (max 10 questions) for higher response rates.", fr: "Gardez les enquêtes courtes (max 10 questions) pour de meilleurs taux de réponse." },
      { nl: "Verstuur na elke sprint of fase een korte retrospective enquête.", en: "Send a short retrospective survey after each sprint or phase.", fr: "Envoyez une courte enquête rétrospective après chaque sprint ou phase." },
      { nl: "Gebruik NPS-vragen voor vergelijkbare metingen over tijd.", en: "Use NPS questions for comparable measurements over time.", fr: "Utilisez des questions NPS pour des mesures comparables dans le temps." },
    ],
    tourSteps: [
      { title: { nl: "Enquêtes", en: "Surveys", fr: "Enquêtes" }, description: { nl: "Hier maakt en analyseert u enquêtes voor projectfeedback.", en: "Here you create and analyse surveys for project feedback.", fr: "Ici, vous créez et analysez des enquêtes pour le feedback projet." } },
    ],
  },
};

const DEFAULT_GUIDE: RawGuide = {
  pageTitle: { nl: "ProjeXtPal", en: "ProjeXtPal", fr: "ProjeXtPal" },
  pageDescription: {
    nl: "Uw complete AI-gestuurde project management platform. Ontdek hieronder alle modules.",
    en: "Your complete AI-powered project management platform. Discover all modules below.",
    fr: "Votre plateforme complète de gestion de projet pilotée par l'IA. Découvrez tous les modules ci-dessous.",
  },
  features: [
    { icon: Layout, title: { nl: "Dashboard", en: "Dashboard", fr: "Tableau de bord" }, description: { nl: "Centraal overzicht van al uw projecten", en: "Central overview of all your projects", fr: "Aperçu central de tous vos projets" } },
    { icon: FolderKanban, title: { nl: "Projecten", en: "Projects", fr: "Projets" }, description: { nl: "Projectbeheer met diverse methodologieën", en: "Project management with various methodologies", fr: "Gestion de projet avec diverses méthodologies" } },
    { icon: Building2, title: { nl: "Programma's", en: "Programmes", fr: "Programmes" }, description: { nl: "Strategische programma's met meerdere projecten", en: "Strategic programmes with multiple projects", fr: "Programmes stratégiques à plusieurs projets" } },
    { icon: GraduationCap, title: { nl: "Academy", en: "Academy", fr: "Academy" }, description: { nl: "Leer project management methodologieën", en: "Learn project management methodologies", fr: "Apprenez les méthodologies de gestion de projet" } },
  ],
  howTos: [
    { title: { nl: "Aan de slag met ProjeXtPal", en: "Getting started with ProjeXtPal", fr: "Démarrer avec ProjeXtPal" }, steps: [
      { nl: "Maak uw eerste project aan via Projecten", en: "Create your first project via Projects", fr: "Créez votre premier projet via Projets" },
      { nl: "Kies de juiste methodologie (Scrum, Kanban, PRINCE2, etc.)", en: "Choose the right methodology (Scrum, Kanban, PRINCE2, etc.)", fr: "Choisissez la bonne méthodologie (Scrum, Kanban, PRINCE2, etc.)" },
      { nl: "Stel uw team samen en wijs rollen toe", en: "Build your team and assign roles", fr: "Constituez votre équipe et attribuez les rôles" },
      { nl: "Begin met plannen en taken toewijzen", en: "Start planning and assigning tasks", fr: "Commencez à planifier et attribuer des tâches" },
      { nl: "Monitor voortgang via het Dashboard", en: "Monitor progress via the Dashboard", fr: "Suivez la progression via le tableau de bord" },
    ] },
    { title: { nl: "Navigeren in de applicatie", en: "Navigating the application", fr: "Naviguer dans l'application" }, steps: [
      { nl: "Gebruik de zijbalk links om naar modules te navigeren", en: "Use the left sidebar to navigate to modules", fr: "Utilisez la barre latérale gauche pour naviguer entre les modules" },
      { nl: "Open de AI Copilot (rechtsboven) voor hulp op elke pagina", en: "Open the AI Copilot (top right) for help on every page", fr: "Ouvrez l'AI Copilot (en haut à droite) pour de l'aide sur chaque page" },
      { nl: "Klik op 'Gids' voor pagina-specifieke handleidingen", en: "Click 'Guide' for page-specific manuals", fr: "Cliquez sur 'Guide' pour les manuels spécifiques à la page" },
      { nl: "Methodologie-specifieke menu's verschijnen bij projectweergave", en: "Methodology-specific menus appear in the project view", fr: "Les menus propres à la méthodologie apparaissent dans la vue projet" },
    ] },
  ],
  tips: [
    { nl: "Gebruik de AI Copilot om snel antwoorden te vinden over projectmanagement.", en: "Use the AI Copilot to quickly find answers about project management.", fr: "Utilisez l'AI Copilot pour trouver rapidement des réponses sur la gestion de projet." },
    { nl: "Klik op 'Gids' op elke pagina voor context-specifieke handleidingen.", en: "Click 'Guide' on any page for context-specific manuals.", fr: "Cliquez sur 'Guide' sur chaque page pour des manuels contextuels." },
    { nl: "De Academy biedt trainingen voor alle ondersteunde methodologieën.", en: "The Academy offers training for all supported methodologies.", fr: "L'Academy propose des formations pour toutes les méthodologies prises en charge." },
  ],
  tourSteps: [
    { title: { nl: "Welkom bij ProjeXtPal", en: "Welcome to ProjeXtPal", fr: "Bienvenue sur ProjeXtPal" }, description: { nl: "Dit is uw complete project management platform. Laten we een rondleiding doen.", en: "This is your complete project management platform. Let's take a tour.", fr: "Voici votre plateforme complète de gestion de projet. Faisons un tour." } },
  ],
};

/* ─── Methodology-specific guides (project-scoped, with deep links) ───
   These are built per project because their feature links need the project id.
   Resolved from the pathname (e.g. /projects/:id/prince2/...) so the guide
   reflects the methodology you're actually in instead of the generic
   "Projecten" guide. */
const buildPrince2Guide = (projectId: string): RawGuide => ({
  pageTitle: { nl: "PRINCE2", en: "PRINCE2", fr: "PRINCE2" },
  pageDescription: {
    nl: "Beheer dit project volgens PRINCE2: processen (SU→IP→CS→SB→CP), thema's en managementproducten. Klik op een functie om er direct naartoe te gaan.",
    en: "Manage this project with PRINCE2: processes (SU→IP→CS→SB→CP), themes and management products. Click a feature to jump straight to it.",
    fr: "Gérez ce projet avec PRINCE2 : processus (SU→IP→CS→SB→CP), thèmes et produits de management. Cliquez sur une fonction pour y accéder directement.",
  },
  features: [
    { icon: Layout, title: { nl: "Overzicht", en: "Overview", fr: "Aperçu" }, description: { nl: "Procesflow, fasen en managementproducten in één beeld", en: "Process flow, stages and management products in one view", fr: "Flux de processus, étapes et produits de management en une vue" }, path: `/projects/${projectId}/prince2/dashboard` },
    { icon: Briefcase, title: { nl: "Business Case", en: "Business Case", fr: "Cas d'affaire" }, description: { nl: "Doorlopende zakelijke rechtvaardiging onderbouwen", en: "Substantiate continued business justification", fr: "Étayer la justification continue de l'affaire" }, path: `/projects/${projectId}/prince2/business-case` },
    { icon: Workflow, title: { nl: "Werkpakketten", en: "Work Packages", fr: "Lots de travaux" }, description: { nl: "Werk autoriseren, accepteren en uitvoeren (CS/MP)", en: "Authorise, accept and deliver work (CS/MP)", fr: "Autoriser, accepter et livrer le travail (CS/MP)" }, path: `/projects/${projectId}/prince2/work-packages` },
    { icon: Shield, title: { nl: "Fasepoorten", en: "Stage Gates", fr: "Jalons de phase" }, description: { nl: "Faseovergangen met go/no-go-besluit van de Project Board", en: "Stage transitions with the Project Board's go/no-go decision", fr: "Transitions de phase avec décision go/no-go du Comité de projet" }, path: `/projects/${projectId}/prince2/stage-gates` },
    { icon: AlertTriangle, title: { nl: "Toleranties", en: "Tolerances", fr: "Tolérances" }, description: { nl: "Tolerantiegrenzen bewaken — manage by exception", en: "Monitor tolerance limits — manage by exception", fr: "Surveiller les limites de tolérance — gestion par exception" }, path: `/projects/${projectId}/prince2/tolerances` },
    { icon: CheckCircle2, title: { nl: "Quality Register", en: "Quality Register", fr: "Registre qualité" }, description: { nl: "Kwaliteitscontroles van producten registreren", en: "Record quality checks of products", fr: "Enregistrer les contrôles qualité des produits" }, path: `/projects/${projectId}/prince2/quality-register` },
    { icon: ListChecks, title: { nl: "Product Status", en: "Product Status", fr: "Statut des produits" }, description: { nl: "Status en kwaliteitscontroles per product (§A.18)", en: "Status and quality checks per product (§A.18)", fr: "Statut et contrôles qualité par produit (§A.18)" }, path: `/projects/${projectId}/prince2/product-status` },
    { icon: BookOpen, title: { nl: "Geleerde Lessen", en: "Lessons Learned", fr: "Leçons apprises" }, description: { nl: "Lessen vastleggen + enquête-inzichten + Lessenrapport", en: "Capture lessons + survey insights + Lessons Report", fr: "Capturer les leçons + insights d'enquête + Rapport de leçons" }, path: `/projects/${projectId}/prince2/lessons-log` },
    { icon: FileText, title: { nl: "Projectafsluiting", en: "Project Closure", fr: "Clôture du projet" }, description: { nl: "Eindprojectrapport en gecontroleerde afsluiting (CP)", en: "End Project Report and controlled closure (CP)", fr: "Rapport de fin de projet et clôture contrôlée (CP)" }, path: `/projects/${projectId}/prince2/end-project-report` },
  ],
  howTos: [
    { title: { nl: "Een fase doorlopen (CS)", en: "Working through a stage (CS)", fr: "Dérouler une phase (CS)" }, steps: [
      { nl: "Open Werkpakketten en autoriseer werk (fase moet actief zijn)", en: "Open Work Packages and authorise work (stage must be active)", fr: "Ouvrez les Lots de travaux et autorisez le travail (la phase doit être active)" },
      { nl: "Teammanager accepteert het werkpakket", en: "The Team Manager accepts the Work Package", fr: "Le Chef d'équipe accepte le Lot de travaux" },
      { nl: "Start het werk zodra afhankelijkheden voltooid zijn", en: "Start the work once dependencies are complete", fr: "Démarrez le travail une fois les dépendances terminées" },
      { nl: "Leg risico's & issues vast", en: "Record risks & issues", fr: "Consignez les risques et incidents" },
      { nl: "Stel een Highlight Report op voor de Project Board", en: "Produce a Highlight Report for the Project Board", fr: "Produisez un rapport de progression pour le Comité de projet" },
    ] },
    { title: { nl: "Een fasepoort passeren (SB)", en: "Passing a stage gate (SB)", fr: "Franchir un jalon de phase (SB)" }, steps: [
      { nl: "Open Fasepoorten", en: "Open Stage Gates", fr: "Ouvrez les Jalons de phase" },
      { nl: "Controleer dat producten goedgekeurd zijn", en: "Check that products are approved", fr: "Vérifiez que les produits sont approuvés" },
      { nl: "Werk de Business Case en het volgende Faseplan bij", en: "Update the Business Case and the next Stage Plan", fr: "Mettez à jour le Cas d'affaire et le prochain Plan de phase" },
      { nl: "Vraag de Project Board om go/no-go-besluit", en: "Ask the Project Board for a go/no-go decision", fr: "Demandez au Comité de projet une décision go/no-go" },
    ] },
    { title: { nl: "Het project afsluiten (CP)", en: "Closing the project (CP)", fr: "Clôturer le projet (CP)" }, steps: [
      { nl: "Stel via Geleerde Lessen het Lessenrapport samen", en: "Compile the Lessons Report via Lessons Learned", fr: "Compilez le Rapport de leçons via Leçons apprises" },
      { nl: "Zorg dat alle producten goedgekeurd zijn", en: "Ensure all products are approved", fr: "Assurez-vous que tous les produits sont approuvés" },
      { nl: "Vul het Eindprojectrapport in", en: "Complete the End Project Report", fr: "Complétez le Rapport de fin de projet" },
      { nl: "Keur het rapport goed om af te sluiten", en: "Approve the report to close", fr: "Approuvez le rapport pour clôturer" },
    ] },
  ],
  tips: [
    { nl: "Een project is alleen PRINCE2 als alle 7 principes worden toegepast.", en: "A project is only PRINCE2 if all 7 principles are applied.", fr: "Un projet n'est PRINCE2 que si les 7 principes sont appliqués." },
    { nl: "Manage by exception: escaleer pas naar de Project Board bij dreigende tolerantie-overschrijding.", en: "Manage by exception: only escalate to the Project Board when a tolerance is about to be breached.", fr: "Gestion par exception : n'escaladez au Comité de projet qu'en cas de dépassement de tolérance imminent." },
    { nl: "Stel het Lessenrapport samen vóór afsluiting — het is een voorwaarde voor de Project Board.", en: "Compile the Lessons Report before closure — it's a precondition for the Project Board.", fr: "Compilez le Rapport de leçons avant la clôture — c'est une condition préalable pour le Comité de projet." },
    { nl: "Gebruik 'Tailor to suit the project' om de methode passend te maken voor de omvang en het risico.", en: "Use 'Tailor to suit the project' to fit the method to the size and risk.", fr: "Utilisez « Adapter au projet » pour ajuster la méthode à la taille et au risque." },
  ],
  tourSteps: [
    { title: { nl: "PRINCE2-procesflow", en: "PRINCE2 process flow", fr: "Flux de processus PRINCE2" }, description: { nl: "Bovenaan ziet u de procesflow SU→IP→CS→SB→CP met de huidige fase. Volg de functies hieronder om elk onderdeel te beheren.", en: "At the top you see the process flow SU→IP→CS→SB→CP with the current stage. Follow the features below to manage each part.", fr: "En haut, vous voyez le flux de processus SU→IP→CS→SB→CP avec la phase actuelle. Suivez les fonctions ci-dessous pour gérer chaque partie." } },
  ],
});

const buildScrumGuide = (projectId: string): RawGuide => ({
  pageTitle: { nl: "Scrum", en: "Scrum", fr: "Scrum" },
  pageDescription: {
    nl: "Lever in korte sprints: een geordende Product Backlog, een Sprint Goal, dagelijkse inspectie en een Definition of Done als kwaliteitsgrens. Klik op een functie om er direct heen te gaan.",
    en: "Deliver in short sprints: an ordered Product Backlog, a Sprint Goal, daily inspection, and a Definition of Done as the quality gate. Click a feature to jump straight to it.",
    fr: "Livrez en sprints courts : un Product Backlog ordonné, un Sprint Goal, une inspection quotidienne et une Definition of Done comme barrière qualité. Cliquez sur une fonction pour y accéder.",
  },
  features: [
    { icon: Layout, title: { nl: "Dashboard", en: "Dashboard", fr: "Tableau de bord" }, description: { nl: "Sprintvoortgang, velocity en de sprintflow in één beeld", en: "Sprint progress, velocity and the sprint flow in one view", fr: "Progression du sprint, vélocité et flux du sprint en une vue" }, path: `/projects/${projectId}/scrum/overview` },
    { icon: ListChecks, title: { nl: "Product Backlog", en: "Product Backlog", fr: "Product Backlog" }, description: { nl: "Items ordenen, verfijnen en story points toekennen", en: "Order, refine and point backlog items", fr: "Ordonner, affiner et estimer les items du backlog" }, path: `/projects/${projectId}/scrum/backlog` },
    { icon: Target, title: { nl: "Sprint Board", en: "Sprint Board", fr: "Tableau de sprint" }, description: { nl: "Werk verslepen door To Do → In Progress → Done", en: "Drag work through To Do → In Progress → Done", fr: "Déplacez le travail de To Do → In Progress → Done" }, path: `/projects/${projectId}/scrum/sprint-board` },
    { icon: Calendar, title: { nl: "Sprint Planning", en: "Sprint Planning", fr: "Planification de sprint" }, description: { nl: "Sprint Goal bepalen en items in de sprint trekken", en: "Set the Sprint Goal and pull items into the sprint", fr: "Définir le Sprint Goal et tirer les items dans le sprint" }, path: `/projects/${projectId}/scrum/sprint-planning` },
    { icon: Users, title: { nl: "Daily Standup", en: "Daily Standup", fr: "Mêlée quotidienne" }, description: { nl: "Dagelijkse inspectie van voortgang naar het Sprint Goal", en: "Daily inspection of progress toward the Sprint Goal", fr: "Inspection quotidienne de la progression vers le Sprint Goal" }, path: `/projects/${projectId}/scrum/daily-standup` },
    { icon: CheckCircle2, title: { nl: "Sprint Review", en: "Sprint Review", fr: "Revue de sprint" }, description: { nl: "Het Increment laten zien en feedback ophalen", en: "Demonstrate the Increment and gather feedback", fr: "Présenter l'Increment et recueillir les retours" }, path: `/projects/${projectId}/scrum/sprint-review` },
    { icon: TrendingUp, title: { nl: "Velocity", en: "Velocity", fr: "Vélocité" }, description: { nl: "Doorlopende velocity per sprint voor planning", en: "Rolling velocity per sprint for planning", fr: "Vélocité glissante par sprint pour la planification" }, path: `/projects/${projectId}/scrum/velocity` },
    { icon: Shield, title: { nl: "Definition of Done", en: "Definition of Done", fr: "Definition of Done" }, description: { nl: "De kwaliteitsgrens die 'Done' bewaakt", en: "The quality gate that guards 'Done'", fr: "La barrière qualité qui protège le « Done »" }, path: `/projects/${projectId}/scrum/definition-of-done` },
  ],
  howTos: [
    { title: { nl: "Een sprint plannen", en: "Plan a sprint", fr: "Planifier un sprint" }, steps: [
      { nl: "Open Sprint Planning en formuleer een Sprint Goal", en: "Open Sprint Planning and write a Sprint Goal", fr: "Ouvrez la Planification et rédigez un Sprint Goal" },
      { nl: "Trek geordende backlogitems in de sprint tot de velocity", en: "Pull ordered backlog items into the sprint up to velocity", fr: "Tirez les items ordonnés dans le sprint jusqu'à la vélocité" },
      { nl: "Controleer dat elk item een Definition of Done heeft", en: "Check each item has a Definition of Done", fr: "Vérifiez que chaque item a une Definition of Done" },
    ] },
    { title: { nl: "Een item naar Done brengen", en: "Move an item to Done", fr: "Passer un item en Done" }, steps: [
      { nl: "Sleep het item op het Sprint Board naar In Progress", en: "Drag the item on the Sprint Board to In Progress", fr: "Déplacez l'item du tableau vers In Progress" },
      { nl: "Voldoe aan alle Definition of Done-criteria", en: "Satisfy every Definition of Done criterion", fr: "Satisfaites chaque critère de la Definition of Done" },
      { nl: "Verplaats naar Done — anders blokkeert de poort", en: "Move to Done — otherwise the gate blocks it", fr: "Passez en Done — sinon la barrière le bloque" },
    ] },
  ],
  tips: [
    { nl: "Alleen de Product Owner ordent de backlog; volgorde stuurt de planning.", en: "Only the Product Owner orders the backlog; order drives planning.", fr: "Seul le Product Owner ordonne le backlog ; l'ordre guide la planification." },
    { nl: "Het Sprint Goal geeft samenhang — laat het de sprint sturen, niet andersom.", en: "The Sprint Goal gives coherence — let it steer the sprint, not the other way around.", fr: "Le Sprint Goal donne de la cohérence — laissez-le guider le sprint." },
    { nl: "Een item is pas klaar als het de Definition of Done haalt.", en: "An item is only done when it meets the Definition of Done.", fr: "Un item n'est terminé que s'il atteint la Definition of Done." },
  ],
  tourSteps: [
    { title: { nl: "Sprintflow", en: "Sprint flow", fr: "Flux de sprint" }, description: { nl: "Bovenaan ziet u de sprintflow To Do → In Progress → Done met live aantallen. Gebruik de functies hieronder om de sprint te runnen.", en: "At the top you see the sprint flow To Do → In Progress → Done with live counts. Use the features below to run the sprint.", fr: "En haut, le flux To Do → In Progress → Done avec des compteurs en direct. Utilisez les fonctions ci-dessous pour mener le sprint." } },
  ],
});

const buildKanbanGuide = (projectId: string): RawGuide => ({
  pageTitle: { nl: "Kanban", en: "Kanban", fr: "Kanban" },
  pageDescription: {
    nl: "Visualiseer het werk, beperk onderhanden werk (WIP) en beheer de flow. Maak werkbeleid expliciet en stuur op doorlooptijd en doorstroom. Klik op een functie om er direct heen te gaan.",
    en: "Visualise the work, limit work-in-progress (WIP) and manage flow. Make work policies explicit and steer on lead time and throughput. Click a feature to jump straight to it.",
    fr: "Visualisez le travail, limitez l'en-cours (WIP) et gérez le flux. Rendez les politiques explicites et pilotez le délai et le débit. Cliquez sur une fonction pour y accéder.",
  },
  features: [
    { icon: Layout, title: { nl: "Dashboard", en: "Dashboard", fr: "Tableau de bord" }, description: { nl: "Kaarten, geblokkeerd werk en doorlooptijd in één beeld", en: "Cards, blocked work and lead time in one view", fr: "Cartes, travail bloqué et délai en une vue" }, path: `/projects/${projectId}/kanban/overview` },
    { icon: Kanban, title: { nl: "Board", en: "Board", fr: "Tableau" }, description: { nl: "Kaarten door de kolommen trekken binnen de WIP-limieten", en: "Pull cards through columns within WIP limits", fr: "Tirez les cartes entre colonnes dans les limites de WIP" }, path: `/projects/${projectId}/kanban/board` },
    { icon: ListChecks, title: { nl: "Werkitems", en: "Work Items", fr: "Éléments de travail" }, description: { nl: "Alle kaarten beheren, type en class of service toekennen", en: "Manage all cards, set type and class of service", fr: "Gérer toutes les cartes, type et classe de service" }, path: `/projects/${projectId}/kanban/work-items` },
    { icon: Settings, title: { nl: "WIP-limieten", en: "WIP Limits", fr: "Limites de WIP" }, description: { nl: "Limieten per kolom instellen — trekken blokkeert bij overschrijding", en: "Set per-column limits — a pull blocks when exceeded", fr: "Limites par colonne — le tirage bloque en cas de dépassement" }, path: `/projects/${projectId}/kanban/wip-limits` },
    { icon: AlertTriangle, title: { nl: "Geblokkeerde items", en: "Blocked Items", fr: "Éléments bloqués" }, description: { nl: "Blokkades zichtbaar maken en zo snel mogelijk opheffen", en: "Surface blockers and clear them as fast as possible", fr: "Faire ressortir les blocages et les lever au plus vite" }, path: `/projects/${projectId}/kanban/blocked` },
    { icon: BarChart3, title: { nl: "Flow Metrics", en: "Flow Metrics", fr: "Métriques de flux" }, description: { nl: "Doorlooptijd, doorstroom en WIP-trends meten", en: "Measure lead time, throughput and WIP trends", fr: "Mesurer délai, débit et tendances de WIP" }, path: `/projects/${projectId}/kanban/metrics` },
    { icon: TrendingUp, title: { nl: "CFD", en: "CFD", fr: "CFD" }, description: { nl: "Cumulative Flow Diagram voor stabiliteit en knelpunten", en: "Cumulative Flow Diagram for stability and bottlenecks", fr: "Diagramme de flux cumulé pour stabilité et goulets" }, path: `/projects/${projectId}/kanban/cfd` },
    { icon: FileText, title: { nl: "Werkbeleid", en: "Work Policies", fr: "Politiques de travail" }, description: { nl: "Expliciete regels per kolom — wanneer mag een kaart door", en: "Explicit per-column rules — when may a card advance", fr: "Règles explicites par colonne — quand une carte avance" }, path: `/projects/${projectId}/kanban/work-policies` },
  ],
  howTos: [
    { title: { nl: "Een kaart door het board trekken", en: "Pull a card through the board", fr: "Tirer une carte sur le tableau" }, steps: [
      { nl: "Open het Board en kies een kaart in de vorige kolom", en: "Open the Board and pick a card in the previous column", fr: "Ouvrez le Tableau et choisissez une carte en amont" },
      { nl: "Controleer dat de doelkolom onder zijn WIP-limiet zit", en: "Check the target column is below its WIP limit", fr: "Vérifiez que la colonne cible est sous sa limite de WIP" },
      { nl: "Trek de kaart; bij overschrijding blokkeert de poort", en: "Pull the card; the gate blocks if the limit is exceeded", fr: "Tirez la carte ; la barrière bloque si la limite est dépassée" },
    ] },
    { title: { nl: "De flow verbeteren", en: "Improve the flow", fr: "Améliorer le flux" }, steps: [
      { nl: "Open Flow Metrics en zoek de kolom met de langste wachttijd", en: "Open Flow Metrics and find the longest-waiting column", fr: "Ouvrez les Métriques et trouvez la colonne la plus lente" },
      { nl: "Verlaag de WIP-limiet daar of hef blokkades op", en: "Lower the WIP limit there or clear blockers", fr: "Baissez la limite de WIP ou levez les blocages" },
      { nl: "Volg het effect op het CFD over enkele dagen", en: "Track the effect on the CFD over a few days", fr: "Suivez l'effet sur le CFD sur quelques jours" },
    ] },
  ],
  tips: [
    { nl: "WIP-limieten zijn echt: een trek die de limiet overschrijdt wordt geweigerd.", en: "WIP limits are real: a pull that exceeds the limit is rejected.", fr: "Les limites de WIP sont réelles : un tirage qui dépasse est refusé." },
    { nl: "Maak werkbeleid expliciet — onuitgesproken regels veroorzaken wachttijd.", en: "Make work policies explicit — unspoken rules cause waiting.", fr: "Rendez les politiques explicites — les règles tacites créent de l'attente." },
    { nl: "Stuur op doorlooptijd, niet op bezetting; een vol board stroomt niet.", en: "Steer on lead time, not utilisation; a full board doesn't flow.", fr: "Pilotez le délai, pas l'occupation ; un tableau plein ne s'écoule pas." },
  ],
  tourSteps: [
    { title: { nl: "Board flow", en: "Board flow", fr: "Flux du tableau" }, description: { nl: "Bovenaan ziet u de kolommen met live aantallen en WIP-bezetting. Gebruik de functies hieronder om de flow te beheren.", en: "At the top you see the columns with live counts and WIP usage. Use the features below to manage the flow.", fr: "En haut, les colonnes avec compteurs en direct et occupation du WIP. Utilisez les fonctions ci-dessous pour gérer le flux." } },
  ],
});

const buildAgileGuide = (projectId: string): RawGuide => ({
  pageTitle: { nl: "Agile", en: "Agile", fr: "Agile" },
  pageDescription: {
    nl: "Lever waarde in iteraties vanuit een heldere productvisie: persona's, een geordende backlog, een continu-flow-board en regelmatige reflectie. Klik op een functie om er direct heen te gaan.",
    en: "Deliver value in iterations from a clear product vision: personas, an ordered backlog, a continuous-flow board and regular reflection. Click a feature to jump straight to it.",
    fr: "Livrez de la valeur en itérations à partir d'une vision produit claire : personas, backlog ordonné, tableau à flux continu et réflexion régulière. Cliquez sur une fonction pour y accéder.",
  },
  features: [
    { icon: Layout, title: { nl: "Dashboard", en: "Dashboard", fr: "Tableau de bord" }, description: { nl: "Iteratie, backlog en de flow-board in één beeld", en: "Iteration, backlog and the flow board in one view", fr: "Itération, backlog et tableau de flux en une vue" }, path: `/projects/${projectId}/agile/overview` },
    { icon: Compass, title: { nl: "Productvisie", en: "Product Vision", fr: "Vision produit" }, description: { nl: "De richting die alle prioritering onderbouwt", en: "The direction that underpins all prioritisation", fr: "La direction qui sous-tend toute priorisation" }, path: `/projects/${projectId}/agile/vision` },
    { icon: Users, title: { nl: "Persona's", en: "User Personas", fr: "Personas" }, description: { nl: "Voor wie u bouwt — koppel backlogitems aan behoeften", en: "Who you build for — link backlog items to needs", fr: "Pour qui vous construisez — reliez les items aux besoins" }, path: `/projects/${projectId}/agile/personas` },
    { icon: ListChecks, title: { nl: "Backlog", en: "Backlog", fr: "Backlog" }, description: { nl: "Items ordenen op waarde en in iteraties trekken", en: "Order items by value and pull into iterations", fr: "Ordonner par valeur et tirer dans les itérations" }, path: `/projects/${projectId}/agile/backlog` },
    { icon: Target, title: { nl: "Iteration Board", en: "Iteration Board", fr: "Tableau d'itération" }, description: { nl: "Werk door het continu-flow-board met WIP-grens", en: "Move work through the continuous-flow board with a WIP cap", fr: "Faites avancer le travail sur le tableau à flux continu avec un plafond WIP" }, path: `/projects/${projectId}/agile/iteration-board` },
    { icon: BarChart3, title: { nl: "Dagelijkse voortgang", en: "Daily Progress", fr: "Progression quotidienne" }, description: { nl: "Korte dagelijkse inspectie van de iteratie", en: "Short daily inspection of the iteration", fr: "Inspection quotidienne brève de l'itération" }, path: `/projects/${projectId}/agile/daily-progress` },
    { icon: Calendar, title: { nl: "Release Planning", en: "Release Planning", fr: "Planification des versions" }, description: { nl: "Iteraties bundelen tot een geplande release", en: "Bundle iterations into a planned release", fr: "Regrouper les itérations en une version planifiée" }, path: `/projects/${projectId}/agile/release-planning` },
    { icon: CheckCircle2, title: { nl: "Definition of Done", en: "Definition of Done", fr: "Definition of Done" }, description: { nl: "De gedeelde kwaliteitsgrens voor elk item", en: "The shared quality gate for every item", fr: "La barrière qualité partagée pour chaque item" }, path: `/projects/${projectId}/agile/definition-of-done` },
  ],
  howTos: [
    { title: { nl: "Een iteratie starten", en: "Start an iteration", fr: "Démarrer une itération" }, steps: [
      { nl: "Controleer dat de Productvisie en persona's actueel zijn", en: "Check the Product Vision and personas are current", fr: "Vérifiez que la vision et les personas sont à jour" },
      { nl: "Order de backlog op waarde", en: "Order the backlog by value", fr: "Ordonnez le backlog par valeur" },
      { nl: "Trek items op het Iteration Board tot de WIP-grens", en: "Pull items on the Iteration Board up to the WIP cap", fr: "Tirez les items sur le tableau jusqu'au plafond WIP" },
    ] },
    { title: { nl: "Reflecteren en verbeteren", en: "Reflect and improve", fr: "Réfléchir et améliorer" }, steps: [
      { nl: "Houd na de iteratie een retrospective", en: "Hold a retrospective after the iteration", fr: "Tenez une rétrospective après l'itération" },
      { nl: "Leg verbeteracties vast en draag ze over", en: "Capture improvement actions and carry them forward", fr: "Consignez les actions d'amélioration et reportez-les" },
      { nl: "Volg de openstaande acties in de volgende iteratie", en: "Track open actions in the next iteration", fr: "Suivez les actions ouvertes à l'itération suivante" },
    ] },
  ],
  tips: [
    { nl: "Agile hier is een flow-systeem: één continu-flow-board met een WIP-grens, geen vaste sprints.", en: "Agile here is a flow system: one continuous-flow board with a WIP cap, not fixed sprints.", fr: "Ici, Agile est un système de flux : un tableau à flux continu avec plafond WIP, sans sprints fixes." },
    { nl: "Laat de productvisie en persona's elke prioriteringskeuze onderbouwen.", en: "Let the product vision and personas underpin every prioritisation choice.", fr: "Laissez la vision et les personas justifier chaque choix de priorisation." },
    { nl: "Sluit retro-acties echt af — open acties verschijnen in de volgende iteratie.", en: "Actually close retro actions — open ones reappear in the next iteration.", fr: "Clôturez vraiment les actions de rétro — les ouvertes réapparaissent." },
  ],
  tourSteps: [
    { title: { nl: "Flow board", en: "Flow board", fr: "Tableau de flux" }, description: { nl: "Bovenaan ziet u de continu-flow-board met live aantallen en de WIP-grens. Gebruik de functies hieronder om de iteratie te runnen.", en: "At the top you see the continuous-flow board with live counts and the WIP cap. Use the features below to run the iteration.", fr: "En haut, le tableau à flux continu avec compteurs en direct et plafond WIP. Utilisez les fonctions ci-dessous pour mener l'itération." } },
  ],
});

const buildWaterfallGuide = (projectId: string): RawGuide => ({
  pageTitle: { nl: "Waterfall", en: "Waterfall", fr: "Cascade" },
  pageDescription: {
    nl: "Lever via opeenvolgende fasen met fasepoorten: eisen → ontwerp → bouw → test → uitrol. Elke poort moet passeren voordat de volgende fase begint. Klik op een functie om er direct heen te gaan.",
    en: "Deliver through sequential phases with phase gates: requirements → design → build → test → deployment. Each gate must pass before the next phase starts. Click a feature to jump straight to it.",
    fr: "Livrez par phases séquentielles avec des jalons : exigences → conception → réalisation → test → déploiement. Chaque jalon doit passer avant la phase suivante. Cliquez sur une fonction pour y accéder.",
  },
  features: [
    { icon: Layout, title: { nl: "Dashboard", en: "Dashboard", fr: "Tableau de bord" }, description: { nl: "Huidige fase, voortgang en de fasenflow in één beeld", en: "Current phase, progress and the phase flow in one view", fr: "Phase actuelle, progression et flux de phases en une vue" }, path: `/projects/${projectId}/waterfall/overview` },
    { icon: FileText, title: { nl: "Eisen", en: "Requirements", fr: "Exigences" }, description: { nl: "Vastleggen en baselinen wat het systeem moet doen", en: "Capture and baseline what the system must do", fr: "Capturer et figer ce que le système doit faire" }, path: `/projects/${projectId}/waterfall/requirements` },
    { icon: Workflow, title: { nl: "Ontwerp", en: "Design", fr: "Conception" }, description: { nl: "Eisen vertalen naar een technisch ontwerp", en: "Translate requirements into a technical design", fr: "Traduire les exigences en conception technique" }, path: `/projects/${projectId}/waterfall/design` },
    { icon: BarChart3, title: { nl: "Bouw", en: "Development", fr: "Réalisation" }, description: { nl: "Bouwen volgens het goedgekeurde ontwerp", en: "Build to the approved design", fr: "Réaliser selon la conception approuvée" }, path: `/projects/${projectId}/waterfall/development` },
    { icon: CheckCircle2, title: { nl: "Test", en: "Testing", fr: "Test" }, description: { nl: "Verifiëren tegen de eisen — falende tests passeren niet", en: "Verify against requirements — failing tests don't pass", fr: "Vérifier selon les exigences — un test échoué ne passe pas" }, path: `/projects/${projectId}/waterfall/testing` },
    { icon: Shield, title: { nl: "Fasepoort", en: "Phase Gate", fr: "Jalon de phase" }, description: { nl: "Go/no-go-besluit dat de volgende fase ontgrendelt", en: "Go/no-go decision that unlocks the next phase", fr: "Décision go/no-go qui débloque la phase suivante" }, path: `/projects/${projectId}/waterfall/phase-gate` },
    { icon: Calendar, title: { nl: "Mijlpalen", en: "Milestones", fr: "Jalons" }, description: { nl: "Vaste data bewaken tegen het plan", en: "Track fixed dates against the plan", fr: "Suivre les dates fixes par rapport au plan" }, path: `/projects/${projectId}/waterfall/milestones` },
    { icon: BarChart3, title: { nl: "Gantt", en: "Gantt", fr: "Gantt" }, description: { nl: "Tijdlijn en afhankelijkheden van alle fasen", en: "Timeline and dependencies of all phases", fr: "Calendrier et dépendances de toutes les phases" }, path: `/projects/${projectId}/waterfall/gantt` },
  ],
  howTos: [
    { title: { nl: "Een fase afronden", en: "Complete a phase", fr: "Achever une phase" }, steps: [
      { nl: "Lever alle producten van de fase op", en: "Deliver all of the phase's products", fr: "Livrez tous les produits de la phase" },
      { nl: "Open de Fasepoort en controleer de exit-criteria", en: "Open the Phase Gate and check the exit criteria", fr: "Ouvrez le Jalon et vérifiez les critères de sortie" },
      { nl: "Vraag een go/no-go — alleen 'go' ontgrendelt de volgende fase", en: "Request a go/no-go — only 'go' unlocks the next phase", fr: "Demandez un go/no-go — seul « go » débloque la phase suivante" },
    ] },
    { title: { nl: "Een baseline beheren", en: "Manage a baseline", fr: "Gérer une référence" }, steps: [
      { nl: "Baseline de eisen voordat het ontwerp begint", en: "Baseline the requirements before design starts", fr: "Figez les exigences avant la conception" },
      { nl: "Voer wijzigingen alleen via Change Requests door", en: "Make changes only via Change Requests", fr: "N'apportez de changements que via des demandes de changement" },
      { nl: "Volg afwijkingen op tijd en kosten via EVM op het dashboard", en: "Track time/cost variance via EVM on the dashboard", fr: "Suivez les écarts délai/coût via l'EVM sur le tableau de bord" },
    ] },
  ],
  tips: [
    { nl: "De fasepoort is echt: zonder go-besluit start de volgende fase niet.", en: "The phase gate is real: without a go decision the next phase won't start.", fr: "Le jalon est réel : sans décision « go », la phase suivante ne démarre pas." },
    { nl: "Baseline eisen vroeg en beheer wijzigingen — scope creep doodt het plan.", en: "Baseline requirements early and control change — scope creep kills the plan.", fr: "Figez les exigences tôt et maîtrisez le changement — la dérive tue le plan." },
    { nl: "Gebruik EVM (CPI/SPI) om vroeg te zien of u voor- of achterloopt.", en: "Use EVM (CPI/SPI) to see early whether you're ahead or behind.", fr: "Utilisez l'EVM (CPI/SPI) pour voir tôt si vous êtes en avance ou en retard." },
  ],
  tourSteps: [
    { title: { nl: "Fasenflow", en: "Phase flow", fr: "Flux de phases" }, description: { nl: "Bovenaan ziet u de fasen REQ→DES→DEV→TST→DEP met voortgang en de poortstatus. Volg de functies hieronder per fase.", en: "At the top you see the phases REQ→DES→DEV→TST→DEP with progress and the gate status. Follow the features below per phase.", fr: "En haut, les phases REQ→DES→DEV→TST→DEP avec progression et statut du jalon. Suivez les fonctions ci-dessous par phase." } },
  ],
});

const buildHybridGuide = (projectId: string): RawGuide => ({
  pageTitle: { nl: "Hybride", en: "Hybrid", fr: "Hybride" },
  pageDescription: {
    nl: "Combineer voorspellende en adaptieve aanpakken: per fase kiest u de methodiek (bv. waterfall voor ontwerp, scrum voor bouw). De gekozen methodiek bepaalt de werkwijze van die fase. Klik op een functie om er direct heen te gaan.",
    en: "Blend predictive and adaptive approaches: per phase you choose the methodology (e.g. waterfall for design, scrum for build). The chosen methodology drives that phase's way of working. Click a feature to jump straight to it.",
    fr: "Combinez approches prédictive et adaptative : par phase, choisissez la méthodologie (ex. cascade pour la conception, scrum pour la réalisation). La méthodologie choisie pilote la façon de travailler de la phase. Cliquez sur une fonction pour y accéder.",
  },
  features: [
    { icon: Layout, title: { nl: "Dashboard", en: "Dashboard", fr: "Tableau de bord" }, description: { nl: "Fasen, methodieken-in-gebruik en voortgang in één beeld", en: "Phases, methodologies-in-use and progress in one view", fr: "Phases, méthodologies utilisées et progression en une vue" }, path: `/projects/${projectId}/hybrid/overview` },
    { icon: GitBranch, title: { nl: "Fasen & methodiek", en: "Phases & methodology", fr: "Phases & méthodologie" }, description: { nl: "Per fase de methodiek kiezen die de werkwijze stuurt", en: "Per phase choose the methodology that drives the workflow", fr: "Par phase, choisir la méthodologie qui pilote le flux" }, path: `/projects/${projectId}/hybrid/phases` },
    { icon: ListChecks, title: { nl: "Taken", en: "Tasks", fr: "Tâches" }, description: { nl: "Werk per fase toewijzen en de status volgen", en: "Assign work per phase and track status", fr: "Attribuer le travail par phase et suivre le statut" }, path: `/projects/${projectId}/hybrid/tasks` },
    { icon: Calendar, title: { nl: "Tijdlijn", en: "Timeline", fr: "Calendrier" }, description: { nl: "De fasen in de tijd met afhankelijkheden", en: "The phases over time with dependencies", fr: "Les phases dans le temps avec dépendances" }, path: `/projects/${projectId}/hybrid/timeline` },
    { icon: FileText, title: { nl: "Artefacten", en: "Artifacts", fr: "Artefacts" }, description: { nl: "Documenten en producten per fase beheren", en: "Manage documents and products per phase", fr: "Gérer documents et produits par phase" }, path: `/projects/${projectId}/hybrid/artifacts` },
    { icon: Settings, title: { nl: "Configuratie", en: "Configuration", fr: "Configuration" }, description: { nl: "Governance en regels per fase instellen", en: "Set governance and rules per phase", fr: "Définir la gouvernance et les règles par phase" }, path: `/projects/${projectId}/hybrid/configuration` },
  ],
  howTos: [
    { title: { nl: "Een fase inrichten", en: "Set up a phase", fr: "Configurer une phase" }, steps: [
      { nl: "Open Fasen & methodiek en voeg een fase toe", en: "Open Phases & methodology and add a phase", fr: "Ouvrez Phases & méthodologie et ajoutez une phase" },
      { nl: "Kies de methodiek die bij die fase past", en: "Choose the methodology that fits that phase", fr: "Choisissez la méthodologie adaptée à la phase" },
      { nl: "De gekozen methodiek bepaalt de artefacten en governance", en: "The chosen methodology drives the artifacts and governance", fr: "La méthodologie choisie pilote les artefacts et la gouvernance" },
    ] },
    { title: { nl: "Werk per fase uitvoeren", en: "Execute work per phase", fr: "Exécuter le travail par phase" }, steps: [
      { nl: "Open Taken en filter op de actieve fase", en: "Open Tasks and filter on the active phase", fr: "Ouvrez Tâches et filtrez sur la phase active" },
      { nl: "Wijs werk toe en volg de status", en: "Assign work and track status", fr: "Attribuez le travail et suivez le statut" },
      { nl: "Volg de overkoepelende voortgang op het dashboard", en: "Track overall progress on the dashboard", fr: "Suivez la progression globale sur le tableau de bord" },
    ] },
  ],
  tips: [
    { nl: "Het methodiek-label per fase is functioneel: het verandert echt de werkwijze van die fase.", en: "The per-phase methodology label is functional: it actually changes that phase's way of working.", fr: "L'étiquette de méthodologie par phase est fonctionnelle : elle change réellement la façon de travailler." },
    { nl: "Gebruik voorspellende fasen waar de scope vaststaat en adaptieve waar die nog evolueert.", en: "Use predictive phases where scope is fixed and adaptive where it still evolves.", fr: "Utilisez des phases prédictives où la portée est fixe et adaptatives où elle évolue." },
    { nl: "Houd de configuratie per fase actueel zodat governance bij de aanpak past.", en: "Keep the per-phase configuration current so governance matches the approach.", fr: "Gardez la configuration par phase à jour pour aligner la gouvernance." },
  ],
  tourSteps: [
    { title: { nl: "Fasenflow", en: "Phase flow", fr: "Flux de phases" }, description: { nl: "Bovenaan ziet u elke fase met zijn gekozen methodiek en voortgang. Gebruik de functies hieronder om fasen in te richten en uit te voeren.", en: "At the top you see each phase with its chosen methodology and progress. Use the features below to set up and execute phases.", fr: "En haut, chaque phase avec sa méthodologie choisie et sa progression. Utilisez les fonctions ci-dessous pour configurer et exécuter." } },
  ],
});

const buildLssGreenGuide = (projectId: string): RawGuide => ({
  pageTitle: { nl: "Lean Six Sigma — Green Belt", en: "Lean Six Sigma — Green Belt", fr: "Lean Six Sigma — Green Belt" },
  pageDescription: {
    nl: "Verbeter een proces via DMAIC: Define → Measure → Analyze → Improve → Control. Een tollgate sluit elke fase af voordat de volgende start. Klik op een functie om er direct heen te gaan.",
    en: "Improve a process through DMAIC: Define → Measure → Analyze → Improve → Control. A tollgate closes each phase before the next begins. Click a feature to jump straight to it.",
    fr: "Améliorez un processus via DMAIC : Define → Measure → Analyze → Improve → Control. Un tollgate clôt chaque phase avant la suivante. Cliquez sur une fonction pour y accéder.",
  },
  features: [
    { icon: Layout, title: { nl: "Dashboard", en: "Dashboard", fr: "Tableau de bord" }, description: { nl: "DMAIC-flow, fasen en kwaliteitsmetrieken in één beeld", en: "DMAIC flow, phases and quality metrics in one view", fr: "Flux DMAIC, phases et métriques qualité en une vue" }, path: `/projects/${projectId}/lss-green/overview` },
    { icon: Target, title: { nl: "DMAIC-fasen", en: "DMAIC Phases", fr: "Phases DMAIC" }, description: { nl: "Elke fase doorlopen met een tollgate als afsluiting", en: "Work each phase with a tollgate as the closeout", fr: "Dérouler chaque phase avec un tollgate de clôture" }, path: `/projects/${projectId}/lss-green/phases` },
    { icon: ListChecks, title: { nl: "Taken", en: "Tasks", fr: "Tâches" }, description: { nl: "Verbeteracties per fase toewijzen en volgen", en: "Assign and track improvement actions per phase", fr: "Attribuer et suivre les actions d'amélioration par phase" }, path: `/projects/${projectId}/lss-green/tasks` },
    { icon: BarChart3, title: { nl: "Metingen", en: "Measurements", fr: "Mesures" }, description: { nl: "Procesdata vastleggen voor een betrouwbare baseline", en: "Capture process data for a reliable baseline", fr: "Capturer les données process pour une référence fiable" }, path: `/projects/${projectId}/lss-green/measurements` },
    { icon: TrendingUp, title: { nl: "Metrieken", en: "Metrics", fr: "Métriques" }, description: { nl: "Cp, Cpk, DPMO en sigma-niveau berekend uit echte data", en: "Cp, Cpk, DPMO and sigma level computed from real data", fr: "Cp, Cpk, DPMO et niveau sigma calculés depuis les données" }, path: `/projects/${projectId}/lss-green/metrics` },
    { icon: Calendar, title: { nl: "Tijdlijn", en: "Timeline", fr: "Calendrier" }, description: { nl: "De DMAIC-fasen in de tijd uitgezet", en: "The DMAIC phases laid out over time", fr: "Les phases DMAIC réparties dans le temps" }, path: `/projects/${projectId}/lss-green/timeline` },
  ],
  howTos: [
    { title: { nl: "Een DMAIC-fase afsluiten", en: "Close a DMAIC phase", fr: "Clôturer une phase DMAIC" }, steps: [
      { nl: "Rond de taken en deliverables van de fase af", en: "Finish the phase's tasks and deliverables", fr: "Terminez les tâches et livrables de la phase" },
      { nl: "Controleer dat de tollgate-criteria gehaald zijn", en: "Check the tollgate criteria are met", fr: "Vérifiez que les critères du tollgate sont atteints" },
      { nl: "Sluit de tollgate — pas dan opent de volgende fase", en: "Pass the tollgate — only then does the next phase open", fr: "Franchissez le tollgate — alors seulement la phase suivante s'ouvre" },
    ] },
    { title: { nl: "Capability bepalen", en: "Establish capability", fr: "Établir la capabilité" }, steps: [
      { nl: "Leg metingen vast in de Measure-fase", en: "Capture measurements in the Measure phase", fr: "Capturez les mesures en phase Measure" },
      { nl: "Open Metrieken voor Cp/Cpk en sigma-niveau", en: "Open Metrics for Cp/Cpk and sigma level", fr: "Ouvrez les Métriques pour Cp/Cpk et le niveau sigma" },
      { nl: "Vergelijk de baseline met het doel na Improve", en: "Compare the baseline to the target after Improve", fr: "Comparez la référence à la cible après Improve" },
    ] },
  ],
  tips: [
    { nl: "De tollgate is echt: een fase voltooien lukt niet zonder dat de poort gehaald is.", en: "The tollgate is real: you can't complete a phase without passing the gate.", fr: "Le tollgate est réel : impossible d'achever une phase sans le franchir." },
    { nl: "Meet eerst, verbeter daarna — beslis op data, niet op aannames.", en: "Measure first, improve later — decide on data, not assumptions.", fr: "Mesurez d'abord, améliorez ensuite — décidez sur des données." },
    { nl: "Cp/Cpk en sigma worden uit echte metingen berekend; vul de Measure-fase volledig.", en: "Cp/Cpk and sigma are computed from real measurements; complete the Measure phase fully.", fr: "Cp/Cpk et sigma sont calculés depuis des mesures réelles ; complétez la phase Measure." },
  ],
  tourSteps: [
    { title: { nl: "DMAIC-flow", en: "DMAIC flow", fr: "Flux DMAIC" }, description: { nl: "Bovenaan ziet u D→M→A→I→C met de status per fase. Gebruik de functies hieronder om elke fase uit te voeren en af te sluiten.", en: "At the top you see D→M→A→I→C with each phase's status. Use the features below to execute and close each phase.", fr: "En haut, D→M→A→I→C avec le statut de chaque phase. Utilisez les fonctions ci-dessous pour exécuter et clôturer." } },
  ],
});

const buildLssBlackGuide = (projectId: string): RawGuide => ({
  pageTitle: { nl: "Lean Six Sigma — Black Belt", en: "Lean Six Sigma — Black Belt", fr: "Lean Six Sigma — Black Belt" },
  pageDescription: {
    nl: "Voer geavanceerde DMAIC-verbeteringen uit met statistische tools: hypothesetoetsen, DOE, control plans en SPC. Een tollgate sluit elke fase af. Klik op een functie om er direct heen te gaan.",
    en: "Run advanced DMAIC improvements with statistical tools: hypothesis tests, DOE, control plans and SPC. A tollgate closes each phase. Click a feature to jump straight to it.",
    fr: "Menez des améliorations DMAIC avancées avec des outils statistiques : tests d'hypothèses, plans d'expériences, plans de contrôle et SPC. Un tollgate clôt chaque phase. Cliquez sur une fonction pour y accéder.",
  },
  features: [
    { icon: Layout, title: { nl: "Dashboard", en: "Dashboard", fr: "Tableau de bord" }, description: { nl: "DMAIC-flow, statistische studies en kosten in één beeld", en: "DMAIC flow, statistical studies and cost in one view", fr: "Flux DMAIC, études statistiques et coûts en une vue" }, path: `/projects/${projectId}/lss-black/overview` },
    { icon: Target, title: { nl: "DMAIC-fasen", en: "DMAIC Phases", fr: "Phases DMAIC" }, description: { nl: "Elke fase doorlopen met een tollgate als afsluiting", en: "Work each phase with a tollgate as the closeout", fr: "Dérouler chaque phase avec un tollgate de clôture" }, path: `/projects/${projectId}/lss-black/phases` },
    { icon: BarChart3, title: { nl: "Hypothesetoetsen", en: "Hypothesis Tests", fr: "Tests d'hypothèses" }, description: { nl: "Vermoede oorzaken statistisch bevestigen of verwerpen", en: "Statistically confirm or reject suspected causes", fr: "Confirmer ou rejeter statistiquement les causes suspectées" }, path: `/projects/${projectId}/lss-black/hypothesis-tests` },
    { icon: Workflow, title: { nl: "DOE", en: "DOE", fr: "Plans d'expériences" }, description: { nl: "Design of Experiments om factoren te optimaliseren", en: "Design of Experiments to optimise factors", fr: "Plans d'expériences pour optimiser les facteurs" }, path: `/projects/${projectId}/lss-black/doe` },
    { icon: Shield, title: { nl: "Control Plans", en: "Control Plans", fr: "Plans de contrôle" }, description: { nl: "Verbeteringen borgen met een beheersplan", en: "Lock in improvements with a control plan", fr: "Pérenniser les gains avec un plan de contrôle" }, path: `/projects/${projectId}/lss-black/control-plans` },
    { icon: TrendingUp, title: { nl: "SPC-kaarten", en: "SPC Charts", fr: "Cartes SPC" }, description: { nl: "Statistische procesbeheersing — speciale oorzaken signaleren", en: "Statistical process control — flag special causes", fr: "Maîtrise statistique — signaler les causes spéciales" }, path: `/projects/${projectId}/lss-black/spc-charts` },
    { icon: ListChecks, title: { nl: "Taken", en: "Tasks", fr: "Tâches" }, description: { nl: "Werk per fase toewijzen en de status volgen", en: "Assign work per phase and track status", fr: "Attribuer le travail par phase et suivre le statut" }, path: `/projects/${projectId}/lss-black/tasks` },
  ],
  howTos: [
    { title: { nl: "Een oorzaak bewijzen", en: "Prove a root cause", fr: "Prouver une cause racine" }, steps: [
      { nl: "Formuleer een hypothese in de Analyze-fase", en: "Formulate a hypothesis in the Analyze phase", fr: "Formulez une hypothèse en phase Analyze" },
      { nl: "Voer een hypothesetoets uit met voldoende data", en: "Run a hypothesis test with sufficient data", fr: "Exécutez un test d'hypothèse avec assez de données" },
      { nl: "Gebruik de p-waarde om de oorzaak te bevestigen of te verwerpen", en: "Use the p-value to confirm or reject the cause", fr: "Utilisez la p-value pour confirmer ou rejeter la cause" },
    ] },
    { title: { nl: "Verbeteringen borgen (Control)", en: "Lock in gains (Control)", fr: "Pérenniser les gains (Control)" }, steps: [
      { nl: "Stel een Control Plan op voor de verbeterde proceswaarden", en: "Create a Control Plan for the improved process values", fr: "Créez un Plan de contrôle pour les valeurs améliorées" },
      { nl: "Configureer een SPC-kaart om afwijkingen te bewaken", en: "Configure an SPC chart to monitor deviations", fr: "Configurez une carte SPC pour surveiller les écarts" },
      { nl: "Sluit de Control-tollgate om het project af te ronden", en: "Pass the Control tollgate to finish the project", fr: "Franchissez le tollgate Control pour clôturer le projet" },
    ] },
  ],
  tips: [
    { nl: "De tollgate is echt: een fase voltooien lukt niet zonder dat de poort gehaald is.", en: "The tollgate is real: you can't complete a phase without passing the gate.", fr: "Le tollgate est réel : impossible d'achever une phase sans le franchir." },
    { nl: "Bewijs oorzaken met statistiek (hypothesetoets/DOE) voordat u verbetert.", en: "Prove causes with statistics (hypothesis test/DOE) before you improve.", fr: "Prouvez les causes par la statistique (test/DOE) avant d'améliorer." },
    { nl: "Borg in Control met een control plan + SPC; zonder borging keert de variatie terug.", en: "Secure in Control with a control plan + SPC; without it the variation returns.", fr: "Pérennisez en Control avec un plan + SPC ; sinon la variation revient." },
  ],
  tourSteps: [
    { title: { nl: "DMAIC-flow", en: "DMAIC flow", fr: "Flux DMAIC" }, description: { nl: "Bovenaan ziet u D→M→A→I→C met de status per fase. De statistische tools hieronder horen bij Analyze, Improve en Control.", en: "At the top you see D→M→A→I→C with each phase's status. The statistical tools below belong to Analyze, Improve and Control.", fr: "En haut, D→M→A→I→C avec le statut de chaque phase. Les outils statistiques ci-dessous relèvent d'Analyze, Improve et Control." } },
  ],
});

/* Methodology key (from the URL) → guide builder. Lets any project page show
   its own methodology guide with working deep links instead of the generic
   "Projecten" guide. */
const METHODOLOGY_GUIDE_BUILDERS: Record<string, (projectId: string) => RawGuide> = {
  prince2: buildPrince2Guide,
  scrum: buildScrumGuide,
  kanban: buildKanbanGuide,
  agile: buildAgileGuide,
  waterfall: buildWaterfallGuide,
  hybrid: buildHybridGuide,
  "lss-green": buildLssGreenGuide,
  "lss-black": buildLssBlackGuide,
};

/* ─── Related pages navigation ─── */
interface NavLink {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

/* Labels are English canonical translation keys, rendered through pt() so the
   navigation localises to NL/EN/FR with the rest of the app. */
const RELATED_PAGES: Record<string, NavLink[]> = {
  "/dashboard":      [{ label: "Projects", path: "/projects", icon: FolderKanban }, { label: "Reports", path: "/reports", icon: FileText }, { label: "Team", path: "/team", icon: Users }],
  "/projects":       [{ label: "Dashboard", path: "/dashboard", icon: Layout }, { label: "Programs", path: "/programs", icon: Building2 }, { label: "Team", path: "/team", icon: Users }],
  "/programs":       [{ label: "Projects", path: "/projects", icon: FolderKanban }, { label: "Governance", path: "/governance/portfolios", icon: Shield }, { label: "Reports", path: "/reports", icon: FileText }],
  "/governance":     [{ label: "Programs", path: "/programs", icon: Building2 }, { label: "Reports", path: "/reports", icon: FileText }, { label: "Projects", path: "/projects", icon: FolderKanban }],
  "/reports":        [{ label: "Dashboard", path: "/dashboard", icon: Layout }, { label: "Projects", path: "/projects", icon: FolderKanban }, { label: "Time Tracking", path: "/time-tracking", icon: Clock }],
  "/team":           [{ label: "Projects", path: "/projects", icon: FolderKanban }, { label: "Time Tracking", path: "/time-tracking", icon: Clock }, { label: "Dashboard", path: "/dashboard", icon: Layout }],
  "/time-tracking":  [{ label: "Projects", path: "/projects", icon: FolderKanban }, { label: "Team", path: "/team", icon: Users }, { label: "Reports", path: "/reports", icon: FileText }],
  "/ai-assistant":   [{ label: "Dashboard", path: "/dashboard", icon: Layout }, { label: "Projects", path: "/projects", icon: FolderKanban }, { label: "Reports", path: "/reports", icon: FileText }],
  "/post-project":   [{ label: "Projects", path: "/projects", icon: FolderKanban }, { label: "Reports", path: "/reports", icon: FileText }, { label: "Surveys", path: "/surveys", icon: FileText }],
  "/profile":        [{ label: "Settings", path: "/settings", icon: Settings }, { label: "Dashboard", path: "/dashboard", icon: Layout }, { label: "Team", path: "/team", icon: Users }],
  "/settings":       [{ label: "Profile", path: "/profile", icon: Users }, { label: "Team", path: "/team", icon: Users }, { label: "Governance", path: "/governance/portfolios", icon: Shield }],
  "/surveys":        [{ label: "Post Project", path: "/post-project", icon: CheckCircle2 }, { label: "Team", path: "/team", icon: Users }, { label: "Reports", path: "/reports", icon: FileText }],
};

const APP_SITEMAP: NavSection[] = [
  { title: "Overview", links: [
    { label: "Dashboard", path: "/dashboard", icon: Layout },
    { label: "AI Assistant", path: "/ai-assistant", icon: Brain },
  ]},
  { title: "Projects & Programs", links: [
    { label: "Projects", path: "/projects", icon: FolderKanban },
    { label: "Programs", path: "/programs", icon: Building2 },
    { label: "Governance", path: "/governance/portfolios", icon: Shield },
  ]},
  { title: "Team & Planning", links: [
    { label: "Team", path: "/team", icon: Users },
    { label: "Time Tracking", path: "/time-tracking", icon: Clock },
    { label: "Reports", path: "/reports", icon: FileText },
  ]},
  { title: "Evaluation & Other", links: [
    { label: "Post Project", path: "/post-project", icon: CheckCircle2 },
    { label: "Surveys", path: "/surveys", icon: FileText },
    { label: "Profile", path: "/profile", icon: Users },
    { label: "Settings", path: "/settings", icon: Settings },
  ]},
];

/* ═══════════════════════════════════════════════════════════════════
   SUGGESTIONS & QUICK ACTIONS (Chat tab)
   ═══════════════════════════════════════════════════════════════════ */

const suggestionsData = {
  en: [
    { icon: AlertTriangle, title: "Project risks", description: "Analyze current project risks and suggest mitigations." },
    { icon: TrendingUp, title: "Performance report", description: "Generate a summary of project performance metrics." },
  ],
  nl: [
    { icon: AlertTriangle, title: "Projectrisico's", description: "Analyseer huidige projectrisico's en stel mitigaties voor." },
    { icon: TrendingUp, title: "Prestatierapport", description: "Genereer een samenvatting van projectprestaties." },
  ],
};

const quickActionsData = {
  en: [
    { icon: BarChart3, label: "Monthly report" },
    { icon: TrendingUp, label: "Portfolio analysis" },
    { icon: AlertTriangle, label: "Risk scan" },
  ],
  nl: [
    { icon: BarChart3, label: "Maandrapportage" },
    { icon: TrendingUp, label: "Portfolio analyse" },
    { icon: AlertTriangle, label: "Risico scan" },
  ],
};

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function AICopilotSidebar() {
  const { isOpen, close, requestedTab } = useCopilot();
  const { language } = useLanguage();
  const { pt } = usePageTranslations();
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<CopilotTab>("chat");
  const [isTourOpen, setIsTourOpen] = useState(false);

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeForm, setActiveForm] = useState<any>(null);
  // Pre-fill payload for the Issues tab. When chat detects an issue-intent
  // and user clicks "Maak hier een issue van", we lift the prefill to this
  // state and switch to the Issues tab; the IssuesTab reads it once.
  const [issuePrefill, setIssuePrefill] = useState<{ title: string; description: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Detect issue-report intent from a user message. Conservative — only
   *  matches clear bug/error words to avoid false positives in normal chat. */
  const isIssueIntent = (text: string): boolean => {
    if (!text) return false;
    const t = text.toLowerCase();
    const triggers = [
      "probleem", "issue", "bug", "fout", "foutmelding", "error", "crash",
      "werkt niet", "kan niet", "lukt niet", "broken", "doesn't work",
      "stuck", "freezes", "hangt", "vastloop",
    ];
    return triggers.some((w) => t.includes(w));
  };

  /** Extract a short title (first 60 chars of first line) and full body
   *  (last few user messages) for pre-filling the issue form. */
  const buildIssuePrefillFromChat = (sourceText?: string) => {
    const lastUserMsgs = messages
      .filter((m) => m.role === "user")
      .slice(-3)
      .map((m) => m.content);
    const seed = sourceText ?? lastUserMsgs[lastUserMsgs.length - 1] ?? "";
    const firstLine = seed.split("\n")[0] || seed;
    return {
      title: firstLine.slice(0, 100).trim(),
      description: [...lastUserMsgs, sourceText].filter(Boolean).join("\n\n").slice(0, 4000),
    };
  };

  const openIssueFromChat = (sourceText?: string) => {
    setIssuePrefill(buildIssuePrefillFromChat(sourceText));
    setActiveTab("issues");
  };

  // Resolve current path for guide
  const currentPath = "/" + location.pathname.split("/").filter(Boolean)[0];
  // Methodology-specific guides take precedence so a project page shows its own
  // guide (with working deep links) instead of the generic "Projecten" guide.
  const methodologyMatch = location.pathname.match(/^\/projects\/([^/]+)\/(prince2|scrum|kanban|agile|waterfall|hybrid|lss-green|lss-black)(?:\/|$)/);
  const guideLang: GuideLang = language === "nl" || language === "fr" ? language : "en";
  const rawGuide: RawGuide = methodologyMatch
    ? METHODOLOGY_GUIDE_BUILDERS[methodologyMatch[2]](methodologyMatch[1])
    : GUIDE_MAP[location.pathname] || GUIDE_MAP[currentPath] || DEFAULT_GUIDE;
  const guide = resolveGuide(rawGuide, guideLang);

  const suggestions = language === "nl" ? suggestionsData.nl : suggestionsData.en;
  const quickActions = language === "nl" ? quickActionsData.nl : quickActionsData.en;

  // Sync with requested tab from context
  useEffect(() => {
    if (requestedTab) setActiveTab(requestedTab);
  }, [requestedTab]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && activeTab === "chat") setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen, activeTab]);

  const handleSendMessage = async (customMessage?: string) => {
    const messageContent = customMessage || inputValue;
    if (!messageContent.trim() || isSending) return;
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: messageContent, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);
    setActiveForm(null);
    try {
      let chatId = currentChatId;
      if (!chatId) {
        const newChat = await api.post<{ id: string; title: string }>("/bot/chats/", { title: messageContent.substring(0, 50) });
        chatId = newChat.id.toString();
        setCurrentChatId(chatId);
      }
      const response = await api.post<SendMessageResponse>(`/bot/chats/${chatId}/send_message/`, { message: messageContent, language });
      let formSchema = null;
      if (response.ai_response?.original_ai_response) {
        try {
          const parsed = JSON.parse(response.ai_response.original_ai_response);
          if (parsed.form_type && parsed.fields) { formSchema = parsed; setActiveForm(parsed); }
        } catch {}
      }
      const aiResponse: Message = { id: (response.ai_response?.id || Date.now() + 1).toString(), role: "assistant", content: response.ai_response?.content || "Sorry, I could not process your request.", timestamp: new Date(), formSchema };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I encountered an error. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = async (result: any) => {
    setActiveForm(null);
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: `## Success\n\n${result.message || "Operation completed successfully!"}`, timestamp: new Date() }]);
  };

  const handleFormCancel = () => {
    setActiveForm(null);
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: language === "nl" ? "Formulier geannuleerd. Hoe kan ik verder helpen?" : "Form cancelled. How else can I help you?", timestamp: new Date() }]);
  };

  const handleNewChat = () => {
    setCurrentChatId(null); setMessages([]); setActiveForm(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(language === "nl" ? "Gekopieerd" : "Copied to clipboard");
  };

  const handleFeedback = (type: "positive" | "negative") => {
    toast.success(type === "positive" ? "Thanks for the feedback!" : "We'll work to improve");
  };

  if (!isOpen) return null;

  const sidebarWidth = expanded ? "w-[600px]" : "w-[380px]";
  const isNl = language === "nl";

  /* ─── Guide Tab Content ─── */
  const renderGuideTab = () => (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {/* Page header */}
        <div className="rounded-lg bg-gradient-to-r from-purple-600/10 to-fuchsia-600/10 border border-purple-200 dark:border-purple-800/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Info className="h-4 w-4 text-purple-600" />
            <h4 className="text-sm font-semibold text-foreground">{guide.pageTitle}</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{guide.pageDescription}</p>
          {guide.tourSteps.length > 0 && (
            <Button
              size="sm"
              className="mt-3 text-xs bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-700 hover:to-fuchsia-700"
              onClick={() => setIsTourOpen(true)}
            >
              <Play className="h-3 w-3 mr-1.5" />
              {pt("Start Tour")}
            </Button>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            {pt("Features")}
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {guide.features.map((feature, i) => {
              const Icon = feature.icon;
              const clickable = !!feature.path;
              const inner = (
                <>
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                    <Icon className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-purple-600 transition-colors">{feature.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">{feature.description}</p>
                  </div>
                  {clickable && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />}
                </>
              );
              return clickable ? (
                <button
                  key={i}
                  onClick={() => navigate(feature.path!)}
                  className="group flex items-start gap-2.5 p-2.5 rounded-lg border border-border hover:bg-accent/40 hover:border-purple-300 transition-all text-left w-full cursor-pointer"
                >
                  {inner}
                </button>
              ) : (
                <div key={i} className="group flex items-start gap-2.5 p-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* How-To's */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            {pt("How does it work?")}
          </p>
          {guide.howTos.map((howTo, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <ArrowRight className="h-3 w-3 text-purple-500" />
                <p className="text-xs font-semibold text-foreground">{howTo.title}</p>
              </div>
              <ol className="space-y-1 ml-4">
                {howTo.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                    <span className="w-4 h-4 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5">{j + 1}</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Tips */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Tips & Best Practices</p>
          {guide.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>

        {/* Ask AI button */}
        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setActiveTab("chat"); handleSendMessage(`${pt("How do I use")} ${guide.pageTitle}? ${pt("Give me an overview.")}`); }}>
            <MessageSquare className="h-3 w-3 mr-1.5" />
            {pt("Ask AI Copilot about")} {guide.pageTitle}
          </Button>
        </div>

        <div className="border-t border-border" />

        {/* Related pages */}
        {RELATED_PAGES[currentPath] && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1">
              <Compass className="h-3 w-3" />
              {pt("Related pages")}
            </p>
            <div className="grid grid-cols-1 gap-1">
              {RELATED_PAGES[currentPath].map((link, i) => {
                const LinkIcon = link.icon;
                return (
                  <button key={i} className="flex items-center gap-2.5 p-2 rounded-lg border border-border hover:bg-accent/50 hover:border-purple-300 transition-all text-left group cursor-pointer w-full" onClick={() => navigate(link.path)}>
                    <div className="w-6 h-6 rounded-md bg-purple-500/10 group-hover:bg-purple-500/20 flex items-center justify-center shrink-0 transition-colors">
                      <LinkIcon className="h-3 w-3 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-foreground group-hover:text-purple-600 transition-colors">{pt(link.label)}</span>
                    <ExternalLink className="h-2.5 w-2.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sitemap */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1">
            <Map className="h-3 w-3" />
            {pt("All modules")}
          </p>
          <div className="space-y-2">
            {APP_SITEMAP.map((section, si) => (
              <div key={si} className="rounded-lg border border-border p-2.5 space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{pt(section.title)}</p>
                <div className="grid grid-cols-2 gap-1">
                  {section.links.map((link, li) => {
                    const SitemapIcon = link.icon;
                    const isCurrentPage = currentPath === link.path;
                    return (
                      <button key={li} className={cn("flex items-center gap-1.5 p-1.5 rounded-md text-left transition-all cursor-pointer text-[10px]", isCurrentPage ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 font-semibold border border-purple-200 dark:border-purple-800/50" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground")} onClick={() => !isCurrentPage && navigate(link.path)}>
                        <SitemapIcon className={cn("h-3 w-3 shrink-0", isCurrentPage ? "text-purple-600" : "text-muted-foreground")} />
                        <span className="truncate">{pt(link.label)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <>
      <div className={cn("h-full max-h-full min-h-0 border-l border-border bg-card flex flex-col transition-all duration-300 relative overflow-hidden", sidebarWidth)}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">AI Copilot</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">Online</Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">ProjeXtPal AI</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setExpanded(!expanded)} title={expanded ? "Minimize" : "Expand"}>
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={close}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border bg-muted/30">
          <button className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-b-2", activeTab === "chat" ? "border-purple-600 text-purple-700 dark:text-purple-400" : "border-transparent text-muted-foreground hover:text-foreground")} onClick={() => setActiveTab("chat")}>
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </button>
          <button className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-b-2", activeTab === "guide" ? "border-purple-600 text-purple-700 dark:text-purple-400" : "border-transparent text-muted-foreground hover:text-foreground")} onClick={() => setActiveTab("guide")}>
            <HelpCircle className="h-3.5 w-3.5" />
            {pt("Guide")}
          </button>
          <button className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-b-2", activeTab === "setup" ? "border-purple-600 text-purple-700 dark:text-purple-400" : "border-transparent text-muted-foreground hover:text-foreground")} onClick={() => setActiveTab("setup")}>
            <Settings className="h-3.5 w-3.5" />
            Setup
          </button>
          <button className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-b-2", activeTab === "issues" ? "border-purple-600 text-purple-700 dark:text-purple-400" : "border-transparent text-muted-foreground hover:text-foreground")} onClick={() => setActiveTab("issues")}>
            <AlertTriangle className="h-3.5 w-3.5" />
            Issues
          </button>
        </div>

        {/* Content */}
        {activeTab === "issues" ? (
          <IssuesTab
            pathname={location.pathname}
            isActive={activeTab === "issues"}
            prefill={issuePrefill}
            onPrefillConsumed={() => setIssuePrefill(null)}
          />
        ) : activeTab === "setup" ? (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <div className="text-center pt-4 pb-2">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-lg">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-sm font-semibold">{isNl ? "AI Setup Copilot" : "AI Setup Copilot"}</h3>
                <p className="text-[11px] text-muted-foreground mt-1">{isNl ? "Laat AI uw omgeving configureren" : "Let AI configure your environment"}</p>
              </div>
              <div className="space-y-2">
                <button onClick={() => navigate("/setup-onboarding")} className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent/50 hover:border-purple-300 transition-all text-left group">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{isNl ? "Setup Wizard" : "Setup Wizard"}</p>
                    <p className="text-[11px] text-muted-foreground">{isNl ? "Stap-voor-stap onboarding" : "Step-by-step onboarding"}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-purple-600" />
                </button>
                <button onClick={() => navigate("/demo-environment")} className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent/50 hover:border-purple-300 transition-all text-left group">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Play className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{isNl ? "Demo Omgeving" : "Demo Environment"}</p>
                    <p className="text-[11px] text-muted-foreground">{isNl ? "Genereer demo data" : "Generate demo data"}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-purple-600" />
                </button>
              </div>
            </div>
          </ScrollArea>
        ) : activeTab === "guide" ? (
          renderGuideTab()
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-4">
                {messages.length === 0 ? (
                  <div className="space-y-6">
                    <div className="text-center pt-6 pb-2">
                      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-purple-400 to-fuchsia-500 shadow-lg">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">{isNl ? "Hallo! Ik ben uw AI Copilot" : "Hello! I'm your AI Copilot"}</h3>
                      <p className="text-xs text-muted-foreground max-w-[260px] mx-auto">{isNl ? "Ik help u met overzicht van uw projecten en programma's" : "I help you with insights on your projects and programs"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">{isNl ? "Suggesties" : "Suggestions"}</p>
                      <div className="space-y-2">
                        {suggestions.map((item, i) => (
                          <button key={i} onClick={() => handleSendMessage(item.description)} className="w-full flex items-start gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent/50 hover:border-primary/20 transition-all text-left group">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"><item.icon className="h-4 w-4 text-primary" /></div>
                            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground">{item.title}</p><p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p></div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
                          </button>
                        ))}
                        {/* Issue-melden suggestion (option A) — direct shortcut to the Issues tab. */}
                        <button
                          onClick={() => { setIssuePrefill(null); setActiveTab("issues"); }}
                          className="w-full flex items-start gap-3 p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{isNl ? "Probleem melden" : "Report a problem"}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">{isNl ? "Werkt iets niet zoals verwacht? Stuur het naar onze AI-triage." : "Something not working? Send it to our AI triage."}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-amber-600 transition-colors mt-1 flex-shrink-0" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">{isNl ? "Snelle Acties" : "Quick Actions"}</p>
                      <div className="space-y-1.5">
                        {quickActions.map((action, i) => (
                          <button key={i} onClick={() => handleSendMessage(action.label)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left">
                            <action.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message, idx) => {
                      const prevUserMsg = idx > 0 && messages[idx - 1].role === "user" ? messages[idx - 1].content : "";
                      const showIssueCta = message.role === "assistant" && isIssueIntent(prevUserMsg);
                      return (
                        <div key={message.id}>
                          <AIMessageRenderer message={{ id: message.id, role: message.role, content: message.content }} onCopy={handleCopyMessage} onFeedback={handleFeedback} showActions={message.role === "assistant"} />
                          {showIssueCta && (
                            <button
                              onClick={() => openIssueFromChat(prevUserMsg)}
                              className="ml-9 mt-1 mb-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-[11px] font-medium text-amber-800 dark:text-amber-200 transition-colors"
                              type="button"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {isNl ? "📋 Maak hier een issue van" : "📋 File this as an issue"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {activeForm && (<div className="mt-3"><DynamicForm schema={activeForm} onSubmit={handleFormSubmit} onCancel={handleFormCancel} /></div>)}
                    {isSending && (
                      <div className="flex items-start gap-2 mt-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center flex-shrink-0"><Loader2 className="h-4 w-4 text-white animate-spin" /></div>
                        <div className="bg-muted/50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                            <span className="text-xs text-muted-foreground ml-1">{isNl ? "Denken..." : "Thinking..."}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                )}
              </div>
            </ScrollArea>

            {messages.length > 0 && (
              <div className="px-4 pt-2">
                <Button variant="ghost" size="sm" onClick={handleNewChat} className="w-full text-xs text-muted-foreground hover:text-foreground">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  {isNl ? "Nieuw gesprek" : "New conversation"}
                </Button>
              </div>
            )}

            <div className="p-3 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Input ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === "Enter" && !isSending && !activeForm && handleSendMessage()} placeholder={isNl ? "Stel een vraag..." : "Ask a question..."} disabled={isSending || !!activeForm} className="h-10 text-sm bg-background" />
                <Button onClick={() => handleSendMessage()} disabled={!inputValue.trim() || isSending || !!activeForm} size="icon" className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white">
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-1.5">ProjeXtPal AI &middot; {isNl ? "Aangedreven door gespecialiseerde agents" : "Powered by specialized agents"}</p>
            </div>
          </>
        )}
      </div>

      {/* Guided Tour overlay */}
      {isTourOpen && guide.tourSteps.length > 0 && (
        <GuidedTour steps={guide.tourSteps} onClose={() => setIsTourOpen(false)} />
      )}
    </>
  );
}
