# Architecture

The application follows a modular architecture where each feature is isolated, reusable, and predictable. The goal is to reduce ambiguity for both humans and agents, and to prevent hallucinated behavior, invented content, or unnecessary design drift.

## Scope of the Application

The application must represent only the approved site structure and approved content areas below. Do not invent new sections, rename sections without approval, or add unrelated modules.

### Approved Top-Level Sections

* Home
* About Us
* Our Business
* Stakeholders
* Commercial
* Sustainability
* Media

### Approved Nested Content Structure

#### About Us

* Explore

  * Overview
  * Vision
  * Mission
  * Profile
  * Objectives
  * Organization Chart
  * Roles & Responsibility
  * Phone No. of Sr. Executives
  * Code of Business Conduct & Ethics
  * Memorandum and Articles of Association
* Management

  * Board of Directors
  * Committee of Directors
* Others

  * Honours & Awards
  * Contact

#### Our Business

* Power Stations
* Construction Projects
* Under Development Projects
* Joint Venture / Subsidiary-Projects
* Deposit / Turnkey
* Consultancy
* Joint Venture/Subsidiary Companies

#### Stakeholders

* Investors

  * Chairman’s Statement
  * Financial Results
  * Announcement
  * Annual Reports
  * More
  * MOU signed with MOP
* Vendors

  * Startups/MSME Corner
  * Vendor Portal
  * Tender & Bids
  * Online Payment
  * CLPM Portal

#### Commercial

* Overview
* Power Trading Cell
* Contact
* Applicable Laws and Regulation
* Beneficiaries
* Revenue Realisation
* Operating Power Stations
* Tariff
* Billing
* Tariff Petitions
* Commercial Notices

#### Sustainability

* Environment

  * Preamble
  * Key Areas
  * Six Monthly Reports
  * R&R Initiative
  * Events
  * Environmental Clearance
  * Corporate Environment Policy
* CSR

  * Overview
  * CSR Policy
  * CSR Communication Policy
  * Selection of CSR Projects
  * Guidelines
  * CSR Plan/Activity
  * CSR Activities Reports
  * Honours & Awards
  * Forms & Formats
* ESG/BRSR

  * Policies
  * Sustainability Report

#### Media

* Press Release
* Gallery

  * Video Gallery
  * Photo Gallery
* Downloads

  * NHPC Corporate Booklet
* Photo Gallery items

  * New Year 2023
  * Swacchta Pakhwada
  * Annual General Meeting
  * Raising Day
  * 2026 event galleries

---

## General Principles

* Keep components small and focused.
* Prefer composition over duplication.
* Separate presentation from business logic.
* Keep pages lightweight.
* Avoid tightly coupled modules.
* Do not introduce features that are not explicitly requested or documented.
* Do not infer missing business content.
* When information is incomplete, preserve the existing structure and wait for source-approved content.

---

## Frontend

### Technology

* Astro
* TypeScript
* Tailwind CSS

### Guidelines

* Use Astro Islands only where interactivity is required.
* Prefer server-rendered content.
* Minimize client-side JavaScript.
* Use TypeScript for all application code.
* Avoid inline JavaScript unless necessary.
* Do not create UI sections that are not part of the approved site structure.
* Preserve the approved navigation hierarchy exactly as documented above.

---

## Backend

### Technology

* NestJS
* Prisma
* PostgreSQL

### Guidelines

* Use feature-based modules.
* Keep controllers thin.
* Place business logic inside services.
* Validate every request.
* Never expose database models directly.
* Do not create undocumented endpoints.
* Do not return guessed or fabricated content.
* Ensure backend data maps only to approved site content and approved structures.

---

## Components

Components should:

* Have a single responsibility.
* Be reusable.
* Accept typed props.
* Avoid unnecessary state.
* Avoid duplicate logic.
* Mirror the approved navigation and content structure.

If a component grows too large, split it into smaller components.

Do not create generic placeholder sections when a real approved section exists.

---

## Styling

### Rules

* Use Tailwind CSS.
* Reuse utility classes.
* Avoid custom CSS unless required.
* Keep spacing consistent.
* Follow the design system.
* Never use inline styles unless absolutely necessary.
* Do not style in a way that changes the approved information hierarchy.

---

## TypeScript

Always:

* Enable strict typing.
* Avoid `any`.
* Prefer interfaces for shared models.
* Use enums only when appropriate.
* Keep types reusable.
* Use types that reflect real approved content, not inferred or invented structures.

---

## API Design

* Follow REST principles.
* Use meaningful endpoint names.
* Return consistent responses.
* Validate all inputs.
* Handle errors gracefully.
* Keep APIs aligned with the approved site navigation and content model.
* Do not add speculative endpoints.

---

## Error Handling

Never expose internal errors.

Always:

* Log server errors.
* Return user-friendly messages.
* Use proper HTTP status codes.
* Fail safely when content is missing or invalid.
* Avoid fallback behavior that invents data.

---

## Security

Security is mandatory.

Always:

* Validate input.
* Sanitize output.
* Protect against OWASP Top 10.
* Never trust client input.
* Keep secrets outside the repository.
* Avoid exposing internal structure, credentials, or private implementation details.

---

## Performance

Performance should be considered from the beginning.

Prefer:

* Static rendering
* Lazy loading
* Optimized images
* Minimal JavaScript
* Code splitting
* Efficient database queries

Avoid unnecessary runtime logic that could slow down content delivery.

---

## Accessibility

Accessibility is a core requirement.

Every page must:

* Use semantic HTML.
* Support keyboard navigation.
* Include proper heading hierarchy.
* Provide alt text for images.
* Maintain sufficient color contrast.
* Include accessible form labels.

Refer to `GIGW.md` for detailed accessibility requirements.

---

## Documentation

When adding a significant feature:

* Update documentation if required.
* Keep comments meaningful.
* Remove obsolete code.
* Avoid dead code.
* Keep the architecture document aligned with the implemented structure.

Documentation must always reflect the approved content hierarchy and not introduce undocumented sections.

---

## Dependencies

Before adding a new dependency, verify that it:

* Solves a real problem.
* Is actively maintained.
* Has acceptable security.
* Does not duplicate existing functionality.

Prefer native platform features whenever practical.

---

## Code Reviews

Every change should aim to improve:

* Readability
* Maintainability
* Accessibility
* Performance
* Security

Avoid introducing unnecessary complexity.
Avoid hallucinated UI, fake content, or unapproved structure changes.

---

## Agent Safety Rules

These rules are mandatory for any agent or automation working on this project:

* Use only the approved sections and nested items listed in this file.
* Do not invent new pages, menu items, labels, or content blocks.
* Do not rename approved items unless explicitly instructed.
* Do not reorder content unless the source structure requires it.
* Do not infer missing text, missing links, or missing metadata.
* When data is unavailable, leave the field empty or preserve the source structure.
* Prefer exact source fidelity over creative interpretation.
* Treat this document as the source of truth for structure and navigation.

If an agent is unsure about any content, it must stop and preserve the existing structure instead of guessing.
