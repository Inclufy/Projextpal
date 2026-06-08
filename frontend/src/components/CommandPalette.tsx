import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from "@/components/ui/command";
import {
  LayoutDashboard, Inbox, FolderKanban, Layers, BarChart3, MessageCircle, Users,
  GraduationCap, Shield, Plus, FolderOpen,
} from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

interface Proj { id: number; name: string }

/** Global ⌘K / Ctrl+K command palette: jump to any page or project. */
export default function CommandPalette() {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Proj[]>([]);

  // ⌘K / Ctrl+K toggles the palette anywhere in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    // Also openable from a visible button (discoverability) via a custom event.
    const onOpenEvent = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  // Load projects once the palette is first opened.
  const loadProjects = useCallback(async () => {
    if (projects.length) return;
    try {
      const r = await fetch("/api/v1/projects/", { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });
      if (r.ok) { const d = await r.json(); setProjects((Array.isArray(d) ? d : d.results || []).slice(0, 50)); }
    } catch { /* ignore */ }
  }, [projects.length]);
  useEffect(() => { if (open) loadProjects(); }, [open, loadProjects]);

  const go = (url: string) => { setOpen(false); navigate(url); };

  const NAV: { label: string; url: string; icon: any }[] = [
    { label: pt("Dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { label: pt("My Work"), url: "/my-work", icon: Inbox },
    { label: pt("Projects"), url: "/projects", icon: FolderKanban },
    { label: pt("Programs"), url: "/programs", icon: Layers },
    { label: pt("Reports & Analytics"), url: "/reports", icon: BarChart3 },
    { label: pt("Messages"), url: "/messages", icon: MessageCircle },
    { label: pt("Team"), url: "/team", icon: Users },
    { label: pt("Academy"), url: "/academy", icon: GraduationCap },
    { label: pt("Admin Portal"), url: "/admin", icon: Shield },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={pt("Search pages and projects… (⌘K)")} />
      <CommandList>
        <CommandEmpty>{pt("No results.")}</CommandEmpty>
        <CommandGroup heading={pt("Quick actions")}>
          <CommandItem onSelect={() => go("/projects?new=1")}><Plus className="mr-2 h-4 w-4" />{pt("New project")}</CommandItem>
          <CommandItem onSelect={() => go("/my-work")}><Inbox className="mr-2 h-4 w-4" />{pt("Go to My Work")}</CommandItem>
        </CommandGroup>
        <CommandGroup heading={pt("Navigation")}>
          {NAV.map((n) => { const Icon = n.icon; return (
            <CommandItem key={n.url} onSelect={() => go(n.url)}><Icon className="mr-2 h-4 w-4" />{n.label}</CommandItem>
          ); })}
        </CommandGroup>
        {projects.length > 0 && (
          <CommandGroup heading={pt("Projects")}>
            {projects.map((p) => (
              <CommandItem key={p.id} value={`project ${p.name}`} onSelect={() => go(`/projects/${p.id}`)}>
                <FolderOpen className="mr-2 h-4 w-4" />{p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
