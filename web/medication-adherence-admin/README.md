# MedMinder web

Angular 22 standalone frontend for the patient-mobile / staff-web ecosystem.
All changes and deployment files belong in this directory. Backend source is read-only.

**Release status:** the public homepage, credential verification and API health
check and public doctor self-registration are implemented. Protected clinical and administration workflows are blocked
by missing backend authentication and authorization. This is not a completed
production clinical platform. No identity response is treated as a protected session.

## Run and verify

Use Node 24.15+ in the 24.x line (or another version permitted by package.json).
From `web/medication-adherence-admin`:

```powershell
npm.cmd ci --cache .npm-cache
npm.cmd start -- --host 127.0.0.1 --port 4200
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

Open http://127.0.0.1:4200. Production output is
`dist/medication-adherence-admin/browser`. Tests use Angular's Vitest builder,
jsdom and HttpTestingController; no live backend credentials are needed.
There is no existing lint target. Do not describe typechecking as linting.

## Configure the API

`public/app-config.json` is loaded before Angular starts. It defaults to:

```json
{"mode":"live","apiBaseUrl":""}
```

An empty base URL means same-origin API hosting. For a separate API use an HTTPS
base URL, for example `https://your-api.onrender.com`, without `/api`, credentials,
query parameters or fragment. The server must allow the exact frontend CORS origin.
The file is public: never put credentials or private tokens in it.

For builds and Render, generate the file from a public environment variable:

```powershell
$env:MEDMINDER_API_URL = 'https://your-api.onrender.com'
npm.cmd run configure
npm.cmd run build
```

The generator always writes live mode. Configuration errors produce a recoverable
startup screen; they never enable a demo fallback. Nginx prevents caching this file.
A static host can replace the published JSON without rebuilding JavaScript.

### Development preview

The existing doctor/admin demo screens are preserved for design exploration only.
To inspect them locally, change the JSON `mode` to `demo` and use `npm start`.
They use fictional browser-local records and visibly identify demo mode. Do not
enter real patient information. Reset them from Account settings. Return the file
to `live` afterward. Optimized production builds reject demo mode at startup.
No URL parameter or one-click role selector can enable it in production.

## Architecture

- `src/main.ts`: validated runtime configuration, HTTP and router providers; startup recovery.
- `src/app/core/runtime-config.ts`: configuration validation and production mode boundary.
- `src/app/core/api.models.ts`, `api.service.ts`: exact public API DTOs and HTTP transport with request timeouts.
- `src/app/core/auth-*`, `auth.service.ts`, `role.guard.ts`: credential verification, fail-closed session handling and role routing.
- `src/app/public`: public ecosystem introduction and on-demand service availability.
- `src/app/auth`: reactive login form, validation and connection/error feedback.
- `src/app/auth/register-doctor.*`: public `/register` form calling `POST /api/auth/SignIn`.
  Fields match SignInDoctorDto. Confirmation of password stays client-side; no role
  is submitted. Name/email/specialization/phone/license limits match database mappings.
  Optional phone and license are submitted as null when blank. Account creation
  does not establish a protected session. Admin accounts are created in the database.
- `src/app/doctor`, `admin`: preserved lazy-loaded development preview features.
- `src/app/shared`: existing brand, icons, shell, chart, and shared presentation.
- `src/app/core/demo-*`, `medminder-data.service.ts`: development-only local preview behavior; these are not API DTOs or live data access.

No large state library or new UI dependency was added. Clinical/API data is not
stored by the production login flow. DemoStore is initialized lazily, so live
startup does not seed fictional patient records into browser storage.

## Authentication boundary

POST `/api/auth/web-login` currently returns an identity and role, with no token
or authenticated cookie. The frontend checks the role but deliberately refuses
to open a protected workspace from that response. It stores no live identity,
password or invented token. Rejections, connection errors and server failures
stay on the login screen. Existing route guards redirect signed-out users and
deny the wrong role. They supplement, and cannot replace, backend policies.

GET `/health` is connected to the public availability page. Its response must
contain `status: healthy`; an SPA HTML fallback is not interpreted as success.
Health means reachability, not authentication or release readiness.

See [the endpoint inventory](docs/api-contracts.md) for every actual controller
route, DTO field, missing feature and exact backend prerequisite. Patient and user
endpoints are documented but intentionally not called without server authorization.
Medication, prescription and adherence controllers do not exist in this checkout.

## Styles and assets

`src/styles/_tokens.scss` owns the palette, type families, spacing scale, radii,
shadows, motion and page width. `_base.scss` owns document defaults, focus and brand
presentation. `_components.scss` owns buttons, fields, notices, panels and tables.
`src/styles.scss` composes these foundations with existing feature styles.
Component styles own their specific layouts. Change shared tokens first when
adjusting a common design decision. Responsive breakpoints remain in their
relevant stylesheets; the system is not a complete token migration of every
legacy preview screen. Reduced-motion preferences are respected.

Replace `public/assets/brand/medminder-logo.png` to change the shared logo and
favicon. The original top-level image remains for compatibility with old references.
Icons are shared stroke components in `src/app/shared/icon.ts`; the homepage care
ecosystem is CSS and accessible text, with no external imagery or font downloads.
The existing green/mint palette is retained. Figma inspection was attempted but
hit the connector's plan limit; visual parity with Figma is unverified.

## Deploy on Render (recommended: Static Site)

This app needs only static hosting; a continuously running Node server is not
required. Create a Static Site with:

| Setting | Value |
| --- | --- |
| Root directory | `web/medication-adherence-admin` |
| Build command | `npm ci --cache .npm-cache && npm run configure && npm run build` |
| Publish directory | `dist/medication-adherence-admin/browser` |
| Environment | `NODE_VERSION=24.15.0`, `MEDMINDER_API_URL=https://your-api-host` |
| Rewrite | `/*` to `/index.html` (Rewrite, not Redirect) |

Alternatively select `web/medication-adherence-admin/render.yaml` as the Blueprint
path. The blueprint configures the SPA rewrite and configuration cache headers.
Use the actual externally reachable HTTPS API URL. Browser requests cannot use
Render private/internal hostnames. Do not add a proxy that bypasses authorization.
The backend CORS/session changes in the inventory must be completed independently.

[Render SPA rewrites](https://render.com/docs/redirects-rewrites) ·
[Render static hosting](https://render.com/docs/your-first-deploy) ·
[Angular tests](https://angular.dev/guide/testing)

## Docker alternative

From this directory:

```sh
docker build --build-arg MEDMINDER_API_URL=https://your-api-host -t medminder-web .
docker run --rm -e PORT=10000 -p 127.0.0.1:10000:10000 medminder-web
```

For a Render Docker Web Service use this directory as Root Directory, Dockerfile
`./Dockerfile`, context `.`, and health path `/healthz`. The multistage image serves
only the production output with Nginx. SPA routes fall back to index.html; JS/CSS
assets are cached with immutable headers; index/config are revalidated or uncached.
`/api/*` and `/health` never return successful app-shell HTML. For same-origin API
hosting, supply a real API gateway separately. `PORT` is the only Nginx substitution.
The API URL is a public build argument, not a runtime container environment option.

## Verification and limitations

See [verification notes](docs/verification.md) for this session's actual checks.
Earlier images in `docs/screenshots` describe the prior demo and are not evidence
for this release. No real backend end-to-end or clinical workflow verification is
claimed. See [the implementation plan](docs/implementation-plan.md) for scope.
