import { useState, useEffect } from "react";
import { 
  GraduationCap, Plus, Search, Filter, MoreHorizontal,
  Edit, Trash2, Eye, Users, DollarSign, BookOpen,
  Award, BarChart3, Download, AlertCircle, FileText, 
  Mail, RefreshCw, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Safe import for useLanguage - fallback if not available
let useLanguage: () => { language: string };
try {
  useLanguage = require("@/contexts/LanguageContext").useLanguage;
} catch {
  useLanguage = () => ({ language: 'nl' });
}

// Safe import for useToast - fallback if not available
let useToast: () => { toast: (opts: any) => void };
try {
  useToast = require("@/hooks/use-toast").useToast;
} catch {
  useToast = () => ({ toast: (opts: any) => console.log('Toast:', opts) });
}

// ============================================
// BRAND COLORS
// ============================================
const BRAND = {
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  pink: '#D946EF',
  green: '#22C55E',
  blue: '#3B82F6',
  orange: '#F59E0B',
};

// ============================================
// TYPES
// ============================================
interface Course {
  id: string;
  title: string;
  category: string;
  price: number;
  students: number;
  revenue: number;
  rating: number;
  status: string;
  is_featured?: boolean;
  is_bestseller?: boolean;
}

interface Enrollment {
  id: string;
  user: string;
  email: string;
  course: string;
  date: string;
  progress: number;
  status: string;
}

interface Quote {
  id: string;
  company: string;
  contact: string;
  email: string;
  courses: number;
  teamSize: string;
  date: string;
  status: string;
}

interface Analytics {
  total_courses: number;
  total_students: number;
  total_revenue: number;
  avg_rating: number;
  popular_courses: { title: string; students: number }[];
  revenue_by_month: { month: string; revenue: number }[];
  new_quotes: number;
}

// ============================================
// API SERVICE
// ============================================
const api = {
  baseUrl: '/api/v1/academy',
  
  headers: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  }),

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.headers(),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },

  async getCourses(): Promise<Course[]> {
    return this.get('/courses/');
  },

  async getEnrollments(): Promise<Enrollment[]> {
    const data = await this.get<any[]>('/enrollments/');
    return data.map(e => ({
      id: e.id,
      user: e.user?.name || e.user || '',
      email: e.user?.email || e.email || '',
      course: e.course?.title || e.course || '',
      date: e.enrolled_at || e.date || '',
      progress: e.progress || 0,
      status: e.status || 'active',
    }));
  },

  async getQuotes(): Promise<Quote[]> {
    const data = await this.get<any[]>('/quotes/');
    return data.map(q => ({
      id: q.id,
      company: q.company || '',
      contact: q.contact?.name || q.contact || '',
      email: q.contact?.email || q.email || '',
      courses: Array.isArray(q.courses) ? q.courses.length : q.courses || 0,
      teamSize: q.team_size || q.teamSize || '',
      date: q.date || '',
      status: q.status || 'new',
    }));
  },

  async getAnalytics(): Promise<Analytics> {
    return this.get('/analytics/');
  },
};

// ============================================
// MAIN COMPONENT
// ============================================
const AdminTrainingManagement = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

  // Data states
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNL = language === 'nl';

  const content = {
    title: isNL ? 'Training Beheer' : 'Training Management',
    subtitle: isNL ? 'Beheer cursussen, inschrijvingen en offerteaanvragen' : 'Manage courses, enrollments and quote requests',
    tabs: {
      courses: isNL ? 'Cursussen' : 'Courses',
      enrollments: isNL ? 'Inschrijvingen' : 'Enrollments',
      quotes: isNL ? 'Offertes' : 'Quotes',
      analytics: isNL ? 'Analytics' : 'Analytics',
    },
    stats: {
      totalCourses: isNL ? 'Totaal Cursussen' : 'Total Courses',
      totalStudents: isNL ? 'Totaal Studenten' : 'Total Students',
      totalRevenue: isNL ? 'Totale Omzet' : 'Total Revenue',
      avgRating: isNL ? 'Gem. Beoordeling' : 'Avg. Rating',
    },
    actions: {
      addCourse: isNL ? 'Cursus Toevoegen' : 'Add Course',
      edit: isNL ? 'Bewerken' : 'Edit',
      delete: isNL ? 'Verwijderen' : 'Delete',
      view: isNL ? 'Bekijken' : 'View',
      export: isNL ? 'Exporteren' : 'Export',
      sendEmail: isNL ? 'E-mail Sturen' : 'Send Email',
      refresh: isNL ? 'Vernieuwen' : 'Refresh',
    },
    status: {
      published: isNL ? 'Gepubliceerd' : 'Published',
      draft: isNL ? 'Concept' : 'Draft',
      active: isNL ? 'Actief' : 'Active',
      completed: isNL ? 'Voltooid' : 'Completed',
      pending: isNL ? 'In afwachting' : 'Pending',
      new: isNL ? 'Nieuw' : 'New',
      contacted: isNL ? 'Gecontacteerd' : 'Contacted',
      quoted: isNL ? 'Offerte verstuurd' : 'Quote Sent',
      sent: isNL ? 'Offerte verstuurd' : 'Quote Sent',
      closed: isNL ? 'Gesloten' : 'Closed',
    },
    errors: {
      loadFailed: isNL ? 'Kon data niet laden' : 'Could not load data',
      tryAgain: isNL ? 'Opnieuw proberen' : 'Try again',
    },
  };

  // Fetch all data from API
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [coursesData, enrollmentsData, quotesData, analyticsData] = await Promise.all([
        api.getCourses(),
        api.getEnrollments(),
        api.getQuotes(),
        api.getAnalytics(),
      ]);

      setCourses(coursesData);
      setEnrollments(enrollmentsData);
      setQuotes(quotesData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(content.errors.loadFailed);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats from analytics
  const totalStudents = analytics?.total_students || 0;
  const totalRevenue = analytics?.total_revenue || 0;
  const avgRating = analytics?.avg_rating || 0;
  const newQuotesCount = analytics?.new_quotes || 0;

  // Filter data
  const filteredCourses = courses.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(e => 
    e.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.course?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuotes = quotes.filter(q => 
    q.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.contact?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      published: { bg: `${BRAND.green}15`, text: BRAND.green },
      draft: { bg: '#f3f4f6', text: '#6b7280' },
      active: { bg: `${BRAND.blue}15`, text: BRAND.blue },
      completed: { bg: `${BRAND.green}15`, text: BRAND.green },
      pending: { bg: `${BRAND.orange}15`, text: BRAND.orange },
      new: { bg: `${BRAND.purple}15`, text: BRAND.purple },
      contacted: { bg: `${BRAND.blue}15`, text: BRAND.blue },
      quoted: { bg: `${BRAND.orange}15`, text: BRAND.orange },
      sent: { bg: `${BRAND.orange}15`, text: BRAND.orange },
      closed: { bg: '#f3f4f6', text: '#6b7280' },
    };
    const style = styles[status] || styles.draft;
    return (
      <Badge style={{ backgroundColor: style.bg, color: style.text }} className="border-0">
        {content.status[status as keyof typeof content.status] || status}
      </Badge>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: BRAND.purple }} />
          <p className="text-muted-foreground">{isNL ? 'Data laden...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {content.errors.tryAgain}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-7 h-7" style={{ color: BRAND.purple }} />
            {content.title}
          </h1>
          <p className="text-muted-foreground">{content.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
            {content.actions.refresh}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {content.actions.export}
          </Button>
          <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 text-white" style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}>
                <Plus className="w-4 h-4" />
                {content.actions.addCourse}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isNL ? 'Nieuwe Cursus Toevoegen' : 'Add New Course'}</DialogTitle>
                <DialogDescription>
                  {isNL ? 'Vul de cursusgegevens in.' : 'Fill in the course details.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>{isNL ? 'Titel' : 'Title'}</Label>
                  <Input placeholder="Project Management Fundamentals" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{isNL ? 'Categorie' : 'Category'}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={isNL ? 'Selecteer' : 'Select'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pm">Project Management</SelectItem>
                        <SelectItem value="agile">Agile & Scrum</SelectItem>
                        <SelectItem value="program">Program Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{isNL ? 'Prijs (€)' : 'Price (€)'}</Label>
                    <Input type="number" placeholder="49" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>{isNL ? 'Beschrijving' : 'Description'}</Label>
                  <Textarea placeholder={isNL ? 'Beschrijf de cursus...' : 'Describe...'} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id="featured" />
                    <Label htmlFor="featured">{isNL ? 'Uitgelicht' : 'Featured'}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="published" />
                    <Label htmlFor="published">{isNL ? 'Publiceren' : 'Publish'}</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                  {isNL ? 'Annuleren' : 'Cancel'}
                </Button>
                <Button 
                  className="text-white" 
                  style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                  onClick={() => {
                    toast({ title: isNL ? 'Cursus toegevoegd!' : 'Course added!' });
                    setIsAddCourseOpen(false);
                  }}
                >
                  {isNL ? 'Toevoegen' : 'Add'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{content.stats.totalCourses}</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${BRAND.purple}15` }}>
                <BookOpen className="w-6 h-6" style={{ color: BRAND.purple }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{content.stats.totalStudents}</p>
                <p className="text-2xl font-bold">{totalStudents.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${BRAND.blue}15` }}>
                <Users className="w-6 h-6" style={{ color: BRAND.blue }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{content.stats.totalRevenue}</p>
                <p className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${BRAND.green}15` }}>
                <DollarSign className="w-6 h-6" style={{ color: BRAND.green }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{content.stats.avgRating}</p>
                <p className="text-2xl font-bold">⭐ {avgRating}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${BRAND.orange}15` }}>
                <Award className="w-6 h-6" style={{ color: BRAND.orange }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              {content.tabs.courses}
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="gap-2">
              <Users className="w-4 h-4" />
              {content.tabs.enrollments}
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-2">
              <FileText className="w-4 h-4" />
              {content.tabs.quotes}
              {newQuotesCount > 0 && (
                <Badge className="ml-1 text-white" style={{ backgroundColor: BRAND.purple }}>
                  {newQuotesCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              {content.tabs.analytics}
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={isNL ? 'Zoeken...' : 'Search...'} 
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isNL ? 'Cursus' : 'Course'}</TableHead>
                  <TableHead>{isNL ? 'Categorie' : 'Category'}</TableHead>
                  <TableHead>{isNL ? 'Prijs' : 'Price'}</TableHead>
                  <TableHead>{isNL ? 'Studenten' : 'Students'}</TableHead>
                  <TableHead>{isNL ? 'Omzet' : 'Revenue'}</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {isNL ? 'Geen cursussen' : 'No courses'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{course.title}</span>
                          {course.is_featured && <Badge variant="outline" className="text-xs">⭐</Badge>}
                          {course.is_bestseller && <Badge variant="outline" className="text-xs">🔥</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{(course.category || 'PM').toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        {course.price === 0 ? (
                          <span style={{ color: BRAND.green }}>{isNL ? 'Gratis' : 'Free'}</span>
                        ) : `€${course.price}`}
                      </TableCell>
                      <TableCell>{(course.students || 0).toLocaleString()}</TableCell>
                      <TableCell>€{(course.revenue || 0).toLocaleString()}</TableCell>
                      <TableCell>⭐ {course.rating || 0}</TableCell>
                      <TableCell>{getStatusBadge(course.status || 'published')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />{content.actions.view}</DropdownMenuItem>
                            <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />{content.actions.edit}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />{content.actions.delete}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{isNL ? 'Gebruiker' : 'User'}</TableHead>
                  <TableHead>{isNL ? 'Cursus' : 'Course'}</TableHead>
                  <TableHead>{isNL ? 'Datum' : 'Date'}</TableHead>
                  <TableHead>{isNL ? 'Voortgang' : 'Progress'}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {isNL ? 'Geen inschrijvingen' : 'No enrollments'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-sm">{e.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{e.user}</div>
                          <div className="text-sm text-muted-foreground">{e.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{e.course}</TableCell>
                      <TableCell>{e.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${e.progress}%`, backgroundColor: e.progress === 100 ? BRAND.green : BRAND.blue }} />
                          </div>
                          <span className="text-sm">{e.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(e.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />{content.actions.view}</DropdownMenuItem>
                            <DropdownMenuItem><Mail className="w-4 h-4 mr-2" />{content.actions.sendEmail}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{isNL ? 'Bedrijf' : 'Company'}</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>{isNL ? 'Cursussen' : 'Courses'}</TableHead>
                  <TableHead>{isNL ? 'Teamgrootte' : 'Team Size'}</TableHead>
                  <TableHead>{isNL ? 'Datum' : 'Date'}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {isNL ? 'Geen offertes' : 'No quotes'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotes.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-sm">{q.id}</TableCell>
                      <TableCell className="font-medium">{q.company}</TableCell>
                      <TableCell>
                        <div>
                          <div>{q.contact}</div>
                          <div className="text-sm text-muted-foreground">{q.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{q.courses} {isNL ? 'cursussen' : 'courses'}</TableCell>
                      <TableCell>{q.teamSize}</TableCell>
                      <TableCell>{q.date}</TableCell>
                      <TableCell>{getStatusBadge(q.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />{content.actions.view}</DropdownMenuItem>
                            <DropdownMenuItem><Mail className="w-4 h-4 mr-2" />{content.actions.sendEmail}</DropdownMenuItem>
                            <DropdownMenuItem><FileText className="w-4 h-4 mr-2" />{isNL ? 'Offerte maken' : 'Create Quote'}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isNL ? 'Omzet per Maand' : 'Revenue per Month'}</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.revenue_by_month?.length ? (
                  <div className="space-y-3">
                    {analytics.revenue_by_month.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{item.month}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min((item.revenue / 500000) * 100, 100)}%`, backgroundColor: BRAND.purple }} />
                          </div>
                          <span className="text-sm font-medium w-24 text-right">€{item.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <BarChart3 className="w-16 h-16 opacity-30" />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isNL ? 'Populairste Cursussen' : 'Most Popular Courses'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analytics?.popular_courses || []).map((course, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: BRAND.purple }}>{i + 1}</span>
                        <span className="text-sm">{course.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{course.students.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTrainingManagement;