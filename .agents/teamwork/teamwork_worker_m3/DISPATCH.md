# DISPATCH: Worker 3 (Milestone 3 - Dignitaries & Project Portfolios Standardization)

## Working Directory
`d:\jkspdc-main-site\website\src\`

## Mandatory Inputs to Read
1. `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read before starting)
2. `d:\jkspdc-main-site\.agents\teamwork\PROJECT.md`
3. `d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`

## Exclusive File Ownership
You own and may ONLY modify:
- `website/src/pages/dignitaries/[id].astro`
- `website/src/pages/dignitaries/ashwani-kumar.astro`
- `website/src/pages/dignitaries/manoj-sinha.astro`
- `website/src/pages/dignitaries/omar-abdullah.astro`
- `website/src/pages/dignitaries/rahul-yadav.astro`
- `website/src/pages/our-business/power-stations.astro`
- `website/src/pages/our-business/power-station-details.astro`
- `website/src/pages/our-business/construction.astro`
- `website/src/pages/our-business/under-development.astro`

You MUST NOT touch any other files (no contact, no feedback, no index, no global.css, no backend, no package.json).

## Implementation Scope
1. **Dignitaries Profile Standardization**:
   - For all 5 dignitary pages (`[id].astro` and the 4 static files):
     - Ensure profile card images have consistent dimensions and undistorted aspect ratios using:
       `w-36 h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs` with inner `w-full h-full object-cover object-top`.
     - Fix heading hierarchy: Remove duplicate `<h1>` tags! The page-header-band already contains the page `<h1>`. In the right biography column, change the in-content `<h1 class="text-2xl font-extrabold text-[#0B4F9C] text-balance">Official Profile</h1>` to `<h2 class="text-xl font-bold text-[#0B3B60] text-balance">Official Profile</h2>`.
     - Maintain strict visual hierarchy: prominent dignitary name (`text-xl font-extrabold text-[#0B3B60]` or `#0B4F9C`), secondary designation badge, and readable body bio text (`text-sm text-slate-700 leading-relaxed`).
     - DO NOT alter existing names, designations, qualifications, or biographical content.
2. **Project Portfolio Standardization (`our-business/*.astro`)**:
   - `power-stations.astro`, `construction.astro`, `under-development.astro`, `power-station-details.astro`:
     - Standardize infrastructure portfolio cards/tables with clear hierarchy for project name, capacity (e.g. MW badge), location (River Basin), and status (Operational / Under Construction / Under Development).
     - Ensure consistent image treatment and aspect ratios, distinguishing project attributes visually without inventing facts or data.
     - Ensure data tables use the standardized `.table-wrapper` and `.table-data` classes.

## Mandatory Verification Command
From workspace root `d:\jkspdc-main-site`:
`npm --prefix website run build`
Must succeed with zero errors.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Requirements
Write your detailed report to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m3\handoff.md`
Report files modified, diff summary, build command and output. Send message to orchestrator upon completion.


## 2026-11-13T01:59:27Z
You are Worker 3 (Dignitaries and Projects Worker for Milestone 3).
You MUST read `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` before starting work.
Read your instructions in `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m3\DISPATCH.md`.
Read Explorer 2's report in `d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`.

Your write scope is EXCLUSIVELY:
- `website/src/pages/dignitaries/[id].astro`
- `website/src/pages/dignitaries/ashwani-kumar.astro`
- `website/src/pages/dignitaries/manoj-sinha.astro`
- `website/src/pages/dignitaries/omar-abdullah.astro`
- `website/src/pages/dignitaries/rahul-yadav.astro`
- `website/src/pages/our-business/power-stations.astro`
- `website/src/pages/our-business/power-station-details.astro`
- `website/src/pages/our-business/construction.astro`
- `website/src/pages/our-business/under-development.astro`

Tasks:
1. Dignitaries Standardization:
   - For all 5 dignitary pages (`[id].astro` and the 4 static pages):
     - Ensure portrait images have consistent dimensions and undistorted aspect ratios: `w-36 h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs` with `w-full h-full object-cover object-top`.
     - Fix heading hierarchy: Remove duplicate `<h1>`! Change in-content `<h1 class="text-2xl font-extrabold text-[#0B4F9C] text-balance">Official Profile</h1>` to `<h2 class="text-xl font-bold text-[#0B3B60] text-balance">Official Profile</h2>` so each page has exactly one `<h1>` in page-header-band.
     - Visual hierarchy: prominent name (`#0B3B60` or `#0B4F9C`), secondary designation badge, readable body bio (`text-sm text-slate-700 leading-relaxed`).
     - DO NOT alter existing names, designations, qualifications, or bio content.
2. Project Portfolios Standardization (`our-business/*.astro`):
   - In `power-stations.astro`, `construction.astro`, `under-development.astro`, `power-station-details.astro`:
     - Standardize infrastructure portfolio cards/tables with clear hierarchy for project name, capacity (MW badge), location (River Basin), and status.
     - Consistent image treatment and aspect ratios; visual distinction of project attributes without inventing facts/data.
     - Use `.table-wrapper` and `.table-data`.

Verification: Run `npm --prefix website run build` from `d:\jkspdc-main-site`. Must pass with zero errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your handoff report to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m3\handoff.md`
When done, send a message to orchestrator with your results.
