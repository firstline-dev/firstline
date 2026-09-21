# FirstLine — context-saver for developers with ADHD

Single page, one route, all data in the browser. No accounts, no server, no tracking.

## What gets built

**Resume screen (default)**
- Most recent session card: project, was working on, next step, blocked on.
- One big button: "Resume → Get First Line".
- Older sessions collapsed below, expandable — always free to view.
- Empty state: "No saved context yet. Start a session below." / "Close the tab. We'll remember where you were."

**Capture sheet**
- Opens with Ctrl/Cmd+Shift+S or the floating "⏸ Save Context" button.
- Project name + 3 fields, first field autofocused, saves in seconds.
- Toast: "Saved. You're covered."
- Double-tap the shortcut within 2 seconds: re-saves the latest session with a fresh time, no sheet.
- Under 640px wide it becomes a full-height scrollable sheet with large touch targets that stays above the keyboard.

**First Line screen**
- Monospace prompt block using the exact wording from the brief.
- "Copy prompt" button → toast "Copied. Paste it in your AI tool."
- Separate small links: Open Claude ↗ / Open ChatGPT ↗ / Open Cursor ↗, driven by a tool selector. Copying and opening are never one action.
- Caption: "Your brain doesn't need a plan. It needs a line."

**Free starts and locked state**
- Starts at 3, decrements on every generation including the first; label shows the count after the decrement.
- At zero: only the first sentence is ever built in the browser, faded out, with "Locked. Unlock to generate your first line." The full text exists nowhere on the page.
- Inline unlock card (no popup) with the exact $27 one-time copy and an Unlock button (placeholder link).
- Regenerate replaced by "You're out of free starts. Unlock below."
- Saving and viewing stay free forever.

**Bottom bar and footer**
- "Active days: N" only, tooltip "No streaks to break. Miss a week? The number just waits."
- Footer: privacy line, the active shortcut, Export (JSON download) and Import (validated; bad file shows "Couldn't read that file. Make sure it's a FirstLine export." and never wipes existing data).

## Look and feel
Deep blue-black background, soft off-white text, one teal accent. No red, no bright orange or yellow, no gradients, no pure white on pure black. JetBrains Mono for names, numbers, prompts, timestamps and the logo; Inter for labels and body. Max width 640px, centered, lots of空 space, one primary thing per screen.

Logo: "FirstLine" wordmark where each "i" dot is a teal blinking cursor (1.2s pulse). Matching cursor favicon on a dark square. One animation only; sheet slides up in 200ms; toast fades over 1s; all motion off for users who ask for reduced motion.

## Technical notes
- TanStack Router shell kept, exactly one route, no navigation or data fetching — behaves as a static SPA.
- State persisted to localStorage under `firstline_state` with the given schema; a single reducer-style store hook.
- Shortcut registered on window with preventDefault; the floating button stays the always-available fallback.
- Locked teaser built by truncating in JS before render, so the full prompt is not in the DOM.
- Head: `lang="en"`, `notranslate` meta, page title and description.
- Contrast ≥ 7:1, visible focus rings, full keyboard navigation.

## Deliverables
1. The running app in this workspace, ready to publish.
2. A static build exported as a downloadable folder, with instructions for grabbing it from Files.
