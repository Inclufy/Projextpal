import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap, Plus, Search, MoreHorizontal, Edit, Trash2, Eye,
  BookOpen, Video, FileText, Award, Play, ChevronDown, ChevronRight,
  Save, X, Loader2, CheckCircle2, AlertCircle, Layers, List, Upload,
  ArrowLeft, Settings, Image as ImageIcon, Link2, FileUp, Sparkles,
  Target, MessageCircle, Pencil, Download, ExternalLink, BarChart3,
  Brain, FlaskConical, Trophy, Clock
} from "lucide-react";
import { coursesWithContent, getModulesByCourseId, getCourseStats } from "@/data/academy/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIGenerateButton } from '../academy/AIGenerateButton';
import FileUploader from './FileUploader';
import RichTextEditor from './RichTextEditor';
import DraggableList from './DraggableList';
import QuizBuilder from './QuizBuilder';

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
  status: string;
  is_featured: boolean;
  is_bestseller: boolean;
}

interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons_count: number;
}

interface Lesson {
  id: number;
  title: string;
  lesson_type: string;
  duration_minutes: number;
  is_free_preview: boolean;
  order: number;
  video_url?: string;
  content?: string;
}

interface ContentBlock {
  id: number;
  content_type: string;
  title: string;
  order: number;
  file_url?: string;
  url?: string;
  text_content?: string;
  duration_seconds: number;
  file_size: number;
}

const EnhancedCourseBuilder = () => {
  const navigate = useNavigate();
  // ===== STATES =====
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'courses' | 'content'>('courses');
  const [mainView, setMainView] = useState<'courses' | 'skills' | 'practice' | 'simulation' | 'quiz' | 'exam' | 'certificate'>('courses');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [editCourseModalOpen, setEditCourseModalOpen] = useState(false);
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [editCourseForm, setEditCourseForm] = useState<any>({});
  const [moduleForm, setModuleForm] = useState<any>({});
  const [lessonForm, setLessonForm] = useState<any>({});
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [generatedSimulation, setGeneratedSimulation] = useState<any>(null);

  // ===== API =====
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
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    },

    async post<T>(endpoint: string, data: any): Promise<T> {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    },

    async patch<T>(endpoint: string, data: any): Promise<T> {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.headers(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    },

    async delete<T>(endpoint: string): Promise<T> {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers(),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    },
  };

  // ===== HELPER FUNCTIONS =====
  const showToast = (message: string) => {
    console.log(`✓ ${message}`);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      published: { bg: `${BRAND.green}15`, text: BRAND.green },
      draft: { bg: '#f3f4f6', text: '#6b7280' },
    };
    const style = styles[status] || styles.draft;
    return (
      <Badge style={{ backgroundColor: style.bg, color: style.text }} className="border-0">
        {status === 'published' ? 'Gepubliceerd' : 'Concept'}
      </Badge>
    );
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'quiz': return <Award className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  // ===== DATA FETCHING =====
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Course[]>('/courses/');
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async (courseId: string) => {
    try {
      const data = await api.get<Module[]>(`/modules/?course=${courseId}`);
      setModules(data);
      for (const module of data) {
        fetchLessons(module.id);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const fetchLessons = async (moduleId: number) => {
    try {
      const data = await api.get<Lesson[]>(`/lessons/?module=${moduleId}`);
      setLessons(prev => ({ ...prev, [moduleId]: data }));
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  const fetchLessonContent = async (lessonId: number) => {
    try {
      const data = await api.get<ContentBlock[]>(`/lessons/${lessonId}/content/`);
      setContentBlocks(data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  // ===== EVENT HANDLERS =====
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setEditCourseForm({
      title: course.title,
      category: course.category,
      price: course.price,
      status: course.status,
      is_featured: course.is_featured,
      is_bestseller: course.is_bestseller,
    });
    setEditCourseModalOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;
    try {
      await api.patch(`/courses/${selectedCourse.id}/update/`, editCourseForm);
      await fetchCourses();
      setEditCourseModalOpen(false);
      showToast('Course updated!');
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setDeleteCourseModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;
    try {
      await api.delete(`/courses/${selectedCourse.id}/delete/`);
      await fetchCourses();
      setDeleteCourseModalOpen(false);
      showToast('Course deleted!');
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handlePublishToggle = async (course: Course) => {
    try {
      const newStatus = course.status === 'published' ? 'draft' : 'published';
      await api.patch(`/courses/${course.id}/update/`, { status: newStatus });
      await fetchCourses();
      showToast(`Course ${newStatus === 'published' ? 'published' : 'unpublished'}!`);
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    }
  };

  const handleManageCourse = async (course: Course) => {
    setSelectedCourse(course);
    await fetchModules(course.id);
    setView('content');
  };

  const handleCreateModule = async () => {
    if (!selectedCourse) return;
    try {
      await api.post(`/courses/${selectedCourse.id}/modules/create/`, moduleForm);
      await fetchModules(selectedCourse.id);
      setModuleModalOpen(false);
      setModuleForm({});
      setEditingModule(null);
      showToast('Module created!');
    } catch (error) {
      console.error('Failed to create module:', error);
    }
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;
    try {
      await api.patch(`/modules/${editingModule.id}/update/`, moduleForm);
      if (selectedCourse) await fetchModules(selectedCourse.id);
      setModuleModalOpen(false);
      setModuleForm({});
      setEditingModule(null);
      showToast('Module updated!');
    } catch (error) {
      console.error('Failed to update module:', error);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    try {
      await api.delete(`/modules/${moduleId}/delete/`);
      if (selectedCourse) await fetchModules(selectedCourse.id);
      showToast('Module deleted!');
    } catch (error) {
      console.error('Failed to delete module:', error);
    }
  };

  const handleReorderModules = async (reorderedModules: Module[]) => {
    setModules(reorderedModules);
    try {
      for (let i = 0; i < reorderedModules.length; i++) {
        await api.patch(`/modules/${reorderedModules[i].id}/update/`, { order: i });
      }
      showToast('Modules reordered!');
    } catch (error) {
      console.error('Failed to reorder modules:', error);
    }
  };

  const handleCreateLesson = async () => {
    if (!selectedModule) return;
    try {
      await api.post(`/modules/${selectedModule.id}/lessons/create/`, lessonForm);
      await fetchLessons(selectedModule.id);
      setLessonModalOpen(false);
      setLessonForm({});
      setEditingLesson(null);
      showToast('Lesson created!');
    } catch (error) {
      console.error('Failed to create lesson:', error);
    }
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson) return;
    try {
      await api.patch(`/lessons/${editingLesson.id}/update/`, lessonForm);
      const moduleId = modules.find(m =>
        lessons[m.id]?.some(l => l.id === editingLesson.id)
      )?.id;
      if (moduleId) await fetchLessons(moduleId);
      setLessonModalOpen(false);
      setLessonForm({});
      setEditingLesson(null);
      showToast('Lesson updated!');
    } catch (error) {
      console.error('Failed to update lesson:', error);
    }
  };

  const handleDeleteLesson = async (lessonId: number, moduleId: number) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/lessons/${lessonId}/delete/`);
      await fetchLessons(moduleId);
      showToast('Lesson deleted!');
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  const handleEditLessonContent = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLessonForm({
      title: lesson.title,
      lesson_type: lesson.lesson_type,
      duration_minutes: lesson.duration_minutes,
      is_free_preview: lesson.is_free_preview,
      video_url: lesson.video_url || '',
      content: lesson.content || '',
    });
    await fetchLessonContent(lesson.id);
    setContentModalOpen(true);
  };

  const handleSaveLessonContent = async () => {
    if (!selectedLesson) return;
    try {
      await api.patch(`/lessons/${selectedLesson.id}/update/`, {
        content: lessonForm.content,
        video_url: lessonForm.video_url,
      });
      setContentModalOpen(false);
      showToast('Content saved!');
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  const handleDeleteContent = async (contentId: number) => {
    if (!confirm('Delete this content?')) return;
    try {
      await api.delete(`/content/${contentId}/delete/`);
      if (selectedLesson) await fetchLessonContent(selectedLesson.id);
      showToast('Content deleted!');
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.purple }} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Tabs value={mainView} onValueChange={(value: any) => setMainView(value)}>
        <TabsList className="grid w-full grid-cols-7 mb-6">
          <TabsTrigger value="courses">
            <GraduationCap className="w-4 h-4 mr-2" />
            Trainingen
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Award className="w-4 h-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="practice">
            <Pencil className="w-4 h-4 mr-2" />
            Praktijk
          </TabsTrigger>
          <TabsTrigger value="simulation">
            <Play className="w-4 h-4 mr-2" />
            Simulatie
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="exam">
            <FileText className="w-4 h-4 mr-2" />
            Examen
          </TabsTrigger>
          <TabsTrigger value="certificate">
            <Award className="w-4 h-4 mr-2" />
            Certificaat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          {view === 'courses' ? (
            // ===================================
            // COURSES VIEW
            // ===================================
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Layers className="w-7 h-7" style={{ color: BRAND.purple }} />
                    Enhanced Course Builder
                  </h1>
                  <p className="text-muted-foreground">Complete cursus beheer met modules, lessen en content</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{course.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline">{course.category}</Badge>
                            {getStatusBadge(course.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {course.students} studenten
                            </span>
                            <span className="font-medium">
                              {course.price === 0 ? 'Gratis' : `€${course.price}`}
                            </span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Details Bewerken
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePublishToggle(course)}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {course.status === 'published' ? 'Unpublish' : 'Publiceren'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteCourse(course)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Verwijderen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <Button
                        className="w-full text-white"
                        style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                        onClick={() => handleManageCourse(course)}
                      >
                        <Layers className="w-4 h-4 mr-2" />
                        Content Beheren
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Edit Course Modal */}
              <Dialog open={editCourseModalOpen} onOpenChange={setEditCourseModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cursus Bewerken</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Titel</Label>
                      <Input
                        value={editCourseForm.title || ''}
                        onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Categorie</Label>
                        <Select
                          value={editCourseForm.category}
                          onValueChange={(value) => setEditCourseForm({ ...editCourseForm, category: value })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PM">Project Management</SelectItem>
                            <SelectItem value="AGILE">Agile & Scrum</SelectItem>
                            <SelectItem value="PROGRAM">Program Management</SelectItem>
                            <SelectItem value="LEADERSHIP">Leadership</SelectItem>
                            <SelectItem value="TOOLS">Tools</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Prijs (€)</Label>
                        <Input
                          type="number"
                          value={editCourseForm.price || 0}
                          onChange={(e) => setEditCourseForm({ ...editCourseForm, price: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editCourseForm.is_featured}
                          onCheckedChange={(checked) => setEditCourseForm({ ...editCourseForm, is_featured: checked })}
                        />
                        <Label>Uitgelicht</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editCourseForm.is_bestseller}
                          onCheckedChange={(checked) => setEditCourseForm({ ...editCourseForm, is_bestseller: checked })}
                        />
                        <Label>Bestseller</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditCourseModalOpen(false)}>Annuleren</Button>
                    <Button
                      onClick={handleUpdateCourse}
                      className="text-white"
                      style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Opslaan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Course Modal */}
              <Dialog open={deleteCourseModalOpen} onOpenChange={setDeleteCourseModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      Cursus Verwijderen
                    </DialogTitle>
                    <DialogDescription>
                      Weet je zeker dat je "{selectedCourse?.title}" wilt verwijderen?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteCourseModalOpen(false)}>Annuleren</Button>
                    <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Verwijderen
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            // ===================================
            // CONTENT MANAGEMENT VIEW
            // ===================================
            <div className="p-6 space-y-6">
              {/* Header with Back Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => setView('courses')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Terug naar Cursussen
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">{selectedCourse?.title}</h1>
                    <p className="text-muted-foreground">Modules & Lessen Beheer</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setModuleForm({ title: '', description: '' });
                    setEditingModule(null);
                    setModuleModalOpen(true);
                  }}
                  className="text-white"
                  style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Module Toevoegen
                </Button>
              </div>

              {/* Modules & Lessons */}
              {modules.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Layers className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-semibold mb-2">Nog geen modules</h3>
                    <p className="text-muted-foreground mb-4">Begin met het toevoegen van modules aan deze cursus</p>
                    <Button
                      onClick={() => {
                        setModuleForm({ title: '', description: '' });
                        setModuleModalOpen(true);
                      }}
                      style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                      className="text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Eerste Module Toevoegen
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <DraggableList
                  items={modules}
                  onReorder={handleReorderModules}
                  getItemId={(m) => m.id}
                  renderItem={(module) => (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => toggleModule(module.id)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedModules.includes(module.id) ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                            <h3 className="font-semibold text-lg">{module.title}</h3>
                            <Badge variant="outline">{module.lessons_count} lessen</Badge>
                          </div>
                          {module.description && (
                            <p className="text-sm text-muted-foreground mt-1 ml-7">{module.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedModule(module);
                              setLessonForm({
                                title: '',
                                lesson_type: 'video',
                                duration_minutes: 0,
                                is_free_preview: false,
                              });
                              setEditingLesson(null);
                              setLessonModalOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Les
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingModule(module);
                              setModuleForm({
                                title: module.title,
                                description: module.description,
                              });
                              setModuleModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Lessons */}
                      {expandedModules.includes(module.id) && (
                        <div className="ml-7 space-y-2">
                          {lessons[module.id]?.map((lesson) => (
                            <Card key={lesson.id} className="bg-muted/50">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {getLessonTypeIcon(lesson.lesson_type)}
                                    <div>
                                      <p className="font-medium">{lesson.title}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {lesson.duration_minutes} min • {lesson.lesson_type}
                                        {lesson.is_free_preview && ' • Gratis preview'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditLessonContent(lesson)}
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Content
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingLesson(lesson);
                                        setSelectedModule(module);
                                        setLessonForm({
                                          title: lesson.title,
                                          lesson_type: lesson.lesson_type,
                                          duration_minutes: lesson.duration_minutes,
                                          is_free_preview: lesson.is_free_preview,
                                          video_url: lesson.video_url || '',
                                          content: lesson.content || '',
                                        });
                                        setLessonModalOpen(true);
                                      }}
                                    >
                                      <Settings className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteLesson(lesson.id, module.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {(!lessons[module.id] || lessons[module.id].length === 0) && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Nog geen lessen. Voeg de eerste les toe!
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                />
              )}

              {/* Module Modal */}
              <Dialog open={moduleModalOpen} onOpenChange={setModuleModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingModule ? 'Module Bewerken' : 'Module Toevoegen'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Titel *</Label>
                      <Input
                        value={moduleForm.title || ''}
                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                        placeholder="Bijv. Inleiding tot Project Management"
                      />
                    </div>
                    <div>
                      <Label>Beschrijving</Label>
                      <Textarea
                        value={moduleForm.description || ''}
                        onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                        placeholder="Beschrijf wat studenten in deze module leren..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setModuleModalOpen(false)}>Annuleren</Button>
                    <Button
                      onClick={editingModule ? handleUpdateModule : handleCreateModule}
                      className="text-white"
                      style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingModule ? 'Bijwerken' : 'Toevoegen'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Lesson Modal */}
              <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingLesson ? 'Les Bewerken' : 'Les Toevoegen'}</DialogTitle>
                    {selectedModule && (
                      <DialogDescription>Module: {selectedModule.title}</DialogDescription>
                    )}
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Titel *</Label>
                      <Input
                        value={lessonForm.title || ''}
                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        placeholder="Bijv. Wat is een project?"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={lessonForm.lesson_type}
                          onValueChange={(value) => setLessonForm({ ...lessonForm, lesson_type: value })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="text">Tekst/Artikel</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="download">Downloadbaar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Duur (minuten)</Label>
                        <Input
                          type="number"
                          value={lessonForm.duration_minutes || 0}
                          onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={lessonForm.is_free_preview}
                        onCheckedChange={(checked) => setLessonForm({ ...lessonForm, is_free_preview: checked })}
                      />
                      <Label>Gratis preview</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setLessonModalOpen(false)}>Annuleren</Button>
                    <Button
                      onClick={editingLesson ? handleUpdateLesson : handleCreateLesson}
                      className="text-white"
                      style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingLesson ? 'Bijwerken' : 'Toevoegen'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Content Editor Modal */}
              <Dialog open={contentModalOpen} onOpenChange={setContentModalOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Les Content: {selectedLesson?.title}</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[70vh]">
                    <Tabs defaultValue="text" className="w-full">
                      <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="text">
                          <FileText className="w-4 h-4 mr-2" />
                          Tekst
                        </TabsTrigger>
                        <TabsTrigger value="video">
                          <Video className="w-4 h-4 mr-2" />
                          Video
                        </TabsTrigger>
                        <TabsTrigger value="files">
                          <Upload className="w-4 h-4 mr-2" />
                          Bestanden
                        </TabsTrigger>
                        <TabsTrigger value="quiz">
                          <Award className="w-4 h-4 mr-2" />
                          Quiz
                        </TabsTrigger>
                        <TabsTrigger value="ai">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          AI Coach
                        </TabsTrigger>
                        <TabsTrigger value="simulation">
                          <Play className="w-4 h-4 mr-2" />
                          Simulation
                        </TabsTrigger>
                      </TabsList>

                      {/* TEXT TAB */}
                      <TabsContent value="text" className="space-y-4 pt-4">
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">AI Content Generator</span>
                          </div>
                          <AIGenerateButton
                            type="content"
                            context={{
                              courseTitle: selectedCourse?.title || '',
                              moduleTitle: selectedModule?.title || '',
                              lessonTitle: selectedLesson?.title || '',
                              duration: selectedLesson?.duration_minutes || 15
                            }}
                            onGenerated={(data) => {
                              setLessonForm({ ...lessonForm, content: data.content });
                              showToast('Content gegenereerd!');
                            }}
                            variant="primary"
                            size="sm"
                          />
                        </div>
                        <RichTextEditor
                          content={lessonForm.content || ''}
                          onChange={(content) => setLessonForm({ ...lessonForm, content })}
                          placeholder="Schrijf de les content hier..."
                        />
                      </TabsContent>

                      {/* VIDEO TAB */}
                      <TabsContent value="video" className="space-y-4 pt-4">
                        <div>
                          <Label>Video URL (YouTube, Vimeo, etc.)</Label>
                          <Input
                            value={lessonForm.video_url || ''}
                            onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                            placeholder="https://youtube.com/watch?v=..."
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Plak de volledige URL van je video
                          </p>
                        </div>
                        {lessonForm.video_url && (
                          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                            <Video className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </TabsContent>

                      {/* FILES TAB */}
                      <TabsContent value="files" className="space-y-4 pt-4">
                        {selectedLesson && (
                          <FileUploader
                            lessonId={selectedLesson.id}
                            onUploadComplete={(file) => {
                              fetchLessonContent(selectedLesson.id);
                              showToast('File uploaded!');
                            }}
                          />
                        )}
                        {contentBlocks.length > 0 && (
                          <div className="space-y-2 mt-6">
                            <h4 className="font-semibold">Geuploade Bestanden</h4>
                            {contentBlocks.map(block => (
                              <Card key={block.id}>
                                <CardContent className="p-4 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5" />
                                    <div>
                                      <p className="font-medium">{block.title}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {block.content_type} • {(block.file_size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteContent(block.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* QUIZ TAB */}
                      <TabsContent value="quiz" className="pt-4">
                        <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">AI Quiz Generator</span>
                          </div>
                          <AIGenerateButton
                            type="quiz"
                            context={{
                              courseTitle: selectedCourse?.title || '',
                              moduleTitle: selectedModule?.title || '',
                              lessonTitle: selectedLesson?.title || '',
                              existingContent: lessonForm.content || ''
                            }}
                            onGenerated={(data) => {
                              setGeneratedQuestions(data.questions);
                              showToast('Quiz gegenereerd met ' + data.questions.length + ' vragen!');
                            }}
                            variant="primary"
                            size="sm"
                          />
                        </div>

                        {/* Show generated questions */}
                        {generatedQuestions.length > 0 && (
                          <div className="mb-4 p-4 bg-white rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold">Gegenereerde Vragen ({generatedQuestions.length})</h3>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      for (const question of generatedQuestions) {
                                        await api.post(`/lessons/${selectedLesson?.id}/quiz/questions/`, {
                                          question_text: question.question,
                                          question_type: 'multiple_choice',
                                          options: question.options,
                                          correct_answer: question.correctAnswer,
                                          explanation: question.explanation,
                                          difficulty: question.difficulty
                                        });
                                      }
                                      showToast('Quiz opgeslagen!');
                                      setGeneratedQuestions([]);
                                    } catch (error) {
                                      console.error('Save failed:', error);
                                      showToast('Opslaan mislukt');
                                    }
                                  }}
                                  style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.purple})` }}
                                  className="text-white"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Opslaan naar Les
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setGeneratedQuestions([])}
                                >
                                  Wissen
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedLesson && (
                          <QuizBuilder
                            lessonId={selectedLesson.id}
                            onSave={(quiz) => {
                              console.log('Quiz saved:', quiz);
                              showToast('Quiz saved!');
                            }}
                          />
                        )}
                      </TabsContent>

                      {/* AI COACH TAB */}
                      <TabsContent value="ai" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <button
                            onClick={() => showToast('Uitleg genereren - komt binnenkort!')}
                            className="p-3 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">Uitleg</span>
                          </button>
                          <button
                            onClick={() => showToast('Toepassing genereren - komt binnenkort!')}
                            className="p-3 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Toepassen</span>
                          </button>
                          <button
                            onClick={() => showToast('Reflectie genereren - komt binnenkort!')}
                            className="p-3 bg-white hover:bg-green-50 border border-green-200 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Reflectie</span>
                          </button>
                          <button
                            onClick={() => showToast('Oefeningen genereren - komt binnenkort!')}
                            className="p-3 bg-white hover:bg-orange-50 border border-orange-200 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Pencil className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium">Oefenen</span>
                          </button>
                        </div>

                        <div className="rounded-xl border p-4 space-y-4">
                          <div>
                            <Label>AI Coach Metadata</Label>
                            <p className="text-sm text-muted-foreground mb-3">
                              Voeg context toe voor de AI Coach (tags, leerdoelen, glossary)
                            </p>
                            <Textarea
                              rows={6}
                              placeholder="Komt binnenkort: Tags, Objectives, Glossary editor..."
                              className="bg-muted/50"
                              disabled
                            />
                          </div>
                        </div>
                      </TabsContent>

                      {/* SIMULATION TAB */}
                      <TabsContent value="simulation" className="space-y-4 pt-4">
                        <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">AI Simulation Generator</span>
                          </div>
                          <AIGenerateButton
                            type="simulation"
                            context={{
                              courseTitle: selectedCourse?.title || '',
                              moduleTitle: selectedModule?.title || '',
                              lessonTitle: selectedLesson?.title || ''
                            }}
                            onGenerated={(data) => {
                              setGeneratedSimulation(data.simulation);
                              showToast('Simulatie gegenereerd!');
                            }}
                            variant="primary"
                            size="sm"
                          />
                        </div>

                        {/* Display Generated Simulation */}
                        {generatedSimulation && (
                          <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold">Gegenereerde Simulatie</h3>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await api.patch(`/lessons/${selectedLesson?.id}/update/`, {
                                        simulation_id: generatedSimulation.id,
                                        simulation_data: JSON.stringify(generatedSimulation)
                                      });
                                      showToast('Simulatie opgeslagen!');
                                      setGeneratedSimulation(null);
                                    } catch (error) {
                                      console.error('Save failed:', error);
                                      showToast('Opslaan mislukt');
                                    }
                                  }}
                                  style={{ background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.blue})` }}
                                  className="text-white"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Opslaan naar Les
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setGeneratedSimulation(null)}
                                >
                                  Wissen
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-lg text-green-700">{generatedSimulation.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{generatedSimulation.description}</p>
                              </div>
                              <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium mb-2">Scenario:</p>
                                <p className="text-sm text-gray-700">{generatedSimulation.scenario}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">Opties:</p>
                                {generatedSimulation.options?.map((option: any, idx: number) => (
                                  <div key={idx} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="font-medium text-gray-900">{idx + 1}. {option.text}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      <strong>Resultaat:</strong> {option.outcome}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                      Punten: {option.points}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              {generatedSimulation.learningPoints && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm font-medium mb-2">Leerpunten:</p>
                                  <ul className="ml-4 space-y-1">
                                    {generatedSimulation.learningPoints.map((point: string, idx: number) => (
                                      <li key={idx} className="text-sm text-blue-700">• {point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                ID: {generatedSimulation.id}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Manual Simulation Input */}
                        <div className="rounded-xl border p-4 space-y-4">
                          <div>
                            <Label>Simulation ID</Label>
                            <Input
                              placeholder="sim_risk_escalation_healthcare_v1"
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Koppel een decision scenario aan deze les
                            </p>
                          </div>
                          <div>
                            <Label>Practice Set ID (optional)</Label>
                            <Input
                              placeholder="ps_prince2_risk_basics"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </ScrollArea>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setContentModalOpen(false)}>
                      Sluiten
                    </Button>
                    <Button
                      onClick={handleSaveLessonContent}
                      className="text-white"
                      style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Content Opslaan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* SKILLS TAB */}
        {/* ============================================================ */}
        <TabsContent value="skills">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Award className="w-7 h-7" style={{ color: BRAND.purple }} />
                Skills Management
              </h2>
              <Button
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                className="text-white"
                onClick={() => navigate('/academy')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Naar Academy
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Technical Skills</h3>
                  <p className="text-2xl font-bold">12</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Soft Skills</h3>
                  <p className="text-2xl font-bold">8</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Leadership</h3>
                  <p className="text-2xl font-bold">5</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Methodology</h3>
                  <p className="text-2xl font-bold">15</p>
                </CardContent>
              </Card>
            </div>
            <h3 className="text-lg font-semibold">Cursussen met Skills</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesWithContent.map(course => {
                const modules = getModulesByCourseId(course.id);
                const lessonCount = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/academy/course/${course.id}/learn?tab=skills`)}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ background: `${BRAND.purple}15` }}>
                          <Brain className="w-5 h-5" style={{ color: BRAND.purple }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{course.title}</h4>
                          <p className="text-xs text-muted-foreground">{modules.length} modules · {lessonCount} lessen</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full gap-2">
                        <Award className="w-3.5 h-3.5" />
                        Skills Bekijken
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* PRACTICE TAB */}
        {/* ============================================================ */}
        <TabsContent value="practice">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Pencil className="w-7 h-7" style={{ color: BRAND.green }} />
                Praktijk Opdrachten
              </h2>
              <Button
                style={{ background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.blue})` }}
                className="text-white"
                onClick={() => navigate('/academy')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Naar Academy
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Totaal Opdrachten</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.green }}>{coursesWithContent.length * 3}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Cursussen</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.blue }}>{coursesWithContent.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Actieve Studenten</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.purple }}>{getCourseStats().totalStudents.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
            <h3 className="text-lg font-semibold">Cursussen met Praktijk Opdrachten</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesWithContent.map(course => {
                const modules = getModulesByCourseId(course.id);
                const lessonCount = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/academy/course/${course.id}/learn?tab=practice`)}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ background: `${BRAND.green}15` }}>
                          <Pencil className="w-5 h-5" style={{ color: BRAND.green }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{course.title}</h4>
                          <p className="text-xs text-muted-foreground">{modules.length} modules · {lessonCount} lessen</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full gap-2">
                        <Pencil className="w-3.5 h-3.5" />
                        Praktijk Bekijken
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* SIMULATION TAB */}
        {/* ============================================================ */}
        <TabsContent value="simulation">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Play className="w-7 h-7" style={{ color: BRAND.blue }} />
                Simulaties
              </h2>
              <Button
                style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.purple})` }}
                className="text-white"
                onClick={() => navigate('/academy')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Naar Academy
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Totaal Simulaties</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.blue }}>{coursesWithContent.length * 2}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Interactieve Scenario's</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.purple }}>{coursesWithContent.length * 4}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Cursussen</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.green }}>{coursesWithContent.length}</p>
                </CardContent>
              </Card>
            </div>
            <h3 className="text-lg font-semibold">Cursussen met Simulaties</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesWithContent.map(course => {
                const modules = getModulesByCourseId(course.id);
                const lessonCount = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/academy/course/${course.id}/learn?tab=simulation`)}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ background: `${BRAND.blue}15` }}>
                          <FlaskConical className="w-5 h-5" style={{ color: BRAND.blue }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{course.title}</h4>
                          <p className="text-xs text-muted-foreground">{modules.length} modules · {lessonCount} lessen</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full gap-2">
                        <Play className="w-3.5 h-3.5" />
                        Simulatie Starten
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* QUIZ TAB */}
        {/* ============================================================ */}
        <TabsContent value="quiz">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-7 h-7" style={{ color: BRAND.green }} />
                Quiz Beheer
              </h2>
              <Button
                style={{ background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.blue})` }}
                className="text-white"
                onClick={() => navigate('/academy')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Naar Academy
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Totaal Quizzen</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.green }}>{getCourseStats().totalModules}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Totaal Vragen</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.blue }}>{getCourseStats().totalModules * 10}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Gem. Score</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.purple }}>78%</p>
                </CardContent>
              </Card>
            </div>
            <h3 className="text-lg font-semibold">Cursussen met Quizzen</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesWithContent.map(course => {
                const modules = getModulesByCourseId(course.id);
                const lessonCount = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/academy/course/${course.id}/learn?tab=quiz`)}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ background: `${BRAND.green}15` }}>
                          <CheckCircle2 className="w-5 h-5" style={{ color: BRAND.green }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{course.title}</h4>
                          <p className="text-xs text-muted-foreground">{modules.length} quizzen · {lessonCount} lessen</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Quiz Bekijken
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* EXAM TAB */}
        {/* ============================================================ */}
        <TabsContent value="exam">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-7 h-7" style={{ color: BRAND.orange }} />
                Examen Beheer
              </h2>
              <Button
                style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.purple})` }}
                className="text-white"
                onClick={() => navigate('/academy')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Naar Academy
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Totaal Examens</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.orange }}>{coursesWithContent.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Afgenomen</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.green }}>342</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Slagingspercentage</h3>
                  <p className="text-2xl font-bold" style={{ color: BRAND.blue }}>85%</p>
                </CardContent>
              </Card>
            </div>
            <h3 className="text-lg font-semibold">Cursussen met Examens</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesWithContent.map(course => {
                const modules = getModulesByCourseId(course.id);
                const lessonCount = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/academy/course/${course.id}/learn?tab=exam`)}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ background: `${BRAND.orange}15` }}>
                          <FileText className="w-5 h-5" style={{ color: BRAND.orange }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{course.title}</h4>
                          <p className="text-xs text-muted-foreground">{course.duration || 0}u · {lessonCount} lessen · 1 examen</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        Examen Bekijken
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* CERTIFICATE TAB */}
        {/* ============================================================ */}
        <TabsContent value="certificate">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Award className="w-7 h-7" style={{ color: BRAND.purple }} />
                Certificaten Beheer
              </h2>
              <Button
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                className="text-white"
                onClick={() => navigate('/academy')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Naar Academy
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5" style={{ color: BRAND.purple }} />
                    <h3 className="font-semibold">Totaal Uitgegeven</h3>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: BRAND.purple }}>156</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5" style={{ color: BRAND.green }} />
                    <h3 className="font-semibold">Deze Maand</h3>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: BRAND.green }}>23</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-5 h-5" style={{ color: BRAND.blue }} />
                    <h3 className="font-semibold">Downloads</h3>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: BRAND.blue }}>142</p>
                </CardContent>
              </Card>
            </div>
            <h3 className="text-lg font-semibold">Cursussen met Certificaten</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesWithContent.map(course => {
                const modules = getModulesByCourseId(course.id);
                const lessonCount = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/academy/course/${course.id}/learn?tab=certificate`)}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ background: `${BRAND.purple}15` }}>
                          <Trophy className="w-5 h-5" style={{ color: BRAND.purple }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{course.title}</h4>
                          <p className="text-xs text-muted-foreground">{course.duration || 0}u · {lessonCount} lessen</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full gap-2">
                        <Award className="w-3.5 h-3.5" />
                        Certificaat Bekijken
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCourseBuilder;