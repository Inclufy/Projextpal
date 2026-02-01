import { useState, useEffect } from 'react';
import { 
  Plus, Save, X, ChevronDown, ChevronUp, GripVertical, 
  Upload, Download, Eye, Trash2, Copy, BookOpen, Video,
  FileText, HelpCircle, Award, Edit2, Check, AlertCircle,
  Loader2, RefreshCw, PlayCircle, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { academyCourses } from '@/data/academyCourses';
import { academyCourses } from '@/data/academy/academyCourses';
import { categories } from '@/data/academy/categories';
import { instructors } from '@/data/academy/instructors';

// ============================================
// TYPES
// ============================================
interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'assignment' | 'exam' | 'certificate';
  videoUrl?: string;
  transcript?: string;
  keyTakeaways?: string[];
  description?: string;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  originalPrice?: number;
  language: string;
  modules: Module[];
  whatYouLearn: string[];
  requirements: string[];
  targetAudience: string[];
  instructor: {
    name: string;
    title: string;
    avatar: string;
    bio: string;
  };
  featured?: boolean;
  bestseller?: boolean;
  certificate?: boolean;
}

const handleImportCourse = (courseId: string) => {
  const courseToImport = academyCourses.find(c => c.id === courseId);
  
  if (!courseToImport) {
    toast({
      title: isNL ? 'Fout' : 'Error',
      description: isNL ? 'Cursus niet gevonden' : 'Course not found',
      variant: 'destructive',
    });
    return;
  }

  // Map imported course to form data
  setFormData({
    title: courseToImport.title,
    subtitle: courseToImport.subtitle || '',
    description: courseToImport.description,
    category: courseToImport.category,
    difficulty: courseToImport.difficulty,
    price: courseToImport.price,
    language: courseToImport.language || 'Nederlands',
    duration: courseToImport.duration || '',
    modules: courseToImport.modules || [],
    whatYouLearn: courseToImport.whatYouLearn || [],
    requirements: courseToImport.requirements || [],
    targetAudience: courseToImport.targetAudience || [],
    instructor: courseToImport.instructor,
    featured: courseToImport.featured || false,
    bestseller: courseToImport.bestseller || false,
    certificate: courseToImport.certificate !== false,
  });

  toast({
    title: isNL ? 'Cursus geïmporteerd!' : 'Course imported!',
    description: isNL ? `"${courseToImport.title}" is geladen` : `"${courseToImport.title}" has been loaded`,
  });
};
// ============================================
// LESSON TYPE ICONS
// ============================================
const getLessonIcon = (type: string) => {
  switch (type) {
    case 'quiz': return <HelpCircle className="h-4 w-4 text-orange-500" />;
    case 'assignment': return <FileText className="h-4 w-4 text-blue-500" />;
    case 'exam': return <Award className="h-4 w-4 text-red-500" />;
    case 'certificate': return <Award className="h-4 w-4 text-yellow-500" />;
    default: return <PlayCircle className="h-4 w-4 text-purple-500" />;
  }
};

// ============================================
// MAIN COMPONENT
// ============================================
interface CourseBuilderProps {
  onClose?: () => void;
  initialCourseId?: string;
}

const CourseBuilder = ({ onClose, initialCourseId }: CourseBuilderProps) => {
  const { toast } = useToast();
  
  // State
  const [course, setCourse] = useState<Course>({
    id: '',
    title: '',
    subtitle: '',
    description: '',
    category: 'PM',
    difficulty: 'Beginner',
    price: 0,
    language: 'Nederlands',
    modules: [],
    whatYouLearn: [],
    requirements: [],
    targetAudience: [],
    instructor: {
      name: 'ProjeXtPal Academy',
      title: 'Expert Instructors',
      avatar: '🎓',
      bio: 'Professional training by industry experts'
    },
    featured: false,
    bestseller: false,
    certificate: true,
  });

  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Load course if initialCourseId is provided
  useEffect(() => {
    if (initialCourseId) {
      const foundCourse = academyCourses.find(c => c.id === initialCourseId);
      if (foundCourse) {
        setCourse(foundCourse as Course);
        toast({
          title: "Cursus geladen",
          description: `${foundCourse.title} is geladen voor bewerken`,
        });
      }
    }
  }, [initialCourseId]);

  // Import course from academyCourses
  const handleImportCourse = (courseId: string) => {
    const importedCourse = academyCourses.find(c => c.id === courseId);
    if (importedCourse) {
      setCourse(importedCourse as Course);
      setIsImportDialogOpen(false);
      toast({
        title: "Cursus geïmporteerd!",
        description: `${importedCourse.title} is succesvol geïmporteerd`,
      });
    }
  };

  // Save course to backend
  const handleSaveCourse = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/v1/academy/admin/courses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          ...course,
          modules: JSON.stringify(course.modules),
          what_you_learn: course.whatYouLearn,
          target_audience: course.targetAudience,
        }),
      });

      if (response.ok) {
        toast({
          title: "Cursus opgeslagen!",
          description: "De cursus is succesvol opgeslagen in de database",
        });
      } else {
        throw new Error('Failed to save course');
      }
    } catch (error) {
      toast({
        title: "Fout bij opslaan",
        description: "Er is een fout opgetreden bij het opslaan van de cursus",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Module Management
  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: 'Nieuwe Module',
      description: '',
      lessons: [],
    };
    setCourse({ ...course, modules: [...course.modules, newModule] });
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setCourse({
      ...course,
      modules: course.modules.map(m => 
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    });
  };

  const deleteModule = (moduleId: string) => {
    setCourse({
      ...course,
      modules: course.modules.filter(m => m.id !== moduleId),
    });
  };

  // Lesson Management
  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: 'Nieuwe Les',
      duration: '10:00',
      type: 'video',
      keyTakeaways: [],
    };
    
    setCourse({
      ...course,
      modules: course.modules.map(m => 
        m.id === moduleId 
          ? { ...m, lessons: [...m.lessons, newLesson] }
          : m
      ),
    });
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourse({
      ...course,
      modules: course.modules.map(m => 
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map(l => 
                l.id === lessonId ? { ...l, ...updates } : l
              ),
            }
          : m
      ),
    });
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setCourse({
      ...course,
      modules: course.modules.map(m => 
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
          : m
      ),
    });
  };

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Array field management
  const addArrayItem = (field: 'whatYouLearn' | 'requirements' | 'targetAudience') => {
    setCourse({
      ...course,
      [field]: [...course[field], ''],
    });
  };

  const updateArrayItem = (
    field: 'whatYouLearn' | 'requirements' | 'targetAudience',
    index: number,
    value: string
  ) => {
    const newArray = [...course[field]];
    newArray[index] = value;
    setCourse({ ...course, [field]: newArray });
  };

  const removeArrayItem = (
    field: 'whatYouLearn' | 'requirements' | 'targetAudience',
    index: number
  ) => {
    setCourse({
      ...course,
      [field]: course[field].filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Course Builder
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {course.id ? 'Bewerk cursus' : 'Maak een nieuwe cursus'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importeer
            </Button>
            <Button
              onClick={handleSaveCourse}
              disabled={isSaving || !course.title}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opslaan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Opslaan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basis Informatie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titel *</label>
                <Input
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  placeholder="Bijv. Projectmanagement Fundamentals"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Categorie</label>
                <Select
                  value={course.category}
                  onValueChange={(value) => setCourse({ ...course, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PM">Project Management</SelectItem>
                    <SelectItem value="AGILE">Agile</SelectItem>
                    <SelectItem value="SCRUM">Scrum</SelectItem>
                    <SelectItem value="LEADERSHIP">Leadership</SelectItem>
                    <SelectItem value="TECH">Technical Skills</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ondertitel</label>
              <Input
                value={course.subtitle}
                onChange={(e) => setCourse({ ...course, subtitle: e.target.value })}
                placeholder="Korte beschrijving van de cursus"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Beschrijving</label>
              <Textarea
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                placeholder="Uitgebreide cursus beschrijving..."
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Moeilijkheidsgraad</label>
                <Select
                  value={course.difficulty}
                  onValueChange={(value: any) => setCourse({ ...course, difficulty: value })}
                >
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
              <div>
                <label className="text-sm font-medium mb-2 block">Prijs (€)</label>
                <Input
                  type="number"
                  value={course.price}
                  onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Taal</label>
                <Select
                  value={course.language}
                  onValueChange={(value) => setCourse({ ...course, language: value })}
                >
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

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={course.featured}
                  onChange={(e) => setCourse({ ...course, featured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={course.bestseller}
                  onChange={(e) => setCourse({ ...course, bestseller: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Bestseller</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={course.certificate}
                  onChange={(e) => setCourse({ ...course, certificate: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Certificaat</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Learn */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Wat Je Leert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {course.whatYouLearn.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateArrayItem('whatYouLearn', index, e.target.value)}
                  placeholder="Leerpunt..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem('whatYouLearn', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => addArrayItem('whatYouLearn')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Voeg leerpunt toe
            </Button>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vereisten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {course.requirements.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                  placeholder="Vereiste..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem('requirements', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => addArrayItem('requirements')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Voeg vereiste toe
            </Button>
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Doelgroep</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {course.targetAudience.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateArrayItem('targetAudience', index, e.target.value)}
                  placeholder="Doelgroep..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem('targetAudience', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => addArrayItem('targetAudience')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Voeg doelgroep toe
            </Button>
          </CardContent>
        </Card>

        {/* Modules & Lessons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Modules & Lessen</span>
              <Button onClick={addModule}>
                <Plus className="h-4 w-4 mr-2" />
                Module Toevoegen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.modules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nog geen modules. Voeg je eerste module toe!</p>
              </div>
            ) : (
              course.modules.map((module, moduleIndex) => (
                <Card key={module.id} className="border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4">
                    {/* Module Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
                        {moduleIndex + 1}
                      </div>
                      <Input
                        value={module.title}
                        onChange={(e) => updateModule(module.id, { title: e.target.value })}
                        className="flex-1 font-semibold"
                        placeholder="Module titel..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleModuleExpanded(module.id)}
                      >
                        {expandedModules.includes(module.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteModule(module.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    {/* Module Description */}
                    {expandedModules.includes(module.id) && (
                      <div className="space-y-3 ml-11">
                        <Textarea
                          value={module.description || ''}
                          onChange={(e) => updateModule(module.id, { description: e.target.value })}
                          placeholder="Module beschrijving..."
                          rows={2}
                        />

                        {/* Lessons */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Lessen</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addLesson(module.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Les toevoegen
                            </Button>
                          </div>

                          {module.lessons.map((lesson, lessonIndex) => (
                            <Card key={lesson.id} className="bg-gray-50 dark:bg-gray-800/50">
                              <CardContent className="p-3">
                                <div className="flex items-start gap-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    {getLessonIcon(lesson.type)}
                                    <Input
                                      value={lesson.title}
                                      onChange={(e) => 
                                        updateLesson(module.id, lesson.id, { title: e.target.value })
                                      }
                                      placeholder="Les titel..."
                                      className="flex-1"
                                    />
                                  </div>
                                  <Select
                                    value={lesson.type}
                                    onValueChange={(value: any) => 
                                      updateLesson(module.id, lesson.id, { type: value })
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="video">Video</SelectItem>
                                      <SelectItem value="quiz">Quiz</SelectItem>
                                      <SelectItem value="assignment">Opdracht</SelectItem>
                                      <SelectItem value="exam">Examen</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={lesson.duration}
                                    onChange={(e) => 
                                      updateLesson(module.id, lesson.id, { duration: e.target.value })
                                    }
                                    placeholder="10:00"
                                    className="w-20"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteLesson(module.id, lesson.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Import Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Importeer Cursus</DialogTitle>
              <DialogDescription>
                Selecteer een cursus uit de Academy bibliotheek om te importeren
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[60vh] space-y-2">
              {academyCourses.map((importCourse) => (
                <Card
                  key={importCourse.id}
                  className="cursor-pointer hover:border-purple-500 transition-colors"
                  onClick={() => handleImportCourse(importCourse.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {importCourse.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {importCourse.subtitle}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline">{importCourse.category}</Badge>
                          <Badge variant="outline">{importCourse.difficulty}</Badge>
                          <Badge variant="outline">
                            {importCourse.modules.length} modules
                          </Badge>
                          <Badge variant="outline">€{importCourse.price}</Badge>
                        </div>
                      </div>
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Importeer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CourseBuilder;
