# Global Foundation & Shared Components — Exploration & Survey Report

**Explorer**: Explorer 1 (`teamwork_explorer_survey_1`)  
**Scope**: Global foundation (`global.css`, `Layout.astro`), shared components (`website/src/components/*`), baseline build verification, and R1 design token standardization.  
**Report Date**: 2026-11-13  
**Status**: Exploration Complete (Read-Only)

---

## Executive Summary
The JKSPDC public website compiles cleanly with zero errors on Astro 7.4.10 and Tailwind CSS v4. However, the existing design foundation exhibits critical deviations from the R1 standardization requirements: `.table-data` currently uses dark blue `#0B3B60` headers instead of slate-50/slate-600 headers; `TableWrapper.astro` incorrectly disables horizontal scrolling on desktop; the header search container suppresses focus rings; `Layout.astro` inlines the entire header instead of composing `Header.astro`; and color/typography tokens in `global.css` diverge from R1 specifications.

---

## 1. Observation

### 1.1 Baseline Build Status
- **Command**: `npm --prefix website run build` executed from workspace root `d:\jkspdc-main-site`.
- **Result**: Command exited with code `0`.
- **Build Output**:
```
> jkspdc-website@0.0.1 build
> astro build

[@astrojs/node] Enabling sessions with filesystem storage
[types] Generated 288ms
[build] output: "server"
[build] mode: "server"
[build] directory: D:\jkspdc-main-site\website\dist\
[build] adapter: @astrojs/node
[build] Collecting build info...
[build] ✓ Completed in 516ms.
[build] Building server entrypoints...
[vite] ✓ built in 693ms
[vite] ✓ built in 3.23s
[vite] ✓ built in 198ms
[build] Rearranging server assets...
[build] ✓ Completed in 4.97s.
[build] Server built in 5.58s
[build] Complete!
```
- **Observations**: 
  - Toolchain: Astro `^7.4.10`, Tailwind CSS `^4.0.0` with `@tailwindcss/vite: ^4.0.0`, `@astrojs/node: ^11.1.12`.
  - Zero build warnings or errors. Static SSR bundle generated in `website/dist/`.

---

### 1.2 `website/src/styles/global.css` Observations

#### A. Color Tokens in `@theme` (Lines 93–122)
```css
@theme {
  --color-brand-primary: #0B3B60;        /* Primary dark blue */
  --color-brand-primary-dark: #002B49;
  --color-brand-primary-deeper: #002B49;
  --color-brand-secondary: #06741A;
  --color-brand-secondary-hover: #055914;
  --color-brand-accent: #0EA4E5;         /* Bright cyan, NOT Action blue */
  --color-brand-accent-hover: #0B3B60;
  --color-brand-hydro-cyan: #52B5E8;     /* Light accent */
  --color-brand-hydro-teal: #A4D7F4;

  --color-brand-text: #333333;           /* Diverges from slate-800 (#1e293b) */
  --color-brand-muted: #64748B;          /* Matches slate-500 (#64748b) */
  --color-brand-border: #D9E5EE;         /* Diverges from slate-200 (#e2e8f0) */
  ...
}
```
- **Discrepancies**:
  - Missing token for Action Blue `#0B4F9C`.
  - `--color-brand-text` is `#333333` instead of `slate-800` (`#1e293b`).
  - `--color-brand-border` is `#D9E5EE` instead of `slate-200` (`#e2e8f0`).
  - `html` background is hardcoded to `#ffffff` at line 137, while `Layout.astro` uses `bg-slate-50`.

#### B. Typography Tokens (Lines 147–220, 1649–1657)
- Lines 147–191 set global font weights (`h1, h2` bold 700; `h3, h4` semibold 600; `h5, h6` medium 500) and fonts to `Noto Sans`.
- Lines 1649–1657 define custom type scale variables:
  - `--text-xs-rem: 0.75rem;` (12px min)
  - `--text-sm-rem: 0.875rem;` (14px)
  - `--text-base-rem: 1rem;` (16px)
  - `--text-body-rem: 1.0625rem;` (17px)
  - `--text-lg-rem: 1.25rem;` (20px)
  - `--text-xl-rem: 1.5625rem;` (25px)
  - `--text-2xl-rem: 1.9375rem;` (31px)
- **Discrepancy with R1**:
  - R1 mandates:
    - H1 = `text-2xl font-bold text-[#0B3B60]`
    - H2 = `text-xl font-bold`
    - H3 = `text-base font-semibold`
    - Body = `text-sm text-slate-700 leading-relaxed`
    - Caption = `text-xs text-slate-500`
  - Currently in `global.css`, `html` sets default font size to `17px` (`font-size: 17px;` at line 7) and `--text-body-rem` is `1.0625rem` (17px), while R1 asks for body as `text-sm text-slate-700 leading-relaxed`.
  - `.page-header-band h1` (lines 365–380) is styled as `font-size: 1.75rem; font-weight: 800; color: #ffffff;` (at md: `2.15rem`), because `.page-header-band` has a dark gradient background `#0B3B60` to `#134E6F`.

#### C. Table Styles `.table-data` (Lines 863–953)
```css
.table-data thead th,
.table-data th,
.admin-table thead th,
.admin-table th {
  background-color: #0B3B60;
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.65rem 0.85rem;
  border-bottom: 2px solid #073B75;
  vertical-align: middle;
  white-space: nowrap;
  user-select: none;
}

.table-data tbody td,
.table-data td,
.admin-table tbody td,
.admin-table td {
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid #E2E8F0;
  color: #1E293B;
  font-size: 0.8125rem;
  vertical-align: middle;
  line-height: 1.5;
  word-break: normal;
  overflow-wrap: break-word;
  hyphens: manual;
}
```
- **Direct Conflict with R1 Requirement**:
  - R1 specifies:
    - `th` = `text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50 px-4 py-3`
    - `td` = `text-sm text-slate-700 px-4 py-3 align-top leading-snug`
  - Current `global.css` has:
    - `th`: `background-color: #0B3B60; color: #FFFFFF; font-size: 0.72rem; padding: 0.65rem 0.85rem; vertical-align: middle;`
    - `td`: `color: #1E293B; font-size: 0.8125rem; padding: 0.65rem 0.85rem; vertical-align: middle;`
  - Current `.table-data` and `.admin-table` share identical selector rules. Updating `.table-data` must decouple it from `.admin-table` so admin views (styled separately in `admin.css`) are not impacted.

#### D. Horizontal Scroll Overflow in `global.css` (Lines 825–836)
```css
.table-wrapper,
.admin-table-wrapper,
.admin-table-container {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #CBD5E1;
  border-radius: 0.5rem;
  background-color: #FFFFFF;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
}
```
- `.table-wrapper` in `global.css` handles `overflow-x: auto;` properly, but `TableWrapper.astro` has its own conflicting inline styles.

---

### 1.3 `website/src/layouts/Layout.astro` Observations

#### A. Component Inlining Duplication (Lines 520–890)
- `Layout.astro` imports `Header` at line 3 (`import Header from '../components/Header.astro';`) and `Ticker` at line 6 (`import Ticker from '../components/Ticker.astro';`), but **never calls `<Header />` or `<Ticker />` in its JSX template**.
- Instead, `Layout.astro` contains **370 lines of inlined header markup and logic** (lines 520–890):
  - Inlined Organization title and logo (lines 523–551).
  - Inlined Accessibility bar (font sizing, contrast, language dropdown) (lines 557–635).
  - Inlined Search form `#header-search-form` (lines 638–665).
  - Inlined News Ticker bar (lines 669–705).
  - Inlined Sticky Navigation Bar with all dropdown menus (lines 708–890).
  - Inlined Header search autocomplete client script (lines 1088–1248).
  - Inlined Ticker marquee client script (lines 1250–1292).
- Meanwhile, `website/src/components/Header.astro` exists as an independent 381-line file with a divergent, slightly older implementation of the same markup.

#### B. Header Search Form Focus State (Lines 641–650)
```html
<div class="flex items-center w-full bg-white hover:bg-slate-50/50 focus-within:bg-white border border-slate-300 focus-within:border-[#0B3B60] rounded-lg pl-2.5 pr-1 py-0.5 transition-all duration-150 shadow-2xs outline-none focus-within:outline-none ring-0 focus-within:ring-0">
  <Icon name="search" size={13} strokeWidth={2.2} class="text-slate-400 shrink-0 mr-1.5" />
  <input 
    type="search" 
    name="q" 
    id="header-search" 
    placeholder="Search portal, tenders…" 
    class="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 font-normal py-1 px-1 border-0 focus:ring-0"
    style="box-shadow: none !important; font-weight: 400 !important;"
    required
  />
  <button type="submit" class="shrink-0 px-2.5 py-1 bg-[#0B3B60] hover:bg-[#0EA4E5] text-white text-[11px] font-semibold rounded-md transition-colors duration-150 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0B3B60] cursor-pointer" aria-label="Submit Search">
    Search
  </button>
</div>
```
- **Discrepancy with R1**:
  - The container has `outline-none focus-within:outline-none ring-0 focus-within:ring-0`.
  - While it has `focus-within:border-[#0B3B60]`, the ring is explicitly set to `0` and outline to `none`. There is no prominent focus highlight or ring glow as mandated by WCAG 2.1 AA and R1.
  - Exactly the same code is replicated in `website/src/components/Header.astro` (line 48).

#### C. Layout Overflow Handling (Lines 505, 937)
- `Layout.astro` line 505:
  `<body class="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans transition-colors duration-150">`
  - Neither `html` nor `body` has `overflow-x-clip` or `overflow-x-hidden`.
- Line 937:
  `<main id="main-content" class={isHome ? "flex-grow focus:outline-none" : "flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none"} tabindex="-1">`
  - `.page-header-band` on 40 interior pages uses negative margins (`margin: -2rem -1rem 2.5rem;` up to `-2rem -2rem 2.5rem;` at `lg:`). Without `overflow-x-clip` on `body`, any table or grid that overflows on narrow viewports causes the entire page to scroll horizontally rather than confining scroll to the component.

#### D. Search Autocomplete API Bug (Line 1119 in `Layout.astro`, Line 251 in `Header.astro`)
- Both files contain: `var projectsRes = await fetch('window.__API_BASE__/api/projects');`
- Notice the literal string `'window.__API_BASE__/api/projects'` instead of using the template variable or window property `window.__API_BASE__ + '/api/projects'`.

---

### 1.4 Shared Components in `website/src/components/`

Enumeration of all files in `website/src/components/` (excluding `admin/`):

| Component File | Size | Purpose & Role | R1 Compliance Status |
|---|---|---|---|
| 1. `Header.astro` | 30,345 bytes | Standalone Header component. Contains logo, search form, accessibility bar, nav with dropdowns, ticker. | **Discrepancy**: Not actively used in `Layout.astro` (duplicated inline). Container suppresses focus ring (`focus-within:ring-0`). |
| 2. `Footer.astro` | 9,840 bytes | 4-column institutional footer + GIGW compliance & copyright bar. Actively rendered in `Layout.astro` line 941. | **Compliant**: Clean institutional hierarchy, accurate dark blue `#0B3B60` background, `#002B49` border, `#52B5E8` hover accents. |
| 3. `PageHeader.astro` | 1,582 bytes | Page header banner component with breadcrumb slot, title, and intro text. Supports dark and light variants. | **Unused**: 40 public pages write raw `<div class="page-header-band">` instead of using this component. |
| 4. `PageNav.astro` | 2,784 bytes | Pagination controls for data tables (used across 18 admin pages). | **Compliant**: Clean typography (`text-xs text-slate-500 font-medium`, `font-bold text-slate-800`), accessible aria-labels. |
| 5. `TableWrapper.astro` | 2,955 bytes | Responsive wrapper for data tables with empty/loading/error states. | **Discrepancy**: Line 91 restricts `overflow-x: auto` only to `@media (max-width: 768px)`; desktop has `overflow: hidden`, causing wide tables to truncate. |
| 6. `DocumentList.astro` | 4,495 bytes | Uniform government document list renderer with format tags (PDF/DOC/XLS/ZIP), metadata, status badges, and download links. | **Compliant**: Uses `--color-brand-primary` (`#0B3B60`), `--radius-card`, format badges, and accessible markup. |
| 7. `Icon.astro` | 13,813 bytes | Inline SVG icon library containing 35+ custom vector paths without external fonts or HTTP requests. | **Compliant**: Highly accessible and flexible (`size`, `strokeWidth`, `class`). |
| 8. `Breadcrumb.astro` | 1,502 bytes | Accessible `<nav aria-label="Breadcrumb">` with `<ol>` and `aria-current="page"`. | **Unused on pages**: Most pages write `<nav class="breadcrumb-trail">` directly. |
| 9. `AccessibilityBar.astro` | 4,054 bytes | GIGW accessibility bar: font resizing (-A, A, +A), high contrast mode toggle, and language switcher dropdown. | **Duplicated**: Replicated inline in `Layout.astro` lines 557–635. |
| 10. `Ticker.astro` | 6,262 bytes | Dynamic live announcements ticker with backend API fetch and marquee animation. | **Duplicated**: Replicated inline in `Layout.astro` lines 669–705 & 1250–1292. |

*Note*: The original request references 9 shared components. Counting the top-level shared components (`Header`, `Footer`, `PageHeader`, `PageNav`, `TableWrapper`, `DocumentList`, `Icon`, `Breadcrumb`, `AccessibilityBar`/`Ticker`), all 10 files in `components/` are accounted for.

---

## 2. Logic Chain

1. **Premise 1 (Build Integrity)**: The baseline build completed with 0 errors (`Server built in 5.58s`, code `0`). Any foundation standardization changes must not introduce build breakages, new packages, or syntax errors.
2. **Premise 2 (Table Standardization)**: 
   - Observation: Requirement R1 mandates `th` as `text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50 px-4 py-3` and `td` as `text-sm text-slate-700 px-4 py-3 align-top leading-snug`.
   - Observation: `global.css` lines 873–910 style `.table-data th` as dark blue `#0B3B60` with white text and `.table-data td` with `padding: 0.65rem 0.85rem` and `vertical-align: middle`.
   - Deduction: Replacing lines 873–910 in `global.css` with R1 classes will immediately bring all 14+ public pages using `.table-data` into compliance without breaking page markup.
   - Deduction: `.admin-table` must be separated from `.table-data` in `global.css` so admin views (governed by R5 non-destructive constraints) maintain their styling.
3. **Premise 3 (Table Overflow)**:
   - Observation: `TableWrapper.astro` line 91 uses `@media (max-width: 768px) { .table-scroll { overflow-x: auto; } }` and sets desktop `.table-scroll` to `overflow: hidden`.
   - Deduction: On desktop screens (e.g. 1024px or 1280px), tables with many columns (such as power station specs or tender matrices) will be truncated without scroll capability.
   - Conclusion: `.table-scroll` in `TableWrapper.astro` must have `overflow-x: auto;` unconditionally across all screen sizes.
4. **Premise 4 (Search Focus State)**:
   - Observation: Requirement R1 requires "header search form highlights on focus via `:focus-within`".
   - Observation: Both `Layout.astro` line 641 and `Header.astro` line 48 set `ring-0 focus-within:ring-0 outline-none focus-within:outline-none`.
   - Deduction: Suppressing rings prevents clear focus feedback.
   - Conclusion: Replacing `focus-within:ring-0` with `focus-within:ring-2 focus-within:ring-[#0B3B60]/25` and `focus-within:border-[#0B3B60]` in both `Layout.astro` and `Header.astro` provides the required visual focus highlight while satisfying WCAG 2.1 AA.
5. **Premise 5 (Layout Overflow & Header Synchronization)**:
   - Observation: `Layout.astro` inlines header markup instead of rendering `<Header />`.
   - Deduction: Changes made solely to `Header.astro` will NOT take effect on public pages unless `Layout.astro` is updated (or refactored to consume `<Header />`). To avoid regressions while maintaining existing routing logic, both files must be synchronized.
   - Observation: Negative margins on `.page-header-band` (`-2rem -1rem` up to `-2rem -2rem`) can trigger horizontal page overflow if body allows horizontal scroll.
   - Conclusion: Adding `overflow-x-clip` to `body` in `Layout.astro` reliably confines horizontal scroll to designated `.table-wrapper` and `.nav-scroll-container` elements.

---

## 3. Caveats

1. **H1 Color in Page Header Band**:
   - Requirement R1 specifies: `H1 (page title in page-header-band) = text-2xl font-bold text-[#0B3B60]`.
   - However, all 40 public pages render `.page-header-band` with a dark blue gradient background (`linear-gradient(135deg, #0B3B60 0%, #134E6F 40%, #0B3B60 100%)`). Text `#0B3B60` on background `#0B3B60` would have zero contrast (failing WCAG 2.1 AA).
   - In `.page-header-band`, the H1 is currently white text (`color: #ffffff;`). The `text-[#0B3B60]` token applies when H1 is used on light backgrounds (page body, card headers, or light header variants).
2. **Admin Tables Protection (R5)**:
   - Admin files (`website/src/pages/admin/*`) must not be modified. `global.css` lines 863–953 currently group `.table-data` and `.admin-table` together. Separating `.table-data` from `.admin-table` is essential so that public table standardization does not alter admin portal views.
3. **`Header.astro` vs `Layout.astro` Composition**:
   - Because `Layout.astro` contains bespoke server-side active route logic (`isSectionActive()`), directly replacing lines 520–890 with `<Header />` could risk breaking SSR active-state props unless carefully matched. Synchronizing both `Layout.astro` (active in production) and `Header.astro` ensures full consistency without risking regression.

---

## 4. Conclusion & Actionable Implementation Plan

### 4.1 Required Changes in `website/src/styles/global.css`

1. **Add Missing Design Tokens in `@theme`**:
   - Add Action blue: `--color-brand-action: #0B4F9C;`
   - Update `--color-brand-text: #1E293B;` (`slate-800`)
   - Update `--color-brand-border: #E2E8F0;` (`slate-200`)
   - Ensure `--color-brand-bg-page: #F8FAFC;` (`slate-50`)
2. **Standardize `.table-data`**:
   - Decouple `.table-data` from `.admin-table`.
   - Update `.table-data thead th, .table-data th`:
     ```css
     .table-data thead th,
     .table-data th {
       background-color: #F8FAFC; /* bg-slate-50 */
       color: #475569;            /* text-slate-600 */
       font-size: 0.75rem;        /* text-xs */
       font-weight: 600;          /* font-semibold */
       text-transform: uppercase; /* uppercase */
       letter-spacing: 0.05em;    /* tracking-wider */
       padding: 0.75rem 1rem;     /* px-4 py-3 */
       border-bottom: 1px solid #E2E8F0;
       vertical-align: middle;
       white-space: nowrap;
       user-select: none;
     }
     ```
   - Update `.table-data tbody td, .table-data td`:
     ```css
     .table-data tbody td,
     .table-data td {
       padding: 0.75rem 1rem;     /* px-4 py-3 */
       border-bottom: 1px solid #E2E8F0;
       color: #334155;            /* text-slate-700 */
       font-size: 0.875rem;       /* text-sm */
       vertical-align: top;       /* align-top */
       line-height: 1.375;        /* leading-snug */
       word-break: normal;
       overflow-wrap: break-word;
     }
     ```
   - Retain `.table-data tbody tr:hover { background-color: #F1F5F9 !important; }` for scannability.
3. **Typography Helper Utilities**:
   - Provide standard classes:
     - `.heading-h1`: `font-size: 1.5rem; font-weight: 700; color: #0B3B60; line-height: 1.25;`
     - `.heading-h2`: `font-size: 1.25rem; font-weight: 700; color: #1E293B; line-height: 1.3;`
     - `.heading-h3`: `font-size: 1rem; font-weight: 600; color: #1E293B; line-height: 1.4;`
     - `.text-body-std`: `font-size: 0.875rem; color: #334155; line-height: 1.625;`
     - `.text-caption-std`: `font-size: 0.75rem; color: #64748B;`

### 4.2 Required Changes in `website/src/layouts/Layout.astro`

1. **Body Horizontal Overflow**:
   - Line 505: Add `overflow-x-clip` to body class:
     `class="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans transition-colors duration-150 overflow-x-clip"`
2. **Header Search Focus State**:
   - Line 641: Change search container class from:
     `focus-within:border-[#0B3B60] rounded-lg pl-2.5 pr-1 py-0.5 transition-all duration-150 shadow-2xs outline-none focus-within:outline-none ring-0 focus-within:ring-0`
     to:
     `focus-within:border-[#0B3B60] focus-within:ring-2 focus-within:ring-[#0B3B60]/25 rounded-lg pl-2.5 pr-1 py-0.5 transition-all duration-150 shadow-2xs outline-none`
3. **Fix API Search Autocomplete Bug**:
   - Line 1119: Correct `'window.__API_BASE__/api/projects'` to use dynamic URL:
     `var projectsRes = await fetch((window.__API_BASE__ || '') + '/api/projects');`

### 4.3 Required Changes in `website/src/components/Header.astro`

1. **Synchronize Header Search Focus State**:
   - Line 48: Add `focus-within:ring-2 focus-within:ring-[#0B3B60]/25` and remove `focus-within:ring-0`.
2. **Fix API Search Autocomplete Bug**:
   - Line 251: Replace literal string `'window.__API_BASE__/api/projects'` with `(window.__API_BASE__ || '') + '/api/projects'`.

### 4.4 Required Changes in `website/src/components/TableWrapper.astro`

1. **Horizontal Scroll Fix**:
   - Line 56: Change `.table-scroll` to have `overflow-x: auto; -webkit-overflow-scrolling: touch;` on all viewports, removing the 768px restriction.

---

## 5. Verification Method

To independently verify all findings and validate future implementations:

1. **Compilation Check**:
   ```powershell
   npm --prefix website run build
   ```
   *Expected outcome*: Exit code 0, 0 errors, all server routes generated in `website/dist/`.

2. **CSS Token & Table Style Verification**:
   Inspect `website/src/styles/global.css`:
   - Search for `.table-data thead th` and verify `background-color: #F8FAFC`, `color: #475569`, `padding: 0.75rem 1rem`.
   - Search for `.table-data tbody td` and verify `font-size: 0.875rem`, `color: #334155`, `vertical-align: top`.

3. **Header Search Focus Verification**:
   Inspect `website/src/layouts/Layout.astro` (line 641) and `website/src/components/Header.astro` (line 48):
   - Confirm `focus-within:ring-2` and `focus-within:ring-[#0B3B60]/25` are present.
   - Confirm `focus-within:ring-0` is eliminated.

4. **TableWrapper Overflow Verification**:
   Inspect `website/src/components/TableWrapper.astro`:
   - Confirm `.table-scroll` includes `overflow-x: auto;` globally, not restricted to `@media (max-width: 768px)`.

5. **Invalidation Conditions**:
   - If any change causes `npm --prefix website run build` to fail.
   - If any changes are committed to `website/src/pages/admin/` or `backend/`.
