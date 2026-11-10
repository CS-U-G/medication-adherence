# Verification evidence

## Render integration — 2026-11-10

Run from `web/medication-adherence-admin` with Node 24.15.0 and the locked
dependencies installed:

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build -- --configuration production
```

- Type check and production build exited successfully. The initial bundle was
  364.55 kB, below the configured budget. All 47 tests across six files passed.
  Tests verify API destinations and payloads, rejection of identity-only
  sessions, unsuccessful and empty responses, and isolation from demo writes.
  They use Angular's HTTP test controller and do not prove live browser access.
- Served the production artifact locally with the planned SPA rewrite.
  `/`, `/login`, `/register`, `/availability` and `/doctor` all returned the
  compiled Angular shell on direct HTTP requests. The runtime asset returned
  live-mode JSON, all five linked script and style resources returned HTTP
  200, and the compiled client contained the fixed Render API origin.
  This checks static serving, not a deployed frontend or a browser workflow.
- Direct HTTPS probes verified API liveness, Swagger and request rejection.
  They also confirmed missing CORS headers, rejected preflights and repeatable
  HTTP 500 responses from medication reads. See [the API inventory and curl
  commands](api-contracts.md) for exact methods, statuses and backend fixes.
- No approved live credentials were available. No successful live staff
  session, clinical data read, registration or write was verified. The
  frontend was not deployed; the Docker engine was unavailable locally.
- All edits were confined to `web/`. Existing backend and mobile changes
  were left in place.

| Files under the Angular project | Purpose |
| --- | --- |
| `src/app/core/app-mode.ts`, `src/app/core/runtime-config.ts`, `public/app-config.json` | Fix the API origin and keep runtime mode selection separate. |
| `src/app/core/api.service.ts`, `src/app/core/auth-adapters.ts`, `src/app/core/auth.service.ts` | Send live calls directly to Render, validate public responses, preserve email casing, and reject identity-only sessions. |
| `src/app/auth/login.html`, `src/app/auth/register-doctor.ts`, `src/app/auth/register-doctor.html`, `src/app/public/home.html`, `src/app/public/service-status.ts` | Explain live availability, keep demo writes separate, and distinguish a rejected submission from one the browser could not confirm. |
| `src/app/core/api.spec.ts`, `src/app/core/auth.spec.ts`, `src/app/core/runtime-config.spec.ts`, `src/app/auth/register-doctor.spec.ts`, `src/app/public/public.spec.ts` | Cover transport, validation, failure states, and the session and demo boundaries. |
| `render.yaml`, `Dockerfile`, `package.json` | Publish the production browser build with no API URL injection step. |
| `scripts/configure.mjs`, `src/proxy.conf.json` (removed) | Remove the blank URL generator and unused development proxy. |
| `README.md`, `docs/api-contracts.md`, `docs/verification.md` | Record deployment settings, live HTTP evidence, tests, and remaining blockers. |

## Earlier verification — 2026-11-07

## Doctor self-registration follow-up

- Added public `/register` against actual `POST /api/auth/SignIn` and SignInDoctorDto.
- Corrected the earlier assumption that administrators must create doctor accounts.
  Doctors self-register; administrators are database-provisioned.
- Full suite: 38 tests passed across six files. Registration coverage includes exact
  payload, optional null fields, duplicate submission protection, invalid/mismatched
  input, confirmed success without login, and recoverable HTTP 0/400/401/500 errors.
- Production build passed, including the lazy registration route; initial bundle
  363.87 kB raw, below the existing budget.
- Live database creation remains unverified: the local backend cannot start without
  its missing PostgreSQL connection string. No live account was created during tests.
- Follow-up changes are frontend-only; backend source was not modified.

## Verified

- Inspected Angular 22 frontend, all three backend controllers, DTOs, Program.cs
  and authentication/user/patient service implementations without changing backend files.
- Production Angular build passed after fixing a homepage template nesting error.
  Final initial JavaScript/CSS: 363.31 kB raw / 97.60 kB estimated transfer, below budgets.
- TypeScript app typecheck passed.
- 26 tests across five files passed using Node 24.15.0: configuration validation,
  fail-closed staff access, network errors, health response validation, public page
  rendering/retry behavior, and signed-out/wrong-role guards.
- Package lock refreshed offline after adding the supported Node engine range.

## Limitations and remaining verification

- Final expanded suite: **31 tests across five files passed** on Node 24.15.0.
  Initial full-suite reruns exhausted process memory while Vitest started multiple
  jsdom workers. Limiting Vitest to one worker resolved this; the limit is saved
  in `vitest.config.mts` and loaded by the Angular test target.
- Node 25.2.1 is the host default and emits Angular engine warnings. Node 24.15.0
  is available in the existing local npm cache and was used for supported-runtime testing.
- A temporary regression experiment did not fail as expected. It is not counted
  as proof of regression sensitivity; the source changes were restored.
- Figma get_design_context returned no selected layer; metadata then hit the
  Starter plan limit. Browser fallback and local browser creation timed out.
  Figma parity, responsive visual inspection and browser console checks are unverified.
- Component tests run in jsdom, not a real browser. Responsive styles are implemented
  but this session did not capture updated viewport screenshots.
- No running backend integration was exercised. HTTP tests intercept requests using
  Angular HttpTestingController; they do not prove deployed authentication or CORS.
- Docker/Render configuration is prepared, not deployed or Docker-runtime tested.
- No lint target existed; none is claimed to have passed.

## Production release blockers

Protected staff sessions, server authorization and ownership policies are absent.
Clinical and administrative API workflows intentionally remain inaccessible.
Medication, prescription, schedule and adherence endpoints are absent.
See `api-contracts.md` for exact required backend work.

All intended source/configuration/documentation changes are inside
`web/medication-adherence-admin`. No commits, branches or Git metadata changes were made.
