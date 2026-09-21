import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Logo } from "@/components/firstline/Logo";
import { CaptureSheet, type CaptureValues } from "@/components/firstline/CaptureSheet";
import {
  buildPrompt,
  emptyState,
  firstSentence,
  formatTime,
  isValidUnlockKey,
  loadState,
  loadTool,
  newId,
  parseState,
  saveState,
  saveTool,
  SUPPORT_EMAIL,
  todayKey,
  TOOLS,
  UNLOCKED_GENERATIONS,
  USDT_ADDRESS,
  type FirstLineState,
  type Session,
  type ToolId,
} from "@/lib/firstline";


const cardClass = "rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-5";
const linkClass =
  "text-[0.75rem] text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--accent)]";

function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function FirstLineApp() {
  const hydrated = useHydrated();
  const [state, setState] = useState<FirstLineState>(emptyState);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [screen, setScreen] = useState<"resume" | "firstline">("resume");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showOlder, setShowOlder] = useState(false);
  const [tool, setTool] = useState<ToolId>("claude");
  const [importError, setImportError] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const lastShortcut = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(loadState());
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  const update = useCallback((fn: (s: FirstLineState) => FirstLineState) => {
    setState((prev) => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1600);
  }, []);

  const sessions = state.sessions;
  const latest = sessions[0] ?? null;
  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId],
  );
  const isLocked = state.freeGenerations <= 0;

  const commitSession = useCallback(
    (values: CaptureValues) => {
      const session: Session = {
        id: newId(),
        project: values.project.trim(),
        wasWorkingOn: values.wasWorkingOn.trim(),
        nextStep: values.nextStep.trim(),
        blockedOn: values.blockedOn.trim(),
        savedAt: new Date().toISOString(),
        resumedAt: null,
      };
      update((s) => ({
        ...s,
        sessions: [session, ...s.sessions],
        activeDays: s.activeDays.includes(todayKey()) ? s.activeDays : [...s.activeDays, todayKey()],
      }));
      setSheetOpen(false);
      setScreen("resume");
      showToast("Saved. You're covered.");
    },
    [update, showToast],
  );

  const quickSave = useCallback(() => {
    const recent = latest;
    if (!recent) {
      setSheetOpen(true);
      return;
    }
    commitSession({
      project: recent.project,
      wasWorkingOn: recent.wasWorkingOn,
      nextStep: recent.nextStep,
      blockedOn: recent.blockedOn,
    });
  }, [latest, commitSession]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastShortcut.current < 2000) {
          lastShortcut.current = 0;
          setSheetOpen(false);
          quickSave();
          return;
        }
        lastShortcut.current = now;
        setSheetOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickSave]);

  const generate = useCallback(
    (session: Session) => {
      update((s) => ({
        ...s,
        freeGenerations: Math.max(0, s.freeGenerations - 1),
        sessions: s.sessions.map((x) =>
          x.id === session.id ? { ...x, resumedAt: new Date().toISOString() } : x,
        ),
        activeDays: s.activeDays.includes(todayKey()) ? s.activeDays : [...s.activeDays, todayKey()],
      }));
      setActiveId(session.id);
      setScreen("firstline");
    },
    [update],
  );

  const copyPrompt = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      showToast("Copied. Paste it in your AI tool.");
    },
    [showToast],
  );

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `firstline-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importJson = useCallback(
    async (file: File) => {
      setImportError(false);
      try {
        const text = await file.text();
        const parsed = parseState(text);
        if (!parsed) {
          setImportError(true);
          return;
        }
        update(() => parsed);
        showToast("Saved. You're covered.");
      } catch {
        setImportError(true);
      }
    },
    [update, showToast],
  );

  const shortcut = isMac ? "Cmd+Shift+S" : "Ctrl+Shift+S";
  const activeDays = state.activeDays.length;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pb-28">
      <div className="mx-auto w-full max-w-[640px] px-5 pt-8">
        <header className="mb-10 flex items-center justify-between">
          <Logo />
          <span className="font-mono text-[0.75rem] text-[var(--text-muted)]">
            {hydrated ? `${state.freeGenerations} starts left` : ""}
          </span>
        </header>

        {screen === "resume" && (
          <main className="flex flex-col gap-6">
            {!hydrated ? null : !latest ? (
              <div className={cardClass}>
                <p className="text-[1rem] text-[var(--text-primary)]">
                  No saved context yet. Start a session below.
                </p>
                <p className="mt-2 text-[0.875rem] text-[var(--text-secondary)]">
                  Close the tab. We&apos;ll remember where you were.
                </p>
              </div>
            ) : (
              <>
                <section className={cardClass}>
                  <p className="text-[0.75rem] uppercase tracking-wide text-[var(--text-muted)]">
                    Last session
                  </p>
                  <p className="mt-1 font-mono text-[1.125rem] text-[var(--text-primary)]">
                    {latest.project}
                  </p>
                  <dl className="mt-4 flex flex-col gap-3 text-[0.875rem]">
                    <div>
                      <dt className="text-[var(--text-muted)]">Was working on</dt>
                      <dd className="text-[var(--text-primary)]">{latest.wasWorkingOn}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--text-muted)]">Next step</dt>
                      <dd className="text-[var(--text-primary)]">{latest.nextStep}</dd>
                    </div>
                    {latest.blockedOn ? (
                      <div>
                        <dt className="text-[var(--text-muted)]">Blocked</dt>
                        <dd className="text-[var(--warning)]">{latest.blockedOn}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <p className="mt-4 font-mono text-[0.75rem] text-[var(--text-muted)]">
                    {formatTime(latest.savedAt)}
                  </p>
                  <button
                    onClick={() => generate(latest)}
                    className="mt-5 min-h-[44px] w-full rounded-md bg-[var(--accent)] px-4 text-[0.875rem] font-medium text-[#0a0a0f] transition-colors hover:bg-[var(--accent-hover)]"
                  >
                    Resume → Get First Line
                  </button>
                </section>

                {sessions.length > 1 && (
                  <section>
                    <button
                      onClick={() => setShowOlder((v) => !v)}
                      className="text-[0.875rem] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      aria-expanded={showOlder}
                    >
                      {showOlder ? "Hide older sessions" : `Older sessions (${sessions.length - 1})`}
                    </button>
                    {showOlder && (
                      <ul className="mt-3 flex flex-col gap-3">
                        {sessions.slice(1).map((s) => (
                          <li key={s.id} className={cardClass}>
                            <p className="font-mono text-[0.875rem] text-[var(--text-primary)]">
                              {s.project}
                            </p>
                            <p className="mt-2 text-[0.875rem] text-[var(--text-secondary)]">
                              {s.wasWorkingOn}
                            </p>
                            <p className="text-[0.875rem] text-[var(--text-secondary)]">
                              {s.nextStep}
                            </p>
                            {s.blockedOn ? (
                              <p className="text-[0.875rem] text-[var(--warning)]">{s.blockedOn}</p>
                            ) : null}
                            <div className="mt-3 flex items-center justify-between">
                              <span className="font-mono text-[0.75rem] text-[var(--text-muted)]">
                                {formatTime(s.savedAt)}
                              </span>
                              <button
                                onClick={() => generate(s)}
                                className="min-h-[44px] rounded-md border border-[var(--border)] px-3 text-[0.75rem] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                              >
                                Resume → Get First Line
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}
              </>
            )}
          </main>
        )}

        {screen === "firstline" && active && (
          <FirstLineScreen
            session={active}
            isLocked={isLocked}
            tool={tool}
            onTool={setTool}
            onBack={() => setScreen("resume")}
            onCopy={copyPrompt}
            onRegenerate={() => generate(active)}
          />
        )}

        <footer className="mt-14 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-[0.75rem] text-[var(--text-muted)]">
          <p>No accounts. No servers. Your context never leaves this browser.</p>
          <p className="font-mono">Save shortcut: {shortcut} (press twice to quick-save)</p>
          <div className="flex items-center gap-4">
            <button onClick={exportJson} className={linkClass}>
              Export
            </button>
            <button onClick={() => fileRef.current?.click()} className={linkClass}>
              Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importJson(f);
                e.target.value = "";
              }}
            />
          </div>
          {importError && (
            <p className="text-[var(--warning)]">
              Couldn&apos;t read that file. Make sure it&apos;s a FirstLine export.
            </p>
          )}
        </footer>
      </div>

      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-16 right-5 z-40 min-h-[44px] rounded-full border border-[var(--border)] bg-[var(--bg-raised)] px-5 text-[0.875rem] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
      >
        ⏸ Save Context
      </button>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--bg-base)]">
        <div className="mx-auto flex w-full max-w-[640px] items-center px-5 py-2">
          <span
            title="No streaks to break. Miss a week? The number just waits."
            className="font-mono text-[0.75rem] text-[var(--text-secondary)]"
          >
            Active days: {hydrated ? activeDays : 0}
          </span>
        </div>
      </div>

      <CaptureSheet
        open={sheetOpen}
        initial={
          latest
            ? {
                project: latest.project,
                wasWorkingOn: "",
                nextStep: "",
                blockedOn: "",
              }
            : undefined
        }
        onClose={() => setSheetOpen(false)}
        onSave={commitSession}
      />

      {toast && (
        <div
          role="status"
          className="fl-toast fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-2 text-[0.875rem] text-[var(--success)]"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function FirstLineScreen({
  session,
  isLocked,
  tool,
  onTool,
  onBack,
  onCopy,
  onRegenerate,
  onRedeem,
  onCopyAddress,
}: {
  session: Session;
  isLocked: boolean;
  tool: ToolId;
  onTool: (t: ToolId) => void;
  onBack: () => void;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
  onRedeem: (key: string) => boolean;
  onCopyAddress: () => void;
}) {
  const teaser = firstSentence(session);
  const prompt = isLocked ? teaser : buildPrompt(session);
  const selected = TOOLS.find((t) => t.id === tool) ?? TOOLS[0];

  return (
    <main className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="self-start text-[0.875rem] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        ← Back
      </button>

      <section className={cardClass}>
        {isLocked ? (
          <div>
            <div className="relative max-h-24 overflow-hidden">
              <pre className="whitespace-pre-wrap font-mono text-[0.875rem] leading-[1.7] text-[var(--text-primary)]">
                {teaser}
              </pre>
              <div className="fl-fade-mask pointer-events-none absolute inset-x-0 bottom-0 h-10" />
            </div>
            <p className="mt-3 text-[0.75rem] text-[var(--text-muted)]">
              Locked. Unlock to generate your first line.
            </p>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-[0.875rem] leading-[1.7] text-[var(--text-primary)]">
            {prompt}
          </pre>
        )}
      </section>

      <p className="text-[0.875rem] text-[var(--text-secondary)]">
        Your brain doesn&apos;t need a plan. It needs a line.
      </p>

      {!isLocked && (
        <button
          onClick={() => onCopy(prompt)}
          className="min-h-[44px] rounded-md bg-[var(--accent)] px-4 text-[0.875rem] font-medium text-[#0a0a0f] transition-colors hover:bg-[var(--accent-hover)]"
        >
          Copy prompt
        </button>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-[0.75rem] text-[var(--text-muted)]" htmlFor="fl-tool">
          Tool
        </label>
        <select
          id="fl-tool"
          value={tool}
          onChange={(e) => onTool(e.target.value as ToolId)}
          className="min-h-[44px] rounded-md border border-[var(--border)] bg-[var(--bg-raised)] px-3 text-[0.875rem] text-[var(--text-primary)]"
        >
          {TOOLS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label.replace("Open ", "")}
            </option>
          ))}
        </select>
        <a href={selected.url} target="_blank" rel="noreferrer noopener" className={linkClass}>
          {selected.label} ↗
        </a>
      </div>

      {isLocked ? (
        <>
          <p className="text-[0.875rem] text-[var(--warning)]">
            You&apos;re out of free starts. Unlock below.
          </p>
          <UnlockCard onRedeem={onRedeem} onCopyAddress={onCopyAddress} />
        </>
      ) : (
        <button
          onClick={onRegenerate}
          className="min-h-[44px] self-start rounded-md border border-[var(--border)] px-4 text-[0.875rem] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        >
          Regenerate
        </button>
      )}
    </main>
  );
}

function UnlockCard({
  onRedeem,
  onCopyAddress,
}: {
  onRedeem: (key: string) => boolean;
  onCopyAddress: () => void;
}) {
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);

  return (
    <section className={cardClass}>
      <p className="text-[0.875rem] leading-[1.7] text-[var(--text-primary)]">
        You&apos;ve used your 3 free starts. Unlock unlimited first-line generation for $27
        (one-time, USDT). No subscription. No account. Saving and viewing your contexts stays free
        forever.
      </p>

      <h3 className="mt-6 text-[1rem] text-[var(--text-primary)]">How to unlock</h3>

      <ol className="mt-3 flex flex-col gap-5 text-[0.875rem] leading-[1.7]">
        <li>
          <p className="text-[var(--text-primary)]">
            Step 1. Send exactly 27 USDT on the TRON network (TRC20) to:
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="font-mono text-[0.75rem] break-all text-[var(--text-primary)]">
              {USDT_ADDRESS}
            </code>
            <button
              onClick={onCopyAddress}
              className="min-h-[44px] rounded-md border border-[var(--border)] px-3 text-[0.75rem] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            >
              Copy address
            </button>
          </div>
          <p className="mt-2 text-[0.75rem] text-[var(--warning)]">
            TRON (TRC20) only — payments on other networks will be lost.
          </p>
        </li>
        <li>
          <p className="text-[var(--text-primary)]">
            Step 2. Email the transaction ID (TXID) and the email where you want your unlock key to:{" "}
            {SUPPORT_EMAIL}
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={`${linkClass} mt-2 inline-block`}>
            Email your TXID
          </a>
        </li>
        <li className="text-[var(--text-primary)]">
          Step 3. You&apos;ll receive your unlock key within 24 hours. Paste it below to unlock.
        </li>
      </ol>

      <form
        className="mt-6 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = onRedeem(key);
          setError(!ok);
        }}
      >
        <label className="text-[0.75rem] text-[var(--text-muted)]" htmlFor="fl-key">
          Paste your unlock key
        </label>
        <input
          id="fl-key"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          className="min-h-[44px] w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 font-mono text-[0.875rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          placeholder="FL-XXXX-XXXX-XXXX"
        />
        <button
          type="submit"
          className="min-h-[44px] self-start rounded-md bg-[var(--accent)] px-4 text-[0.875rem] font-medium text-[#0a0a0f] transition-colors hover:bg-[var(--accent-hover)]"
        >
          Unlock
        </button>
        {error && (
          <p className="text-[0.875rem] text-[var(--warning)]">
            That key doesn&apos;t look right. Check your email for the correct one.
          </p>
        )}
      </form>

      <div className="mt-5 flex flex-col gap-2 text-[0.75rem] leading-[1.7] text-[var(--text-muted)]">
        <p>Keys are delivered by email within 24 hours of payment confirmation.</p>
        <p>30-day refund — reply to your delivery email, no questions.</p>
        <p>
          Why USDT? I build from a country where Stripe doesn&apos;t operate. You pay once, you own
          it — no subscription, no data broker.
        </p>
        <p>
          Questions before paying?{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
            Email {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
    </section>
  );
}
