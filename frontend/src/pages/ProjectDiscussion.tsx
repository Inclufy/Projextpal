import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Card } from "@/components/ui/card";
import { MessagesSquare } from "lucide-react";
import CommentThread from "@/components/CommentThread";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useAuth } from "@/contexts/AuthContext";

export default function ProjectDiscussion() {
  const { id } = useParams();
  const { pt } = usePageTranslations();
  const { user } = useAuth();

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white"><MessagesSquare className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold">{pt("Discussion")}</h1>
            <p className="text-sm text-muted-foreground">{pt("Shared project board — post updates, ask questions, @mention teammates.")}</p>
          </div>
        </div>
        <Card className="p-5">
          <CommentThread projectId={id!} currentUserId={(user as any)?.id} />
        </Card>
      </div>
    </div>
  );
}
