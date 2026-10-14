# API specification (v1)

Base path: `/api/v1`. JSON over HTTPS. Auth: JWT bearer. Swagger/OpenAPI exposed in development.

| Method | Endpoint | Purpose | Roles |
|---|---|---|---|
| POST | `/auth/register` | Register an account | Anonymous |
| POST | `/auth/login` | Authenticate, receive JWT | Anonymous |
| GET | `/medications` | Patient's medications | Patient |
| POST | `/prescriptions` | Create a prescription | Staff |
| GET | `/schedules` | List schedules | Patient (own), Staff |
| POST | `/schedules` | Create a schedule | Staff |
| PUT | `/schedules/{id}` | Update a schedule | Staff |
| GET | `/doses/today` | Today's scheduled doses | Patient |
| POST | `/doses/{id}/record` | Record Taken / Skipped | Patient (own) |
| GET | `/reports/adherence` | Adherence statistics | Staff |
| GET | `/notifications` | Notification history | Authenticated |

## Conventions
- DTOs only; validate with FluentValidation.
- Ownership checks on every patient-scoped resource.
- Errors use RFC 7807 `ProblemDetails`.
- `POST /doses/{id}/record` is idempotent.
- Likely additions: `GET /patients`, `GET /medicines`, `POST /auth/refresh`.
