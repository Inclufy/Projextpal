import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';
import { visualService, type LessonVisual } from '@/services/visualService';
import axios from 'axios';
import VisualPreviewModal from './VisualPreviewModal';
import { coursesWithContent } from '@/data/academy/courses';

interface Course {
  id: string;
  title: string;
}

const VisualManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [visuals, setVisuals] = useState<LessonVisual[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rejectKeywords, setRejectKeywords] = useState<{ [key: number]: string }>({});
  const [previewVisual, setPreviewVisual] = useState<any>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Load courses on mount — try API first, fall back to local data
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await axios.get('/api/v1/academy/courses/');
        const apiCourses = response.data.results || response.data || [];
        if (apiCourses.length > 0) {
          setCourses(apiCourses);
        } else {
          // Use local course data as fallback
          setCourses(coursesWithContent.map(c => ({ id: c.id, title: c.title })));
        }
      } catch (error) {
        console.error('API unavailable, using local course data:', error);
        setCourses(coursesWithContent.map(c => ({ id: c.id, title: c.title })));
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  // Load visuals for selected course
  const loadVisuals = async (courseId: string, status?: string) => {
    setLoading(true);
    try {
      const data = await visualService.getVisualsByCourse(
        courseId,
        status === 'all' ? undefined : status
      );
      setVisuals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load visuals:', error);
      setVisuals([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate visuals for course
  const handleGenerate = async () => {
    if (!selectedCourse) return;
    
    setGenerating(true);
    try {
      const result = await visualService.generateVisuals(selectedCourse, false);
      alert(`Generated ${result.generated} visuals!\nSkipped: ${result.skipped}\nErrors: ${result.errors?.length || 0}`);
      loadVisuals(selectedCourse, filterStatus);
    } catch (error) {
      console.error('Failed to generate visuals:', error);
      alert('Failed to generate visuals. Check console for details.');
    } finally {
      setGenerating(false);
    }
  };

  // Approve visual
  const handleApprove = async (visualId: number) => {
    try {
      await visualService.approveVisual(visualId);
      loadVisuals(selectedCourse, filterStatus);
    } catch (error) {
      console.error('Failed to approve visual:', error);
      alert('Failed to approve visual');
    }
  };

  // Reject visual
  const handleReject = async (visualId: number) => {
    try {
      const keywords = rejectKeywords[visualId];
      await visualService.rejectVisual(visualId, keywords);
      setRejectKeywords(prev => {
        const newState = { ...prev };
        delete newState[visualId];
        return newState;
      });
      loadVisuals(selectedCourse, filterStatus);
    } catch (error) {
      console.error('Failed to reject visual:', error);
      alert('Failed to reject visual');
    }
  };

  // ✅ NIEUWE FUNCTIE: Regenerate visual met custom keywords
  const handleRegenerate = async (visualId: number, keywords: string) => {
    try {
      await visualService.regenerateVisual(visualId, keywords);
      loadVisuals(selectedCourse, filterStatus);
      alert('Visual wordt opnieuw gegenereerd met je custom keywords!');
    } catch (error) {
      console.error('Failed to regenerate visual:', error);
      alert('Failed to regenerate visual. Check console for details.');
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      loadVisuals(selectedCourse, filterStatus);
    }
  }, [selectedCourse, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Visual Management
          </CardTitle>
          <CardDescription>
            Genereer en beheer AI-powered visuals voor cursussen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Selecteer Cursus</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={loadingCourses}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCourses ? "Loading..." : "Kies een cursus..."} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleGenerate} 
                disabled={!selectedCourse || generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Visuals
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Visuals ({visuals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : visuals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Geen visuals gevonden. Genereer eerst visuals voor deze cursus.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Visual ID</TableHead>
                      <TableHead>AI Confidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[500px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visuals.map((visual) => (
                      <TableRow key={visual.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {visual.lesson_title}
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-sm">
                            {visual.visual_id}
                          </code>
                        </TableCell>
                        <TableCell>{visual.ai_confidence}%</TableCell>
                        <TableCell>{getStatusBadge(visual.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* ✅ VIEW BUTTON - ALTIJD ZICHTBAAR */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPreviewVisual(visual);
                                setPreviewModalOpen(true);
                              }}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>

                            {/* APPROVE/REJECT BUTTONS - ALLEEN VOOR PENDING */}
                            {visual.status === 'pending' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprove(visual.id)}
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <div className="flex items-center gap-2">
                                  <Input
                                    placeholder="Custom keywords..."
                                    className="h-8 w-48"
                                    value={rejectKeywords[visual.id] || ''}
                                    onChange={(e) => setRejectKeywords(prev => ({
                                      ...prev,
                                      [visual.id]: e.target.value
                                    }))}
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(visual.id)}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </>
                            ) : visual.status === 'approved' ? (
                              <span className="text-sm text-green-600 font-medium">
                                ✓ Approved
                              </span>
                            ) : (
                              <span className="text-sm text-red-600 font-medium">
                                ✗ Rejected {visual.custom_keywords && `(${visual.custom_keywords})`}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ✅ PREVIEW MODAL MET REGENERATE */}
      <VisualPreviewModal
        visual={previewVisual}
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewVisual(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onRegenerate={handleRegenerate}
      />
    </div>
  );
};

export default VisualManagement;