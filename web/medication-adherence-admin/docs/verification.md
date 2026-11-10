# Verification evidence — 2026-11-07

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
