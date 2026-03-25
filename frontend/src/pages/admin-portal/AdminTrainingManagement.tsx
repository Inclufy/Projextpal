import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Image } from 'lucide-react';
import EnhancedCourseBuilder from '@/components/course-builder/EnhancedCourseBuilder';
import VisualManagement from '@/components/admin/VisualManagement';
import { usePageTranslations } from '@/hooks/usePageTranslations';

const AdminTrainingManagement = () => {
  const { pt } = usePageTranslations();
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{pt("Training Management")}</h1>
        <p className="text-muted-foreground">
          {pt("Manage courses and visual content")}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {pt("Courses")}
          </TabsTrigger>
          <TabsTrigger value="visuals" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            {pt("Visual Management")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <EnhancedCourseBuilder />
        </TabsContent>

        <TabsContent value="visuals" className="space-y-4">
          <VisualManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTrainingManagement;
