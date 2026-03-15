import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserPlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: number;
  user_name: string;
  user_email: string;
  role: string;
}

interface CompanyUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  name?: string;
}

const FoundationTeam = () => {
  const { pt } = usePageTranslations();
  const { t } = useLanguage();
  const { id: projectId } = useParams<{ id: string }>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/team/`, { headers });
      if (response.ok) {
        const data = await response.json();
        setMembers(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/v1/users/", { headers });
      if (response.ok) {
        const data = await response.json();
        setCompanyUsers(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [projectId]);

  const handleAddMember = async (userId: number) => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/team/add/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (response.ok) {
        toast.success(t.common.teamMemberAdded);
        fetchMembers();
        fetchCompanyUsers();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || t.common.addFailed);
      }
    } catch {
      toast.error(t.common.addFailed);
    }
  };

  const handleRemoveMember = async (teamMemberId: number) => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/team/remove/${teamMemberId}/`, {
        method: "DELETE",
        headers,
      });
      if (response.ok || response.status === 204) {
        toast.success(t.common.teamMemberRemoved);
        fetchMembers();
      } else {
        toast.error(t.common.removeFailed);
      }
    } catch {
      toast.error(t.common.removeFailed);
    }
  };

  const memberUserIds = members.map((m: any) => m.user || m.user_id);
  const availableUsers = companyUsers
    .filter(u => !memberUserIds.includes(u.id))
    .filter(u => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const name = u.name || `${u.first_name} ${u.last_name}`;
      return name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });

  const getMemberName = (m: any) =>
    m.user_name || m.name || (m.user?.first_name ? `${m.user.first_name} ${m.user.last_name}` : m.user_email || "");
  const getMemberEmail = (m: any) => m.user_email || m.email || m.user?.email || "";
  const getMemberRole = (m: any) => {
    const role = m.role || "Member";
    const roleMap: Record<string, string> = {
      superadmin: "Admin", admin: "Admin", pm: "Project Manager",
      project_manager: "Project Manager", member: "Member",
      product_manager: "Product Manager",
    };
    return roleMap[role.toLowerCase()] || role;
  };

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {pt("Project Team")} ({members.length} {pt("members")})
                </h2>
                <p className="text-sm text-muted-foreground">{pt("Manage project team and roles")}</p>
              </div>
              <Button onClick={() => { setAddDialogOpen(true); fetchCompanyUsers(); }} className="gap-2">
                <UserPlus className="h-4 w-4" />
                + {pt("Add Member")}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{pt("No team members yet")}</h3>
              <p className="text-muted-foreground mb-4">{pt("Add members to get started")}</p>
              <Button onClick={() => { setAddDialogOpen(true); fetchCompanyUsers(); }}>
                <UserPlus className="h-4 w-4 mr-2" />
                {pt("Add Member")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {members.map((member: any) => (
                <Card key={member.id} className="p-4 hover:shadow-md transition-shadow group relative">
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                    title={pt("Remove")}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {getMemberName(member)?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{getMemberName(member)}</h3>
                      <p className="text-xs text-muted-foreground truncate">{getMemberEmail(member)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {pt(getMemberRole(member))}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{pt("Add Member")}</DialogTitle>
            <DialogDescription>{pt("Select a user to add to the project team")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={pt("Search by name or email...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : availableUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  {searchQuery ? pt("No users found") : pt("All users are already team members")}
                </p>
              ) : (
                availableUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleAddMember(user.id)}
                  >
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {(user.name || user.first_name || user.email)?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name || `${user.first_name} ${user.last_name}`.trim() || user.email}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <UserPlus className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoundationTeam;
