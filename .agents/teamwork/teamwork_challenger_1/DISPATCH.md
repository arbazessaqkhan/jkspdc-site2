# DISPATCH: Challenger 1 (Adversarial Scope & Functional Verifier)

## Working Directory
`d:\jkspdc-main-site\website\src\`

## Mandatory Inputs to Read
1. `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read before starting)
2. `d:\jkspdc-main-site\.agents\teamwork\PROJECT.md`

## Mission: Adversarial Scope, Integrity & Functional Testing
Empirically verify and stress-test:
1. **Forbidden Scope Verification**:
   - Check git status and diffs across `website/src/pages/admin/`, `backend/src/auth/`, `backend/test/`, `backend/prisma/`, and `package.json`.
   - Confirm with 100% certainty that ZERO lines of code or files were modified or added in these protected paths.
2. **Contact Us & Feedback Empirical Checks**:
   - Verify `contact.astro` does NOT contain:
     - "Submit General Inquiry" or "Submit General Inquiry / Feedback"
     - "Website Help & Support"
     - "RTI Disclosure" or "RTI Disclosures"
   - Verify `contact.astro` DOES contain all corporate addresses, telephone numbers, emails, map embed iframes, and both official tables (Corporate Office Contacts and Wing Contacts).
   - Verify `feedback.astro` DOES contain the verbatim string:
     "working hrs are from 9.30 am to 5.30 pm from monday to friday"
     and the badge "Official Government Timings".
3. **Build Stress Test**:
   - Run `npm --prefix website run build` from workspace root `d:\jkspdc-main-site`.
   - Confirm exit code 0, zero warnings, zero errors.

## Output Requirements
Write your adversarial findings and empirical test logs to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_challenger_1\handoff.md`
Conclude with an explicit confirmation: `APPROVE` or `REQUEST_CHANGES`.
Send a completion message to the orchestrator.


## 2026-11-13T02:10:37Z
You are Challenger 1 (Adversarial Scope & Functional Challenger).
You MUST read `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` before starting work.
Read your instructions in `d:\jkspdc-main-site\.agents\teamwork\teamwork_challenger_1\DISPATCH.md`.
Read `d:\jkspdc-main-site\.agents\teamwork\PROJECT.md`.

Adversarially challenge and stress-test:
1. Forbidden Scope Verification:
   - Check git status and diffs across `website/src/pages/admin/`, `backend/src/auth/`, `backend/test/`, `backend/prisma/`, and `package.json`.
   - Confirm with 100% certainty that ZERO lines of code or files were modified or added in these protected paths.
2. Contact Us & Feedback Empirical Checks:
   - Verify `contact.astro` does NOT contain "Submit General Inquiry", "Website Help & Support", or "RTI Disclosure".
   - Verify `contact.astro` DOES contain all corporate addresses, telephone numbers, emails, map embed iframes, and both official contact tables intact.
   - Verify `feedback.astro` DOES contain verbatim "working hrs are from 9.30 am to 5.30 pm from monday to friday" and badge "Official Government Timings".
3. Build Stress Test:
   - Run `npm --prefix website run build` from `d:\jkspdc-main-site`.
   - Confirm exit code 0, zero warnings, zero errors.

Write your report to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_challenger_1\handoff.md`
Provide an explicit confirmation/verdict: APPROVE or REQUEST_CHANGES.
Send a message to orchestrator when complete.
