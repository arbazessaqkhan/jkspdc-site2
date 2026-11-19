# DISPATCH: Reviewer 2 (Milestones 3 & 4 Verification)

## Working Directory
`d:\jkspdc-main-site\website\src\`

## Mandatory Inputs to Read
1. `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read before starting)
2. `d:\jkspdc-main-site\.agents\teamwork\PROJECT.md`
3. Worker 3 handoff: `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m3\handoff.md`
4. Worker 4 handoff: `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m4\handoff.md`

## Review Scope: Milestones 3 & 4
1. Dignitaries Standardization (R3):
   - Inspect `dignitaries/[id].astro`, `ashwani-kumar.astro`, `manoj-sinha.astro`, `omar-abdullah.astro`, `rahul-yadav.astro`.
   - Portrait container & aspect ratio: `w-36 h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs` with `w-full h-full object-cover object-top` ensuring no distortion across varying source images.
   - Heading hierarchy: Exactly one `<h1>` per page (in `page-header-band`); in-content profile heading is `<h2>`.
   - Typography tokens: prominent name in `#0B3B60` or `#0B4F9C`, secondary designation badge, readable body bio in `text-sm text-slate-700 leading-relaxed`. No altered facts or biographical content.
2. Project Portfolios Standardization (R3):
   - Inspect `our-business/power-stations.astro`, `construction.astro`, `under-development.astro`, `power-station-details.astro`.
   - Hierarchy: project name, capacity (MW badge), location/river basin, status badges.
   - Consistent image treatment in `power-station-details.astro`.
   - Consistent table classes `.table-wrapper` and `.table-data`.
3. Navigation & Index Page (R4):
   - Inspect `website/src/pages/index.astro`: Semantic accessible `<h1>` present for WCAG 2.1 AA.
   - "Navigate the Corporation" 10 cards: consistent dimensions, padding (`p-5`), icon box (`w-11 h-11 rounded-md bg-slate-50 border border-slate-200 text-[#0B3B60]`), label typography (`text-sm font-semibold text-slate-800`), description (`text-xs text-slate-500 mt-1 leading-relaxed`), safe arrow alignment without text overlap.
4. Gallery & Public Pages (R4):
   - Inspect `website/src/pages/media/gallery.astro`: image cards use `aspect-[4/3]` with `w-full h-full object-cover`; nested double-padding bug removed.
   - Lightbox keyboard accessibility: initial focus shift to `#lightbox-close`, Tab/Shift+Tab focus trap strictly within modal controls, focus restored to `lastFocusedElement` on close.
   - Inspect `website/src/pages/help.astro`: zero legacy `gray-*` / `neutral-*` tokens remaining; all updated to `slate-*`.
5. Protected Scope: Zero changes to `admin/`, `backend/`, `package.json`.
6. Mandatory Build Check: Run `npm --prefix website run build` from workspace root. Must pass with zero errors.

## Verdict Requirement
Write your review report to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_reviewer_2\handoff.md`
Conclude with an explicit verdict: `APPROVE` or `REQUEST_CHANGES`.
Send a completion message to the orchestrator.


## 2026-11-13T02:10:30Z
You are Reviewer 2 (Dignitaries, Projects, & Public Pages Reviewer).
You MUST read `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` before starting work.
Read your instructions in `d:\jkspdc-main-site\.agents\teamwork\teamwork_reviewer_2\DISPATCH.md`.
Read `d:\jkspdc-main-site\.agents\teamwork\PROJECT.md`.
Read Worker 3's handoff: `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m3\handoff.md`.
Read Worker 4's handoff: `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m4\handoff.md`.

Review:
1. Milestone 3: Dignitaries pages (`[id].astro` and 4 static pages) portrait aspect ratios (`w-36 h-36 rounded-full overflow-hidden object-cover object-top`), single `<h1>` per page, typography tokens, factual preservation. Project portfolios (`our-business/*.astro`) table consistency, MW capacity badges, status badges, location hierarchy.
2. Milestone 4: `index.astro` accessible `<h1>` and standardized 10 quick-access cards. `media/gallery.astro` aspect-ratio `aspect-[4/3]`, removal of double-padding bug, lightbox keyboard focus trap and focus restoration. `help.astro` token cleanup (zero `gray-*` tokens).
3. Protected files: zero changes in `admin/`, `backend/`, `package.json`.
4. Mandatory build check: Run `npm --prefix website run build`.

Write your report to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_reviewer_2\handoff.md`
Provide an explicit verdict: APPROVE or REQUEST_CHANGES.
Send a message to orchestrator when complete.
