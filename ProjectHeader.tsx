import { Button } from "@/components/ui/button";
import { Sparkles, Edit2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export const ProjectHeader = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="border-b border-border bg-card">
      <div className="px-6 py-4 flex justify-end gap-2">
        <Button 
          variant="outline"
          onClick={() => navigate(`/projects/${id}/foundation/overview`)}
          className="gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Edit Project
        </Button>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Analyze with AI
        </Button>
      </div>
    </div>
  );
};
