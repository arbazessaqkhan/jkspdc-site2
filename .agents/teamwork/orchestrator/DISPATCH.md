# DISPATCH LOG

## 2026-11-13T01:46:14Z

The team should work in parallel where possible — one agent on global foundation (global.css, Layout.astro, shared components), other agents on page groups (dignitaries group, projects group, contact/feedback, remaining pages). Perform comprehensive UI/UX consistency and refinement of the JKSPDC (Jammu & Kashmir State Power Development Corporation Limited) government public website for production deployment, bringing 42 public pages and 9 shared components into one consistent, professional government PSU design system.

Working directory: d:\jkspdc-main-site\website\src\
Integrity mode: development

## Requirements

### R1. Global Foundation and Design System Standardization
Standardize typography tokens, table styles (`.table-data`), header search `:focus-within` container behavior, and layout overflow handling in `global.css`, `Layout.astro`, and shared components (`Header.astro`, `Footer.astro`, `PageHeader.astro`, `PageNav.astro`, `TableWrapper.astro`, `DocumentList.astro`, `Icon.astro`).
- Design tokens: Primary dark blue `#0B3B60`, Action blue `#0B4F9C`, Light accent `#52B5E8`, Text primary `slate-800` (`#1e293b`), Text secondary `slate-600` (`#475569`), Text muted `slate-500` (`#64748b`), Background page `slate-50` (`#f8fafc`), Background card `white` (`#ffffff`), Border standard `slate-200` (`#e2e8f0`).
- Typography tokens: H1 (page title in page-header-band) = `text-2xl font-bold text-[#0B3B60]`; H2 = `text-xl font-bold`; H3 = `text-base font-semibold`; body = `text-sm text-slate-700 leading-relaxed`; caption = `text-xs text-slate-500`.
- Standardize table styles (`.table-data`): `th` = `text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50 px-4 py-3`; `td` = `text-sm text-slate-700 px-4 py-3 align-top leading-snug`. Ensure no fixed row heights cut off content and tables scroll horizontally with `overflow-x-auto`.

### R2. Contact Us and Feedback Page Refinements
On `about-us/others/contact.astro`:
- Remove the "Submit General Inquiry/Feedback" section and its cards immediately below it.
- Remove the "Website Help & Support" card.
- Remove the "RTI Disclosure" card.
- Keep all office contact info, addresses, phone numbers, emails, map embeds, and official contacts table intact.
On `feedback.astro`:
- Move the "Official Working Hours" info/card from Contact Us to Feedback in a suitable position matching the page design, keeping the working hours text unchanged.

### R3. Dignitaries and Project Portfolios Standardization
Dignitaries (`dignitaries/[id].astro` and all static dignitaries pages: `ashwani-kumar.astro`, `manoj-sinha.astro`, `omar-abdullah.astro`, `rahul-yadav.astro`):
- Consistent profile cards with undistorted images at consistent dimensions and aspect ratios.
- Maintain visual hierarchy: prominent name, secondary designation, and readable body bio text without altering existing names, designations, or biographical content.
Project Portfolio (`our-business/*.astro`):
- Infrastructure portfolio cards with clear hierarchy for project name, capacity, location, and status.
- Consistent image treatment and aspect ratios, distinguishing project attributes visually without inventing facts or data.

### R4. Gallery, Navigation, and Public Pages Consistency
- Index page: Standardize cards in the "Navigate the Corporation" section with consistent dimensions, padding, icon sizes, typography, and restrained institutional styling.
- Gallery (`media/gallery.astro`): Uniform grid with consistent aspect ratios, proper captions, metadata display, and keyboard-accessible lightbox/viewer.
- All 42 public pages: Apply consistent `page-header-band` (H1 size, breadcrumb, subtitle pattern), section backgrounds (`slate-50` or `white`), body typography, card layouts, button styles, and consistent empty/error states.

### R5. Non-Destructive Scope and Technical Constraints
- Read every file before modifying it. Keep changes surgical: `global.css` for shared styles, individual pages for page-specific layouts.
- Astro + TypeScript + Tailwind CSS only; no new npm packages.
- Preserve all existing content (text, links, downloads, data). Only remove Contact Us items explicitly listed.
- Do not modify admin pages, backend, database, or MFA auth files (`backend/src/auth/*`, `backend/test/*`, `backend/prisma/*`).
- Comply with WCAG 2.1 AA accessibility standards (readable contrast, keyboard focus states, semantic headings, alt text).

## Verification Resources
- Build check: `npm --prefix website run build` (run from workspace root) to verify TypeScript compilation and static page generation.

## Acceptance Criteria

### Build and Integrity Verification
- [ ] `npm --prefix website run build` completes successfully with zero errors.
- [ ] No new npm dependencies added to `package.json`.
- [ ] No modifications made to files in `website/src/pages/admin/`, `backend/src/auth/`, `backend/test/`, or `backend/prisma/`.

### Functional and Visual Verification
- [ ] All 42 public pages and 9 shared components adhere to the standardized typography tokens and color palette.
- [ ] `about-us/others/contact.astro` does not contain the "Submit General Inquiry/Feedback" section, "Website Help & Support" card, or "RTI Disclosure" card, while all contact tables and office info remain intact.
- [ ] `feedback.astro` includes the "Official Working Hours" card with unchanged text.
- [ ] Header search form highlights on focus via `:focus-within`.
- [ ] Dignitaries profile cards feature consistent aspect-ratio images, prominent names, and secondary designations across dynamic and static routes.
- [ ] Infrastructure project cards on `our-business/*.astro` display distinct, consistent visual treatments for capacity, location, and status.
- [ ] Gallery lightbox is operable via keyboard navigation.
- [ ] A final completion report lists all pages inspected/modified, the build result, and any issues encountered.
