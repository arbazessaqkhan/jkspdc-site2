# DISPATCH: Forensic Auditor (Integrity Forensic Verification)

## Working Directory
`d:\jkspdc-main-site\website\src\`

## Mandatory Inputs to Read
1. `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read before starting)
2. `d:\jkspdc-main-site\.agents\teamwork\PROJECT.md`
3. All worker handoffs:
   - `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m1\handoff.md`
   - `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m2\handoff.md`
   - `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m3\handoff.md`
   - `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m4\handoff.md`

## Mission: Forensic Integrity Verification
Perform an exhaustive forensic audit across all modified code:
1. **Authenticity Audit**:
   - Verify that all changes implement genuine functionality.
   - Verify that NO hardcoded test results, facade implementations, dummy mocks, or circumventions exist.
   - Verify that all project data, dignitary data, and corporate office contact information remain genuine and uncorrupted.
2. **Protected Scope Audit**:
   - Audit git diffs / file system to verify that:
     - `website/src/pages/admin/*` has 0 modifications.
     - `backend/src/auth/*` has 0 modifications.
     - `backend/test/*` has 0 modifications.
     - `backend/prisma/*` has 0 modifications.
     - `package.json` has 0 modifications and 0 new dependencies.
3. **Execution Validation**:
   - Independently run `npm --prefix website run build` from `d:\jkspdc-main-site` to verify that the build compiles cleanly with exit code 0.
4. **Binary Veto Decision**:
   - If ANY cheating, hardcoding, dummy facade, or protected file modification is detected: report `INTEGRITY VIOLATION` with full evidence.
   - If all implementations are genuine and all integrity criteria pass: report `CLEAN`.

## Output Requirements
Write your full forensic audit report to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_auditor_1\handoff.md`
Conclude with an explicit binary verdict: `CLEAN` or `INTEGRITY VIOLATION`.
Send a completion message to the orchestrator.


## 2026-11-13T02:10:53Z
You are the Forensic Auditor (teamwork_auditor).
You MUST read `d:\jkspdc-main-site\.agents\teamwork\ORIGINAL_REQUEST.md` before starting work.
Read your instructions in `d:\jkspdc-main-site\.agents\teamwork\teamwork_auditor_1\DISPATCH.md`.
Read `d:\jkspdc-main-site\.agents\teamwork\PROJECT.md`.
Read all worker handoffs:
- `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m1\handoff.md`
- `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m2\handoff.md`
- `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m3\handoff.md`
- `d:\jkspdc-main-site\.agents\teamwork\teamwork_worker_m4\handoff.md`

Perform an exhaustive forensic audit:
1. Authenticity:
   - Verify that all changes implement genuine functionality.
   - Verify that NO hardcoded test results, facade implementations, dummy mocks, or circumventions exist.
   - Verify that all project data, dignitary data, and corporate office contact information remain genuine and uncorrupted.
2. Protected Scope:
   - Audit git diffs / file system to verify that:
     - `website/src/pages/admin/*` has 0 modifications.
     - `backend/src/auth/*` has 0 modifications.
     - `backend/test/*` has 0 modifications.
     - `backend/prisma/*` has 0 modifications.
     - `package.json` has 0 modifications and 0 new dependencies.
3. Execution Validation:
   - Independently run `npm --prefix website run build` from `d:\jkspdc-main-site` to verify that the build compiles cleanly with exit code 0.
4. Binary Verdict:
   - If ANY cheating, hardcoding, dummy facade, or protected file modification is detected: report `INTEGRITY VIOLATION`.
   - If all implementations are genuine and all integrity criteria pass: report `CLEAN`.

Write your full report to:
`d:\jkspdc-main-site\.agents\teamwork\teamwork_auditor_1\handoff.md`
Conclude with an explicit binary verdict: CLEAN or INTEGRITY VIOLATION.
Send a message to orchestrator when complete.
