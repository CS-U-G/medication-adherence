# Render API contract and release blockers

[Deployed Swagger UI](https://medication-adherence.onrender.com/swagger/index.html) ·
[OpenAPI JSON](https://medication-adherence.onrender.com/swagger/v1/swagger.json)

On 10 November 2026, the deployed OpenAPI document returned HTTP 200. It
confirms the paths, methods, request keys and query parameters below, including
the medication catalogue. Swagger does not describe the successful response
schemas or an authentication scheme. Response shapes below come from the
controllers and service DTOs in the read-only checkout; successful login,
record reads and writes were not verified live.

| Method and path | Contract | Web workflow |
| --- | --- | --- |
| GET `/` | `{status, service, version}` | Service metadata |
| GET `/health` | `{status: "healthy"}` | Public service check; process liveness only |
| POST `/api/auth/web-login` | `{email, password}` → AuthResponse | Staff credential check; identity alone cannot open a protected session |
| POST `/api/auth/SignIn` | SignInDoctor → AuthResponse | Public doctor self-registration; no protected session |
| POST `/api/patients/code-login` | `{accessCode}` → PatientDetails | Existing patient access-code contract; no staff or protected patient session |
| GET `/api/patients/doctor/{doctorId}` | PatientDetails[] | Doctor's patient list; requires ownership enforcement |
| GET `/api/patients/{patientId}` | PatientDetails | Patient record; requires ownership enforcement |
| POST `/api/patients/register-by-doctor` | CreatePatient → PatientDetails | Register patient; requires authenticated doctor |
| PUT `/api/patients/{patientId}` | UpdatePatient → `{message}` | Edit patient; requires ownership enforcement |
| PUT `/api/patients/{patientId}/regenerate-code` | `{patientId, newAccessCode, message}` | Rotate patient access code; requires ownership enforcement |
| PUT `/api/patients/{patientId}/status?isActive=true` | `{message}` | Activate/deactivate patient; requires ownership enforcement |
| GET `/api/users/doctors` | UserProfile[]; 404 when empty | Doctor directory; requires admin authorization |
| GET `/api/users/user/{id}` | UserProfile; `id` is a **user ID** | Staff profile; requires self or admin authorization |
| PUT `/api/users/doctors/{doctorId}` | UpdateDoctor → `{message}` | Edit doctor; requires admin or verified ownership as appropriate |
| POST `/api/users/freeze/{id}`, `/api/users/unfreeze/{id}` | `id` is a **user ID** → boolean; `false` is not success | Freeze/unfreeze accounts; requires admin authorization |
| GET `/api/Medications/All`, `/api/Medications/active` | Medication[] | Full/active medication catalogue; both currently return HTTP 500 |
| GET `/api/Medications/Medication/{id}` | Medication | Catalogue detail |
| POST `/api/Medications/AddNew` | CreateMedication → Medication | Create catalogue entry; requires admin authorization |
| PUT `/api/Medications/Medication/{id}` | CreateMedication → `{message}` | Edit catalogue entry; requires admin authorization |
| PUT `/api/Medications/{id}/status?isActive=true` | `{message}` | Activate/deactivate catalogue entry; requires admin authorization |

## DTO fields

JSON field names are camel case. Dates of birth are `YYYY-MM-DD`, gender is a
single character, and ID parameters are integers.

- AuthResponse: `userId`, `doctorId: number | null`, `fullName`, `email`,
  `role: "Admin" | "Doctor"`, `message`. No access token, expiry or refresh token.
- SignInDoctor: `fullName`, `phoneNumber?`, `gender`, `dateOfBirth`, `email`,
  `password`, `specialization`, `licenseNumber?`.
- UserProfile: `userId`, `personId`, `doctorId`, `fullName`, `email`,
  `phoneNumber`, `gender`, `dateOfBirth`, `role`, `specialization`,
  `licenseNumber`, `isActive`. Doctor ID, phone, gender, date of birth,
  specialization and license number can be null.
- UpdateDoctor: `fullName`, `phoneNumber?`, `specialization`, `licenseNumber?`.
- CreatePatient: `fullName`, `phoneNumber?`, `gender`, `dateOfBirth`,
  `primaryDoctorId`, `medicalNotes?`. No patient email field.
- UpdatePatient: CreatePatient without `primaryDoctorId`.
- PatientDetails: `patientId`, `personId`, `fullName`, `phoneNumber`,
  `gender`, `dateOfBirth`, `patientAccessCode`, `primaryDoctorId`,
  `primaryDoctorName`, `medicalNotes`, `isActive`. Phone, gender, doctor name
  and notes can be null.
- CreateMedication: `tradeName`, `scientificName`, `dosageForm`, `strength?`.
  The controller requires nonblank trade name, scientific name and dosage form.
- Medication: `medicationId`, `tradeName`, `scientificName`, `dosageForm`,
  `strength`, `isActive`, `createdAt` (date and time). Scientific name,
  dosage form and strength can be null.

Swagger exposes no prescription, schedule, dose, adherence summary, dashboard
metrics, search, pagination, session refresh or logout API.

## Live HTTP evidence

These checks used curl over HTTPS at about 11:46–11:54 Riyadh time. No account
credentials, patient records or production writes were used.

| Request | HTTP result | Meaning |
| --- | --- | --- |
| GET `/`, `/health`, `/swagger/index.html`, `/swagger/v1/swagger.json` | 200 each | Render and Swagger reachable; health returned `{"status":"healthy"}` |
| OPTIONS `/api/auth/web-login`, asking for POST and `content-type` | 405 for `https://medminder-web.onrender.com`, `http://localhost:4200` and `http://127.0.0.1:4200` | `Allow: POST`, no `Access-Control-Allow-*` headers; browser stops before the login POST |
| OPTIONS `/api/auth/SignIn`, asking for POST and `content-type` from the planned Render frontend origin | 405 | `Allow: POST`, no CORS headers; browser stops before the registration POST |
| GET `/health` with `Origin: https://medminder-web.onrender.com` | 200 | No `Access-Control-Allow-Origin`; browser cannot read the response |
| OPTIONS `/api/patients/0/status?isActive=true`, asking for PUT and `authorization,content-type` from the Render frontend origin | 405 | `Allow: PUT`, no CORS headers; no mutation sent |
| POST `/api/auth/web-login` and `/api/auth/SignIn` with malformed JSON | 400 each | ASP.NET validation problem includes field errors |
| POST `/api/auth/web-login` with `{}` | 500 | Empty response from Kestrel; checkout queries users by email in this handler |
| POST `/api/patients/code-login` with `{}` | 401 | `Invalid Access Code.` |
| GET `/api/users/user/0` | 400 | Invalid user ID |
| GET `/api/patients/0`, `/api/patients/doctor/0`, `/api/Medications/Medication/0` | 404 each | Invalid IDs; these checks do not exercise record retrieval |
| GET `/api/Medications/All`, `/api/Medications/active` | 500 each, on repeat | Empty responses from Kestrel, while `/health` still returned 200 |

The planned frontend hostname `https://medminder-web.onrender.com` returned
404 with `x-render-routing: no-server`. It was used as a proposed origin;
check the assigned hostname after the frontend deploy.

An initial Swagger connection reached its 10-second connection limit before
receiving HTTP. DNS later resolved to Render, the first successful health probe
took about 12 seconds, and subsequent root, health and Swagger responses were
200. No HTTP 503 or Render loading page was observed. The connection timeout
does not establish a [Render cold start](https://render.com/docs/free#spinning-down-on-idle).
The repeatable 500s were separate application errors.

To reproduce without credentials or record writes (PowerShell):

```powershell
$api = 'https://medication-adherence.onrender.com'
$curl = @('-sS', '--connect-timeout', '30', '--max-time', '85')
curl.exe @curl -i "$api/"
curl.exe @curl -i "$api/health"
curl.exe @curl -o NUL -w '%{http_code}\n' "$api/swagger/index.html"
$spec = ((curl.exe @curl "$api/swagger/v1/swagger.json") -join "`n") | ConvertFrom-Json
$spec.paths.PSObject.Properties.Name

foreach ($origin in @('https://medminder-web.onrender.com', 'http://localhost:4200', 'http://127.0.0.1:4200')) {
  curl.exe @curl -i -X OPTIONS -H "Origin: $origin" `
    -H 'Access-Control-Request-Method: POST' `
    -H 'Access-Control-Request-Headers: content-type' "$api/api/auth/web-login"
}
curl.exe @curl -i -X OPTIONS -H 'Origin: https://medminder-web.onrender.com' `
  -H 'Access-Control-Request-Method: POST' `
  -H 'Access-Control-Request-Headers: content-type' "$api/api/auth/SignIn"
curl.exe @curl -i -H 'Origin: https://medminder-web.onrender.com' "$api/health"
curl.exe @curl -i -X OPTIONS -H 'Origin: https://medminder-web.onrender.com' `
  -H 'Access-Control-Request-Method: PUT' `
  -H 'Access-Control-Request-Headers: authorization,content-type' "$api/api/patients/0/status?isActive=true"

curl.exe @curl -i -H 'Content-Type: application/json' --data-binary '{' "$api/api/auth/web-login"
curl.exe @curl -i -H 'Content-Type: application/json' --data-binary '{' "$api/api/auth/SignIn"
curl.exe @curl -i -H 'Content-Type: application/json' --data-binary '{}' "$api/api/auth/web-login"
curl.exe @curl -i -H 'Content-Type: application/json' --data-binary '{}' "$api/api/patients/code-login"
foreach ($path in @('/api/users/user/0', '/api/patients/0', '/api/patients/doctor/0',
  '/api/Medications/Medication/0', '/api/Medications/All', '/api/Medications/active')) {
  curl.exe @curl -D - -o NUL -w "$path %{http_code}\n" "$api$path"
}
```

## Changes needed on the backend

1. Configure [ASP.NET Core CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors)
   for the exact frontend origin Render assigns (expected
   `https://medminder-web.onrender.com`), any approved custom frontend domain,
   and `http://localhost:4200` / `http://127.0.0.1:4200` if local browser
   development is allowed. Configure a named `AddCors` policy and call
   `UseCors` after routing and before authentication/authorization. Allow
   `GET`, `POST`, `PUT` and the `Content-Type` header; include
   `Authorization` only when the backend actually supports a bearer token.
   Preflight needs a successful OPTIONS response with the matching
   `Access-Control-Allow-Origin`, allowed method and headers. Actual responses
   (including errors) also need the matching allow-origin header. CORS does not
   protect these endpoints from direct HTTP callers.
2. Correlate the empty HTTP 500s with the Render service logs. At 08:49 UTC the
   `rndr-id` values were `4b320f91-faa5-4027` (all medications),
   `b0b5afe6-5b64-4b00` (active medications), and `cf5a2f78-7ecc-484a`
   (web login). These handlers use database repositories in the checkout.
   Verify the deployed database connection, permissions and schema against the
   logged exception. The public response does not identify which failed.
3. Register an authentication scheme and issue a server-verifiable session.
   Publish the token or cookie contract, expiry, identity validation, renewal
   and logout/revocation behavior. If using cookies, define HTTPS, SameSite,
   credentialed CORS and CSRF protection. Apply role and ownership policies:
   admins manage staff and the medication catalogue; doctors access their own
   patients; patients access only their own records. Resolve ownership from
   the authenticated identity rather than a browser-supplied doctor or
   patient ID. Keep public health and the intended registration/login routes
   separate from protected actions. Do not expose patient access codes or
   health details to unauthorized callers.
4. Publish authenticated prescription, schedule, dose and adherence contracts
   before connecting those screens. Define which roles can read or write each
   resource and enforce patient ownership on the server. Add database readiness
   monitoring separately from the existing process liveness check.

The checkout compares the submitted email directly with the stored value.
The frontend preserves the supplied case. For consistent case-insensitive
login and duplicate detection, normalize email in the backend on account
creation and lookup, and enforce uniqueness on the normalized value.

Recheck browser CORS after the backend deployment, then use authorized test
accounts and approved test records for sign-in, role and ownership checks,
record reads and record submissions. A successful curl call or a passing
Angular transport test is insufficient proof of any of those workflows.
