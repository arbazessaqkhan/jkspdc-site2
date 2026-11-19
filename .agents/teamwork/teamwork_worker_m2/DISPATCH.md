# DISPATCH: Worker 2 (Milestone 2 - Contact Us and Feedback Page Refinements)

## Working Directory
`d:\jkspdc-main-site\website\src\`

## Mandatory Inputs to Read
1. `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read before starting)
2. `d:\jkspdc-main-site\.agents\teamwork\PROJECT.md`
3. `d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`

## Exclusive File Ownership
You own and may ONLY modify:
- `website/src/pages/about-us/others/contact.astro`
- `website/src/pages/feedback.astro`

You MUST NOT touch any other files (no other pages, no layout, no global.css, no backend, no package.json).

## Implementation Scope
1. **`website/src/pages/about-us/others/contact.astro`**:
   - Locate and remove Section 4 (Citizen Feedback & Inquiries Callout Banner, approx. lines 394–411) including "Submit General Inquiry / Feedback" button and its enclosing container.
   - Locate and remove Section 5 (Portal Support & Citizen Information, approx. lines 413–474) containing:
     - "Website Help & Support" card (lines 423–439)
     - "RTI Disclosures" card (lines 441–457)
     - "Official Working Hours" card (lines 459–472)
     - Section 5 heading container (lines 413–420)
   - PRESERVE INTACT:
     - All Srinagar Corporate Office info (address, phone, fax, email, map button, map iframe).
     - All Jammu Camp Office info (address, phone, fax, email, map button, map iframe).
     - Corporate Office Contacts table and fallback seed data.
     - Wing Contacts table and fallback seed data.
2. **`website/src/pages/feedback.astro`**:
   - Move the "Official Working Hours" info/card from Contact Us to Feedback in a suitable position matching the page design.
   - Specifically, insert an "Official Working Hours" card inside the right sidebar `<aside class="space-y-5">` (around line 189), matching the existing sidebar card visual style (`bg-white rounded-xl border border-slate-200 p-5 shadow-xs`).
   - Use the icon `clock`, title `Official Working Hours`, and keep the working hours text UNCHANGED:
     `working hrs are from 9.30 am to 5.30 pm from monday to friday`
   - Include the badge `Official Government Timings`.

## Mandatory Verification Command
From workspace root `d:\jkspdc-main-site`:
`npm --prefix website run build`
Must succeed with zero errors.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Requirements
Write your detailed report to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m2\handoff.md`
Report files modified, diff summary, build command and output. Send message to orchestrator upon completion.


## 2026-11-13T01:59:18Z
You are Worker 2 (Contact & Feedback Worker for Milestone 2).
You MUST read `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` before starting work.
Read your instructions in `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m2\DISPATCH.md`.
Read Explorer 2's report in `d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`.

Your write scope is EXCLUSIVELY:
- `website/src/pages/about-us/others/contact.astro`
- `website/src/pages/feedback.astro`

Tasks:
1. In `website/src/pages/about-us/others/contact.astro`:
   - Remove Section 4 ("Submit General Inquiry / Feedback" callout banner, lines 394–411) and its cards immediately below it.
   - Remove "Website Help & Support" card.
   - Remove "RTI Disclosure" card.
   - Remove Section 5 container/heading (lines 413–474).
   - PRESERVE INTACT: Srinagar & Jammu corporate offices, addresses, phone numbers, emails, map buttons/iframes, Corporate Office Contacts table, and Wing Contacts table.
2. In `website/src/pages/feedback.astro`:
   - Move the "Official Working Hours" info/card from Contact Us to Feedback in the right sidebar `<aside class="space-y-5">`.
   - Keep working hours text UNCHANGED: "working hrs are from 9.30 am to 5.30 pm from monday to friday".
   - Include the badge "Official Government Timings".

Verification: Run `npm --prefix website run build` from `d:\jkspdc-main-site`. Must pass with zero errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your handoff report to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m2\handoff.md`
When done, send a message to orchestrator with your results.
