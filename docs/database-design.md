# Database design

Primary keys: `int` identity, used consistently. The Users table is managed by ASP.NET Core Identity (extend `IdentityUser<int>`).

```mermaid
erDiagram
  USERS ||--o{ PRESCRIPTIONS : receives
  MEDICINES ||--o{ PRESCRIPTIONS : prescribed_as
  PRESCRIPTIONS ||--o{ MEDICATION_SCHEDULES : defines
  MEDICATION_SCHEDULES ||--o{ DOSE_RECORDS : generates
  MEDICATION_SCHEDULES ||--o{ REMINDERS : configures
  USERS ||--o{ NOTIFICATIONS : receives
  USERS { int Id PK
    string Name
    string Email
    string PasswordHash
    string Role }
  MEDICINES { int Id PK
    string Name
    string Strength
    string Form }
  PRESCRIPTIONS { int Id PK
    int PatientId FK
    int MedicineId FK
    string Instructions
    date StartDate
    date EndDate }
  MEDICATION_SCHEDULES { int Id PK
    int PrescriptionId FK
    time TimeOfDay
    string Frequency
    bool IsActive }
  DOSE_RECORDS { int Id PK
    int ScheduleId FK
    datetime ScheduledAt
    string Status
    datetime RecordedAt }
  REMINDERS { int Id PK
    int ScheduleId FK
    time ReminderTime
    bool IsEnabled }
  NOTIFICATIONS { int Id PK
    int UserId FK
    string Message
    datetime CreatedAt
    bool IsRead }
```

## Notes
- Consider adding `PrescribedById` (staff user) to `Prescriptions` for auditability.
- `DoseRecords.Status`: `Pending | Taken | Skipped | Missed`.
- Unique index on `(ScheduleId, ScheduledAt)` prevents duplicate dose occurrences.
- Indexes on `Prescriptions.PatientId`, `DoseRecords.ScheduledAt`, `Notifications.UserId`.
- Store all datetimes in UTC.
