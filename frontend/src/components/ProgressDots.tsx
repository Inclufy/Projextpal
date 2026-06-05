// Yanmar ATR-04 — 5-state progress indicator (○ ◔ ◑ ◕ ●).
// Maps a 0–100 progress integer onto the five Yanmar Action Tracker states.
// Optional onChange makes it click-to-set (cycles 0 → 25 → 50 → 75 → 100 → 0).

const SYMBOLS = ["○", "◔", "◑", "◕", "●"]; // 0, 25, 50, 75, 100

const toState = (progress: number): number => {
  const p = Math.max(0, Math.min(100, progress || 0));
  return Math.round(p / 25); // 0..4
};

interface Props {
  progress: number;
  onChange?: (next: number) => void;
  className?: string;
}

export function ProgressDots({ progress, onChange, className }: Props) {
  const state = toState(progress);
  const symbol = SYMBOLS[state];
  const label = `${state * 25}%`;

  if (onChange) {
    return (
      <button
        type="button"
        title={`${label} — ${progress}%`}
        onClick={() => onChange(((state + 1) % 5) * 25)}
        className={`inline-flex items-center gap-1 hover:opacity-70 ${className ?? ""}`}
      >
        <span className="text-lg leading-none">{symbol}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </button>
    );
  }

  return (
    <span title={`${progress}%`} className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      <span className="text-lg leading-none">{symbol}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </span>
  );
}

export default ProgressDots;
