import { useCallback, useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

/**
 * MultiFileDropzone — drag-and-drop upload zone voor meerdere bestanden.
 *
 * Shadcn + native `DataTransfer.files` — geen externe dependency. Controlled
 * component: parent houdt de File[]-state, zodat clear/upload/submit flows
 * flexibel blijven.
 *
 * Elisa heeft stapels tender-PDF's die ze één-voor-één moest toevoegen. Deze
 * component vervangt elke single `<input type="file">` die geen multi + drop
 * ondersteunt. Niet-matchende bestanden worden stil verworpen met een korte
 * subtekst zodat de user ziet wat er niet is geaccepteerd.
 */

interface Props {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;              // e.g. ".pdf,.docx,.txt"
  maxFiles?: number;            // hard cap on simultaneous selection
  maxBytesPerFile?: number;     // reject individual files larger than this
  disabled?: boolean;
  description?: string;         // optional helper line under the dropzone
}

const DEFAULT_MAX_FILES = 10;
const DEFAULT_MAX_BYTES = 15 * 1024 * 1024; // 15 MB

const fmtSize = (n: number) =>
  n < 1024 ? `${n} B`
    : n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB`
    : `${(n / 1024 / 1024).toFixed(1)} MB`;

export default function MultiFileDropzone({
  files,
  onFilesChange,
  accept,
  maxFiles = DEFAULT_MAX_FILES,
  maxBytesPerFile = DEFAULT_MAX_BYTES,
  disabled,
  description,
}: Props) {
  const { pt } = usePageTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const acceptedExts = (accept || "")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);

    const ok: File[] = [];
    const rej: string[] = [];
    const existingNames = new Set(files.map((f) => `${f.name}:${f.size}`));

    for (const f of list) {
      const key = `${f.name}:${f.size}`;
      if (existingNames.has(key)) continue;
      if (acceptedExts.length > 0) {
        const lname = f.name.toLowerCase();
        const typeOk = acceptedExts.some((ext) => lname.endsWith(ext));
        if (!typeOk) {
          rej.push(`${f.name} — ${pt("unsupported type")}`);
          continue;
        }
      }
      if (f.size > maxBytesPerFile) {
        rej.push(`${f.name} — ${pt("too large")} (${fmtSize(f.size)})`);
        continue;
      }
      ok.push(f);
      existingNames.add(key);
    }

    const combined = [...files, ...ok].slice(0, maxFiles);
    if (files.length + ok.length > maxFiles) {
      rej.push(`${pt("Maximum")} ${maxFiles} ${pt("files")}`);
    }
    setRejected(rej);
    onFilesChange(combined);
  }, [accept, files, maxBytesPerFile, maxFiles, onFilesChange, pt]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  const remove = (i: number) => onFilesChange(files.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !disabled) inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          disabled ? "opacity-50 cursor-not-allowed" : "",
          dragOver ? "border-indigo-500 bg-indigo-50" : "border-border bg-muted/30 hover:bg-muted/50",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          disabled={disabled}
          hidden
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.currentTarget.value = ""; }}
        />
        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {pt("Drag files here or click to select")}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {rejected.length > 0 && (
        <ul className="text-xs text-destructive space-y-0.5">
          {rejected.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${i}`} className="flex items-center gap-2 text-sm bg-muted/40 rounded px-2 py-1.5">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate" title={f.name}>{f.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{fmtSize(f.size)}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-destructive"
                aria-label={pt("Remove")}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
