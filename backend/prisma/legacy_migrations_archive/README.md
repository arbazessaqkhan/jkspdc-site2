# Legacy PostgreSQL Migrations Archive (July 2026)

This directory preserves the three original PostgreSQL migrations created during early project prototyping (July 10-11, 2026):

1. `20260710091938_add_director_and_update_powerstation`
2. `20260711064755_add_tender_metadata_tags`
3. `20260711070658_optional_tender_closing_date`

## Reason for Supersession
These migrations only defined 8-10 tables (User, PowerStation, Tender, Career, PressRelease, AuditLog, ContactSubmission, Director) and were missing 18+ models subsequently introduced (Hydro AI suite, Sessions, Dignitaries, Policies, Downloads, IPP Projects, Official Contacts, Contact Sub-Offices, etc.). They also lacked modern schema columns (`Director.description`, `Tender.corrigendums`, `Tender.bidOpeningDate`, etc.).

They have been superseded by the unified 28-model clean PostgreSQL baseline migration generated in STEP 12B.
