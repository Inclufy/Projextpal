import { useState, useEffect } from "react";
import { 
  GraduationCap, Plus, Search, Filter, MoreHorizontal,
  Edit, Trash2, Eye, Users, DollarSign, BookOpen,
  Award, BarChart3, Download, AlertCircle, RefreshCw, 
  Loader2, FileText, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseBuilder from './CourseBuilder';
import { usePageTranslations } from '@/hooks/usePageTranslations';

// Safe imports with fallbacks
let useLanguage: () => { language: string };
try {
  useLanguage = require("@/contexts/LanguageContext").useLanguage;
} catch {
  useLanguage = () => ({ language: 'nl' });
}

let useToast: () => { toast: (opts: any) => void };
try {
  useToast = require("@/hooks/use-toast").useToast;
} catch {
  useToast = () => ({ toast: (opts: any) => console.log('Toast:', opts) });
}

const BRAND = {
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  pink: '#D946EF',
  green: '#22C55E',
  blue: '#3B82F6',
  orange: '#F59E0B',
};

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
  new_quotes: number;
  monthly_revenue: { month: string; revenue: number }[];
}

const AdminTrainingContent = () => {
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseBuilderOpen, setCourseBuilderOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNL = language === 'nl';

  const content = {
    title: isNL ? 'Training Beheer' : 'Training Management',
    subtitle: isNL ? 'Beheer cursussen, inschrijvingen en offerteaanvragen' : 'Manage courses, enrollments and quotes',
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
      refresh: isNL ? 'Vernieuwen' : 'Refresh',
      view: isNL ? 'Bekijken' : 'View',
      sendEmail: isNL ? 'E-mail Sturen' : 'Send Email',
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
      closed: isNL ? 'Gesloten' : 'Closed',
    },
  };

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1'}/academy/admin`;

  // Fetch all data
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1'}/academy/courses/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`${API_BASE}/enrollments/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      const data = await response.json();
      setEnrollments(data);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await fetch(`${API_BASE}/quotes/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch quotes');
      const data = await response.json();
      setQuotes(data);
    } catch (err) {
      console.error('Failed to fetch quotes:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchCourses(),
        fetchEnrollments(),
        fetchQuotes(),
        fetchAnalytics(),
      ]);
    } catch (err) {
      setError(isNL ? 'Kon data niet laden' : 'Could not load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Delete course
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm(isNL ? 'Weet je zeker dat je deze cursus wilt verwijderen?' : 'Are you sure?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1'}/academy/admin/courses/${courseId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast({
        title: isNL ? 'Cursus verwijderd' : 'Course deleted',
        description: isNL ? 'De cursus is succesvol verwijderd' : 'Course was successfully deleted',
      });

      fetchCourses();
    } catch (err) {
      toast({
        title: 'Error',
        description: isNL ? 'Kon cursus niet verwijderen' : 'Could not delete course',
        variant: 'destructive',
      });
    }
  };

  // Calculate stats
  const totalStudents = analytics?.total_students || courses.reduce((sum, c) => sum + (c.students || 0), 0);
  const totalRevenue = analytics?.total_revenue || courses.reduce((sum, c) => sum + (c.revenue || 0), 0);
  const avgRating = analytics?.avg_rating || 0;
  const newQuotesCount = analytics?.new_quotes || quotes.filter(q => q.status === 'new').length;

  // Filter data
  const filteredCourses = courses.filter(c => {
    const search = searchQuery.toLowerCase();
    return (
      (c.title || '').toLowerCase().includes(search) ||
      (c.category || '').toLowerCase().includes(search)
    );
  });

  const filteredEnrollments = enrollments.filter(e => {
    const search = searchQuery.toLowerCase();
    return (
      (e.user || '').toLowerCase().includes(search) ||
      (e.email || '').toLowerCase().includes(search) ||
      (e.course || '').toLowerCase().includes(search)
    );
  });

  const filteredQuotes = quotes.filter(q => {
    const search = searchQuery.toLowerCase();
    return (
      (q.company || '').toLowerCase().includes(search) ||
      (q.contact || '').toLowerCase().includes(search) ||
      (q.email || '').toLowerCase().includes(search)
    );
  });

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
          <Button onClick={fetchAllData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {isNL ? 'Opnieuw proberen' : 'Try again'}
          </Button>
        </div>
      </div>
    );
  }

  // CourseBuilder is open
  if (courseBuilderOpen) {
    return (
      <CourseBuilder
        onClose={() => {
          setCourseBuilderOpen(false);
          setSelectedCourseId(null);
          fetchCourses();
        }}
        initialCourseId={selectedCourseId}
      />
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
          <Button variant="outline" className="gap-2" onClick={fetchAllData}>
            <RefreshCw className="w-4 h-4" />
            {content.actions.refresh}
          </Button>
          <Button 
            className="gap-2 text-white" 
            style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
            onClick={() => {
              setSelectedCourseId(null);
              setCourseBuilderOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {content.actions.addCourse}
          </Button>
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
                <p className="text-2xl font-bold">⭐ {avgRating.toFixed(1)}</p>
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={isNL ? 'Zoeken...' : 'Search...'} 
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                  <TableHead>{pt("Status")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {isNL ? 'Geen cursussen gevonden' : 'No courses found'}
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
                            <DropdownMenuItem onClick={() => {
                              setSelectedCourseId(course.id);
                              setCourseBuilderOpen(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              {content.actions.edit}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {content.actions.delete}
                            </DropdownMenuItem>
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
                  <TableHead>{pt("Status")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {isNL ? 'Geen inschrijvingen gevonden' : 'No enrollments found'}
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
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${e.progress}%`, 
                                backgroundColor: e.progress === 100 ? BRAND.green : BRAND.blue 
                              }} 
                            />
                          </div>
                          <span className="text-sm">{e.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(e.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              {content.actions.view}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              {content.actions.sendEmail}
                            </DropdownMenuItem>
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
                  <TableHead>{pt("Status")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {isNL ? 'Geen offertes gevonden' : 'No quotes found'}
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
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              {content.actions.view}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              {content.actions.sendEmail}
                            </DropdownMenuItem>
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
                <CardTitle className="text-lg">
                  {isNL ? 'Omzet per Maand' : 'Revenue per Month'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.monthly_revenue?.length ? (
                  <div className="space-y-3">
                    {analytics.monthly_revenue.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{item.month}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${Math.min((item.revenue / 500000) * 100, 100)}%`, 
                                backgroundColor: BRAND.purple 
                              }} 
                            />
                          </div>
                          <span className="text-sm font-medium w-24 text-right">
                            €{item.revenue.toLocaleString()}
                          </span>
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
                <CardTitle className="text-lg">
                  {isNL ? 'Statistieken Overzicht' : 'Statistics Overview'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm">{content.stats.totalCourses}</span>
                    <span className="font-bold">{courses.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm">{content.stats.totalStudents}</span>
                    <span className="font-bold">{totalStudents.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm">{content.stats.totalRevenue}</span>
                    <span className="font-bold">€{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm">{content.stats.avgRating}</span>
                    <span className="font-bold">⭐ {avgRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm">{isNL ? 'Nieuwe Offertes' : 'New Quotes'}</span>
                    <span className="font-bold">{newQuotesCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTrainingContent;