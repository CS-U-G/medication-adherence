# Requirements

## Roles
- **Patient** - views own schedule, records doses, views own history.
- **Staff** (doctor / nurse / pharmacist) - manages patients' prescriptions and schedules, views reports.
- **Admin** - manages staff accounts and the medicine catalogue.

## MVP use cases
1. Register / log in (JWT, role-based).
2. Staff creates a prescription and a schedule for a patient.
3. Patient app syncs schedules and schedules local notifications.
4. Patient records a dose as Taken or Skipped; unanswered doses become Missed after a grace period.
5. Staff views adherence report (scheduled vs taken/skipped/missed) for a period.

## Validation rules (initial)
- `EndDate >= StartDate`.
- Dose status is one of `Pending`, `Taken`, `Skipped`, `Missed`.
- A dose can only be recorded once (idempotent; duplicate requests rejected or ignored).
- Patients can only read and write their own records.
- Missed-dose grace period is configurable (default: 2 hours after `ScheduledAt`).

## Non-functional
- HTTPS only, password hashing via ASP.NET Core Identity, no secrets in git.
- All timestamps stored in UTC; clients convert to local time.
- Reminders work offline (local notifications).

## Out of scope for MVP
Push notifications, caregiver accounts, dosage recommendations, drug-interaction checks.

## Definition of done (MVP)
- Patient logs in and sees assigned schedule.
- App notifies at configured times.
- Dose outcome is persisted by the backend.
- Staff manage prescriptions and schedules.
- Both frontends show consistent data from the same API.
- Adherence is computed from dose records, not reminder delivery.

## Safety boundary
The app records and reminds. It must not prescribe, alter dosages, or recommend an extra dose after a missed reminder.
