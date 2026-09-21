export type Session = {
  id: string;
  project: string;
  wasWorkingOn: string;
  nextStep: string;
  blockedOn: string;
  savedAt: string;
  resumedAt: string | null;
};

export type FirstLineState = {
  sessions: Session[];
  activeDays: string[];
  freeGenerations: number;
};

export const STORAGE_KEY = "firstline_state";

export const emptyState: FirstLineState = {
  sessions: [],
  activeDays: [],
  freeGenerations: 3,
};

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isSession(v: unknown): v is Session {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s['id'] === "string" &&
    typeof s['project'] === "string" &&
    typeof s['wasWorkingOn'] === "string" &&
    typeof s['nextStep'] === "string" &&
    typeof s['savedAt'] === "string"
  );
}

export function normalizeSession(v: Session): Session {
  return {
    id: v.id,
    project: v.project,
    wasWorkingOn: v.wasWorkingOn,
    nextStep: v.nextStep,
    blockedOn: typeof v.blockedOn === "string" ? v.blockedOn : "",
    savedAt: v.savedAt,
    resumedAt: typeof v.resumedAt === "string" ? v.resumedAt : null,
  };
}

export function parseState(raw: string): FirstLineState | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const obj = data as Record<string, unknown>;
    if (!Array.isArray(obj['sessions'])) return null;
    if (!obj['sessions'].every(isSession)) return null;
    const activeDays = Array.isArray(obj['activeDays'])
      ? obj['activeDays'].filter((d): d is string => typeof d === "string")
      : [];
    const free =
      typeof obj['freeGenerations'] === "number" && Number.isFinite(obj['freeGenerations'])
        ? obj['freeGenerations']
        : 3;
    return {
      sessions: (obj['sessions'] as Session[]).map(normalizeSession),
      activeDays,
      freeGenerations: free,
    };
  } catch {
    return null;
  }
}

export function loadState(): FirstLineState {
  if (typeof window === "undefined") return emptyState;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyState;
  return parseState(raw) ?? emptyState;
}

export function saveState(state: FirstLineState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable; the app keeps working in memory */
  }
}

export function firstSentence(session: Session): string {
  return `I'm resuming work on ${session.project}.`;
}

export function buildPrompt(session: Session): string {
  const blocked = session.blockedOn.trim() ? ` I'm blocked on: ${session.blockedOn.trim()}.` : "";
  return (
    `${firstSentence(session)} I was working on: ${session.wasWorkingOn}. ` +
    `My next step is: ${session.nextStep}.${blocked} ` +
    `Give me ONLY the first line of code or the single smallest action I should take right now. ` +
    `No explanation. No multi-step plan. Just the first line. ` +
    `I have ADHD — if you give me a paragraph I will not start.`
  );
}

export const TOOLS = [
  { id: "claude", label: "Open Claude", url: "https://claude.ai/new" },
  { id: "chatgpt", label: "Open ChatGPT", url: "https://chatgpt.com/" },
  { id: "cursor", label: "Open Cursor", url: "https://cursor.com/" },
] as const;

export type ToolId = (typeof TOOLS)[number]["id"];

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${todayKey(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
