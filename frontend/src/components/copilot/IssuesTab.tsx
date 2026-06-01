// =============================================================================
// IssuesTab — ProjeXtPal AI Copilot "Issues" tab.
//
// Lets users:
//   1. See most recent product-issues for their company (status badges)
//   2. Submit a new issue ("Probleem melden")
//      - Auto-detects module from current pathname (projects/risks/scrum/...)
//      - Captures environment (URL, browser, viewport, build SHA, etc.)
//      - Paste-from-clipboard screenshots & file upload (≤5 MB each)
//      - POSTs to Django product_issues endpoint
//
// Purple theme to match the ProjeXtPal AI-Copilot aesthetic.
// =============================================================================

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
} from "react";
import {
  AlertTriangle,
  Bug,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clipboard,
  FileImage,
  GitCommit,
  Lightbulb,
  Loader2,
  MessageCircle,
  Monitor,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  type IssueAttachment,
  type IssueCategory,
  type ProductIssueComment,
  type ProductIssueRecord,
  addComment,
  captureEnvironment,
  createIssue,
  defaultCategoryForModule,
  detectProjeXtPalModuleFromPath,
  fetchIssueDetail,
  fileToAttachment,
  listRecentIssues,
  priorityBadgeClass,
  statusBadgeClass,
} from "@/lib/copilotIssues";

interface IssuesTabProps {
  pathname: string;
  isActive: boolean;
  /** Optional prefill from chat — when provided, switches to form mode
   *  with title/description pre-populated and clears via onPrefillConsumed. */
  prefill?: { title: string; description: string } | null;
  onPrefillConsumed?: () => void;
}

function getCategoryOptions(isNl: boolean): { value: IssueCategory; label: string }[] {
  return [
    { value: "ui", label: "UI / Frontend" },
    { value: "api", label: "API / Backend" },
    { value: "mobile", label: isNl ? "Mobiele app" : "Mobile app" },
    { value: "performance", label: "Performance" },
    { value: "security", label: "Security" },
    { value: "auth", label: isNl ? "Login / Permissies" : "Login / Permissions" },
    { value: "data", label: "Data / Database" },
    { value: "integration", label: isNl ? "Integratie" : "Integration" },
    { value: "documentation", label: isNl ? "Documentatie" : "Documentation" },
    { value: "other", label: isNl ? "Anders" : "Other" },
  ];
}

export function IssuesTab({ pathname, isActive, prefill, onPrefillConsumed }: IssuesTabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isNl = language === "nl";
  const companyId = user?.company ?? null;
  const categoryOptions = getCategoryOptions(isNl);

  const detectedModule = detectProjeXtPalModuleFromPath(pathname);
  const defaultCategory = defaultCategoryForModule(detectedModule);

  const [mode, setMode] = useState<"list" | "form">("list");
  const [issues, setIssues] = useState<ProductIssueRecord[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>(defaultCategory);
  const [reproSteps, setReproSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [errorTrace, setErrorTrace] = useState("");
  const [attachments, setAttachments] = useState<IssueAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && companyId && mode === "list") {
      void refreshList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, companyId, mode]);

  useEffect(() => {
    setCategory(defaultCategoryForModule(detectProjeXtPalModuleFromPath(pathname)));
  }, [pathname]);

  // Apply chat-driven prefill: switches to form mode, fills title +
  // description from the chat context, then clears the prefill state.
  useEffect(() => {
    if (!isActive || !prefill) return;
    setTitle(prefill.title);
    setDescription(prefill.description);
    setMode("form");
    onPrefillConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, prefill]);

  async function refreshList() {
    if (!companyId) return;
    setLoadingList(true);
    try {
      const list = await listRecentIssues(20);
      setIssues(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: isNl ? "Kon issues niet ophalen" : "Could not load issues",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoadingList(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory(defaultCategory);
    setReproSteps("");
    setExpected("");
    setActual("");
    setErrorTrace("");
    setAttachments([]);
  }

  async function handleSubmit() {
    if (!companyId) {
      toast({
        title: isNl ? "Geen bedrijf gekoppeld" : "No company linked",
        variant: "destructive",
      });
      return;
    }
    if (!title.trim()) {
      toast({
        title: isNl ? "Titel is verplicht" : "Title is required",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const env = captureEnvironment(pathname, companyId);
      // Bundle attachments into environment.attachments_inline since Django
      // schema doesn't have a JSON `attachments` column.
      if (attachments.length > 0) {
        env.attachments_inline = attachments;
      }
      const issue = await createIssue({
        company: companyId,
        title: title.trim(),
        description: description.trim(),
        category,
        reproduction_steps: reproSteps.trim(),
        expected_behavior: expected.trim(),
        actual_behavior: actual.trim(),
        error_trace: errorTrace.trim(),
        environment: env,
        capture_method: attachments.some((a) => a.data_url)
          ? "paste_clipboard"
          : "manual_form",
      });
      toast({
        title: isNl ? "Probleem gemeld" : "Issue reported",
        description: isNl
          ? "Onze AI-agent triageert het binnen enkele minuten."
          : "Our AI agent will triage it within minutes.",
      });
      setIssues((prev) => [issue, ...prev]);
      resetForm();
      setMode("list");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: isNl ? "Versturen mislukt" : "Submit failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFileChoose(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: IssueAttachment[] = [];
    for (const f of Array.from(files)) {
      if (f.size > 5 * 1024 * 1024) {
        toast({
          title: isNl ? "Bestand te groot" : "File too large",
          description: `${f.name} (${Math.round(f.size / 1024)} KB) > 5 MB`,
          variant: "destructive",
        });
        continue;
      }
      newAttachments.push(await fileToAttachment(f));
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  }

  // Paste-anywhere — listens on the form-root <div> so an image on the
  // clipboard is captured whether the focus is in the title input, the
  // description textarea, or anywhere else on the form. Plain text paste
  // is left untouched (only image MIME types trigger preventDefault).
  async function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const att = await fileToAttachment(file);
          setAttachments((prev) => [...prev, att]);
          toast({
            title: isNl ? "Screenshot toegevoegd" : "Screenshot attached",
            description: file.name || "clipboard.png",
          });
        }
      }
    }
  }

  // In-browser screenshot capture via the Screen Capture API. Opens the
  // browser's native screen-picker (tab / window / screen), grabs a single
  // frame into a canvas, encodes as PNG, and attaches. Bypasses the OS
  // screenshot-tool → save → upload friction.
  //
  // Browser support: Chrome / Edge / Firefox / Safari ≥ 13.1 on desktop.
  // Not available on iOS Safari — user falls back to "Bestand kiezen" or
  // clipboard paste from the iOS screenshot toolbar.
  async function handleCaptureScreenshot() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      toast({
        title: isNl ? "Schermafbeelding niet ondersteund" : "Screenshot not supported",
        description: isNl
          ? "Je browser ondersteunt de Screen Capture API niet. Gebruik 'Bestand kiezen' of plak een screenshot vanaf je klembord."
          : "Your browser does not support the Screen Capture API. Use 'Choose file' or paste a screenshot from your clipboard.",
        variant: "destructive",
      });
      return;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const track = stream.getVideoTracks()[0];
      if (!track) throw new Error("Geen videotrack ontvangen");

      // Draw a single frame to a canvas via a transient <video>. Using the
      // ImageCapture API would be cleaner but it's Chrome-only — the
      // canvas path works in every browser that supports getDisplayMedia.
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await new Promise<void>((resolve, reject) => {
        const onLoaded = () => {
          video.removeEventListener("loadedmetadata", onLoaded);
          resolve();
        };
        const onError = () => {
          video.removeEventListener("error", onError);
          reject(new Error("Kon videostream niet laden"));
        };
        video.addEventListener("loadedmetadata", onLoaded);
        video.addEventListener("error", onError);
      });
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context niet beschikbaar");
      ctx.drawImage(video, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) throw new Error("Kon schermafbeelding niet coderen");

      const now = new Date();
      const stamp =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}` +
        `_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
      const file = new File([blob], `screenshot-${stamp}.png`, {
        type: "image/png",
      });

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: isNl ? "Schermafbeelding te groot" : "Screenshot too large",
          description: isNl
            ? `${Math.round(file.size / 1024)} KB > 5 MB — kies een kleiner gebied of een lager-resolutie scherm.`
            : `${Math.round(file.size / 1024)} KB > 5 MB — pick a smaller area or a lower-resolution screen.`,
          variant: "destructive",
        });
        return;
      }

      const att = await fileToAttachment(file);
      setAttachments((prev) => [...prev, att]);
      toast({
        title: isNl ? "Schermafbeelding toegevoegd" : "Screenshot attached",
        description: file.name,
      });
    } catch (err) {
      // NotAllowedError = user clicked Cancel in the screen-picker — silent.
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: isNl ? "Schermafbeelding mislukt" : "Screenshot failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      // Always stop the screen-share track so the browser's "X is sharing
      // your screen" indicator disappears immediately.
      if (stream) stream.getTracks().forEach((t) => t.stop());
    }
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  /* ─── Render: list mode ────────────────────────────────────────────── */

  if (mode === "list") {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 px-3 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-purple-50/40 dark:bg-purple-900/10">
          <div className="flex items-center gap-2">
            <Bug className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {isNl ? "Recente issues" : "Recent issues"}
              {detectedModule && (
                <span className="ml-1.5 text-gray-400">· {detectedModule}</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={refreshList}
              disabled={loadingList}
              title={isNl ? "Vernieuwen" : "Refresh"}
            >
              <RefreshCw className={`h-3 w-3 ${loadingList ? "animate-spin" : ""}`} />
            </Button>
            <Button
              size="sm"
              className="h-6 px-2 text-xs bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setMode("form")}
            >
              <Plus className="h-3 w-3 mr-1" />
              {isNl ? "Probleem melden" : "Report issue"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingList && issues.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-xs">{isNl ? "Laden..." : "Loading..."}</span>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-8 px-4 text-gray-500">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500/70" />
              <p className="text-xs">
                {isNl
                  ? "Geen openstaande problemen. Werkt iets niet zoals verwacht?"
                  : "No open issues. Something not working as expected?"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => setMode("form")}
              >
                <Plus className="h-3 w-3 mr-1" />
                {isNl ? "Meld het nu" : "Report it now"}
              </Button>
            </div>
          ) : (
            issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)
          )}
        </div>
      </div>
    );
  }

  /* ─── Render: form mode ────────────────────────────────────────────── */

  return (
    <div className="flex-1 flex flex-col min-h-0" onPaste={handlePaste}>
      <div className="shrink-0 px-3 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-purple-50/40 dark:bg-purple-900/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {isNl ? "Probleem melden" : "Report issue"}
          </span>
          {detectedModule && (
            <span className="text-[10px] px-1.5 py-0 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
              {detectedModule}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => {
            resetForm();
            setMode("list");
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div>
          <Label htmlFor="issue-title" className="text-xs">
            {isNl ? "Wat ging er mis? *" : "What went wrong? *"}
          </Label>
          <Input
            id="issue-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              isNl
                ? "Bijv. 'Risico kan niet worden opgeslagen'"
                : "E.g. 'Risk cannot be saved'"
            }
            className="text-xs mt-1"
            maxLength={255}
          />
        </div>

        <div>
          <Label htmlFor="issue-category" className="text-xs">
            {isNl ? "Categorie" : "Category"}
          </Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as IssueCategory)}
          >
            <SelectTrigger id="issue-category" className="text-xs h-8 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="issue-description" className="text-xs">
            {isNl ? "Beschrijving" : "Description"}
          </Label>
          <Textarea
            id="issue-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              isNl
                ? "Wat probeer je te doen? Wat zie je?"
                : "What are you trying to do? What do you see?"
            }
            className="text-xs mt-1 resize-none"
            rows={4}
          />
          <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
            <Clipboard className="h-2.5 w-2.5" />
            {isNl
              ? "Tip: plak een screenshot ergens op dit formulier (Cmd/Ctrl + V) — die wordt automatisch toegevoegd."
              : "Tip: paste a screenshot anywhere on this form (Cmd/Ctrl + V) — it gets attached automatically."}
          </p>
        </div>

        <details className="group">
          <summary className="text-xs cursor-pointer text-gray-500 hover:text-gray-800 select-none">
            {isNl ? "+ Meer details (optioneel)" : "+ More details (optional)"}
          </summary>
          <div className="mt-2 space-y-2">
            <div>
              <Label htmlFor="issue-repro" className="text-xs">
                {isNl ? "Stappen om te reproduceren" : "Steps to reproduce"}
              </Label>
              <Textarea
                id="issue-repro"
                value={reproSteps}
                onChange={(e) => setReproSteps(e.target.value)}
                placeholder="1. ...&#10;2. ...&#10;3. ..."
                className="text-xs mt-1 resize-none"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="issue-expected" className="text-xs">
                {isNl ? "Wat verwachtte je?" : "What did you expect?"}
              </Label>
              <Input
                id="issue-expected"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                className="text-xs mt-1"
              />
            </div>
            <div>
              <Label htmlFor="issue-actual" className="text-xs">
                {isNl ? "Wat gebeurde er werkelijk?" : "What actually happened?"}
              </Label>
              <Input
                id="issue-actual"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                className="text-xs mt-1"
              />
            </div>
            <div>
              <Label htmlFor="issue-error" className="text-xs">
                {isNl ? "Foutmelding / console-output" : "Error message / console output"}
              </Label>
              <Textarea
                id="issue-error"
                value={errorTrace}
                onChange={(e) => setErrorTrace(e.target.value)}
                placeholder={
                  isNl
                    ? "Plak hier eventueel een stacktrace..."
                    : "Paste a stack trace here if you have one..."
                }
                className="text-xs font-mono mt-1 resize-none"
                rows={3}
              />
            </div>
          </div>
        </details>

        <div>
          <Label className="text-xs">
            {isNl ? "Bijlagen" : "Attachments"}
            {attachments.length > 0 && (
              <span className="ml-1 text-gray-500">({attachments.length})</span>
            )}
          </Label>
          <div className="flex gap-2 mt-1 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-3 w-3 mr-1" />
              {isNl ? "Bestand kiezen" : "Choose file"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={handleCaptureScreenshot}
              title={
                isNl
                  ? "Open de schermkiezer en maak direct een screenshot — geen OS-tool nodig."
                  : "Open the screen picker and take a screenshot directly — no OS tool needed."
              }
            >
              <Monitor className="h-3 w-3 mr-1" />
              {isNl ? "Schermafbeelding maken" : "Take screenshot"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,.har,.txt,.log"
              className="hidden"
              onChange={handleFileChoose}
            />
          </div>
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileImage className="h-3 w-3 shrink-0 text-gray-500" />
                    <span className="truncate">{att.name}</span>
                    <span className="text-gray-500 shrink-0">
                      ({Math.round(att.size_bytes / 1024)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => removeAttachment(i)}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-2 bg-purple-50/40 dark:bg-purple-900/10 border border-dashed border-purple-200 dark:border-purple-900/40 rounded">
          <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed">
            {isNl
              ? "We voegen automatisch toe: paginalink, browser, schermresolutie, app-versie en tijdzone — zo kunnen we het probleem sneller reproduceren."
              : "We automatically attach: page URL, browser, screen resolution, app version and timezone — so we can reproduce the issue faster."}
          </p>
        </div>

        <Button
          type="button"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
          onClick={handleSubmit}
          disabled={submitting || !title.trim()}
        >
          {submitting ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              {isNl ? "Versturen..." : "Submitting..."}
            </>
          ) : (
            <>
              <Send className="h-3 w-3 mr-2" />
              {isNl ? "Verstuur probleem" : "Submit issue"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ─── IssueRow ────────────────────────────────────────────────────────── */

function IssueRow({ issue }: { issue: ProductIssueRecord }) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<ProductIssueComment[] | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const isNl = language === "nl";

  const created = new Date(issue.created_at);
  const ago = relativeTime(created, isNl);
  const moduleCtx =
    typeof issue.environment?.module_context === "string"
      ? (issue.environment.module_context as string)
      : null;

  async function toggleExpand() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (comments === null) {
      setLoadingDetail(true);
      try {
        const detail = await fetchIssueDetail(issue.id);
        setComments(detail.comments);
      } catch {
        setComments([]);
      } finally {
        setLoadingDetail(false);
      }
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      await addComment(issue.id, newComment.trim());
      const detail = await fetchIssueDetail(issue.id);
      setComments(detail.comments);
      setNewComment("");
      toast({ title: isNl ? "Reactie verstuurd" : "Comment sent" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: isNl ? "Versturen mislukt" : "Submit failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setPostingComment(false);
    }
  }

  const tri = (issue.agent_triage_result ?? {}) as Record<string, unknown>;
  const triReasoning = typeof tri.reasoning === "string" ? tri.reasoning : null;
  const triFix = typeof tri.suggested_fix_area === "string" ? tri.suggested_fix_area : null;
  const triLinkedCommits = Array.isArray(tri.linked_commits)
    ? (tri.linked_commits as string[])
    : null;

  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden hover:border-purple-200 dark:hover:border-purple-900 transition-colors">
      {/* Compact summary row — clickable */}
      <button
        type="button"
        onClick={toggleExpand}
        className="w-full p-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {expanded ? (
              <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
            )}
            {issue.priority && (
              <span
                className={`text-[10px] px-1.5 py-0 rounded font-bold ${priorityBadgeClass(issue.priority)}`}
              >
                {issue.priority}
              </span>
            )}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${statusBadgeClass(issue.status)}`}
            >
              {issue.status}
            </span>
            {moduleCtx && (
              <span className="text-[10px] px-1 py-0 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                {moduleCtx}
              </span>
            )}
          </div>
          <p
            className="text-xs font-medium mt-1 truncate text-gray-900 dark:text-white"
            title={issue.title}
          >
            {issue.title}
          </p>
          {issue.classification && (
            <p className="text-[10px] text-gray-500 mt-0.5">
              {issue.classification}
              {issue.triaged_by ? ` · ${issue.triaged_by}` : ""}
            </p>
          )}
        </div>
        <span className="text-[10px] text-gray-500 shrink-0 mt-0.5">{ago}</span>
      </div>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/40 p-3 space-y-3 text-[11px]">
          {issue.description && (
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-0.5">
                {isNl ? "Beschrijving" : "Description"}
              </p>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{issue.description}</p>
            </div>
          )}

          {issue.resolution_summary && (
            <div className="rounded p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50">
              <p className="font-semibold text-green-800 dark:text-green-200 mb-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Resolution
              </p>
              <p className="text-green-700 dark:text-green-300 whitespace-pre-wrap">{issue.resolution_summary}</p>
            </div>
          )}

          {(triReasoning || triFix || triLinkedCommits) && (
            <div className="rounded p-2 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
              <p className="font-semibold text-purple-800 dark:text-purple-200 mb-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Agent triage
              </p>
              {triReasoning && (
                <p className="text-gray-700 dark:text-gray-300 mb-1">{triReasoning}</p>
              )}
              {triFix && (
                <div className="flex items-start gap-1 mt-1">
                  <Lightbulb className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-amber-800 dark:text-amber-200 font-mono">{triFix}</span>
                </div>
              )}
              {triLinkedCommits && triLinkedCommits.length > 0 && (
                <div className="flex items-start gap-1 mt-1">
                  <GitCommit className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-blue-700 dark:text-blue-300 font-mono">
                    {triLinkedCommits.join(", ")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {isNl ? "Reacties" : "Comments"} {comments && `(${comments.length})`}
            </p>
            {loadingDetail ? (
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            ) : comments && comments.length === 0 ? (
              <p className="text-gray-400 italic">
                {isNl ? "Nog geen reacties" : "No comments yet"}
              </p>
            ) : comments ? (
              <div className="space-y-2">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded p-2 ${
                      c.is_triage_step
                        ? "bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40"
                        : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                        {c.author}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {relativeTime(new Date(c.created_at), isNl)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{c.body}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Add comment form */}
            <div className="mt-2 flex gap-1">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={isNl ? "Reactie toevoegen..." : "Add comment..."}
                className="text-[11px] h-7 flex-1"
                disabled={postingComment}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                size="sm"
                className="h-7 px-2 bg-purple-600 hover:bg-purple-700 text-white"
                disabled={postingComment || !newComment.trim()}
                onClick={handleAddComment}
                type="button"
              >
                {postingComment ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function relativeTime(d: Date, isNl: boolean = true): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return isNl ? "net" : "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  // NL uses "u" for "uur"; EN uses "h" for "hour"
  if (h < 24) return `${h}${isNl ? "u" : "h"}`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString(isNl ? "nl-NL" : "en-US", {
    day: "numeric", month: "short",
  });
}
