# First Line Focus

Build a complete single-page web app called "FirstLine" — a context-saver 

for developers with ADHD. This is NOT a generic productivity app. Every 

design decision below is a product requirement driven by ADHD psychology. 

Do not ask clarifying questions; everything you need is in this brief.



═══════════════════════════════════════

PART 1 — WHAT THE APP DOES

═══════════════════════════════════════



Tech: React + TypeScript + Tailwind CSS. No backend. No auth. No database. 

No API calls. No Supabase — remove any Supabase scaffold if present. 

All data in localStorage. Works offline after first load.

If this workspace forces a router shell (e.g. TanStack Router), accept it 

but keep EXACTLY one route, all state local, no navigation, no data 

fetching — the result must behave as a plain static SPA.



CORE LOOP (the entire product in 3 actions):

1. SAVE: Before leaving work, user presses Ctrl/Cmd+Shift+S (global 

   shortcut) or clicks a floating "⏸ Save Context" button. A bottom sheet 

   slides up with a project name field and exactly 3 context fields. 

   Saves in under 15 seconds.

2. RETURN: On next visit, the app shows the most recent saved session: 

   "Last session: [project] / Was working on: [X] / Next step: [Y] / 

   Blocked: [Z]" with one big button: "Resume → Get First Line".

3. START: Clicking it generates a copy-ready cold-start prompt block 

   (monospace) that reads:



   "I'm resuming work on [project]. I was working on: [wasWorkingOn]. 

   My next step is: [nextStep]. [If blockedOn: "I'm blocked on: 

   [blockedOn]."] Give me ONLY the first line of code or the single 

   smallest action I should take right now. No explanation. No 

   multi-step plan. Just the first line. I have ADHD — if you give me 

   a paragraph I will not start."



   Below it: a "Copy prompt" button (copies to clipboard and shows the 

   toast "Copied. Paste it in your AI tool.") and SEPARATE small text 

   links "Open Claude ↗" / "Open ChatGPT ↗" / "Open Cursor ↗" driven by 

   a tool selector (Claude / ChatGPT / Cursor). NEVER combine a 

   clipboard write and window.open in one action — popup blockers 

   break that flow.



SCREENS (state-driven, no router navigation):

- RESUME (default): recent session card + collapsed list of older 

  sessions (expandable; viewing is always free)

- CAPTURE: bottom sheet with project name + 3 inputs, autofocus on the 

  first field, 1-second toast "Saved. You're covered." on success

- FIRST LINE: the generated prompt block + copy button + tool links

- GENTLE STATS: permanent bottom bar showing ONLY "Active days: N" 

  (count of unique dates). Tooltip on hover: "No streaks to break. 

  Miss a week? The number just waits for you."



FREE TIER + LOCKED STATE (monetization — implement exactly):

- freeGenerations starts at 3 and decrements on EVERY prompt generation, 

  INCLUDING the first "Resume → Get First Line" click (so after the 

  first generation the label shows "2 starts left").

- The label "N starts left" shows the remaining count AFTER the decrement.

- When freeGenerations <= 0 (isLocked):

  a) DO NOT render the full prompt text anywhere — not even in the DOM. 

     Build a teaser from a TRUNCATED string in JS: show only the first 

     sentence ("I'm resuming work on [project]."), then a CSS fade-out 

     (linear-gradient to --bg-raised), then a small lock line: 

     "Locked. Unlock to generate your first line."

     A locked user must NOT be able to copy the full prompt from page 

     selection or from view-source.

  b) Render an INLINE unlock card (never a popup or modal) with EXACTLY:

     "You've used your 3 free starts. Unlock unlimited first-line 

     generation for $27 (one-time, USDT). No subscription. No account. 

     Saving and viewing your contexts stays free forever."

     plus an "Unlock" button (href="#" placeholder for now).

  c) Replace the Regenerate button with the calm note: 

     "You're out of free starts. Unlock below."

- CRITICAL: saving new contexts and viewing saved sessions are ALWAYS 

  free and unlimited. Only prompt generation is metered. Never hold the 

  user's saved context hostage.



DATA SCHEMA (localStorage key "firstline_state"):

{

  "sessions": [{ "id", "project", "wasWorkingOn", "nextStep", 

  "blockedOn", "savedAt", "resumedAt" }],

  "activeDays": ["YYYY-MM-DD", ...],

  "freeGenerations": 3

}



═══════════════════════════════════════

PART 2 — DESIGN SYSTEM (NON-NEGOTIABLE)

═══════════════════════════════════════



Colors (CSS variables — use EXACTLY these hex values):

--bg-base: #0a0a0f        (deep blue-black, NEVER pure #000)

--bg-raised: #14141b      (cards, sheets)

--bg-hover: #1c1c26

--text-primary: #e4e4e7   (NEVER pure white — causes halation for ADHD eyes)

--text-secondary: #a1a1aa

--text-muted: #52525b

--accent: #2dd4bf         (teal — calm, non-alarming)

--accent-hover: #14b8a6

--accent-dim: rgba(45,212,191,0.1)

--success: #4ade80        (only for the "Saved" toast)

--warning: #a8a29e        (warm gray — replaces red entirely)

--border: #27272a



BANNED COLORS (hard requirement, not preference):

NO red (#ef4444 or any red) — red = shame/error in ADHD brains

NO bright orange/yellow — alarm and distraction

NO loud gradients — visual noise

NO pure white text on pure black



Typography:

--font-mono: 'JetBrains Mono', ui-monospace, monospace 

  (used for: project names, numbers, generated prompts, timestamps, logo)

--font-sans: 'Inter', system-ui, sans-serif 

  (used for: UI labels, body text)

Sizes: 0.75 / 0.875 / 1 / 1.125 / 1.25 rem. Line-height 1.7 for body, 

1.4 for headings.



Logo:

- Wordmark "FirstLine" in JetBrains Mono, where each letter "i" dot is 

  replaced by a teal blinking cursor (▌, 1.2s ease pulse animation)

- Favicon: the teal cursor glyph alone on a dark square, readable at 16px

- Must work in pure monochrome. Flat, no shadows, no 3D, no mascots.



Motion:

- ONE intentional animation: the blinking cursor (1.2s)

- Bottom sheet slides up in 200ms ease-out

- Toast fades in/out over 1s

- Respect prefers-reduced-motion. NO spinners, NO confetti, NO bounce.



Layout:

- Max-width 640px, centered. Generous whitespace. One primary element 

  per screen. Nothing decorative.



Accessibility:

- Contrast ratio ≥ 7:1 for body text

- Visible focus rings on all interactive elements

- Full keyboard navigation



═══════════════════════════════════════

PART 3 — VOICE & MICROCOPY (USE VERBATIM)

═══════════════════════════════════════



Tone: a tired, self-aware developer talking to a peer. Humble. Short 

sentences. Zero marketing language. Every quoted string below is used 

character for character — never paraphrase.



Exact strings to use:

- Empty state: "No saved context yet. Start a session below."

- Empty state subtitle: "Close the tab. We'll remember where you were."

- Save toast: "Saved. You're covered."

- Copy toast: "Copied. Paste it in your AI tool."

- Under the prompt block: "Your brain doesn't need a plan. It needs a line."

- Stats tooltip: "No streaks to break. Miss a week? The number just waits."

- Locked teaser line: "Locked. Unlock to generate your first line."

- Locked Regenerate replacement: "You're out of free starts. Unlock below."

- Unlock card: "You've used your 3 free starts. Unlock unlimited 

  first-line generation for $27 (one-time, USDT). No subscription. 

  No account. Saving and viewing your contexts stays free forever."

- Import failure: "Couldn't read that file. Make sure it's a FirstLine export."

- Capture field placeholders:

  1. Project name: "e.g., auth-service"

  2. "e.g. fixing the auth middleware race condition"

  3. "e.g. write the retry logic in handleToken()"

  4. "optional"



BANNED WORDS anywhere in the UI: revolutionize, supercharge, 

game-changing, boost, unlock your potential, 🚀, "Hey guys!", 

excessive exclamation marks.



═══════════════════════════════════════

PART 4 — HARD TECHNICAL RULES

═══════════════════════════════════════



1. NO analytics, NO tracking pixels, NO third-party scripts. Privacy IS 

   the feature. Tiny footer line: "No accounts. No servers. Your context 

   never leaves this browser."

2. Global keyboard shortcut Ctrl/Cmd+Shift+S registered on window with 

   preventDefault. If registration fails or is intercepted by the 

   browser, the floating "Save Context" button remains the primary 

   always-visible trigger. Display the active shortcut in the footer.

3. Double-tap the shortcut within 2000ms = quick-save: re-save the most 

   recent session fields with a fresh timestamp only, skip the sheet, 

   show the toast immediately.

4. Export button (small, footer): downloads sessions as JSON. Import 

   button: restores from JSON WITH validation — wrap in try/catch, 

   verify the parsed object has a "sessions" array with the expected 

   field names before committing to state; on failure show the calm 

   inline import-failure message. Never let a bad import crash the app 

   or wipe existing state.

5. The app must be usable within 60 seconds of opening. No onboarding 

   flow, no welcome modal.

6. Mobile: on viewports under 640px the capture sheet becomes a 

   full-height sheet with scrollable content and touch inputs 

   (min-height 44px); the sheet must not be covered by the on-screen 

   keyboard. Desktop keeps the slide-up sheet.

7. In index.html (or root head): add 

   <meta name="google" content="notranslate"> and ensure 

   <html lang="en">, plus a proper page title and meta description, so 

   browsers never auto-translate the verbatim microcopy.



═══════════════════════════════════════

PART 5 — DELIVERABLES

═══════════════════════════════════════



1. The complete runnable app, deployed/published from this workspace.

2. A static export of the built page (a drag-and-drop-hostable folder, 

   e.g. dist/) as a separate deliverable, with exact instructions on 

   how I download it.



Output: complete runnable code. If you present a plan first, keep it 

short and proceed to build in the same session.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://firstline-dev.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e4c6d200-2f25-4057-9135-001eea74398b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
