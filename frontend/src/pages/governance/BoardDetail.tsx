import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Shield, Users, Trash2, Plus, Calendar, X, Pencil,
  Briefcase, Layers, FolderKanban, Gavel, CalendarDays,
} from "lucide-react";
import { usePageTranslations } from '@/hooks/usePageTranslations';
import MeetingActionsPanel from "@/components/governance/MeetingActionsPanel";

interface Board {
  id: string;
  name: string;
  description: string;
  board_type: string;
  meeting_frequency: string;
  is_active: boolean;
  chair_name: string | null;
  chair_email: string | null;
  members: any[];
  member_count: number;
  portfolio: string | null;
  program: number | null;
  project: number | null;
  created_at: string;
}

interface TeamUser { id: number; email: string; first_name: string; last_name: string; }
interface ParentRef { id: string | number; name: string; }
interface Meeting {
  id: string;
  title: string;
  type: string;
  scheduled_at: string | null;
  status: string;
}
interface Decision {
  id: string;
  title: string;
  status: string;
  impact: string;
  decided_at: string | null;
  board: string | null;
  meeting: string | null;
  program: number | null;
}

const boardTypeLabels: Record<string, string> = {
  steering_committee: "Steering Committee",
  program_board: "Program Board",
  project_board: "Project Board",
  advisory_board: "Advisory Board",
  executive_board: "Executive Board",
};
const memberRoleLabels: Record<string, string> = {
  chair: "Chair",
  member: "Member",
  secretary: "Secretary",
  observer: "Observer",
};
const meetingTypeLabels: Record<string, string> = {
  steering: "Steering Committee",
  board: "Programme Board",
  working: "Working Group",
};
const decisionStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
const meetingStatusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
};

const PREVIEW_LIMIT = 5;

const BoardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pt } = usePageTranslations();

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [memberRole, setMemberRole] = useState("member");
  const [addingMember, setAddingMember] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", board_type: "", meeting_frequency: "", is_active: true });

  // Parent entity names (resolved by id from the board's nullable FKs).
  const [parentPortfolio, setParentPortfolio] = useState<ParentRef | null>(null);
  const [parentProgram, setParentProgram] = useState<ParentRef | null>(null);
  const [parentProject, setParentProject] = useState<ParentRef | null>(null);

  // Related entities — meetings of this board (board-precise via Meeting.board
  // FK from migration 0006, with a legacy program-scoped fallback for old
  // rows) and decisions taken either directly at this board or in any of its
  // meetings.
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);

  const token = localStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { fetchBoard(); }, [id]);

  const fetchBoard = async () => {
    try {
      const res = await fetch(`/api/v1/governance/boards/${id}/`, { headers });
      if (!res.ok) throw new Error("Not found");
      const data: Board = await res.json();
      setBoard(data);
      // Kick off the related fetches once we know which parents to look up.
      fetchParents(data);
      fetchDecisions();
      fetchMeetings(data);
    } catch {
      toast({ title: "Error", description: "Board not found.", variant: "destructive" });
      navigate("/governance/boards");
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async (b: Board) => {
    try {
      if (b.portfolio) {
        const r = await fetch(`/api/v1/governance/portfolios/${b.portfolio}/`, { headers });
        if (r.ok) { const d = await r.json(); setParentPortfolio({ id: d.id, name: d.name }); }
      } else { setParentPortfolio(null); }
    } catch { /* ignore */ }
    try {
      if (b.program) {
        const r = await fetch(`/api/v1/programs/${b.program}/`, { headers });
        if (r.ok) { const d = await r.json(); setParentProgram({ id: d.id, name: d.name }); }
      } else { setParentProgram(null); }
    } catch { /* ignore */ }
    try {
      if (b.project) {
        const r = await fetch(`/api/v1/projects/${b.project}/`, { headers });
        if (r.ok) { const d = await r.json(); setParentProject({ id: d.id, name: d.name }); }
      } else { setParentProject(null); }
    } catch { /* ignore */ }
  };

  const fetchDecisions = async () => {
    // Two flavours: decisions with board=<id> directly, and decisions whose
    // meeting belongs to this board. Server doesn't (yet) support a
    // "?board_or_meeting" filter, and Meeting has no board FK, so we just
    // ask for both ?board=<id> and the parent program decisions then dedupe.
    try {
      const r = await fetch(`/api/v1/governance/decisions/?board=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setDecisions(Array.isArray(d) ? d : d.results || []); }
    } catch { /* ignore */ }
  };

  const fetchMeetings = async (b: Board) => {
    // Primary path: governance.Meeting now has a direct board FK
    // (migration 0006), so we can query precisely. Legacy rows created before
    // the FK existed have meeting.board=NULL — they still appear in the
    // program-scoped fallback so nothing regresses.
    try {
      const r = await fetch(`/api/v1/governance/meetings/?board=${id}`, { headers });
      if (r.ok) {
        const d = await r.json();
        const boardScoped: Meeting[] = Array.isArray(d) ? d : d.results || [];
        if (boardScoped.length > 0) {
          setMeetings(boardScoped);
          return;
        }
      }
    } catch { /* ignore */ }
    // Legacy fallback: program-scoped lookup catches meetings that were
    // created before Meeting.board existed.
    try {
      if (b.program) {
        const r = await fetch(`/api/v1/governance/meetings/?program=${b.program}`, { headers });
        if (r.ok) { const d = await r.json(); setMeetings(Array.isArray(d) ? d : d.results || []); }
      } else {
        setMeetings([]);
      }
    } catch { /* ignore */ }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/v1/auth/admin/users/", { headers });
      if (res.ok) { const data = await res.json(); setUsers(Array.isArray(data) ? data : data.results || []); }
    } catch {
      try {
        const res = await fetch("/api/v1/auth/company-users/", { headers });
        if (res.ok) { const data = await res.json(); setUsers(Array.isArray(data) ? data : data.results || []); }
      } catch { /* ignore */ }
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;
    setAddingMember(true);
    try {
      const res = await fetch("/api/v1/governance/board-members/", {
        method: "POST", headers,
        body: JSON.stringify({ board: id, user: parseInt(selectedUser), role: memberRole }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(JSON.stringify(err)); }
      toast({ title: "Member Added", description: "Board member added successfully." });
      setShowAddMember(false); setSelectedUser(""); setMemberRole("member"); fetchBoard();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to add member.", variant: "destructive" });
    } finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member?")) return;
    try {
      await fetch(`/api/v1/governance/board-members/${memberId}/`, { method: "DELETE", headers });
      toast({ title: "Removed", description: "Member removed." }); fetchBoard();
    } catch {
      toast({ title: "Error", description: "Failed to remove.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this board?")) return;
    try {
      const res = await fetch(`/api/v1/governance/boards/${id}/`, { method: "DELETE", headers });
      if (res.ok) { toast({ title: "Deleted", description: "Board removed." }); navigate("/governance/boards"); }
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const openEditModal = () => {
    if (!board) return;
    setEditForm({
      name: board.name,
      description: board.description || "",
      board_type: board.board_type,
      meeting_frequency: board.meeting_frequency || "",
      is_active: board.is_active,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/v1/governance/boards/${id}/`, {
        method: "PATCH", headers, body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Updated", description: "Board updated successfully." });
      setEditModalOpen(false); fetchBoard();
    } catch {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    }
  };

  // Sort decisions by decided_at desc — most recent first — for the preview.
  const sortedDecisions = useMemo(() => {
    return [...decisions].sort((a, b) => {
      const ad = a.decided_at ? new Date(a.decided_at).getTime() : 0;
      const bd = b.decided_at ? new Date(b.decided_at).getTime() : 0;
      return bd - ad;
    });
  }, [decisions]);

  const previewMeetings = meetings.slice(0, PREVIEW_LIMIT);
  const previewDecisions = sortedDecisions.slice(0, PREVIEW_LIMIT);

  // Deep-link to Decisions page with board pre-filtered + dialog open.
  const goAddDecision = () =>
    navigate(`/governance/decisions?board=${id}&add=1`);
  const goAllDecisionsForBoard = () =>
    navigate(`/governance/decisions?board=${id}`);
  const goAllMeetingsForProgram = () => {
    if (board?.program) navigate(`/programs/${board.program}/governance`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
    </div>
  );
  if (!board) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/governance/boards")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {pt("Back to Boards")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openEditModal}>
            <Pencil className="w-4 h-4 mr-2" /> {pt("Edit")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> {pt("Delete")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">{board.name}</CardTitle>
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge>{boardTypeLabels[board.board_type] || board.board_type}</Badge>
                <Badge variant={board.is_active ? "default" : "secondary"}>
                  {board.is_active ? pt("Active") : pt("Inactive")}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {board.description && (
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-1">{pt("Description")}</h3>
              <p className="text-gray-700">{board.description}</p>
            </div>
          )}

          {/* Parent link badges — fix #5 audit item 8 (portfolio/program/project linkage). */}
          {(parentPortfolio || parentProgram || parentProject) && (
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-2">{pt("Parents")}</h3>
              <div className="flex flex-wrap gap-2">
                {parentPortfolio && (
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted gap-1"
                    onClick={() => navigate(`/governance/portfolios/${parentPortfolio.id}`)}
                    title={pt("Open parent portfolio")}
                  >
                    <Briefcase className="h-3 w-3" /> {parentPortfolio.name}
                  </Badge>
                )}
                {parentProgram && (
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted gap-1"
                    onClick={() => navigate(`/programs/${parentProgram.id}`)}
                    title={pt("Open parent programme")}
                  >
                    <Layers className="h-3 w-3" /> {parentProgram.name}
                  </Badge>
                )}
                {parentProject && (
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted gap-1"
                    onClick={() => navigate(`/projects/${parentProject.id}`)}
                    title={pt("Open parent project")}
                  >
                    <FolderKanban className="h-3 w-3" /> {parentProject.name}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <p className="text-sm text-gray-500">{pt("Chair")}</p>
              <p className="font-semibold text-sm">{board.chair_name || pt("Not assigned")}</p>
            </div>
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto text-purple-600 mb-1" />
              <p className="text-sm text-gray-500">{pt("Members")}</p>
              <p className="font-semibold">{board.member_count}</p>
            </div>
            <div className="text-center">
              <Calendar className="w-5 h-5 mx-auto text-green-600 mb-1" />
              <p className="text-sm text-gray-500">{pt("Meeting Frequency")}</p>
              <p className="font-semibold text-sm">{board.meeting_frequency || pt("Not set")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members panel — preserved. Names clickable to the user (no profile
          page in scope yet) — left as plain text but visually consistent. */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" /> {pt("Board Members")}
            </CardTitle>
            <Button size="sm" onClick={() => { setShowAddMember(true); fetchUsers(); }}>
              <Plus className="w-4 h-4 mr-2" /> {pt("Add Member")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddMember && (
            <div className="mb-6 p-4 border-2 border-purple-200 rounded-lg bg-purple-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-purple-700">{pt("Add New Member")}</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowAddMember(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{pt("User")}</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger><SelectValue placeholder={pt("Select a user")} /></SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{pt("Role")}</Label>
                  <Select value={memberRole} onValueChange={setMemberRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chair">{pt("Chair")}</SelectItem>
                      <SelectItem value="member">{pt("Member")}</SelectItem>
                      <SelectItem value="secretary">{pt("Secretary")}</SelectItem>
                      <SelectItem value="observer">{pt("Observer")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUser || addingMember}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                {addingMember ? pt("Adding...") : pt("Add to Board")}
              </Button>
            </div>
          )}
          {board.members.length === 0 && !showAddMember ? (
            <p className="text-gray-500 text-center py-8">{pt("No members yet.")}</p>
          ) : (
            <div className="space-y-3">
              {board.members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium">{member.user_name || member.user_email}</h4>
                    <p className="text-sm text-gray-500">{memberRoleLabels[member.role] || member.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === "chair" ? "default" : "outline"}>
                      {memberRoleLabels[member.role] || member.role}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.id)}>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meetings panel — board-precise via Meeting.board FK (migration 0006).
          Falls back to program-scoped lookup for legacy meetings that were
          created before the FK existed. */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" /> {pt("Meetings")}
              {meetings.length > 0 && (
                <Badge variant="outline">{meetings.length}</Badge>
              )}
            </CardTitle>
            {board.program && meetings.length > PREVIEW_LIMIT && (
              <Button size="sm" variant="outline" onClick={goAllMeetingsForProgram}>
                {pt("View all")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">
              {board.program
                ? pt("No meetings yet for this programme.")
                : pt("Link this board to a programme to see its meetings here.")}
            </p>
          ) : (
            <div className="space-y-2">
              {previewMeetings.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => board.program && navigate(`/programs/${board.program}/governance`)}
                  title={pt("Open meeting in programme governance")}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-sm">{m.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {meetingTypeLabels[m.type] || m.type}
                    </Badge>
                    <Badge className={`text-xs ${meetingStatusColors[m.status] || ""}`}>{m.status}</Badge>
                    {m.scheduled_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.scheduled_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {meetings.length > previewMeetings.length && (
                <button
                  type="button"
                  className="text-xs text-purple-600 hover:underline px-2 py-1"
                  onClick={goAllMeetingsForProgram}
                >
                  {pt("View all")} ({meetings.length}) →
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracked Actions panel (P0-2) — turns meeting minutes into owned,
          due-dated follow-ups with overdue flags and a close/reopen lifecycle.
          Aggregates actions across all of this board's meetings. */}
      <MeetingActionsPanel
        meetings={meetings.map((m) => ({ id: m.id, title: m.title }))}
        users={users}
      />

      {/* Decisions panel — new in audit fix #5. Lists decisions taken by this
          board (Decision.board FK from governance migration 0005). Each row
          deep-links to the Decisions page with ?highlight=<id> so the row
          surfaces at the top. "Add Decision" deep-links with ?board=<id>&add=1
          to open the create dialog with this board preset. */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-purple-600" /> {pt("Decisions")}
              {decisions.length > 0 && (
                <Badge variant="outline">{decisions.length}</Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              {decisions.length > PREVIEW_LIMIT && (
                <Button size="sm" variant="outline" onClick={goAllDecisionsForBoard}>
                  {pt("View all")}
                </Button>
              )}
              <Button size="sm" onClick={goAddDecision}>
                <Plus className="w-4 h-4 mr-2" /> {pt("Add Decision")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {decisions.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">
              {pt("No decisions logged for this board yet.")}
            </p>
          ) : (
            <div className="space-y-2">
              {previewDecisions.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/governance/decisions?board=${id}&highlight=${d.id}`)}
                  title={pt("Open decision")}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-sm">{d.title}</span>
                    <Badge className={`text-xs ${decisionStatusColors[d.status] || ""}`}>{d.status}</Badge>
                    <Badge variant="outline" className="text-xs">{pt("Impact")}: {d.impact}</Badge>
                    {d.decided_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(d.decided_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {decisions.length > previewDecisions.length && (
                <button
                  type="button"
                  className="text-xs text-purple-600 hover:underline px-2 py-1"
                  onClick={goAllDecisionsForBoard}
                >
                  {pt("View all")} ({decisions.length}) →
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-gray-400">
        {pt("Created")}: {new Date(board.created_at).toLocaleDateString()}
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{pt("Edit Board")}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label>{pt("Name")}</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>{pt("Description")}</Label>
              <Textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{pt("Board Type")}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.board_type}
                  onChange={(e) => setEditForm(p => ({ ...p, board_type: e.target.value }))}
                >
                  <option value="steering_committee">{pt("Steering Committee")}</option>
                  <option value="program_board">{pt("Program Board")}</option>
                  <option value="project_board">{pt("Project Board")}</option>
                  <option value="advisory_board">{pt("Advisory Board")}</option>
                  <option value="executive_board">{pt("Executive Board")}</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>{pt("Meeting Frequency")}</Label>
                <Input
                  value={editForm.meeting_frequency}
                  onChange={(e) => setEditForm(p => ({ ...p, meeting_frequency: e.target.value }))}
                  placeholder={pt("e.g. Weekly, Monthly")}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={(e) => setEditForm(p => ({ ...p, is_active: e.target.checked }))}
                className="rounded"
              />
              <Label>{pt("Active")}</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>{pt("Cancel")}</Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                {pt("Save Changes")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoardDetail;
