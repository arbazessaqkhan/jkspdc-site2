# JKSPDC Web Platform

This repository contains the official web platform for the Jammu & Kashmir State Power Development Corporation (JKSPDC).

The platform is designed in accordance with the Guidelines for Indian Government Websites (GIGW) 3.0, WCAG 2.2 AA accessibility standards, and CERT-In secure application standards.

## Project Structure

*   `website/`: The public-facing citizen portal, built with **Astro** (static site generation with hydration as needed) and **Tailwind CSS**.
*   `backend/`: The administrative API server, built with **NestJS**, **Prisma ORM**, and **PostgreSQL**.
*   `admin/`: The administrative management interface.
*   `docs/`: Design documentation, guidelines, architectures, and approved source materials:
    *   [PROJECT.md](file:///d:/jkspdc/docs/PROJECT.md): General project vision, tech stack, and scope.
    *   [ARCHITECTURE.md](file:///d:/jkspdc/docs/ARCHITECTURE.md): The absolute source of truth for site sections and page routing.
    *   [GIGW.md](file:///d:/jkspdc/docs/GIGW.md): Accessibility standards, citizen service rules, and verification checklists.
    *   [AGENTS.md](file:///d:/jkspdc/docs/AGENTS.md): Strict development rules and safety workflows that AI agents must execute.
    *   [TASKS.md](file:///d:/jkspdc/docs/TASKS.md): Project roadmap divided by development phases.

## Getting Started

Refer to the pre-development checklist artifact for required installations, tools, configurations, and baseline documentation targets before initializing development.
