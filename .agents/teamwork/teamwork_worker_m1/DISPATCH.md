# DISPATCH: Worker 1 (Milestone 1 - Global Foundation & Design System Standardization)

## Working Directory
`d:\jkspdc-main-site\website\src\`

## Mandatory Inputs to Read
1. `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read before starting)
2. `d:\jkspdc-main-site\.agents\teamwork\PROJECT.md`
3. `d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_1\handoff.md`

## Exclusive File Ownership
You own and may ONLY modify:
- `website/src/styles/global.css`
- `website/src/layouts/Layout.astro`
- Shared components in `website/src/components/`:
  - `website/src/components/Header.astro`
  - `website/src/components/Footer.astro`
  - `website/src/components/PageHeader.astro`
  - `website/src/components/PageNav.astro`
  - `website/src/components/TableWrapper.astro`
  - `website/src/components/DocumentList.astro`
  - `website/src/components/Icon.astro`
  - `website/src/components/Breadcrumb.astro`
  - `website/src/components/AccessibilityBar.astro`
  - `website/src/components/Ticker.astro`

You MUST NOT touch any other files (no pages, no admin, no backend, no package.json).

## Implementation Scope
1. **`website/src/styles/global.css`**:
   - In `@theme` (lines 93–122):
     - Ensure `--color-brand-primary: #0B3B60;`
     - Add Action Blue: `--color-brand-action: #0B4F9C;`
     - Ensure Light accent: `--color-brand-hydro-cyan: #52B5E8;`
     - Set `--color-brand-text: #1e293b;` (slate-800)
     - Set `--color-brand-border: #e2e8f0;` (slate-200)
     - Add `--color-brand-muted: #64748b;` (slate-500)
   - Standardize table styles (`.table-data`):
     - Update `.table-data thead th, .table-data th`:
       `background-color: #f8fafc; color: #475569; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; vertical-align: top; white-space: nowrap;`
       (Matching `text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50 px-4 py-3`).
     - Update `.table-data tbody td, .table-data td`:
       `padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 0.875rem; vertical-align: top; line-height: 1.375;`
       (Matching `text-sm text-slate-700 px-4 py-3 align-top leading-snug`).
     - Ensure no fixed row heights cut off content.
     - Decouple from `.admin-table` (keep `.admin-table` unaffected for admin views).
2. **`website/src/components/TableWrapper.astro`**:
   - Remove `overflow: hidden;` from desktop breakpoint (`lg:min-w-0 lg:overflow-hidden`).
   - Ensure the wrapper provides fluid horizontal scrolling via `overflow-x-auto` on all viewports.
3. **Header Search Focus Container Highlight**:
   - In `website/src/layouts/Layout.astro` (around line 641) AND `website/src/components/Header.astro` (around line 48):
   - Replace `outline-none focus-within:outline-none ring-0 focus-within:ring-0` with active focus styling:
     `focus-within:ring-2 focus-within:ring-[#0B4F9C] focus-within:border-[#0B4F9C]`.
4. **`website/src/layouts/Layout.astro` Overflow Handling**:
   - Add `overflow-x-clip` (or `overflow-x-hidden`) to the `body` tag in `Layout.astro` to prevent table/card overflow from triggering entire-page horizontal scrolling.
5. **Shared Components Alignment**:
   - Check `Footer.astro`, `PageHeader.astro`, `PageNav.astro`, `DocumentList.astro`, `Icon.astro` and ensure typography and color classes match the tokens.

## Mandatory Verification Command
From workspace root `d:\jkspdc-main-site`:
`npm --prefix website run build`
Must succeed with zero errors.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Requirements
Write your detailed report to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m1\handoff.md`
Report files modified, diff summary, build command and output. Send message to orchestrator upon completion.
