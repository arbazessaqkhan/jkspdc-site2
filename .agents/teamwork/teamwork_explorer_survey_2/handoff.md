# Explorer 2 Handoff Report: Contact Us & Feedback, Dignitaries, and Project Portfolios

## 1. Observation

Direct examination of the workspace files yielded the following verified findings:

### A. Contact Us & Feedback Pages

#### 1. `website/src/pages/about-us/others/contact.astro`
- **Total lines**: 477 lines.
- **Section 1: Corporate Offices & Interactive Maps** (Lines 199–286):
  - Srinagar Corporate Office (Lines 202–242): Address: *"PDD Building, Exhibition Grounds, Opposite High Court, Jahangir Chowk, Srinagar (J&K)."*, PIN: 190009, Phone: 0194-2483783, Fax: 0194-2451665, Email: `md-jkspdcl@jk.gov.in`, Google Maps button link and embedded `iframe` (Lines 233–240).
  - Jammu Camp Office (Lines 244–284): Address: *"Ashok Nagar, Satwari, Jammu (J&K)."*, PIN: 180004, Phone: 0191-2430548, Fax: 0191-2435403, Email: `md-jkspdcl@jk.gov.in`, Google Maps button link and embedded `iframe` (Lines 275–282).
- **Section 2: Corporate Office Contacts Table** (Lines 288–344):
  - Heading banner: `CORPORATE OFFICE` (`bg-[#0B4F9C] text-white`).
  - Table: `.table-wrapper` and `.table-data` rendering dynamic `officialContacts` array with fallback seed data. Columns: `Name of the Official with designation`, `Corporate office, Srinagar`, `Corporate office, Jammu`.
- **Section 3: Wing Contacts Table** (Lines 346–392):
  - Heading banner: `Wing Contacts` (`bg-[#0B4F9C] text-white`).
  - Table: `.table-wrapper` and `.table-data` rendering dynamic `wingContacts` array with fallback seed data. Columns: `Wing`, `Official with designation`, `Phone`.
- **Section 4: Citizen Feedback & Inquiries Callout Banner** (Lines 394–411):
  ```astro
  <!-- Section 4: Citizen Feedback & Inquiries Callout Banner -->
  <section class="mt-8 mb-10 p-5 rounded-lg bg-[#EAF4FF] border border-[#0B4F9C]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
    <div class="flex items-center gap-3.5">
      <div class="w-11 h-11 rounded-full bg-[#0B4F9C] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
        <Icon name="mail" size={22} strokeWidth={2.2} />
      </div>
      <div>
        <h2 class="text-sm sm:text-base font-bold text-[#0B4F9C]">Have a General Query, Grievance, or Corporate Inquiry?</h2>
        <p class="text-xs sm:text-sm text-slate-700 mt-0.5">Submit citizen queries, public grievances, or general administrative feedback through our online portal.</p>
      </div>
    </div>
    <a 
      href="/feedback" 
      class="px-5 py-2.5 bg-[#0B4F9C] hover:bg-[#084A8F] text-white rounded text-xs sm:text-sm font-bold shadow-xs whitespace-nowrap transition-colors flex-shrink-0"
    >
      Submit General Inquiry / Feedback &rarr;
    </a>
  </section>
  ```
- **Section 5: Portal Support & Citizen Information** (Lines 413–474):
  - Container and Header: Lines 413–420.
  - Card 1: **"Website Help & Support"** (Lines 423–439):
    ```astro
    <!-- Card 1: Website Help & Support -->
    <div class="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        <div class="w-9 h-9 rounded-lg bg-slate-100 text-[#0B4F9C] flex items-center justify-center font-bold mb-2.5">
          <Icon name="info" size={20} />
        </div>
        <h3 class="font-bold text-slate-900 text-sm sm:text-base">Website Help &amp; Support</h3>
        <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
          Assistance with navigating portal tenders, downloads, circulars, screen reader accessibility, and font scaling options.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-100">
        <a href="/help" class="text-xs font-semibold text-[#0B4F9C] hover:underline inline-flex items-center gap-1">
          Browse Help Guide &rarr;
        </a>
      </div>
    </div>
    ```
  - Card 2: **"RTI Disclosures"** (Lines 441–457):
    ```astro
    <!-- Card 2: RTI Disclosures -->
    <div class="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        <div class="w-9 h-9 rounded-lg bg-slate-100 text-[#0B4F9C] flex items-center justify-center font-bold mb-2.5">
          <Icon name="shield-check" size={20} />
        </div>
        <h3 class="font-bold text-slate-900 text-sm sm:text-base">RTI Disclosures</h3>
        <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
          Directory of designated Public Information Officers (PIOs) and proactive Section 4(1)(b) publications.
        </p>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-100">
        <a href="/about-us/explore/rti" class="text-xs font-semibold text-[#0B4F9C] hover:underline inline-flex items-center gap-1">
          Access RTI Portal &rarr;
        </a>
      </div>
    </div>
    ```
  - Card 3: **"Official Working Hours"** (Lines 459–472):
    ```astro
    <!-- Card 3: Official Working Hours (Non-interactive static info) -->
    <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
      <div>
        <div class="w-9 h-9 rounded-lg bg-slate-100 text-[#0B4F9C] flex items-center justify-center font-bold mb-2.5">
          <Icon name="clock" size={20} />
        </div>
        <h3 class="font-bold text-slate-900 text-sm sm:text-base">Official Working Hours</h3>
        <p class="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">working hrs are from 9.30 am to 5.30 pm from monday to friday</p>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-100">
        <span class="text-[11px] font-bold text-emerald-700">Official Government Timings</span>
      </div>
    </div>
    ```

#### 2. `website/src/pages/feedback.astro`
- **Total lines**: 329 lines.
- **Layout structure**:
  - Main container: `<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">` (Line 22).
  - Main form area (Lines 24–185): `<section class="lg:col-span-2 space-y-6">` containing introduction box, `#feedback-acknowledgement` (hidden by default), and `#feedback-form-container`.
  - Right sidebar (Lines 187–204): `<aside class="space-y-5">` containing:
    - Card 1: "Privacy Notice" (Lines 189–194).
    - Card 2: "Other Ways to Reach Us" (Lines 195–202).
- **Target Placement for "Official Working Hours"**:
  - Insert directly inside `<aside class="space-y-5">` as the top card or middle card.
  - Text to preserve verbatim: `"working hrs are from 9.30 am to 5.30 pm from monday to friday"`.

---

### B. Dignitaries Pages

#### 1. Dynamic Route: `website/src/pages/dignitaries/[id].astro` (158 lines)
- Dynamic parameter fetch: Fetches by `id` from `${import.meta.env.PUBLIC_API_BASE}/api/dignitaries/${id}` with fallback search through all dignitaries.
- Layout: 2-column grid (`grid grid-cols-1 lg:grid-cols-3 gap-8`).
- Left Column (Lines 84–127):
  - Card container: `bg-white rounded-xl border border-slate-200 p-6 shadow-xs text-center`.
  - Portrait container: `w-36 h-36 rounded-full overflow-hidden bg-white mx-auto border-2 border-slate-200 shadow-xs relative flex items-center justify-center`.
  - Image: `width="144" height="144" class="w-full h-full object-cover object-top"`.
  - Fallback avatar: `bg-[#1B3A6B]` with 2-letter uppercase initials.
  - Name: `<h2 class="text-xl font-extrabold text-[#0B4F9C] mt-4 text-balance">{name}</h2>`.
  - Designation badge: `<span class="inline-block text-[10px] text-[#0B4F9C] font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded border border-slate-200">{position}</span>`.
  - Subtitle: `<p class="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-2">{subTitle}</p>`.
  - Divider: `<div class="w-12 h-0.5 bg-[#D8681B] mx-auto mt-4 rounded-full"></div>`.
  - Quick Info box: `bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700` showing IAS Batch, Education, Office Location.
- Right Column (Lines 129–154):
  - Header: `<h1 class="text-2xl font-extrabold text-[#0B4F9C] text-balance">Official Profile</h1>` (Duplicate `<h1>` on page; page band at line 73 already has `<h1>Official Profile</h1>`).
  - Section 1: Biography (`<div class="prose-gov text-sm text-slate-600 leading-relaxed space-y-3" set:html={cleanDescription} />`).
  - Section 2: Key Responsibilities (`<div class="prose-gov text-sm text-slate-600 leading-relaxed space-y-2" set:html={cleanResponsibilities} />`).

#### 2. Static Routes:
- **`website/src/pages/dignitaries/ashwani-kumar.astro`** (107 lines):
  - Dignitary: Shri Ashwani Kumar (IAS), Financial Commissioner (ACS) PDD.
  - Image: `/dignitaries/ashwani_kumar.png` (dimensions: 200 x 245 px).
  - Breadcrumb: `Home / Key Dignitaries / Shri Ashwani Kumar (IAS)`.
  - Profile card: `w-36 h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs` with `w-full h-full object-cover object-top`.
  - Heading bug: Line 20 has `<h1>Official Profile</h1>`, Line 72 also has `<h1 class="text-2xl font-extrabold text-[#0B4F9C] text-balance">Official Profile</h1>`.
  - Body text uses `text-slate-600`.
- **`website/src/pages/dignitaries/manoj-sinha.astro`** (106 lines):
  - Dignitary: Shri Manoj Sinha, Hon'ble Lieutenant Governor.
  - Image: `/dignitaries/manoj_sinha.png` (dimensions: 250 x 217 px).
  - Breadcrumb: `Home / Key Dignitaries / Shri Manoj Sinha`.
  - Profile card: `w-36 h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs` with `w-full h-full object-cover object-top`.
  - Heading bug: Line 20 has `<h1>Official Profile</h1>`, Line 72 has duplicate `<h1>`.
  - Body text uses `text-slate-600`.
- **`website/src/pages/dignitaries/omar-abdullah.astro`** (108 lines):
  - Dignitary: Shri Omar Abdullah, Hon'ble Chief Minister & Minister Incharge PDD.
  - Image: `/dignitaries/omar_abdullah.png` (dimensions: 250 x 313 px).
  - Breadcrumb: `Home / Key Dignitaries / Shri Omar Abdullah`.
  - Profile card: `w-36 h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs` with `w-full h-full object-cover object-top`.
  - Heading bug: Line 20 has `<h1>Official Profile</h1>`, Line 72 has duplicate `<h1>`.
  - Body text uses `text-slate-600`.
- **`website/src/pages/dignitaries/rahul-yadav.astro`** (107 lines):
  - Dignitary: Shri Rahul Yadav (IAS), Managing Director JKSPDC.
  - Image: `/dignitaries/rahul_yadav.jpg` (dimensions: 1024 x 916 px).
  - Breadcrumb: `Home / Key Dignitaries / Shri Rahul Yadav (IAS)`.
  - Profile card: `w-36 h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs` with `w-full h-full object-cover object-top`.
  - Heading bug: Line 20 has `<h1>Official Profile</h1>`, Line 72 has duplicate `<h1>`.
  - Body text uses `text-slate-600`.

#### 3. Image Distortion & Dimension Analysis:
- The 4 dignitary images have differing raw dimensions:
  - `ashwani_kumar.png`: 200 x 245 px (0.82 portrait)
  - `manoj_sinha.png`: 250 x 217 px (1.15 landscape)
  - `omar_abdullah.png`: 250 x 313 px (0.80 portrait)
  - `rahul_yadav.jpg`: 1024 x 916 px (1.12 landscape)
- Applying `w-36 h-36 rounded-full overflow-hidden` (144 x 144 px) alongside `class="w-full h-full object-cover object-top"` prevents distortion, squishing, or stretching across all images. `object-top` ensures proper headroom and facial framing.

---

### C. Project Portfolio Pages

#### 1. `website/src/pages/our-business/power-stations.astro` (177 lines)
- Page: Operating Power Stations.
- Displays projects grouped into:
  - Sector: State Sector, Joint Venture (JV) Sector (with total MW badge).
  - Basin: Jhelum Basin, Chenab Basin, Ravi Basin, Indus Basin (with basin total MW badge).
- Project list is rendered using `.table-wrapper` and `.table-data`.
- Table columns: `#`, `Name of Power House`, `Configuration`, `Installed Capacity`, `Design Energy`, `Commissioning`.
- Each row links to `/our-business/power-station-details?id=${p.id}`.

#### 2. `website/src/pages/our-business/construction.astro` (100 lines)
- Page: Projects Under Construction.
- Rendered using `.table-wrapper` and `.table-data`.
- Table columns: `#`, `Project Name`, `Type`, `Capacity`, `Location / River Basin`.
- Each row links to `/our-business/power-station-details?id=${p.id}`.

#### 3. `website/src/pages/our-business/under-development.astro` (100 lines)
- Page: Projects Under Development.
- Rendered using `.table-wrapper` and `.table-data`.
- Table columns: `#`, `Project Name`, `Type`, `Capacity`, `Location / River Basin`.
- Each row links to `/our-business/power-station-details?id=${p.id}`.

#### 4. `website/src/pages/our-business/power-station-details.astro` (392 lines)
- Comprehensive Infrastructure Asset Detail page:
  - Header: Sector badge (`State Sector` / `Joint Venture (JV) Sector`), River Basin badge, Status badge (`Operational` / `Under Construction` / `Upcoming`), Project Name.
  - Top Card:
    - Left: Photo container `class="w-full h-[320px] sm:h-[350px] object-cover"` inside rounded container with graceful `handleImageError` fallback.
    - Right: Technical specifications grid (`dl`): Installed Capacity, Configuration, Design Energy, Year of Commissioning, River Basin, District Location.
  - Middle Row (1:1 split):
    - Left: About Project & Overview, quick metric cards (Capacity, Basin, District, Status), Key Objectives list.
    - Right: Salient Features Specifications Matrix table (`.table-data`).
  - Bottom Row: Scheme & Site Overview technical narrative card.

#### 5. Cross-Reference: `website/src/pages/index.astro` (Lines 1113–1142)
- Home page contains an infrastructure project card grid (`#projects-grid`):
  - Project name: `font-bold text-slate-900 text-sm leading-snug group-hover:text-brand-primary`.
  - Location/Basin: `text-xs text-slate-400 mt-1`.
  - Status badge: `.status` with `.status-operational` (emerald), `.status-under-construction` (sky/blue), or `.status-upcoming` (slate/amber).
  - Specifications grid: Capacity, Units, Type, COD/Target.
  - Action link: `View Details &rarr;`.

#### 6. Cross-Reference: `website/src/pages/stakeholders/investors/ipp-projects.astro` (438 lines)
- Tabbed phase system (10 Allotment Phases) with structured table data for IPP projects.

---

## 2. Logic Chain

1. **Contact Us Simplification**:
   - Requirement R2 states: *"On `about-us/others/contact.astro`: Remove the 'Submit General Inquiry/Feedback' section and its cards immediately below it. Remove the 'Website Help & Support' card. Remove the 'RTI Disclosure' card. Keep all office contact info, addresses, phone numbers, emails, map embeds, and official contacts table intact."*
   - Direct observation of `contact.astro` reveals:
     - Section 4 (Lines 394–411) is the "Citizen Feedback & Inquiries Callout Banner" with the link `"Submit General Inquiry / Feedback ->"`.
     - Section 5 (Lines 413–474) contains exactly the three cards: Card 1 ("Website Help & Support", Lines 423–439), Card 2 ("RTI Disclosures", Lines 441–457), and Card 3 ("Official Working Hours", Lines 459–472).
     - Lines 1–392 contain only the corporate office locations, interactive Google map embeds (Srinagar & Jammu), Corporate Contacts Table, and Wing Contacts Table.
   - Therefore, deleting lines 394–474 cleanly and completely fulfills all removal instructions in R2 while preserving 100% of corporate office details, map embeds, phone numbers, and official tables.

2. **Relocation of Working Hours to Feedback Page**:
   - Requirement R2 states: *"On `feedback.astro`: Move the 'Official Working Hours' info/card from Contact Us to Feedback in a suitable position matching the page design, keeping the working hours text unchanged."*
   - Direct observation of `feedback.astro` reveals a 2-column layout with a dedicated right sidebar (`<aside class="space-y-5">`, Lines 187–204) housing institutional notices ("Privacy Notice" and "Other Ways to Reach Us").
   - Placing the "Official Working Hours" card inside `<aside class="space-y-5">` with styling consistent with the other sidebar cards (`card-static`, `sidebar-card-title`, and `Icon name="clock"`) seamlessly integrates the timing information without disrupting the main feedback submission form.
   - Preserving verbatim text: `"working hrs are from 9.30 am to 5.30 pm from monday to friday"` ensures zero semantic change.

3. **Dignitaries Page Uniformity & Image Quality**:
   - Requirement R3 states: *"Consistent profile cards with undistorted images at consistent dimensions and aspect ratios. Maintain visual hierarchy: prominent name, secondary designation, and readable body bio text without altering existing names, designations, or biographical content."*
   - Observation confirms all 5 pages (`[id].astro`, `ashwani-kumar.astro`, `manoj-sinha.astro`, `omar-abdullah.astro`, and `rahul-yadav.astro`) share a common structure:
     - Avatar container: `w-36 h-36 rounded-full overflow-hidden bg-white border-2 border-slate-200 shadow-xs`.
     - Image styling: `w-full h-full object-cover object-top`.
     - Despite different aspect ratios of raw source files (from 0.80 to 1.15), `object-cover object-top` guarantees no stretching or squishing occurs.
   - However, two inconsistencies were identified across these files:
     - **Semantic HTML hierarchy bug**: All 5 pages have a duplicate `<h1>` element (`<h1>Official Profile</h1>` in both the page header band and inside the right column). The right column heading should be converted to an `<h2>` element (`<h2 class="text-xl font-bold text-[#0B3B60]">Official Profile</h2>`).
     - **Typography tokens**: Bio text currently uses `text-slate-600`. Standardizing to `text-slate-700 leading-relaxed` per R1 tokens improves contrast and readability. In `[id].astro`, fallback avatar background `bg-[#1B3A6B]` should use token `#0B3B60`.

4. **Project Portfolio Standardization**:
   - Requirement R3 states: *"Infrastructure portfolio cards with clear hierarchy for project name, capacity, location, and status. Consistent image treatment and aspect ratios, distinguishing project attributes visually without inventing facts or data."*
   - Observation reveals that `our-business/*.astro` currently uses a tabular approach (`power-stations.astro`, `construction.astro`, `under-development.astro`), while `power-station-details.astro` and `index.astro` implement card layouts.
   - For all project displays, the visual hierarchy must strictly follow:
     - Project Name: `font-bold text-slate-900` / `text-[#0B3B60]`
     - Capacity: High prominence, highlighted with `MW` units.
     - Location & Basin: Distinct secondary typography (`text-xs text-slate-500`).
     - Status: Semantic status badge (e.g., Operational = emerald, Under Construction = blue/sky, Upcoming = slate).
     - Images in portfolio detail: Uniform aspect ratio (`aspect-[16/10]` or fixed `h-[320px] sm:h-[350px] object-cover`) with `border border-slate-200 rounded-xl overflow-hidden`.
   - All factual data (MW capacity, basins, commissioning years) must remain intact without modification.

---

## 3. Caveats

1. **Admin and Backend Routes**:
   - `website/src/pages/admin/` and backend API endpoints were strictly treated as out of scope per R5. No modifications or assumptions should be made regarding the admin editing interfaces or schema definitions.
2. **Dynamic vs Static Dignitary Routes**:
   - Dynamic route `/dignitaries/[id]` relies on the backend API `${import.meta.env.PUBLIC_API_BASE}/api/dignitaries`, but the 4 primary key dignitaries (`ashwani-kumar`, `manoj-sinha`, `omar-abdullah`, `rahul-yadav`) have dedicated static pages with comprehensive static biographies. Both dynamic and static routes must maintain identical visual styles.
3. **Build Dependency**:
   - The Astro build relies on TypeScript types. All markup adjustments must retain valid Astro/JSX syntax and closing tags.

---

## 4. Conclusion & Actionable Recommendations

### Action Plan for Implementer:

#### 1. Contact Us (`website/src/pages/about-us/others/contact.astro`):
- **Delete** lines 394–474 entirely:
  - This removes Section 4 (Citizen Feedback & Inquiries Banner, lines 394–411).
  - This removes Section 5 (Portal Support & Citizen Information card container, lines 413–474), which contains "Website Help & Support", "RTI Disclosures", and "Official Working Hours".
- **Keep intact** lines 1–392:
  - Srinagar Corporate Office & Jammu Camp Office addresses, phone, fax, emails, and interactive map iframes.
  - Corporate Office Contacts Table (all official names, positions, contact numbers).
  - Wing Contacts Table (all wing names, chief engineers, phone numbers).

#### 2. Feedback (`website/src/pages/feedback.astro`):
- **Insert** the "Official Working Hours" card inside `<aside class="space-y-5">` (at line 189, before the "Privacy Notice" card):
  ```astro
  <!-- Official Working Hours (Moved from Contact Us) -->
  <div class="card-static">
    <div class="flex items-center gap-2 mb-2">
      <div class="w-8 h-8 rounded-lg bg-blue-50 text-[#0B4F9C] flex items-center justify-center font-bold">
        <Icon name="clock" size={18} />
      </div>
      <h3 class="sidebar-card-title">Official Working Hours</h3>
    </div>
    <p class="text-xs text-slate-700 leading-relaxed font-medium">working hrs are from 9.30 am to 5.30 pm from monday to friday</p>
    <div class="mt-3 pt-2.5 border-t border-slate-100">
      <span class="text-[11px] font-bold text-emerald-700">Official Government Timings</span>
    </div>
  </div>
  ```

#### 3. Dignitaries Pages (`[id].astro`, `ashwani-kumar.astro`, `manoj-sinha.astro`, `omar-abdullah.astro`, `rahul-yadav.astro`):
- **Fix semantic hierarchy**: Change the second `<h1>Official Profile</h1>` in the right column (line 72 in static pages, line 135 in `[id].astro`) to `<h2 class="text-xl font-bold text-[#0B3B60] text-balance">Official Profile</h2>`.
- **Standardize typography tokens**:
  - Profile name: `text-xl font-bold text-[#0B3B60]`.
  - Body paragraphs: `text-sm text-slate-700 leading-relaxed`.
  - In `[id].astro`: Replace fallback background `bg-[#1B3A6B]` with `bg-[#0B3B60]`.
- **Maintain image container**: Ensure `w-36 h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs` with `w-full h-full object-cover object-top` remains unchanged to preserve distortion-free headshots.

#### 4. Project Portfolio Pages (`our-business/*.astro`):
- In `power-stations.astro`, `construction.astro`, and `under-development.astro`:
  - Ensure table styles strictly adhere to `.table-data` tokens (H3 group header `text-lg font-bold text-[#0B3B60]`, `th` `text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50`, `td` `text-sm text-slate-700 align-top`).
  - Distinguish project attributes: Project name in `font-bold text-[#0B4F9C]`, capacity prominently in `font-bold text-slate-800`, location in `text-slate-600`, and type/status in standardized pill badges.
- In `power-station-details.astro`:
  - Ensure project image container maintains `w-full h-[320px] sm:h-[350px] object-cover` with `rounded-xl border border-slate-200 overflow-hidden` to prevent layout shifts and distortion.
  - Standardize technical specifications grid and salient features matrix typography to match design tokens.

---

## 5. Verification Method

### How to independently verify:

1. **Build Verification**:
   Execute the static build command from the workspace root:
   ```powershell
   npm --prefix website run build
   ```
   **Expected result**: Exit code 0, 0 build errors.

2. **Contact Us Verification**:
   Inspect `website/src/pages/about-us/others/contact.astro`:
   - Verify lines 394–474 have been removed.
   - Verify neither `"Submit General Inquiry / Feedback"`, `"Website Help & Support"`, nor `"RTI Disclosures"` appear on `contact.astro`.
   - Verify corporate addresses, phone numbers, map embeds, and both data tables remain intact.

3. **Feedback Page Verification**:
   Inspect `website/src/pages/feedback.astro`:
   - Verify the sidebar contains the "Official Working Hours" card.
   - Search for the verbatim string: `"working hrs are from 9.30 am to 5.30 pm from monday to friday"`.

4. **Dignitaries Verification**:
   Inspect `website/src/pages/dignitaries/`:
   - Verify each of the 5 files has exactly one `<h1>` tag located in the `.page-header-band`.
   - Verify all headshot images use `object-cover object-top` inside circular containers (`w-36 h-36 rounded-full`).
   - Check rendered pages in browser to confirm zero visual stretching or distortion.

5. **Project Portfolios Verification**:
   Inspect `website/src/pages/our-business/`:
   - Verify `power-stations.astro`, `construction.astro`, `under-development.astro`, and `power-station-details.astro` follow standardized typography tokens (`#0B3B60`, `#0B4F9C`, `slate-700`, `slate-500`).
   - Verify all project data and link targets (`/our-business/power-station-details?id=...`) are preserved intact.

### Invalidation Conditions:
- If `npm --prefix website run build` fails with syntax or typing errors.
- If the working hours text in `feedback.astro` deviates from `"working hrs are from 9.30 am to 5.30 pm from monday to friday"`.
- If office contact information or map embeds on `contact.astro` are deleted or broken.
- If dignitary headshot images suffer aspect ratio distortion or multiple `<h1>` elements remain.
