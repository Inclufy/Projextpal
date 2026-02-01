// ============================================
// COURSEBUILDER WITH DATA & AI INTEGRATION - FIXED
// ============================================

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Plus, Trash2, GripVertical, 
  Sparkles, Upload, X, ChevronDown, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// Import from knowledge base
import { 
  courses,
  pmFundamentalsModules,
  prince2Modules,
  scrumModules,
  waterfallModules,
  kanbanModules,
  agileModules,
  leanSixSigmaModules,
  getCourseById,
  type Course, 
  type Module, 
  type Lesson,
} from '../../data/academy';

const academyCourses: Course[] = courses.map(course => {
  let modules: Module[] = [];
  
  switch(course.id) {
    case 'pm-fundamentals':
      modules = pmFundamentalsModules || [];
      break;
    case 'prince2-practitioner':
      modules = prince2Modules || [];
      break;
    case 'scrum-master':
      modules = scrumModules || [];
      break;
    case 'waterfall-pm':
      modules = waterfallModules || [];
      break;
    case 'kanban-practitioner':
      modules = kanbanModules || [];
      break;
    case 'agile-fundamentals':
      modules = agileModules || [];
      break;
    case 'lean-six-sigma-green-belt':
      modules = leanSixSigmaModules || [];
      break;
  }
  
  return {
    ...course,
    modules: modules,
  };
});

// Safe imports
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
  pink: '#D946EF',
  blue: '#3B82F6',
  green: '#22C55E',
};

interface CourseBuilderProps {
  onClose: () => void;
  initialCourseId?: string | null;
}

const CourseBuilder: React.FC<CourseBuilderProps> = ({ onClose, initialCourseId }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isNL = language === 'nl';

  const [currentStep, setCurrentStep] = useState(1);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiCuratorOpen, setAiCuratorOpen] = useState(false);
  const [aiCuratorTopic, setAiCuratorTopic] = useState('');
  const [selectedCourseForImport, setSelectedCourseForImport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    methodology: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    language: 'Nederlands',
    price: 0,
    duration: '',
    instructor: '',
    featured: false,
    bestseller: false,
    certificate: true,
    modules: [] as Module[],
  });

  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const content = {
    title: isNL ? 'Cursus Bouwer' : 'Course Builder',
    subtitle: isNL ? 'Maak of bewerk een cursus' : 'Create or edit a course',
    steps: {
      basics: isNL ? 'Basis Informatie' : 'Basic Info',
      content: isNL ? 'Cursus Inhoud' : 'Course Content',
      preview: isNL ? 'Voorbeeld' : 'Preview',
    },
    actions: {
      import: isNL ? 'Importeer uit Kennisbank' : 'Import from Knowledge Base',
      aiGenerate: isNL ? 'AI Genereren' : 'AI Generate',
      save: isNL ? 'Opslaan' : 'Save',
      cancel: isNL ? 'Annuleren' : 'Cancel',
      addModule: isNL ? 'Module Toevoegen' : 'Add Module',
      addLesson: isNL ? 'Les Toevoegen' : 'Add Lesson',
    },
  };

  useEffect(() => {
    if (initialCourseId) {
      loadCourse(initialCourseId);
    }
  }, [initialCourseId]);

  const loadCourse = async (courseId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8001/api/v1/academy/admin/courses/${courseId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load course');
      
      const course = await response.json();
      
      setFormData({
        title: course.title,
        subtitle: course.subtitle || '',
        description: course.description,
        category: course.category,
        methodology: course.methodology,
        difficulty: course.difficulty,
        language: course.language || 'Nederlands',
        price: course.price,
        duration: course.duration || '',
        instructor: course.instructor?.name || '',
        featured: course.featured || false,
        bestseller: course.bestseller || false,
        certificate: course.certificate !== false,
        modules: course.modules || [],
      });

      toast({ title: isNL ? 'Cursus geladen' : 'Course loaded' });
    } catch (err) {
      toast({
        title: 'Error',
        description: isNL ? 'Kon cursus niet laden' : 'Could not load course',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
  if (!selectedCourseForImport) return;

  const courseData = getCourseById(selectedCourseForImport);
  if (!courseData) {
    toast({
      title: 'Error',
      description: isNL ? 'Cursus niet gevonden' : 'Course not found',
      variant: 'destructive',
    });
    return;
  }

  setFormData({
    title: courseData.title,              // ✅ courseData, niet course
    subtitle: courseData.subtitle,        // ✅
    description: courseData.description,  // ✅
    category: courseData.methodology,     // ✅
    methodology: courseData.methodology,  // ✅
    difficulty: courseData.difficulty,    // ✅
    language: courseData.language,        // ✅
    price: courseData.price,              // ✅
    duration: courseData.duration,        // ✅
    instructor: courseData.instructor?.name || '',  // ✅ Optional chaining
    featured: courseData.featured || false,
    bestseller: courseData.bestseller || false,
    certificate: courseData.certificate,
    modules: courseData.modules || [],
  });

  setImportDialogOpen(false);
  toast({
    title: isNL ? 'Cursus geïmporteerd!' : 'Course imported!',
    description: `"${courseData.title}" ${isNL ? 'is geladen' : 'has been loaded'}`,
  });
}

  const handleAIGenerate = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8001/api/v1/academy/ai/generate-module/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI generation failed');
      }

      const moduleData = await response.json();
      
      const newModule: Module = {
        id: `module-${Date.now()}`,
        title: moduleData.title,
        description: moduleData.description,
        lessons: moduleData.lessons.map((lesson: any, idx: number) => ({
          id: `lesson-${Date.now()}-${idx}`,
          title: lesson.title,
          duration: lesson.duration || '15:00',
          type: lesson.type || 'video',
        })),
      };

      setFormData(prev => ({
        ...prev,
        modules: [...prev.modules, newModule],
      }));

      setAiDialogOpen(false);
      toast({ title: isNL ? 'Module gegenereerd!' : 'Module generated!' });
    } catch (err: any) {
      console.error('AI generation error:', err);
      toast({
        title: 'Error',
        description: err.message || (isNL ? 'AI generatie mislukt' : 'AI generation failed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAICurateCourse = async () => {
    if (!aiCuratorTopic.trim()) {
      toast({
        title: 'Error',
        description: isNL ? 'Voer een onderwerp in' : 'Enter a topic',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const validCourses = academyCourses.filter(course => {
        return course.modules && Array.isArray(course.modules) && course.modules.length > 0;
      });

      const availableModules = validCourses.flatMap(course => 
        course.modules.map(module => ({
          courseId: course.id,
          courseTitle: course.title,
          moduleId: module.id,
          moduleTitle: module.title,
          moduleDescription: module.description || '',
          methodology: course.methodology,
          lessonCount: module.lessons ? module.lessons.length : 0,
        }))
      );

      const response = await fetch('http://localhost:8001/api/v1/academy/ai/curate-course/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          topic: aiCuratorTopic,
          availableModules: availableModules,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI curation failed');
      }

      const courseDesign = await response.json();
      
      const selectedModules: Module[] = [];
      if (courseDesign.selectedModules && Array.isArray(courseDesign.selectedModules)) {
        courseDesign.selectedModules.forEach((selection: any) => {
          const course = academyCourses.find(c => c.id === selection.courseId);
          if (course && course.modules) {
            const module = course.modules.find(m => m.id === selection.moduleId);
            if (module) {
              selectedModules.push({
                ...module,
                id: `module-${Date.now()}-${Math.random()}`,
                lessons: module.lessons ? module.lessons.map(lesson => ({
                  ...lesson,
                  id: `lesson-${Date.now()}-${Math.random()}`,
                })) : [],
              });
            }
          }
        });
      }

      if (selectedModules.length === 0) {
        toast({
          title: 'Warning',
          description: isNL ? 'AI kon geen relevante modules vinden' : 'AI could not find relevant modules',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const estimatedPrice = Math.round(
        (parseInt(courseDesign.duration) || 10) * 8 + selectedModules.length * 15
      );

      setFormData({
        title: courseDesign.title,
        subtitle: courseDesign.subtitle,
        description: courseDesign.description,
        category: courseDesign.category,
        methodology: courseDesign.methodology,
        difficulty: courseDesign.difficulty,
        language: 'Nederlands',
        price: estimatedPrice,
        duration: courseDesign.duration,
        instructor: '',
        featured: false,
        bestseller: false,
        certificate: true,
        modules: selectedModules,
      });

      setAiCuratorOpen(false);
      setAiCuratorTopic('');
      
      toast({
        title: isNL ? 'Cursus samengesteld!' : 'Course curated!',
        description: `"${courseDesign.title}" met ${selectedModules.length} modules`,
      });

      setCurrentStep(2);
    } catch (err: any) {
      console.error('AI error:', err);
      toast({
        title: 'Error',
        description: err.message || (isNL ? 'AI mislukt' : 'AI failed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
  console.log('🔵 HANDLESAVE CALLED!');
  console.log('formData:', formData);
  console.log('initialCourseId:', initialCourseId);
  
  setIsSaving(true);
    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        category: formData.category,
        methodology: formData.methodology,
        difficulty: formData.difficulty,
        language: formData.language,
        price: formData.price,
        duration: formData.duration,
        featured: formData.featured,
        bestseller: formData.bestseller,
        certificate: formData.certificate,
        modules: formData.modules,
        status: 'published',
      };

      const url = initialCourseId
  ? `http://localhost:8001/api/v1/academy/admin/courses/${initialCourseId}/`
  : 'http://localhost:8001/api/v1/academy/admin/courses/create/';

      const response = await fetch(url, {
        method: initialCourseId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Save failed');

      toast({
        title: isNL ? 'Cursus opgeslagen!' : 'Course saved!',
        description: isNL ? 'De cursus is succesvol opgeslagen' : 'Course was saved successfully',
      });

      onClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: isNL ? 'Kon cursus niet opslaan' : 'Could not save course',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: isNL ? 'Nieuwe Module' : 'New Module',
      description: '',
      lessons: [],
    };
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
    setExpandedModules(prev => [...prev, newModule.id]);
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    }));
  };

  const deleteModule = (moduleId: string) => {
    if (!confirm(isNL ? 'Weet je zeker dat je deze module wilt verwijderen?' : 'Are you sure?')) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId),
    }));
  };

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: isNL ? 'Nieuwe Les' : 'New Lesson',
      duration: '15:00',
      type: 'video',
    };

    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? { ...m, lessons: [...m.lessons, newLesson] }
          : m
      ),
    }));
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map(l =>
                l.id === lessonId ? { ...l, ...updates } : l
              ),
            }
          : m
      ),
    }));
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
          : m
      ),
    }));
  };

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex gap-3">
        {/* Import Dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              {content.actions.import}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isNL ? 'Importeer uit Kennisbank' : 'Import from Knowledge Base'}</DialogTitle>
              <DialogDescription>
                {isNL 
                  ? 'Selecteer een cursus uit de kennisbank om te importeren'
                  : 'Select a course from the knowledge base to import'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedCourseForImport} onValueChange={setSelectedCourseForImport}>
                <SelectTrigger>
                  <SelectValue placeholder={isNL ? 'Selecteer een cursus' : 'Select a course'} />
                </SelectTrigger>
                <SelectContent>
                  {academyCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCourseForImport && (() => {
                const course = getCourseById(selectedCourseForImport);
                return course ? (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{course.subtitle}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge>{course.methodology}</Badge>
                        <Badge variant="outline">{course.difficulty}</Badge>
                        <Badge variant="outline">{course.totalLessons} {isNL ? 'lessen' : 'lessons'}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                {content.actions.cancel}
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!selectedCourseForImport}
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                className="text-white"
              >
                {isNL ? 'Importeren' : 'Import'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Curator Dialog */}
        <Dialog open={aiCuratorOpen} onOpenChange={setAiCuratorOpen}>
  <DialogTrigger asChild>
    <Button variant="outline" className="gap-2">
      <Sparkles className="w-4 h-4" />
      {isNL ? 'AI Cursus Samenstellen' : 'AI Curate Course'}
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>{isNL ? 'AI Cursus Samenstellen' : 'AI Curate Course'}</DialogTitle>
      <DialogDescription>
        {isNL 
          ? 'Laat AI relevante modules selecteren en een cursus samenstellen'
          : 'Let AI select relevant modules and create a course'}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>{isNL ? 'Onderwerp' : 'Topic'}</Label>
        <Input
          value={aiCuratorTopic}
          onChange={(e) => setAiCuratorTopic(e.target.value)}
          placeholder="Stakeholder Management, Risk Management, etc."
          onKeyDown={(e) => e.key === 'Enter' && aiCuratorTopic.trim() && handleAICurateCourse()}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {['Stakeholder Management', 'Risk Management', 'Change Management', 'Quality Management'].map(ex => (
          <Button
            key={ex}
            variant="outline"
            size="sm"
            onClick={() => setAiCuratorTopic(ex)}
          >
            {ex}
          </Button>
        ))}
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setAiCuratorOpen(false)}>
        {content.actions.cancel}
      </Button>
      <Button 
        onClick={handleAICurateCourse}
        disabled={isLoading || !aiCuratorTopic.trim()}
        style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
        className="text-white gap-2"
      >
        <Sparkles className="w-4 h-4" />
        {isLoading ? (isNL ? 'Bezig...' : 'Working...') : (isNL ? 'Samenstellen' : 'Create')}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

        {/* AI Generate Module Dialog */}
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
  <DialogTrigger asChild>
    <Button variant="outline" className="gap-2">
      <Sparkles className="w-4 h-4" />
      {content.actions.aiGenerate}
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{isNL ? 'AI Module Genereren' : 'AI Generate Module'}</DialogTitle>
      <DialogDescription>
        {isNL 
          ? 'Beschrijf de module die je wilt maken'
          : 'Describe the module you want to create'}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>{isNL ? 'Module Onderwerp' : 'Module Topic'}</Label>
        <Input
          id="ai-prompt"
          placeholder={isNL ? 'Bijv. "Risk Management in IT Projects"' : 'E.g. "Risk Management in IT Projects"'}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              if (input.value.trim()) handleAIGenerate(input.value);
            }
          }}
        />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
        {content.actions.cancel}
      </Button>
      <Button 
        onClick={() => {
          const promptInput = document.getElementById('ai-prompt') as HTMLInputElement;
          if (promptInput?.value.trim()) {
            handleAIGenerate(promptInput.value);
          }
        }}
        disabled={isLoading}
        style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
        className="text-white gap-2"
      >
        <Sparkles className="w-4 h-4" />
        {isLoading ? (isNL ? 'Genereren...' : 'Generating...') : (isNL ? 'Genereren' : 'Generate')}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>{isNL ? 'Cursustitel' : 'Course Title'} *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Project Management Fundamentals"
          />
        </div>

        <div className="space-y-2">
          <Label>{isNL ? 'Ondertitel' : 'Subtitle'}</Label>
          <Input
            value={formData.subtitle}
            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
            placeholder={isNL ? 'Een korte beschrijving' : 'A short description'}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{isNL ? 'Beschrijving' : 'Description'} *</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          placeholder={isNL ? 'Uitgebreide cursus beschrijving...' : 'Detailed course description...'}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>{isNL ? 'Categorie' : 'Category'} *</Label>
          <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({ ...prev, category: val, methodology: val }))}>
            <SelectTrigger>
              <SelectValue placeholder={isNL ? 'Selecteer' : 'Select'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project-management">Project Management</SelectItem>
              <SelectItem value="agile">Agile & Scrum</SelectItem>
              <SelectItem value="process-improvement">Process Improvement</SelectItem>
              <SelectItem value="governance">Governance</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{isNL ? 'Niveau' : 'Difficulty'} *</Label>
          <Select value={formData.difficulty} onValueChange={(val: any) => setFormData(prev => ({ ...prev, difficulty: val }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{isNL ? 'Prijs (€)' : 'Price (€)'} *</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isNL ? 'Duur (uren)' : 'Duration (hours)'}</Label>
          <Input
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="12"
          />
        </div>

        <div className="space-y-2">
          <Label>{isNL ? 'Taal' : 'Language'}</Label>
          <Select value={formData.language} onValueChange={(val) => setFormData(prev => ({ ...prev, language: val }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nederlands">Nederlands</SelectItem>
              <SelectItem value="English">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
          />
          <Label>{isNL ? 'Uitgelicht' : 'Featured'}</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.bestseller}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bestseller: checked }))}
          />
          <Label>{isNL ? 'Bestseller' : 'Bestseller'}</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.certificate}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, certificate: checked }))}
          />
          <Label>{isNL ? 'Certificaat' : 'Certificate'}</Label>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{isNL ? 'Modules & Lessen' : 'Modules & Lessons'}</h3>
        <Button onClick={addModule} className="gap-2 text-white" style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}>
          <Plus className="w-4 h-4" />
          {content.actions.addModule}
        </Button>
      </div>

      {!formData.modules || formData.modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isNL ? 'Geen modules. Klik op "Module Toevoegen" om te starten.' : 'No modules. Click "Add Module" to start.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {formData.modules.map((module) => {
            const isExpanded = expandedModules.includes(module.id);
            const lessons = module.lessons || [];
            
            return (
              <Card key={module.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" className="cursor-move">
                      <GripVertical className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Input
                          value={module.title || ''}
                          onChange={(e) => updateModule(module.id, { title: e.target.value })}
                          className="font-semibold"
                          placeholder={isNL ? 'Module titel' : 'Module title'}
                        />
                        <Badge variant="outline">{lessons.length} {isNL ? 'lessen' : 'lessons'}</Badge>
                      </div>
                      <Textarea
                        value={module.description || ''}
                        onChange={(e) => updateModule(module.id, { description: e.target.value })}
                        rows={2}
                        placeholder={isNL ? 'Module beschrijving' : 'Module description'}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleModuleExpanded(module.id)}
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteModule(module.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{isNL ? 'Lessen' : 'Lessons'}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addLesson(module.id)}
                          className="gap-2"
                        >
                          <Plus className="w-3 h-3" />
                          {content.actions.addLesson}
                        </Button>
                      </div>

                      {lessons.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          {isNL ? 'Geen lessen. Klik "Les Toevoegen"' : 'No lessons. Click "Add Lesson"'}
                        </div>
                      ) : (
                        lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                            <Button variant="ghost" size="icon" className="cursor-move h-8 w-8">
                              <GripVertical className="w-3 h-3" />
                            </Button>
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              <Input
                                value={lesson.title || ''}
                                onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                placeholder={isNL ? 'Les titel' : 'Lesson title'}
                                className="col-span-2"
                              />
                              <Input
                                value={lesson.duration || ''}
                                onChange={(e) => updateLesson(module.id, lesson.id, { duration: e.target.value })}
                                placeholder="15:00"
                              />
                            </div>
                            <Select
                              value={lesson.type || 'video'}
                              onValueChange={(val) => updateLesson(module.id, lesson.id, { type: val as any })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="assignment">Assignment</SelectItem>
                                <SelectItem value="exam">Exam</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteLesson(module.id, lesson.id)}
                              className="h-8 w-8"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => {
    const totalLessons = formData.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>{formData.title}</CardTitle>
                <p className="text-muted-foreground mt-1">{formData.subtitle}</p>
              </div>
              {formData.featured && (
                <Badge style={{ backgroundColor: BRAND.purple, color: 'white' }}>Featured</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{formData.description}</p>
            
            <div className="flex flex-wrap gap-2">
              <Badge>{formData.category}</Badge>
              <Badge variant="outline">{formData.difficulty}</Badge>
              <Badge variant="outline">{formData.language}</Badge>
              <Badge variant="outline">€{formData.price}</Badge>
              {formData.duration && <Badge variant="outline">{formData.duration} uur</Badge>}
              {formData.bestseller && <Badge style={{ backgroundColor: BRAND.pink, color: 'white' }}>Bestseller</Badge>}
              {formData.certificate && <Badge style={{ backgroundColor: BRAND.green, color: 'white' }}>Certificaat</Badge>}
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{isNL ? 'Cursus Inhoud' : 'Course Content'}</h4>
                <Badge variant="outline">
                  {formData.modules.length} {isNL ? 'modules' : 'modules'} · {totalLessons} {isNL ? 'lessen' : 'lessons'}
                </Badge>
              </div>
              <div className="space-y-2">
                {formData.modules.map((module, idx) => (
                  <div key={module.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{idx + 1}. {module.title}</div>
                        {module.description && (
                          <div className="text-sm text-muted-foreground mt-1">{module.description}</div>
                        )}
                      </div>
                      <Badge variant="secondary">{module.lessons.length} {isNL ? 'lessen' : 'lessons'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{content.title}</h1>
                <p className="text-muted-foreground">{content.subtitle}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                {content.actions.cancel}
              </Button>
              {currentStep === 3 && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !formData.title || !formData.description}
                  className="gap-2 text-white"
                  style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? (isNL ? 'Opslaan...' : 'Saving...') : content.actions.save}
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-8 mt-6">
            {[1, 2, 3].map(step => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                  currentStep === step
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  currentStep === step ? 'bg-purple-600 text-white' : 'bg-muted'
                }`}>
                  {step}
                </div>
                <span className="font-medium">
                  {step === 1 ? content.steps.basics : step === 2 ? content.steps.content : content.steps.preview}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">{isNL ? 'Laden...' : 'Loading...'}</p>
            </div>
          </div>
        ) : (
          <>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </>
        )}

        {!isLoading && (
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              {isNL ? 'Vorige' : 'Previous'}
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              disabled={currentStep === 3}
              style={{ background: currentStep < 3 ? `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` : undefined }}
              className={currentStep < 3 ? 'text-white' : ''}
            >
              {isNL ? 'Volgende' : 'Next'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseBuilder;
