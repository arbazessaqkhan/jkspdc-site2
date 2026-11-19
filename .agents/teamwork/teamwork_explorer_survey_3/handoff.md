# Handoff Report: Survey of Home Navigation, Gallery & Complete 42 Public Pages Inventory

**Explorer**: Explorer 3 (Public Pages Inventory Explorer)  
**Date**: 2026-11-13T01:58:00Z  
**Recipient**: Orchestrator (`ea66745d-ae68-4133-975a-c346c695b103`)  
**Workspace**: `d:\jkspdc-main-site\website\src\`  
**Build Status**: Verified via `npm --prefix website run build` (Completed in 3.40s with zero errors)

---

## Executive Summary

An exhaustive survey of the public website was conducted, verifying exactly **42 public `.astro` pages** (excluding `admin/`) and their alignment with Requirements R1–R5.
Key discoveries include:
1. **Index Page (`website/src/pages/index.astro`)**:
   - The "Navigate the Corporation" section contains 10 quick-access cards. Current styling uses ad-hoc dimensions, hardcoded `#333333` text, hardcoded `#F4F8FB` icon containers, and absolute arrow positioning (`bottom-4 right-4`) which risks text overlap on small viewports.
   - Critically, `index.astro` **lacks an `<h1>` element entirely**, violating WCAG 2.1 AA (SC 1.3.1 & 2.4.6).
2. **Media Gallery (`website/src/pages/media/gallery.astro`)**:
   - Displays a 3-column responsive grid with fixed-height image containers (`h-64 sm:h-72`) rather than standardized aspect-ratio tokens (`aspect-[4/3]`).
   - The lightbox modal implements `Escape` closing and `ArrowLeft`/`ArrowRight` navigation, but **completely lacks keyboard focus management** (no initial focus shift to modal, no focus trap on `Tab`, no return of focus to trigger card on close).
   - Incurred double-padding layout bug: `<div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">` nested inside `<main class="... px-4 sm:px-6 lg:px-8">`.
3. **42 Public Pages Audit**:
   - Exactly 42 `.astro` files exist outside `admin/`. 40 pages render `.page-header-band`, 1 is the Home page, and 1 is a 301 server redirect (`stakeholders/investors/announcement.astro`).
   - Every single one of the 5 dignitary profile pages contains **two duplicate `<h1>` elements**, causing document outline errors.
   - 18 pages contain legacy `gray-*` and `neutral-*` Tailwind tokens instead of the standardized `slate-*` tokens (e.g. `help.astro` has 57 gray tokens).
   - All 12 pages with data tables use `.table-wrapper` and `.table-data`, but `th` styles in `global.css` use dark blue background (`#0B3B60`) with white text, contrasting with R1's requirement (`text-slate-600 bg-slate-50 px-4 py-3`).
   - Zero public pages use the shared components `<PageHeader />`, `<PageNav />`, `<TableWrapper />`, or `<DocumentList />`.

---

## 1. Observation

### 1.1 Complete 42 Public Pages Inventory Table

Every file located under `website/src/pages/` (excluding `admin/`) was cataloged, categorized, and audited across 8 architectural metrics:

| S.No | Logical Category | Route / File Path | Page Title (`Layout.astro`) | Has Band | H1 Count | Has Table | Gray Tokens | Container Class |
|:---:|:---|:---|:---|:---:|:---:|:---:|:---:|:---|
| 1 | Home / Portal Entry | `website/src/pages/index.astro` | "Home \| JKSPDC Official Portal" | ❌ | **0 (Missing)** | ❌ | 0 | `max-w-7xl mx-auto px-4 ...` (via Layout) |
| 2 | Utility & Policy | `website/src/pages/404.astro` | "Page Not Found - JKSPDC" | ✅ | 1 | ❌ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 3 | Utility & Policy | `website/src/pages/500.astro` | "Server Error - JKSPDC" | ✅ | 1 | ❌ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 4 | Utility & Policy | `website/src/pages/accessibility-statement.astro` | "Accessibility Statement - JKSPDC" | ✅ | 1 | ❌ | 8 | `space-y-0 max-w-5xl mx-auto` |
| 5 | Utility & Policy | `website/src/pages/copyright.astro` | "Copyright Policy - JKSPDC" | ✅ | 1 | ❌ | 8 | `space-y-0 max-w-5xl mx-auto` |
| 6 | Utility & Policy | `website/src/pages/disclaimer.astro` | "Disclaimer - JKSPDC" | ✅ | 1 | ❌ | 8 | `space-y-0 max-w-5xl mx-auto` |
| 7 | Citizen Services | `website/src/pages/feedback.astro` | "Feedback & Inquiries - JKSPDC" | ✅ | 1 | ❌ | 5 | `space-y-0 max-w-5xl mx-auto` |
| 8 | Utility & Policy | `website/src/pages/help.astro` | "Help & Support - JKSPDC" | ✅ | 1 | ❌ | **57** | `space-y-0 max-w-5xl mx-auto` |
| 9 | Utility & Policy | `website/src/pages/hyperlinking-policy.astro` | "Hyperlinking Policy - JKSPDC" | ✅ | 1 | ❌ | 5 | `space-y-0 max-w-5xl mx-auto` |
| 10 | Utility & Policy | `website/src/pages/notifications.astro` | "Notifications & Circulars - JKSPDC" | ✅ | 1 | ❌ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 11 | Utility & Policy | `website/src/pages/privacy-policy.astro` | "Privacy Policy - JKSPDC" | ✅ | 1 | ❌ | 14 | `space-y-0 max-w-5xl mx-auto` |
| 12 | Utility & Policy | `website/src/pages/search.astro` | "Search Results - JKSPDC" | ✅ | 1 | ❌ | 11 | `space-y-0 max-w-5xl mx-auto` |
| 13 | Utility & Policy | `website/src/pages/sitemap.astro` | "Sitemap - JKSPDC" | ✅ | 1 | ❌ | 16 | `space-y-0 max-w-5xl mx-auto` |
| 14 | Utility & Policy | `website/src/pages/terms-conditions.astro` | "Terms & Conditions - JKSPDC" | ✅ | 1 | ❌ | 11 | `space-y-0 max-w-5xl mx-auto` |
| 15 | About Us & Governance | `website/src/pages/about-us/explore/association-memorandum.astro` | "MoA & AoA - About Us" | ✅ | 1 | ❌ | 4 | `space-y-0 max-w-5xl mx-auto` |
| 16 | About Us & Governance | `website/src/pages/about-us/explore/gstin-registration.astro` | "GSTIN Registration - About Us" | ✅ | 1 | ✅ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 17 | About Us & Governance | `website/src/pages/about-us/explore/organization-chart.astro` | "Organizational Structure - About Us" | ✅ | 1 | ❌ | 0 | `space-y-0 w-full max-w-6xl mx-auto` |
| 18 | About Us & Governance | `website/src/pages/about-us/explore/overview.astro` | "Corporate Overview - About Us" | ✅ | 1 | ❌ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 19 | About Us & Governance | `website/src/pages/about-us/explore/policies.astro` | "Corporate Policies - About Us" | ✅ | 1 | ❌ | 1 | `space-y-0 max-w-5xl mx-auto` |
| 20 | About Us & Governance | `website/src/pages/about-us/explore/rti.astro` | "RTI Act (Section 4) - About Us" | ✅ | 1 | ❌ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 21 | About Us & Governance | `website/src/pages/about-us/management/board.astro` | "Board of Directors - Management" | ✅ | 1 | ✅ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 22 | About Us & Governance | `website/src/pages/about-us/others/contact.astro` | "Contact Us - Directory" | ✅ | 1 | ✅ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 23 | Dignitaries | `website/src/pages/dignitaries/ashwani-kumar.astro` | "Shri Ashwani Kumar - Key Dignitaries" | ✅ | **2 (Duplicate)** | ❌ | 1 | `space-y-0 max-w-5xl mx-auto` |
| 24 | Dignitaries | `website/src/pages/dignitaries/manoj-sinha.astro` | "Shri Manoj Sinha - Key Dignitaries" | ✅ | **2 (Duplicate)** | ❌ | 1 | `space-y-0 max-w-5xl mx-auto` |
| 25 | Dignitaries | `website/src/pages/dignitaries/omar-abdullah.astro` | "Shri Omar Abdullah - Key Dignitaries" | ✅ | **2 (Duplicate)** | ❌ | 1 | `space-y-0 max-w-5xl mx-auto` |
| 26 | Dignitaries | `website/src/pages/dignitaries/rahul-yadav.astro` | "Shri Rahul Yadav - Key Dignitaries" | ✅ | **2 (Duplicate)** | ❌ | 1 | `space-y-0 max-w-5xl mx-auto` |
| 27 | Dignitaries | `website/src/pages/dignitaries/[id].astro` | "Official Profile - Key Dignitaries" | ✅ | **2 (Duplicate)** | ❌ | 1 | `space-y-0 max-w-5xl mx-auto` |
| 28 | Media & Publications | `website/src/pages/media/downloads.astro` | "Downloads - Media" | ✅ | 1 | ❌ | 1 | `space-y-0 max-w-5xl mx-auto` |
| 29 | Media & Publications | `website/src/pages/media/gallery.astro` | "Photo & Media Gallery - Media" | ✅ | 1 | ❌ | 5 | `space-y-8 max-w-7xl mx-auto px-4 sm:px-6` |
| 30 | Our Business & Projects | `website/src/pages/our-business/construction.astro` | "Projects Under Construction" | ✅ | 1 | ✅ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 31 | Our Business & Projects | `website/src/pages/our-business/power-station-details.astro` | "{formattedTitle} - Project Details" | ✅ | 1 | ✅ | 0 | `max-w-6xl mx-auto space-y-8 pb-16` |
| 32 | Our Business & Projects | `website/src/pages/our-business/power-stations.astro` | "Operating Power Stations" | ✅ | 1 | ✅ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 33 | Our Business & Projects | `website/src/pages/our-business/under-development.astro` | "Projects Under Development" | ✅ | 1 | ✅ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 34 | Stakeholders & Tenders | `website/src/pages/stakeholders/investors/agm.astro` | "AGM - Stakeholders" | ✅ | 1 | ✅ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 35 | Stakeholders & Tenders | `website/src/pages/stakeholders/investors/announcement.astro` | (Server 301 Redirect to `/agm`) | ❌ | 0 | ❌ | 0 | N/A (3-line redirect) |
| 36 | Stakeholders & Tenders | `website/src/pages/stakeholders/investors/ipp-project-details.astro`| "IPP Project Details - Investors" | ✅ | 1 | ✅ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 37 | Stakeholders & Tenders | `website/src/pages/stakeholders/investors/ipp-projects.astro` | "IPP Projects - Investors" | ✅ | 1 | ✅ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 38 | Stakeholders & Tenders | `website/src/pages/stakeholders/investors/more.astro` | "Investor Services & Utilities" | ✅ | 1 | ❌ | 5 | `space-y-0 max-w-5xl mx-auto` |
| 39 | Stakeholders & Tenders | `website/src/pages/stakeholders/vendors/tender-bids.astro` | "Procurement & Tenders Portal" | ✅ | 1 | ❌ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 40 | Stakeholders & Tenders | `website/src/pages/stakeholders/vendors/tender-details.astro` | "{tender title} - Tender Details" | ✅ | 1 | ✅ | 0 | `space-y-0 max-w-5xl mx-auto` |
| 41 | Sustainability & CSR | `website/src/pages/sustainability/csr/overview.astro` | "CSR Overview - Sustainability" | ✅ | 1 | ❌ | 6 | `space-y-0 max-w-5xl mx-auto` |
| 42 | Sustainability & CSR | `website/src/pages/sustainability/csr/policy.astro` | "CSR Policy - Sustainability" | ✅ | 1 | ✅ | 0 | `space-y-0 max-w-5xl mx-auto` |

---

### 1.2 Detailed Inspection: `website/src/pages/index.astro` ("Navigate the Corporation")

- **Location**: Lines 1182–1212 of `website/src/pages/index.astro`.
- **Data Definition**: Lines 323–334 define `quickLinks` with 10 corporate routes:
  ```typescript
  const quickLinks = [
    { icon: "building", label: "About JKSPDC", desc: "Corporate profile & leadership", href: "/about-us/explore/overview" },
    { icon: "factory", label: "Projects", desc: "Explore power stations", href: "/our-business/power-stations" },
    { icon: "file-text", label: "Tender Portal", desc: "Live tenders & bids", href: "/stakeholders/vendors/tender-bids" },
    { icon: "scroll-text", label: "RTI", desc: "Right to Information", href: "/about-us/explore/rti" },
    { icon: "landmark", label: "Investors", desc: "AGM & IPP Projects", href: "/stakeholders/investors/agm" },
    { icon: "leaf", label: "CSR Policy", desc: "Community initiatives", href: "/sustainability/csr/policy" },
    { icon: "image", label: "Media Gallery", desc: "Photos & event coverage", href: "/media/gallery" },
    { icon: "download", label: "Downloads", desc: "Documents & forms", href: "/media/downloads" },
    { icon: "bell", label: "Notifications", desc: "Circulars & updates", href: "/notifications" },
    { icon: "eye", label: "Policies", desc: "Corporate guidelines", href: "/about-us/explore/policies" },
  ];
  ```
- **Section Enclosure**:
  - Outer: `<section aria-labelledby="quick-access-heading" class="text-left mt-8 bg-brand-bg-subtle -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 rounded-sm">`
  - Inner card: `<div class="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">`
  - Grid: `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">`
- **Card Element Analysis**:
  ```astro
  <a href={link.href} class="group relative bg-white border border-slate-200 rounded-md p-5 hover:border-sky-300 hover:bg-sky-50/40 transition-colors duration-200 overflow-hidden flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
    <div class="w-11 h-11 rounded-sm bg-[#F4F8FB] border border-slate-200 text-[#0B3B60] group-hover:bg-[#0B3B60] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors duration-200 shadow-xs group-hover:shadow-sm relative z-10">
      <Icon name={link.icon} size={22} strokeWidth={1.75} />
    </div>
    <div class="relative z-10">
      <div class="font-semibold text-[#333333] text-sm leading-snug group-hover:text-[#0B3B60] transition-colors">{link.label}</div>
      <div class="text-xs text-slate-500 mt-1 leading-relaxed">{link.desc}</div>
    </div>
    <span class="absolute bottom-4 right-4 text-brand-primary opacity-100 translate-x-0 transition-colors duration-200 text-base font-bold z-10">&rarr;</span>
  </a>
  ```
- **Discrepancies & Deficiencies**:
  1. *Typography Token Violation*: Label uses `text-[#333333]`. Design token standard requires `text-slate-800` (`#1e293b`).
  2. *Color Token Violation*: Icon box uses `bg-[#F4F8FB]`. Standard token is `bg-slate-50` (`#f8fafc`).
  3. *Border Radius Mismatch*: Icon box uses `rounded-sm` (2px), while the parent card uses `rounded-md` (6px).
  4. *Absolute Positioning Hazard*: The arrow `<span class="absolute bottom-4 right-4 ...">&rarr;</span>` is absolutely pinned. In 2-line descriptions or when browser text zoom is enabled, body text wraps directly over the arrow icon.
  5. *Hover State Inconsistency*: Card hover uses `hover:border-sky-300 hover:bg-sky-50/40`, whereas the project's standardized `card-interactive` utility in `global.css` specifies `border-color: #CBD5E1; box-shadow: var(--shadow-card-hover); transform: translateY(-2px);`.
  6. *Missing `<h1>`*: `index.astro` contains `<h2>` headings for slides, welcome, tenders, and quick access, but has **zero `<h1>` elements**.

---

### 1.3 Detailed Inspection: `website/src/pages/media/gallery.astro` & Lightbox

- **Grid Architecture**:
  - Container: `<div id="gallery-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">` (line 191).
  - Preview image wrapper: `<div class="relative w-full h-64 sm:h-72 overflow-hidden bg-slate-100">` (line 204).
  - Uses fixed pixel heights `h-64 sm:h-72` with `w-full h-full object-cover`.
- **Card Structure**:
  - Title: `<h3 class="text-base sm:text-lg font-bold text-slate-800 group-hover:text-[#0B4F9C] transition-colors leading-snug line-clamp-2">`
  - Floating Badge: `<span class="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full bg-white/95 backdrop-blur-md text-[#0B4F9C] shadow-sm border border-slate-100">`
  - Footer: Static label "JKSPDCL Media". Does not display date, event year, or location metadata.
- **Lightbox Implementation**:
  - HTML (lines 265–315):
    ```astro
    <div id="gallery-lightbox" class="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md hidden items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label="Image viewer">
      <button id="lightbox-close" ... aria-label="Close image viewer">&times;</button>
      <button id="lightbox-prev" ... aria-label="Previous photo">&#8249;</button>
      <button id="lightbox-next" ... aria-label="Next photo">&#8250;</button>
      <div class="relative max-w-5xl w-full flex flex-col items-center justify-center max-h-[92vh]">
        <img id="lightbox-img" src="" alt="" class="max-w-[88vw] max-h-[72vh] object-contain rounded-xl select-none" />
        <div id="lightbox-caption" class="mt-4 text-center max-w-2xl px-4 text-white"></div>
      </div>
    </div>
    ```
- **Accessibility & Interaction Findings**:
  - `Escape` Key: Present (line 450: `if (e.key === 'Escape') closeLightbox()`).
  - Left / Right Arrow Keys: Present (lines 451–452: triggers prev/next click).
  - Card Activation: Present (lines 414–420: handles `Enter` and `Space`).
  - **Focus Management (CRITICAL WCAG GAP)**:
    - When `openLightbox()` executes (lines 363–397), focus remains on the card in the background. Focus is not shifted to `#lightbox-close` or the modal container.
    - No Tab focus trap: pressing `Tab` while the modal is visible tabs through elements *behind* the semi-transparent overlay.
    - When `closeLightbox()` executes (lines 399–404), focus is not returned to the triggering card element (`lastActiveElement.focus()` is missing).
    - `inert` or `aria-hidden="true"` is not set on the `<main>` content container when modal is open.
- **Container Layout Bug**:
  - Line 112: `<div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">`.
  - Nested within `<main class="... px-4 sm:px-6 lg:px-8 py-8 ...">` in `Layout.astro`.
  - Creates double horizontal padding (`px-4` inside `px-4`), causing the `.page-header-band` negative margins to fail to align flush with the page margins.

---

### 1.4 Detailed Inspection: `page-header-band` Pattern & Global Typography

- **Global CSS Definition** (`website/src/styles/global.css` lines 293–390):
  ```css
  .page-header-band {
    position: relative;
    background: linear-gradient(135deg, #0B3B60 0%, #134E6F 40%, #0B3B60 100%);
    padding: 2rem 2rem 2.25rem;
    margin: -2rem -1rem 2.5rem;
    overflow: hidden;
  }
  .page-header-band h1 {
    font-family: var(--font-heading);
    font-size: 1.75rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.025em;
    line-height: 1.2;
    margin: 0;
  }
  .page-header-band .page-subtitle {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 0.5rem;
    line-height: 1.6;
    max-width: 40rem;
    font-weight: 400;
  }
  ```
- **In-Page Usage Pattern**:
  In 40 pages, the markup is repeated verbatim:
  ```astro
  <div class="page-header-band animate-fadeInUp">
    <nav class="breadcrumb-trail" aria-label="Breadcrumbs">
      <a href="/">Home</a>
      <span class="separator">/</span>
      <span>{Category}</span>
      <span class="separator">/</span>
      <span class="current">{PageName}</span>
    </nav>
    <h1>{Title}</h1>
    <p class="page-subtitle">Jammu &amp; Kashmir State Power Development Corporation Limited (JKSPDCL)</p>
  </div>
  ```
- **Discrepancy Analysis against R1**:
  - R1 specifies: `H1 (page title in page-header-band) = text-2xl font-bold text-[#0B3B60]`.
  - Current state: `.page-header-band h1` in `global.css` has `color: #ffffff` because the background is dark `#0B3B60` gradient.
  - If `text-[#0B3B60]` were directly injected into `h1` within `.page-header-band`, it would result in **dark blue on dark blue** (0.1 contrast ratio, unreadable).
  - Resolution: The `text-[#0B3B60]` token applies either to the light header variant (`.page-header-light`), or as the primary heading token outside of dark bands. For `.page-header-band`, `color: #ffffff` with `font-size: 1.5rem` (`text-2xl`) and `font-weight: 700` (`font-bold`) is the required standard.

---

### 1.5 Detailed Inspection: R2 Target Pages (Contact Us & Feedback)

1. `website/src/pages/about-us/others/contact.astro`:
   - Line 409: Contains the "Submit General Inquiry / Feedback &rarr;" CTA button and section (lines 390–412).
   - Lines 423–439: Contains "Card 1: Website Help & Support".
   - Lines 441–457: Contains "Card 2: RTI Disclosures".
   - Lines 459–472: Contains "Card 3: Official Working Hours" with text:
     `<p class="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">working hrs are from 9.30 am to 5.30 pm from monday to friday</p>`.
   - All addresses, contact tables, phone numbers, and map embeds are present.
2. `website/src/pages/feedback.astro`:
   - Contains a two-column grid (form on left 2 cols, sidebar on right 1 col).
   - Lines 188–204: Sidebar currently contains "Privacy Notice" and "Other Ways to Reach Us".
   - Does NOT yet contain the "Official Working Hours" card. The ideal destination is directly inside `<aside class="space-y-5">`.

---

## 2. Logic Chain

1. **Premise 1 (R1 & Scope Boundaries)**: Global tokens must be unified in `global.css`, `Layout.astro`, and shared components without modifying admin pages, auth files, or adding npm dependencies.
   - *Evidence*: `npm --prefix website run build` succeeds cleanly now; any modifications must maintain build integrity.
2. **Premise 2 (R4 Card Standardization on Index)**:
   - *Observation*: `index.astro:1198-1207` uses `text-[#333333]`, `bg-[#F4F8FB]`, `rounded-sm` inside `rounded-md`, and absolute bottom right arrow.
   - *Deduction*: Standardizing to `text-slate-800`, `bg-slate-50`, consistent border radius (`rounded-md`), and inline flex alignment for the arrow will eliminate visual glitches, ensure WCAG contrast, and conform to the institutional PSU styling.
3. **Premise 3 (R4 Lightbox Accessibility on Gallery)**:
   - *Observation*: `gallery.astro:448-454` binds `Escape` and arrows, but does not track active element or trap `Tab`.
   - *Deduction*: Adding `focus()` on open, trapping Tab within `[lightboxClose, lightboxPrev, lightboxNext]`, and returning focus on close satisfies WCAG 2.1 AA Success Criterion 2.4.3 (Focus Order) and 2.1.2 (No Keyboard Trap).
4. **Premise 4 (Heading Integrity & WCAG 1.3.1)**:
   - *Observation*: `index.astro` has 0 `<h1>` tags; all 5 dignitary pages (`ashwani-kumar.astro`, `manoj-sinha.astro`, `omar-abdullah.astro`, `rahul-yadav.astro`, `[id].astro`) have 2 `<h1>` tags.
   - *Deduction*: Adding a visually hidden or semantic `<h1>` to `index.astro` (`<h1 class="sr-only">Jammu & Kashmir State Power Development Corporation Limited</h1>`) and demoting the second `<h1>` on dignitary pages to `<h2>` restores proper semantic document outlines across all 42 pages.
5. **Premise 5 (Token Hygiene Across 42 Pages)**:
   - *Observation*: 18 pages use `gray-*` or `neutral-*` tokens (notably `help.astro:57`, `sitemap.astro:16`, `privacy-policy.astro:14`, `sustainability/csr/overview.astro:6`). In `sustainability/csr/overview.astro:34`, `text-gray-550` is invalid Tailwind CSS.
   - *Deduction*: Replacing `gray-*` with `slate-*` aligns the entire public surface with the specified R1 design tokens (`slate-50`, `slate-200`, `slate-500`, `slate-600`, `slate-700`, `slate-800`).

---

## 3. Caveats

1. **Read-Only Investigation**: No source code files in `website/src/` were edited during this survey.
2. **Backend API Dependency**: Several pages (`notifications.astro`, `stakeholders/vendors/tender-bids.astro`, `media/downloads.astro`, `media/gallery.astro`) contain fallback static data that renders when the backend service is offline. Both backend-fed and fallback paths were examined.
3. **Admin Exemption**: All files under `website/src/pages/admin/` were intentionally excluded from this audit per R5.
4. **Redirect Route**: `website/src/pages/stakeholders/investors/announcement.astro` is a 3-line server redirect to `/stakeholders/investors/agm`. It does not require visual design system styling, but counts toward the 42 `.astro` public route inventory.

---

## 4. Conclusion & Actionable Recommendations

### 4.1 Index Page Navigation Section
- Target: `website/src/pages/index.astro:1198-1207`
- Action:
  1. Replace `text-[#333333]` with `text-slate-800`.
  2. Replace `bg-[#F4F8FB]` on icon container with `bg-slate-50 border-slate-200`.
  3. Change icon container `rounded-sm` to `rounded-md` to match parent card.
  4. Fix arrow placement: move arrow into an inline flex footer or add `pr-8` to card text container to prevent overlap.
  5. Add `<h1 class="sr-only">Jammu & Kashmir State Power Development Corporation Limited (JKSPDCL)</h1>` to `index.astro`.

### 4.2 Gallery & Lightbox Accessibility
- Target: `website/src/pages/media/gallery.astro`
- Action:
  1. Fix container double-padding: Change `<div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">` to `<div class="space-y-8 max-w-7xl mx-auto">`.
  2. Implement focus trap and focus restoration in `<script>`:
     - Record `lastTriggerElement = document.activeElement as HTMLElement`.
     - Call `lightboxClose.focus()` upon opening.
     - Add `Tab` key event handler cycling between `lightboxClose`, `lightboxPrev`, and `lightboxNext`.
     - On close, call `lastTriggerElement?.focus()`.
  3. Replace `bg-gray-50`, `border-gray-200`, `text-gray-700` in empty states with `slate-*` tokens.
  4. Add uniform aspect ratio class (e.g. `aspect-[4/3]` or `aspect-[16/9]`) to gallery preview containers.

### 4.3 Dignitaries Pages Duplicate H1 Fix
- Targets:
  - `website/src/pages/dignitaries/ashwani-kumar.astro:72`
  - `website/src/pages/dignitaries/manoj-sinha.astro:72`
  - `website/src/pages/dignitaries/omar-abdullah.astro:72`
  - `website/src/pages/dignitaries/rahul-yadav.astro:72`
  - `website/src/pages/dignitaries/[id].astro:72`
- Action: Change the second `<h1 class="text-2xl font-extrabold text-[#0B4F9C] text-balance">Official Profile</h1>` to `<h2 class="text-xl font-bold text-[#0B4F9C] text-balance">Official Profile</h2>`.

### 4.4 Contact Us & Feedback Refinements (R2)
- Target: `website/src/pages/about-us/others/contact.astro`
  - Remove Section 4 ("Submit General Inquiry / Feedback" banner, lines 390–412).
  - In Section 5 ("Help, Support & Statutory Information"), remove "Card 1: Website Help & Support" and "Card 2: RTI Disclosures".
  - Move "Card 3: Official Working Hours" (lines 459–472) to `website/src/pages/feedback.astro` inside `<aside class="space-y-5">`.
  - In `contact.astro`, adjust the grid to a single card or clean layout for remaining info.

### 4.5 Global Gray Token Clean-up
- Replace all legacy `gray-*` and `neutral-*` utility classes with `slate-*` across the 18 flagged pages, giving special priority to `help.astro` (57 tokens), `privacy-policy.astro` (14 tokens), and `sitemap.astro` (16 tokens).
- In `sustainability/csr/overview.astro:34`, fix typo `text-gray-550` to `text-slate-500`.

---

## 5. Verification Method

To independently verify all findings and validate future implementations:

1. **Build Validation**:
   ```powershell
   npm --prefix website run build
   ```
   *Expected Result*: Build completes with 0 errors.

2. **Verify Public Pages Count (Must equal 42)**:
   ```powershell
   (Get-ChildItem -Path "website/src/pages" -Filter "*.astro" -Recurse | Where-Object { $_.FullName -notmatch '\\admin(\\|$)' }).Count
   ```
   *Expected Result*: 42.

3. **Verify Heading 1 Integrity (Must equal 1 for all pages except announcement redirect)**:
   ```powershell
   Get-ChildItem -Path "website/src/pages" -Filter "*.astro" -Recurse | Where-Object { $_.FullName -notmatch '\\admin(\\|$)' } | ForEach-Object {
       $content = Get-Content -LiteralPath $_.FullName -Raw
       $c = ([regex]::Matches($content, '<h1[^>]*>')).Count
       if ($c -ne 1) { [PSCustomObject]@{ Path = $_.Name; H1Count = $c } }
   }
   ```
   *Current Result*: `index.astro` (0), `announcement.astro` (0), all 5 dignitary pages (2).

4. **Verify Legacy Gray Tokens Count**:
   ```powershell
   Get-ChildItem -Path "website/src/pages" -Filter "*.astro" -Recurse | Where-Object { $_.FullName -notmatch '\\admin(\\|$)' } | ForEach-Object {
       $matches = [regex]::Matches((Get-Content -LiteralPath $_.FullName -Raw), '(bg|text|border)-gray-[0-9]+')
       if ($matches.Count -gt 0) { [PSCustomObject]@{ Page = $_.Name; Grays = $matches.Count } }
   }
   ```
   *Current Result*: 18 files detected.
