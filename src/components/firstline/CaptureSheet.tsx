import { useEffect, useRef, useState } from "react";

export type CaptureValues = {
  project: string;
  wasWorkingOn: string;
  nextStep: string;
  blockedOn: string;
};

const field =
  "w-full min-h-[44px] rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-[0.875rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none";

const label = "block text-[0.75rem] uppercase tracking-wide text-[var(--text-secondary)] mb-1";

export function CaptureSheet({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: CaptureValues | undefined;
  onClose: () => void;
  onSave: (values: CaptureValues) => void;
}) {
  const [values, setValues] = useState<CaptureValues>({
    project: "",
    wasWorkingOn: "",
    nextStep: "",
    blockedOn: "",
  });
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setValues({
      project: initial?.project ?? "",
      wasWorkingOn: "",
      nextStep: "",
      blockedOn: "",
    });
    const t = window.setTimeout(() => firstRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open, initial?.project]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSave = values.project.trim() && values.wasWorkingOn.trim() && values.nextStep.trim();

  const set = (k: keyof CaptureValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Save context"
        className="fl-sheet relative flex max-h-[100dvh] h-[100dvh] w-full flex-col overflow-y-auto border-t border-[var(--border)] bg-[var(--bg-raised)] p-5 sm:h-auto sm:max-h-[90dvh] sm:max-w-[640px] sm:rounded-t-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-[1rem] text-[var(--text-primary)]">Save context</h2>
          <button
            onClick={onClose}
            className="min-h-[44px] px-2 text-[0.875rem] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Close
          </button>
        </div>

        <form
          className="flex flex-col gap-4 pb-[env(safe-area-inset-bottom)]"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) onSave(values);
          }}
        >
          <div>
            <label className={label} htmlFor="fl-project">
              Project name
            </label>
            <input
              id="fl-project"
              ref={firstRef}
              className={`${field} font-mono`}
              placeholder="e.g., auth-service"
              value={values.project}
              onChange={set("project")}
            />
          </div>
          <div>
            <label className={label} htmlFor="fl-was">
              Was working on
            </label>
            <input
              id="fl-was"
              className={field}
              placeholder="e.g. fixing the auth middleware race condition"
              value={values.wasWorkingOn}
              onChange={set("wasWorkingOn")}
            />
          </div>
          <div>
            <label className={label} htmlFor="fl-next">
              Next step
            </label>
            <input
              id="fl-next"
              className={field}
              placeholder="e.g. write the retry logic in handleToken()"
              value={values.nextStep}
              onChange={set("nextStep")}
            />
          </div>
          <div>
            <label className={label} htmlFor="fl-blocked">
              Blocked on
            </label>
            <input
              id="fl-blocked"
              className={field}
              placeholder="optional"
              value={values.blockedOn}
              onChange={set("blockedOn")}
            />
          </div>

          <button
            type="submit"
            disabled={!canSave}
            className="min-h-[44px] rounded-md bg-[var(--accent)] px-4 text-[0.875rem] font-medium text-[#0a0a0f] transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--bg-hover)] disabled:text-[var(--text-muted)]"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
