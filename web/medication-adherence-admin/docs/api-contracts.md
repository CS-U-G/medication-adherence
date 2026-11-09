# API inventory and production blockers

Verified against controllers, DTOs and BLL services in this checkout on 2026-11-07.
Backend files were read only. JSON uses camelCase and string enum values.

| Method / route | Contract | Frontend status |
| --- | --- | --- |
| POST `/api/auth/web-login` | `{email,password}` → AuthResponse | Connected; rejects identity-only response as a protected session |
| GET `/health` | `{status:"healthy"}` | Connected to public service check |
| GET `/` | `{status,service,version}` | Available; not needed by frontend |
| POST `/api/auth/SignIn` | SignInDoctor → AuthResponse | Connected to public doctor self-registration at `/register`; does not start a session |
| GET `/api/users/doctors` | UserProfile[]; 404 when empty | Blocked pending admin authorization |
| GET `/api/users/user/{id}` | UserProfile; **user ID**, not doctor ID | Blocked pending authorization |
| PUT `/api/users/doctors/{doctorId}` | UpdateDoctor → `{message}` | Blocked pending admin/ownership policy |
| POST `/api/users/freeze/{id}` | **user ID** → boolean | Blocked pending admin authorization; false is not success |
| POST `/api/users/unfreeze/{id}` | **user ID** → boolean | Same restriction |
| POST `/api/patients/register-by-doctor` | CreatePatient → PatientDetails | Exists; blocked pending doctor authorization |
| GET `/api/patients/doctor/{doctorId}` | PatientDetails[] | Exists; blocked pending ownership enforcement |
| GET `/api/patients/{patientId}` | PatientDetails | Exists; blocked pending ownership enforcement |
| PUT `/api/patients/{patientId}` | UpdatePatient → `{message}` | Same restriction |
| PUT `/api/patients/{patientId}/regenerate-code` | `{patientId,newAccessCode,message}` | Same restriction; revokes previous mobile code |
| PUT `/api/patients/{patientId}/status?isActive=true` | `{message}` | Same restriction |
| POST `/api/patients/code-login` | `{accessCode}` → PatientDetails | Mobile-only; not a staff login |

## DTO field inventory

- AuthResponse: `userId:number`, `doctorId:number|null`, `fullName`, `email`, `role` (`Admin` / `Doctor`), `message`. **No access token, expiry or refresh token.**
- UserProfile: `userId`, `personId`, `doctorId|null`, `fullName`, `email`, `phoneNumber|null`, `gender|null`, `dateOfBirth|null`, `role`, `specialization|null`, `licenseNumber|null`, `isActive`.
- SignInDoctor: `fullName`, `phoneNumber?`, `gender` (one character), `dateOfBirth` (`YYYY-MM-DD`), `email`, `password`, `specialization`, `licenseNumber?`.
- UpdateDoctor: `fullName`, `phoneNumber?`, `specialization`, `licenseNumber?`.
- CreatePatient: `fullName`, `phoneNumber?`, `gender` (one character), `dateOfBirth`, `primaryDoctorId:number`, `medicalNotes?`. **No patient email field.**
- UpdatePatient: CreatePatient without `primaryDoctorId`.
- PatientDetails: `patientId`, `personId`, `fullName`, `phoneNumber|null`, `gender|null`, `dateOfBirth`, `patientAccessCode`, `primaryDoctorId`, `primaryDoctorName|null`, `medicalNotes|null`, `isActive`.

No API contract exists for medications, prescriptions, schedules, doses,
adherence summaries, dashboard metrics, pagination, sorting, search or logout.
Existing local preview models must not be mistaken for these DTOs.

## Required backend work (not performed here)

1. Issue a verifiable staff session (secure HttpOnly cookie or documented token contract).
   Specify expiry, renewal, logout/revocation and a session/profile endpoint.
2. Register authentication middleware and enforce Admin/Doctor policies on protected
   staff endpoints. Doctor self-registration remains public by product requirement;
   administrator accounts are provisioned in the database, with no public admin registration.
   Infer doctor ownership from authenticated claims; do not trust
   a browser-supplied doctor ID. Protect access codes and patient health data.
3. Add exact frontend origin to CORS when deployed separately. If cookie auth is
   selected, define credentials, SameSite, CSRF and HTTPS requirements first.
4. Provide endpoint contracts for medication, prescription and adherence features.
5. Standardize validation errors (including field errors) and empty-list responses.

The frontend deliberately does not call unprotected patient/user routes, invent a
token, or treat client route guards as server authorization. A successful health
check means reachability only, never authentication or clinical readiness.
