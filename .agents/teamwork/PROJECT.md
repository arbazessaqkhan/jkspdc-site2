# Project: JKSPDC Public Website UI/UX Consistency & Refinement

## Architecture
- **Framework**: Astro 7.4.10 + Tailwind CSS v4 + TypeScript
- **Rendering Model**: Static Generation / SSR via `@astrojs/node`
- **Design System Tokens**:
  - Primary dark blue: `#0B3B60`
  - Action blue: `#0B4F9C`
  - Light accent: `#52B5E8`
  - Text primary: `slate-800` (`#1e293b`)
  - Text secondary: `slate-600` (`#475569`)
  - Text muted: `slate-500` (`#64748b`)
  - Background page: `slate-50` (`#f8fafc`)
  - Background card: `white` (`#ffffff`)
  - Border standard: `slate-200` (`#e2e8f0`)
- **Typography Scale**:
  - H1 (page title in page-header-band): `text-2xl font-bold text-[#0B3B60]`
  - H2: `text-xl font-bold`
  - H3: `text-base font-semibold`
  - Body: `text-sm text-slate-700 leading-relaxed`
  - Caption: `text-xs text-slate-500`
- **Table System (`.table-data`)**:
  - `th`: `text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50 px-4 py-3`
  - `td`: `text-sm text-slate-700 px-4 py-3 align-top leading-snug`
  - Wrapper: `overflow-x-auto` without fixed height clipping or desktop suppression.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Global Tokens & Color Palette | Define brand tokens in `global.css` (@theme) matching specification | M1 | R1, Survey 1 |
| 2 | Table System Standardization | Decouple `.table-data` in `global.css`, apply slate-50/slate-600 header and slate-700 td styling | M1 | R1, Survey 1 |
| 3 | Table Wrapper Overflow | Remove desktop `overflow: hidden` in `TableWrapper.astro` and ensure fluid `overflow-x-auto` | M1 | R1, Survey 1 |
| 4 | Header Search Focus Highlighting | Implement active `:focus-within` ring (`focus-within:ring-2 focus-within:ring-[#0B4F9C] focus-within:border-[#0B4F9C]`) in `Layout.astro` and `Header.astro` | M1 | R1, Survey 1 |
| 5 | Layout Overflow Handling | Prevent document horizontal scroll jitter via `overflow-x-clip` on `body` in `Layout.astro` | M1 | R1, Survey 1 |
| 6 | Shared Components Consistency | Align `Footer.astro`, `PageHeader.astro`, `PageNav.astro`, `DocumentList.astro`, `Icon.astro` with design tokens | M1 | R1, Survey 1 |
| 7 | Contact Us Inquiry Section Removal | Remove "Submit General Inquiry/Feedback" callout banner and cards immediately below it in `about-us/others/contact.astro` | M2 | R2, Survey 2 |
| 8 | Contact Us Help & RTI Card Removal | Remove "Website Help & Support" card and "RTI Disclosure" card in `contact.astro` | M2 | R2, Survey 2 |
| 9 | Contact Us Data & Tables Preservation | Keep Srinagar & Jammu office info, phones, emails, map buttons/embeds, and both official contact tables intact | M2 | R2, Survey 2 |
| 10 | Feedback Working Hours Relocation | Move "Official Working Hours" card to sidebar in `feedback.astro` preserving verbatim text | M2 | R2, Survey 2 |
| 11 | Dignitaries Profile Card Dimensions | Ensure undistorted aspect ratios via `w-36 h-36 rounded-full overflow-hidden object-cover object-top` | M3 | R3, Survey 2 |
| 12 | Dignitaries Heading Hierarchy | Fix duplicate `<h1>` in dynamic route `[id].astro` and all 4 static dignitary pages | M3 | R3, Survey 2, 3 |
| 13 | Dignitaries Typography Standardization | Set prominent name (`#0B4F9C` or `#0B3B60`), secondary designation badge, and `text-slate-700` body bio | M3 | R3, Survey 2 |
| 14 | Project Portfolio Visual Hierarchy | Clear distinction for project name, capacity, location, and status badges in `our-business/*.astro` | M3 | R3, Survey 2 |
| 15 | Index Homepage Semantic H1 | Add compliant `<h1>` element on `index.astro` for WCAG 2.1 AA | M4 | R4, Survey 3 |
| 16 | Navigate the Corporation Cards | Standardize quick-access cards on `index.astro` with consistent dimensions, padding, icons, and safe arrow alignment | M4 | R4, Survey 3 |
| 17 | Gallery Image Grid & Aspect Ratios | Standardize gallery cards in `media/gallery.astro` with `aspect-[4/3]` and eliminate double-padding bug | M4 | R4, Survey 3 |
| 18 | Gallery Lightbox Keyboard Accessibility | Implement focus trapping (`Tab`), initial focus shift to close button, and focus restoration upon modal close | M4 | R4, Survey 3 |
| 19 | Public Pages Typography & Token Cleanup | Replace remaining legacy `gray-*` tokens with `slate-*` (notably in `help.astro`) across public pages | M4 | R4, Survey 3 |
| 20 | Full Build & Integrity Verification | Pass `npm --prefix website run build` with zero errors and pass Forensic Integrity Audit | M5 | R5, All Surveys |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Global Foundation & Design System | `global.css`, `Layout.astro`, `components/*` | None | DONE |
| M2 | Contact Us & Feedback Refinements | `contact.astro`, `feedback.astro` | None | DONE |
| M3 | Dignitaries & Project Portfolios | `dignitaries/*.astro`, `our-business/*.astro` | M1 | DONE |
| M4 | Gallery, Navigation & Public Pages | `index.astro`, `gallery.astro`, `help.astro` | M1 | DONE |
| M5 | Final E2E Verification & Audit | All modified pages, build test, forensic audit | M1, M2, M3, M4 | DONE |

## Code Layout & Write Boundaries
- **M1 Worker**: Owns `website/src/styles/global.css`, `website/src/layouts/Layout.astro`, `website/src/components/*`
- **M2 Worker**: Owns `website/src/pages/about-us/others/contact.astro`, `website/src/pages/feedback.astro`
- **M3 Worker**: Owns `website/src/pages/dignitaries/*.astro`, `website/src/pages/our-business/*.astro`
- **M4 Worker**: Owns `website/src/pages/index.astro`, `website/src/pages/media/gallery.astro`, `website/src/pages/help.astro`
- **Protected Files (Strict Read-Only / Zero Modification)**:
  - `website/src/pages/admin/*`
  - `backend/src/auth/*`
  - `backend/test/*`
  - `backend/prisma/*`
  - `package.json`

## Interface Contracts
### Design Tokens ↔ Page Templates
- All headers (`th`) must use `.table-data th` or explicit classes `text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50 px-4 py-3`.
- All table cells (`td`) must use `.table-data td` or explicit classes `text-sm text-slate-700 px-4 py-3 align-top leading-snug`.
- Backgrounds must alternate between `bg-slate-50` and `bg-white`.
- Focus indicators must be prominent with `ring-2 ring-[#0B4F9C]` and visible contrast.
