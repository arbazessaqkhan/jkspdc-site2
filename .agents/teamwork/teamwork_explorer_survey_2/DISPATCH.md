# DISPATCH: Explorer 2 (Survey - Contact/Feedback, Dignitaries & Projects)

## Task Description
Read `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` first.
Investigate Contact Us & Feedback pages, Dignitaries pages, and Project Portfolio pages.

### Target Areas
1. Contact & Feedback:
   - Inspect `website/src/pages/about-us/others/contact.astro` (or exact path).
     - Locate "Submit General Inquiry/Feedback" section and cards immediately below it.
     - Locate "Website Help & Support" card.
     - Locate "RTI Disclosure" card.
     - Locate "Official Working Hours" info/card.
     - Verify office contact info, addresses, phone numbers, emails, map embeds, and official contacts table to ensure they remain intact.
   - Inspect `website/src/pages/feedback.astro` (or exact path).
     - Analyze layout and determine optimal placement for moving "Official Working Hours" card with exact unchanged text.
2. Dignitaries:
   - Inspect `website/src/pages/dignitaries/[id].astro` (or exact path).
   - Inspect static dignitary pages:
     - `website/src/pages/dignitaries/ashwani-kumar.astro`
     - `website/src/pages/dignitaries/manoj-sinha.astro`
     - `website/src/pages/dignitaries/omar-abdullah.astro`
     - `website/src/pages/dignitaries/rahul-yadav.astro`
     (Check if they are in `dignitaries/` or `about-us/` or other directories).
   - Assess profile card structure, image dimensions/aspect ratios, visual hierarchy (name, designation, bio), distortion risks.
3. Project Portfolios:
   - Inspect all pages under `website/src/pages/our-business/` (e.g. hydro, solar, thermal, new projects, etc.).
   - Assess infrastructure portfolio cards: hierarchy for project name, capacity, location, status badge.
   - Check image treatment and aspect ratios, visual distinction of project attributes.

### Output Requirements
Write your detailed findings and actionable recommendations to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`
Report exact file paths, current markup structures, specific lines/sections to remove/relocate/update, and recommended implementation plan.
Do NOT modify source code. This is an exploration and survey task only.


## 2026-11-13T01:48:06Z
You are Explorer 2 (Dignitaries and Projects Explorer).
You MUST read `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` before starting work.
Read your task description in `d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_2\DISPATCH.md`.

Your mission is to explore:
1. Contact Us & Feedback:
   - `website/src/pages/about-us/others/contact.astro`:
     - Pinpoint exact line numbers and markup for:
       - "Submit General Inquiry/Feedback" section and cards immediately below it.
       - "Website Help & Support" card.
       - "RTI Disclosure" card.
       - "Official Working Hours" card/info.
     - Verify office contact info, addresses, phone numbers, emails, map embeds, and official contacts table to ensure they remain intact.
   - `website/src/pages/feedback.astro`:
     - Inspect layout and recommend exact placement for moving "Official Working Hours" card with unchanged text.
2. Dignitaries Pages:
   - Dynamic route: `website/src/pages/dignitaries/[id].astro`
   - Static routes:
     - `ashwani-kumar.astro`
     - `manoj-sinha.astro`
     - `omar-abdullah.astro`
     - `rahul-yadav.astro`
     (Check their exact paths in `website/src/pages/`).
   - Assess profile card structures, image dimensions, aspect ratios, visual hierarchy (name, designation, body bio), and check for distortion.
3. Project Portfolio Pages:
   - All pages in `website/src/pages/our-business/` (e.g. hydro, solar, thermal, etc.).
   - Check infrastructure portfolio cards: visual hierarchy of project name, capacity, location, status badge.
   - Check image treatment, aspect ratios, and visual distinctions.

Produce a comprehensive, structured handoff report in:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`
Also update `d:\jkspdc-main-site\.agents\teamwork\teamwork_explorer_survey_2\progress.md` with your status.
When finished, send a message to the orchestrator indicating completion and referencing your report path.
Do NOT modify any source code files.
