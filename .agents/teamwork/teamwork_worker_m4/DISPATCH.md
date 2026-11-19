# DISPATCH: Worker 4 (Milestone 4 - Gallery, Navigation, & Public Pages Consistency)

## Working Directory
`d:\jkspdc-main-site\website\src\`

## Mandatory Inputs to Read
1. `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read before starting)
2. `d:\jkspdc-main-site\.agents\teamwork\PROJECT.md`
3. `d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_3\handoff.md`

## Exclusive File Ownership
You own and may ONLY modify:
- `website/src/pages/index.astro`
- `website/src/pages/media/gallery.astro`
- `website/src/pages/help.astro`

You MUST NOT touch any other files (no dignitaries, no our-business, no contact, no feedback, no global.css, no backend, no package.json).

## Implementation Scope
1. **`website/src/pages/index.astro`**:
   - Add a semantic, accessible `<h1>` element (e.g. `<h1 class="sr-only">Jammu & Kashmir State Power Development Corporation Limited (JKSPDC)</h1>` or prominent header) to ensure WCAG 2.1 AA compliance (SC 1.3.1 & 2.4.6).
   - In "Navigate the Corporation" section (around line 1182):
     - Standardize the 10 quick-access cards with consistent dimensions, padding (`p-5`), icon container sizes (`w-11 h-11 rounded-md bg-slate-50 border border-slate-200 text-[#0B3B60]`), label typography (`text-sm font-semibold text-slate-800`), description typography (`text-xs text-slate-500 mt-1 leading-relaxed`).
     - Fix arrow indicator positioning so it does not collide with multi-line description text on zoom/smaller screens (e.g. integrate into layout flow or ensure bottom padding/spacing).
     - Restrained institutional styling matching government PSU design system.
2. **`website/src/pages/media/gallery.astro`**:
   - Image cards: Replace fixed pixel heights (`h-64 sm:h-72`) with standard aspect-ratio token (`aspect-[4/3]`) with `w-full h-full object-cover`.
   - Fix nested double-padding bug: remove the extra `max-w-7xl mx-auto px-4 sm:px-6` wrapper around lines 112/191 that causes misalignment with `Layout.astro`'s main container.
   - Lightbox keyboard accessibility:
     - When opened, shift initial focus to `#lightbox-close` button (`document.getElementById('lightbox-close')?.focus()`).
     - Save `lastFocusedElement = document.activeElement;`.
     - Implement Tab focus trapping: when `e.key === 'Tab'`, cycle focus exclusively among `#lightbox-close`, `#lightbox-prev`, and `#lightbox-next`.
     - When closed, restore focus to `lastFocusedElement?.focus()`.
     - Ensure proper ARIA roles (`role="dialog"`, `aria-modal="true"`, `aria-label="Image viewer"`).
3. **`website/src/pages/help.astro`**:
   - Clean up legacy `gray-*` / `neutral-*` Tailwind tokens to standard `slate-*` tokens (e.g. `text-slate-800`, `text-slate-600`, `text-slate-500`, `bg-slate-50`, `border-slate-200`).

## Mandatory Verification Command
From workspace root `d:\jkspdc-main-site`:
`npm --prefix website run build`
Must succeed with zero errors.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Requirements
Write your detailed report to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m4\handoff.md`
Report files modified, diff summary, build command and output. Send message to orchestrator upon completion.


## 2026-11-13T01:59:37Z
You are Worker 4 (Gallery, Navigation, & Public Pages Worker for Milestone 4).
You MUST read `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` before starting work.
Read your instructions in `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m4\DISPATCH.md`.
Read Explorer 3's report in `d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_3\handoff.md`.

Your write scope is EXCLUSIVELY:
- `website/src/pages/index.astro`
- `website/src/pages/media/gallery.astro`
- `website/src/pages/help.astro`

Tasks:
1. `website/src/pages/index.astro`:
   - Add semantic, accessible `<h1>` element (e.g. `<h1 class="sr-only">Jammu & Kashmir State Power Development Corporation Limited (JKSPDC)</h1>`) for WCAG 2.1 AA compliance (SC 1.3.1 & 2.4.6).
   - Standardize the 10 quick-access cards in the "Navigate the Corporation" section (around line 1182):
     - Consistent dimensions, padding (`p-5`), icon container sizes (`w-11 h-11 rounded-md bg-slate-50 border border-slate-200 text-[#0B3B60]`), label typography (`text-sm font-semibold text-slate-800`), description typography (`text-xs text-slate-500 mt-1 leading-relaxed`).
     - Fix arrow indicator positioning so it does not collide with multi-line description text on zoom or small viewports.
     - Restrained institutional styling.
2. `website/src/pages/media/gallery.astro`:
   - Replace fixed pixel heights (`h-64 sm:h-72`) with standard aspect-ratio token (`aspect-[4/3]`) with `w-full h-full object-cover`.
   - Remove nested double-padding bug: eliminate the extra `max-w-7xl mx-auto px-4 sm:px-6` wrapper that causes margin misalignment with Layout.
   - Lightbox keyboard accessibility:
     - Initial focus shift to `#lightbox-close` button on open.
     - Tab focus trapping: trap `Tab` / `Shift+Tab` cycling strictly between `#lightbox-close`, `#lightbox-prev`, and `#lightbox-next`.
     - Focus restoration: save `lastFocusedElement` on open, restore `lastFocusedElement?.focus()` when modal closes.
     - ARIA attributes: verify `role="dialog"`, `aria-modal="true"`, `aria-label="Image viewer"`.
3. `website/src/pages/help.astro`:
   - Replace legacy `gray-*` and `neutral-*` tokens with standard `slate-*` tokens (`text-slate-800`, `text-slate-600`, `text-slate-500`, `bg-slate-50`, `border-slate-200`).

Verification: Run `npm --prefix website run build` from `d:\jkspdc-main-site`. Must pass with zero errors.
