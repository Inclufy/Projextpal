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

/* ─── Types ─── */
type CopilotTab = "chat" | "guide" | "setup";

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

const GUIDE_MAP: Record<string, GuideContent> = {
  "/dashboard": {
    pageTitle: "Dashboard",
    pageDescription: "Uw centrale project cockpit met overzicht van alle projecten, programma's en taken.",
    features: [
      { icon: BarChart3, title: "Project overzicht", description: "Status van al uw projecten in één oogopslag" },
      { icon: ListChecks, title: "Taken & deadlines", description: "Openstaande taken en naderende deadlines" },
      { icon: TrendingUp, title: "Voortgang", description: "Voortgangsgrafieken en burndown charts" },
      { icon: AlertTriangle, title: "Risico's & alerts", description: "Waarschuwingen voor projectrisico's" },
    ],
    howTos: [
      { title: "Dashboard gebruiken", steps: ["Bekijk projectstatus kaarten bovenaan", "Scroll voor taak- en deadlineoverzicht", "Klik op een project voor details", "Gebruik filters voor specifieke weergaven"] },
    ],
    tips: [
      "Check uw dashboard dagelijks voor actuele projectstatus.",
      "Klik op risico-alerts voor directe actie.",
      "Gebruik de AI Copilot voor snelle projectinzichten.",
    ],
    tourSteps: [
      { title: "Welkom op het Dashboard", description: "Dit is uw centrale project cockpit. Hier ziet u alle belangrijke projectinformatie." },
    ],
  },
  "/projects": {
    pageTitle: "Projecten",
    pageDescription: "Beheer al uw projecten met ondersteuning voor Scrum, Kanban, PRINCE2, Waterfall en meer.",
    features: [
      { icon: FolderKanban, title: "Project portfolio", description: "Overzicht van alle projecten met status en voortgang" },
      { icon: Layers, title: "Methodologie keuze", description: "Kies de juiste methodologie per project" },
      { icon: Users, title: "Team toewijzing", description: "Wijs teamleden toe aan projecten" },
      { icon: Target, title: "Doelen & KPI's", description: "Stel projectdoelen en meetbare KPI's in" },
    ],
    howTos: [
      { title: "Project aanmaken", steps: ["Klik op '+ Nieuw Project'", "Vul projectnaam en beschrijving in", "Selecteer de methodologie (Scrum, Kanban, etc.)", "Stel het team en de planning in", "Klik op Aanmaken"] },
      { title: "Project bekijken", steps: ["Klik op een project in de lijst", "Bekijk de project details en voortgang", "Navigeer via het submenu naar specifieke onderdelen", "Gebruik de methodologie-specifieke tools"] },
    ],
    tips: [
      "Kies de juiste methodologie bij aanvang — later wijzigen is complex.",
      "Stel altijd een project charter op als fundament.",
      "Gebruik de AI Copilot voor risico-analyse en advies.",
    ],
    tourSteps: [
      { title: "Projecten", description: "Hier beheert u al uw projecten en kiest u de juiste aanpak." },
    ],
  },
  "/programs": {
    pageTitle: "Programma's",
    pageDescription: "Beheer programma's die meerdere gerelateerde projecten bundelen (SAFe, MSP, PMI, PRINCE2).",
    features: [
      { icon: Building2, title: "Programma portfolio", description: "Overzicht van alle programma's" },
      { icon: GitBranch, title: "Project bundeling", description: "Groepeer gerelateerde projecten" },
      { icon: Target, title: "Benefits management", description: "Track programma-baten en waarderealisatie" },
      { icon: Users, title: "Stakeholder management", description: "Beheer stakeholders op programmaniveau" },
    ],
    howTos: [
      { title: "Programma aanmaken", steps: ["Klik op '+ Nieuw Programma'", "Kies de programma-methodologie (SAFe, MSP, etc.)", "Vul naam en doelstelling in", "Wijs projecten toe aan het programma", "Klik op Aanmaken"] },
    ],
    tips: [
      "Gebruik programma's voor strategische initiatieven met meerdere projecten.",
      "Track benefits op programmaniveau voor strategisch inzicht.",
      "Stel regelmatige governance reviews in.",
    ],
    tourSteps: [
      { title: "Programma's", description: "Hier beheert u strategische programma's met meerdere projecten." },
    ],
  },
  "/governance": {
    pageTitle: "Governance",
    pageDescription: "Portfolio governance, boards en stakeholder management.",
    features: [
      { icon: Shield, title: "Portfolio's", description: "Beheer project portfolio's en prioritering" },
      { icon: Briefcase, title: "Boards", description: "Governance boards en besluitvorming" },
      { icon: Users, title: "Stakeholders", description: "Stakeholder analyse en communicatie" },
      { icon: BarChart3, title: "Rapportages", description: "Governance rapportages en dashboards" },
    ],
    howTos: [
      { title: "Portfolio beheren", steps: ["Ga naar Governance → Portfolio's", "Bekijk de portfolio matrix", "Prioriteer projecten op basis van waarde en risico", "Neem portfolio-beslissingen"] },
    ],
    tips: [
      "Gebruik portfolio management voor strategische projectselectie.",
      "Houd governance boards regelmatig (maandelijks) bij.",
      "Documenteer alle governance-beslissingen.",
    ],
    tourSteps: [
      { title: "Governance", description: "Hier beheert u portfolio governance en besluitvorming." },
    ],
  },
  "/reports": {
    pageTitle: "Rapportages",
    pageDescription: "Genereer project- en programmarapportages met analyses en inzichten.",
    features: [
      { icon: FileText, title: "Standaard rapporten", description: "Voorgedefinieerde rapportage templates" },
      { icon: BarChart3, title: "Dashboards", description: "Visuele project dashboards" },
      { icon: TrendingUp, title: "Trendanalyse", description: "Projectprestaties over tijd" },
      { icon: FileText, title: "Export", description: "Exporteer naar PDF, Excel of PowerPoint" },
    ],
    howTos: [
      { title: "Rapport genereren", steps: ["Open Rapportages", "Selecteer het rapporttype", "Kies projecten en periode", "Genereer het rapport", "Download of deel met stakeholders"] },
    ],
    tips: [
      "Genereer wekelijks statusrapporten voor stakeholders.",
      "Gebruik trendanalyses om problemen vroegtijdig te signaleren.",
      "Pas rapporten aan per doelgroep (stuurgroep vs. team).",
    ],
    tourSteps: [
      { title: "Rapportages", description: "Hier genereert u project- en programmarapportages." },
    ],
  },
  "/team": {
    pageTitle: "Team",
    pageDescription: "Beheer uw teamleden, rollen en capaciteit.",
    features: [
      { icon: Users, title: "Teamoverzicht", description: "Alle teamleden en hun rollen" },
      { icon: Target, title: "Capaciteitsplanning", description: "Beschikbaarheid en allocatie per teamlid" },
      { icon: BarChart3, title: "Werklast", description: "Werklast verdeling over het team" },
      { icon: Calendar, title: "Beschikbaarheid", description: "Vakanties, verlof en beschikbaarheid" },
    ],
    howTos: [
      { title: "Teamlid toevoegen", steps: ["Open het Team overzicht", "Klik op '+ Teamlid uitnodigen'", "Vul e-mail en rol in", "Wijs projecten toe", "Verstuur de uitnodiging"] },
    ],
    tips: [
      "Houd capaciteitsplanning actueel voor realistische planning.",
      "Verdeel taken gelijkmatig om overbelasting te voorkomen.",
      "Gebruik rollen voor duidelijke verantwoordelijkheden.",
    ],
    tourSteps: [
      { title: "Team", description: "Hier beheert u uw team, rollen en capaciteit." },
    ],
  },
  "/time-tracking": {
    pageTitle: "Tijdregistratie",
    pageDescription: "Registreer en analyseer tijdsbesteding per project, taak en teamlid.",
    features: [
      { icon: Clock, title: "Uren registreren", description: "Log uren per project en taak" },
      { icon: BarChart3, title: "Urenanalyse", description: "Analyse van tijdsbesteding per categorie" },
      { icon: Target, title: "Budget tracking", description: "Vergelijk bestede vs. geplande uren" },
      { icon: FileText, title: "Urenstaten", description: "Genereer urenstaten en overzichten" },
    ],
    howTos: [
      { title: "Uren loggen", steps: ["Open Tijdregistratie", "Selecteer het project en de taak", "Vul de datum en het aantal uren in", "Voeg een notitie toe (optioneel)", "Klik op Opslaan"] },
    ],
    tips: [
      "Log uren dagelijks voor de meest nauwkeurige registratie.",
      "Gebruik categorieën voor betere analyse (development, meetings, etc.).",
      "Review wekelijks of de registratie compleet is.",
    ],
    tourSteps: [
      { title: "Tijdregistratie", description: "Hier registreert en analyseert u tijdsbesteding." },
    ],
  },
  "/ai-assistant": {
    pageTitle: "AI Assistent",
    pageDescription: "Uw persoonlijke AI project management assistent voor analyses en advies.",
    features: [
      { icon: Brain, title: "AI Analyses", description: "Automatische project analyses en inzichten" },
      { icon: AlertTriangle, title: "Risico detectie", description: "AI identificeert risico's proactief" },
      { icon: Lightbulb, title: "Advies", description: "AI-gestuurde aanbevelingen per project" },
      { icon: FileText, title: "Rapportage", description: "Automatisch gegenereerde rapporten" },
    ],
    howTos: [
      { title: "AI Assistent gebruiken", steps: ["Open de AI Assistent pagina", "Stel een vraag over uw project", "AI analyseert uw data en geeft advies", "Pas het advies toe in uw projectmanagement"] },
    ],
    tips: [
      "Stel specifieke vragen voor de beste resultaten.",
      "Gebruik AI voor risico-scans vóór belangrijke milestones.",
      "Laat AI statusrapporten genereren om tijd te besparen.",
    ],
    tourSteps: [
      { title: "AI Assistent", description: "Hier gebruikt u AI voor project analyses en advies." },
    ],
  },
  "/post-project": {
    pageTitle: "Post Project",
    pageDescription: "Evalueer afgeronde projecten en documenteer lessons learned.",
    features: [
      { icon: CheckCircle2, title: "Project evaluatie", description: "Systematische evaluatie van afgeronde projecten" },
      { icon: BookOpen, title: "Lessons learned", description: "Documenteer en deel geleerde lessen" },
      { icon: BarChart3, title: "Prestatie-analyse", description: "Vergelijk planning vs. realisatie" },
      { icon: Target, title: "Benefits realisatie", description: "Meet of verwachte baten zijn gerealiseerd" },
    ],
    howTos: [
      { title: "Post-project review", steps: ["Selecteer het afgeronde project", "Doorloop de evaluatiechecklist", "Documenteer lessons learned", "Beoordeel de benefits realisatie", "Deel resultaten met stakeholders"] },
    ],
    tips: [
      "Voer de review uit binnen 2 weken na projectafsluiting.",
      "Betrek het hele team bij lessons learned sessies.",
      "Gebruik lessons learned in toekomstige projecten.",
    ],
    tourSteps: [
      { title: "Post Project", description: "Hier evalueert u projecten en documenteert lessons learned." },
    ],
  },
  "/profile": {
    pageTitle: "Profiel",
    pageDescription: "Beheer uw persoonlijke instellingen, profielfoto en voorkeuren.",
    features: [
      { icon: Users, title: "Profielgegevens", description: "Naam, foto en contactgegevens" },
      { icon: Settings, title: "Voorkeuren", description: "Taal, thema en notificatie-instellingen" },
      { icon: Shield, title: "Beveiliging", description: "Wachtwoord en authenticatie" },
      { icon: BarChart3, title: "Activiteit", description: "Uw recente activiteiten overzicht" },
    ],
    howTos: [
      { title: "Profiel bijwerken", steps: ["Open uw Profiel", "Klik op 'Bewerken'", "Pas uw gegevens aan", "Upload een profielfoto", "Klik op Opslaan"] },
    ],
    tips: [
      "Houd uw contactgegevens up-to-date.",
      "Stel notificatie-voorkeuren in voor relevante meldingen.",
      "Kies een thema (licht/donker) dat prettig werkt.",
    ],
    tourSteps: [
      { title: "Profiel", description: "Hier beheert u uw persoonlijke instellingen." },
    ],
  },
  "/settings": {
    pageTitle: "Instellingen",
    pageDescription: "Configureer systeem-, team- en projectinstellingen.",
    features: [
      { icon: Settings, title: "Systeeminstellingen", description: "Algemene configuratie en voorkeuren" },
      { icon: Users, title: "Gebruikersbeheer", description: "Rollen, rechten en uitnodigingen" },
      { icon: Workflow, title: "Workflows", description: "Aangepaste workflows en goedkeuringsprocessen" },
      { icon: Shield, title: "Beveiliging", description: "Beveiligingsinstellingen en audit trails" },
    ],
    howTos: [
      { title: "Instellingen aanpassen", steps: ["Open Instellingen", "Navigeer naar de gewenste sectie", "Pas de configuratie aan", "Klik op Opslaan"] },
    ],
    tips: [
      "Stel rollen en rechten zorgvuldig in voor goede governance.",
      "Configureer notificaties per project voor relevante updates.",
      "Review instellingen periodiek na organisatiewijzigingen.",
    ],
    tourSteps: [
      { title: "Instellingen", description: "Hier configureert u alle systeem- en projectinstellingen." },
    ],
  },
  "/surveys": {
    pageTitle: "Enquêtes",
    pageDescription: "Maak en verstuur enquêtes voor projectfeedback en teamtevredenheid.",
    features: [
      { icon: FileText, title: "Enquête builder", description: "Maak enquêtes met diverse vraagtypen" },
      { icon: Users, title: "Verspreiding", description: "Verstuur naar teams en stakeholders" },
      { icon: BarChart3, title: "Resultaten", description: "Analyseer antwoorden en trends" },
      { icon: TrendingUp, title: "Inzichten", description: "AI-gestuurde analyse van feedback" },
    ],
    howTos: [
      { title: "Enquête maken", steps: ["Klik op '+ Nieuwe Enquête'", "Voeg vragen toe (multiple choice, schaal, open)", "Stel de doelgroep in", "Verstuur de enquête", "Bekijk resultaten in het dashboard"] },
    ],
    tips: [
      "Houd enquêtes kort (max 10 vragen) voor hogere response rates.",
      "Verstuur na elke sprint of fase een korte retrospective enquête.",
      "Gebruik NPS-vragen voor vergelijkbare metingen over tijd.",
    ],
    tourSteps: [
      { title: "Enquêtes", description: "Hier maakt en analyseert u enquêtes voor projectfeedback." },
    ],
  },
};

const DEFAULT_GUIDE: GuideContent = {
  pageTitle: "ProjeXtPal",
  pageDescription: "Uw complete AI-gestuurde project management platform. Ontdek hieronder alle modules.",
  features: [
    { icon: Layout, title: "Dashboard", description: "Centraal overzicht van al uw projecten" },
    { icon: FolderKanban, title: "Projecten", description: "Projectbeheer met diverse methodologieën" },
    { icon: Building2, title: "Programma's", description: "Strategische programma's met meerdere projecten" },
    { icon: GraduationCap, title: "Academy", description: "Leer project management methodologieën" },
  ],
  howTos: [
    { title: "Aan de slag met ProjeXtPal", steps: ["Maak uw eerste project aan via Projecten", "Kies de juiste methodologie (Scrum, Kanban, PRINCE2, etc.)", "Stel uw team samen en wijs rollen toe", "Begin met plannen en taken toewijzen", "Monitor voortgang via het Dashboard"] },
    { title: "Navigeren in de applicatie", steps: ["Gebruik de zijbalk links om naar modules te navigeren", "Open de AI Copilot (rechtsboven) voor hulp op elke pagina", "Klik op 'Gids' voor pagina-specifieke handleidingen", "Methodologie-specifieke menu's verschijnen bij projectweergave"] },
  ],
  tips: [
    "Gebruik de AI Copilot om snel antwoorden te vinden over projectmanagement.",
    "Klik op 'Gids' op elke pagina voor context-specifieke handleidingen.",
    "De Academy biedt trainingen voor alle ondersteunde methodologieën.",
  ],
  tourSteps: [
    { title: "Welkom bij ProjeXtPal", description: "Dit is uw complete project management platform. Laten we een rondleiding doen." },
  ],
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

const RELATED_PAGES: Record<string, NavLink[]> = {
  "/dashboard":      [{ label: "Projecten", path: "/projects", icon: FolderKanban }, { label: "Rapportages", path: "/reports", icon: FileText }, { label: "Team", path: "/team", icon: Users }],
  "/projects":       [{ label: "Dashboard", path: "/dashboard", icon: Layout }, { label: "Programma's", path: "/programs", icon: Building2 }, { label: "Team", path: "/team", icon: Users }],
  "/programs":       [{ label: "Projecten", path: "/projects", icon: FolderKanban }, { label: "Governance", path: "/governance/portfolios", icon: Shield }, { label: "Rapportages", path: "/reports", icon: FileText }],
  "/governance":     [{ label: "Programma's", path: "/programs", icon: Building2 }, { label: "Rapportages", path: "/reports", icon: FileText }, { label: "Projecten", path: "/projects", icon: FolderKanban }],
  "/reports":        [{ label: "Dashboard", path: "/dashboard", icon: Layout }, { label: "Projecten", path: "/projects", icon: FolderKanban }, { label: "Tijdregistratie", path: "/time-tracking", icon: Clock }],
  "/team":           [{ label: "Projecten", path: "/projects", icon: FolderKanban }, { label: "Tijdregistratie", path: "/time-tracking", icon: Clock }, { label: "Dashboard", path: "/dashboard", icon: Layout }],
  "/time-tracking":  [{ label: "Projecten", path: "/projects", icon: FolderKanban }, { label: "Team", path: "/team", icon: Users }, { label: "Rapportages", path: "/reports", icon: FileText }],
  "/ai-assistant":   [{ label: "Dashboard", path: "/dashboard", icon: Layout }, { label: "Projecten", path: "/projects", icon: FolderKanban }, { label: "Rapportages", path: "/reports", icon: FileText }],
  "/post-project":   [{ label: "Projecten", path: "/projects", icon: FolderKanban }, { label: "Rapportages", path: "/reports", icon: FileText }, { label: "Enquêtes", path: "/surveys", icon: FileText }],
  "/profile":        [{ label: "Instellingen", path: "/settings", icon: Settings }, { label: "Dashboard", path: "/dashboard", icon: Layout }, { label: "Team", path: "/team", icon: Users }],
  "/settings":       [{ label: "Profiel", path: "/profile", icon: Users }, { label: "Team", path: "/team", icon: Users }, { label: "Governance", path: "/governance/portfolios", icon: Shield }],
  "/surveys":        [{ label: "Post Project", path: "/post-project", icon: CheckCircle2 }, { label: "Team", path: "/team", icon: Users }, { label: "Rapportages", path: "/reports", icon: FileText }],
};

const APP_SITEMAP: NavSection[] = [
  { title: "Overzicht", links: [
    { label: "Dashboard", path: "/dashboard", icon: Layout },
    { label: "AI Assistent", path: "/ai-assistant", icon: Brain },
  ]},
  { title: "Projecten & Programma's", links: [
    { label: "Projecten", path: "/projects", icon: FolderKanban },
    { label: "Programma's", path: "/programs", icon: Building2 },
    { label: "Governance", path: "/governance/portfolios", icon: Shield },
  ]},
  { title: "Team & Planning", links: [
    { label: "Team", path: "/team", icon: Users },
    { label: "Tijdregistratie", path: "/time-tracking", icon: Clock },
    { label: "Rapportages", path: "/reports", icon: FileText },
  ]},
  { title: "Evaluatie & Overig", links: [
    { label: "Post Project", path: "/post-project", icon: CheckCircle2 },
    { label: "Enquêtes", path: "/surveys", icon: FileText },
    { label: "Profiel", path: "/profile", icon: Users },
    { label: "Instellingen", path: "/settings", icon: Settings },
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Resolve current path for guide
  const currentPath = "/" + location.pathname.split("/").filter(Boolean)[0];
  const guide = GUIDE_MAP[location.pathname] || GUIDE_MAP[currentPath] || DEFAULT_GUIDE;

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
        <div className="rounded-lg bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-200 dark:border-emerald-800/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Info className="h-4 w-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-foreground">{guide.pageTitle}</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{guide.pageDescription}</p>
          {guide.tourSteps.length > 0 && (
            <Button
              size="sm"
              className="mt-3 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
              onClick={() => setIsTourOpen(true)}
            >
              <Play className="h-3 w-3 mr-1.5" />
              {isNl ? "Start Rondleiding" : "Start Tour"}
            </Button>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            {isNl ? "Functies" : "Features"}
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {guide.features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{feature.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* How-To's */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            {isNl ? "Hoe werkt het?" : "How does it work?"}
          </p>
          {guide.howTos.map((howTo, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <ArrowRight className="h-3 w-3 text-emerald-500" />
                <p className="text-xs font-semibold text-foreground">{howTo.title}</p>
              </div>
              <ol className="space-y-1 ml-4">
                {howTo.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5">{j + 1}</span>
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
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setActiveTab("chat"); handleSendMessage(isNl ? `Hoe gebruik ik ${guide.pageTitle}? Geef me een overzicht.` : `How do I use ${guide.pageTitle}? Give me an overview.`); }}>
            <MessageSquare className="h-3 w-3 mr-1.5" />
            {isNl ? `Vraag de AI Copilot over ${guide.pageTitle}` : `Ask AI Copilot about ${guide.pageTitle}`}
          </Button>
        </div>

        <div className="border-t border-border" />

        {/* Related pages */}
        {RELATED_PAGES[currentPath] && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1">
              <Compass className="h-3 w-3" />
              {isNl ? "Gerelateerde pagina's" : "Related pages"}
            </p>
            <div className="grid grid-cols-1 gap-1">
              {RELATED_PAGES[currentPath].map((link, i) => {
                const LinkIcon = link.icon;
                return (
                  <button key={i} className="flex items-center gap-2.5 p-2 rounded-lg border border-border hover:bg-accent/50 hover:border-emerald-300 transition-all text-left group cursor-pointer w-full" onClick={() => navigate(link.path)}>
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center shrink-0 transition-colors">
                      <LinkIcon className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-xs font-medium text-foreground group-hover:text-emerald-600 transition-colors">{link.label}</span>
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
            {isNl ? "Alle modules" : "All modules"}
          </p>
          <div className="space-y-2">
            {APP_SITEMAP.map((section, si) => (
              <div key={si} className="rounded-lg border border-border p-2.5 space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{section.title}</p>
                <div className="grid grid-cols-2 gap-1">
                  {section.links.map((link, li) => {
                    const SitemapIcon = link.icon;
                    const isCurrentPage = currentPath === link.path;
                    return (
                      <button key={li} className={cn("flex items-center gap-1.5 p-1.5 rounded-md text-left transition-all cursor-pointer text-[10px]", isCurrentPage ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/50" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground")} onClick={() => !isCurrentPage && navigate(link.path)}>
                        <SitemapIcon className={cn("h-3 w-3 shrink-0", isCurrentPage ? "text-emerald-600" : "text-muted-foreground")} />
                        <span className="truncate">{link.label}</span>
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
      <div className={cn("h-full border-l border-border bg-card flex flex-col transition-all duration-300 relative", sidebarWidth)}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">AI Copilot</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Online</Badge>
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
          <button className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-b-2", activeTab === "chat" ? "border-emerald-600 text-emerald-700 dark:text-emerald-400" : "border-transparent text-muted-foreground hover:text-foreground")} onClick={() => setActiveTab("chat")}>
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </button>
          <button className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-b-2", activeTab === "guide" ? "border-emerald-600 text-emerald-700 dark:text-emerald-400" : "border-transparent text-muted-foreground hover:text-foreground")} onClick={() => setActiveTab("guide")}>
            <HelpCircle className="h-3.5 w-3.5" />
            {isNl ? "Gids" : "Guide"}
          </button>
          <button className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-b-2", activeTab === "setup" ? "border-emerald-600 text-emerald-700 dark:text-emerald-400" : "border-transparent text-muted-foreground hover:text-foreground")} onClick={() => setActiveTab("setup")}>
            <Settings className="h-3.5 w-3.5" />
            Setup
          </button>
        </div>

        {/* Content */}
        {activeTab === "setup" ? (
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
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <Play className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{isNl ? "Demo Omgeving" : "Demo Environment"}</p>
                    <p className="text-[11px] text-muted-foreground">{isNl ? "Genereer demo data" : "Generate demo data"}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-emerald-600" />
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
                      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
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
                    {messages.map((message) => (
                      <AIMessageRenderer key={message.id} message={{ id: message.id, role: message.role, content: message.content }} onCopy={handleCopyMessage} onFeedback={handleFeedback} showActions={message.role === "assistant"} />
                    ))}
                    {activeForm && (<div className="mt-3"><DynamicForm schema={activeForm} onSubmit={handleFormSubmit} onCancel={handleFormCancel} /></div>)}
                    {isSending && (
                      <div className="flex items-start gap-2 mt-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0"><Loader2 className="h-4 w-4 text-white animate-spin" /></div>
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
                <Button onClick={() => handleSendMessage()} disabled={!inputValue.trim() || isSending || !!activeForm} size="icon" className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
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
