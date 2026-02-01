import { useState, useEffect } from "react";
import { 
  GraduationCap, Plus, Search, MoreHorizontal, Edit, Trash2, Eye,
  BookOpen, Video, FileText, Award, Play, ChevronDown, ChevronRight,
  Save, X, Loader2, CheckCircle2, AlertCircle, Layers, List, Upload,
  ArrowLeft, Settings, Image as ImageIcon, Link2, FileUp
} from "lucide-react";
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

// Import our custom components
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // View states
  const [view, setView] = useState<'courses' | 'content'>('courses');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // Modal states
  const [editCourseModalOpen, setEditCourseModalOpen] = useState(false);
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  
  // Form states
  const [editCourseForm, setEditCourseForm] = useState<any>({});
  const [moduleForm, setModuleForm] = useState<any>({});
  const [lessonForm, setLessonForm] = useState<any>({});
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  const [expandedModules, setExpandedModules] = useState<number[]>([]);

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
      const data = await api.get<Module[]>(`/courses/${courseId}/modules/`);
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
      const data = await api.get<Lesson[]>(`/modules/${moduleId}/lessons/`);
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

  // Course Management
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

  // Module Management
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

  // Lesson Management
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
      // Refetch lessons for the module
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

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.purple }} />
      </div>
    );
  }

  // ===================================
  // COURSES VIEW
  // ===================================
  if (view === 'courses') {
    return (
      <div className="p-6 space-y-6">
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
    );
  }

  // ===================================
  // CONTENT MANAGEMENT VIEW
  // ===================================
  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setView('courses')}
          >
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
              <TabsList className="grid w-full grid-cols-4">
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
              </TabsList>

              <TabsContent value="text" className="space-y-4 pt-4">
                <RichTextEditor
                  content={lessonForm.content || ''}
                  onChange={(content) => setLessonForm({ ...lessonForm, content })}
                  placeholder="Schrijf de les content hier..."
                />
              </TabsContent>

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
                    <h4 className="font-semibold">Geüploade Bestanden</h4>
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

              <TabsContent value="quiz" className="pt-4">
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
            </Tabs>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContentModalOpen(false)}>Sluiten</Button>
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
  );
};

export default EnhancedCourseBuilder;
