# DISPATCH: Explorer 1 (Survey - Global Foundation & Shared Components)

## Task Description
Read `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` first.
Investigate the global design system foundation, layout, shared components, and current build status of the website.

### Target Areas
1. Working Directory: `d:\jkspdc-main-site\website\src`
2. Baseline Build: Run `npm --prefix website run build` (from workspace root `d:\jkspdc-main-site`) to verify current compilation and any existing warnings/errors.
3. Styles: Inspect `website/src/styles/global.css` (or equivalent style files), identify current typography definitions, color tokens, `.table-data` table styles, focus states, and scroll utilities.
4. Layout: Inspect `website/src/layouts/Layout.astro` and any other layout files for overflow handling, meta tags, and overall structure.
5. Shared Components: Inspect all components in `website/src/components/`, specifically:
   - `Header.astro` (check search container and `:focus-within` behavior)
   - `Footer.astro`
   - `PageHeader.astro`
   - `PageNav.astro`
   - `TableWrapper.astro`
   - `DocumentList.astro`
   - `Icon.astro`
   - Identify all other shared components (total 9 shared components).
6. Check token compliance against requirements:
   - Primary dark blue `#0B3B60`, Action blue `#0B4F9C`, Light accent `#52B5E8`, Text primary `slate-800` (`#1e293b`), Text secondary `slate-600` (`#475569`), Text muted `slate-500` (`#64748b`), Background page `slate-50` (`#f8fafc`), Background card `white` (`#ffffff`), Border standard `slate-200` (`#e2e8f0`).
   - Typography tokens: H1 = `text-2xl font-bold text-[#0B3B60]`; H2 = `text-xl font-bold`; H3 = `text-base font-semibold`; body = `text-sm text-slate-700 leading-relaxed`; caption = `text-xs text-slate-500`.
   - Table styles: `th` = `text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50 px-4 py-3`; `td` = `text-sm text-slate-700 px-4 py-3 align-top leading-snug`. Horizontal scrolling `overflow-x-auto`.

### Output Requirements
Write your detailed findings and actionable recommendations to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_1\handoff.md`
Report baseline build output, existing discrepancies, exact lines/classes in each component, and recommended implementation plan.
Do NOT modify source code. This is an exploration and survey task only.


## 2026-11-13T01:47:59Z
You are Explorer 1 (Global Foundation Explorer).
You MUST read `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` before starting work.
Read your task description in `d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_1\DISPATCH.md`.

Your mission is to explore:
1. Current baseline build of the site: run `npm --prefix website run build` from `d:\jkspdc-main-site` to verify compilation.
2. `website/src/styles/global.css`: inspect color tokens, typography classes, `.table-data` styles, horizontal scroll overflow, header search focus state.
3. `website/src/layouts/Layout.astro`: layout structure, overflow handling, fonts, shared styles.
4. All shared components in `website/src/components/`:
   - `Header.astro` (specifically header search container `:focus-within` behavior)
   - `Footer.astro`
   - `PageHeader.astro`
   - `PageNav.astro`
   - `TableWrapper.astro`
   - `DocumentList.astro`
   - `Icon.astro`
   - Identify the other shared components (total 9 shared components).
5. Compare everything with R1 design tokens & typography requirements in ORIGINAL_REQUEST.md.

Produce a comprehensive, structured handoff report in:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_1\handoff.md`
Also update `d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_1\progress.md` with your status.
When finished, send a message to the orchestrator indicating completion and referencing your report path.
Do NOT modify any source code files.
