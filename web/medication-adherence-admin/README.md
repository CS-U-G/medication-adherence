# MedMinder web

Angular 22 standalone frontend for the patient-mobile / staff-web ecosystem.
All changes and deployment files belong in this directory. Backend source is read-only.

**Release status:** the public health check, staff credential form and doctor
self-registration use the Render API. See [the endpoint inventory](docs/api-contracts.md)
for live verification and blockers. Protected clinical and administration workflows
require a backend session and server authorization. An identity response alone does
not establish a protected session.

## Run and verify

Use Node 24.15+ in the 24.x line (or another version permitted by package.json).
From `web/medication-adherence-admin`:

```powershell
npm.cmd ci --include=dev
npm.cmd start -- --host 127.0.0.1 --port 4200
npm.cmd run typecheck
npm.cmd test
npm.cmd run build -- --configuration production
```

Open http://127.0.0.1:4200. Production output is
`dist/medication-adherence-admin/browser`. Tests use Angular's Vitest builder,
jsdom and HttpTestingController; no live backend credentials are needed.
There is no existing lint target. Do not describe typechecking as linting.

## API configuration

Local and deployed live mode both send API requests directly to
`https://medication-adherence.onrender.com`. The origin is fixed in the Angular
configuration and doesn't require a build-time environment variable, local proxy,
or same-origin hosting. The backend must allow the exact browser origin through CORS.

`public/app-config.json` defaults to `{"mode":"live"}` and is loaded before
Angular starts. The file is public; never put credentials or tokens in it. Invalid
configuration produces a startup error with a retry option.

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
See the inventory for which clinical endpoints the deployed API exposes.

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
| Build command | `npm ci --include=dev && npm run build -- --configuration production` |
| Publish directory | `dist/medication-adherence-admin/browser` |
| Environment | `NODE_VERSION=24.15.0`, `SKIP_INSTALL_DEPS=true` |
| Rewrite | `/*` to `/index.html` (Rewrite, not Redirect) |

Alternatively select `web/medication-adherence-admin/render.yaml` as the Blueprint
path. The Blueprint configures these settings and the configuration cache headers.
For an existing site, remove the previous `MEDMINDER_API_URL` and `npm run configure`
settings when switching to this build command.

After deploying, refresh `/login` and `/register` directly; both should serve the
Angular app. Use the public health check and confirm in the browser network panel
that the request goes to `https://medication-adherence.onrender.com/health`.

The deployed API currently returns `405` to the JSON login preflight and omits
`Access-Control-Allow-Origin` from the health response. The API operator must
allow the exact HTTPS frontend origin from the Render dashboard (for example,
`https://medminder-web.onrender.com` if assigned), plus any custom domains in use.
Allow `http://127.0.0.1:4200` or `http://localhost:4200` as needed for local work.
The CORS policy must allow `GET` and `POST`, and `Content-Type` for JSON POSTs.
See the [API inventory](docs/api-contracts.md) for server requirements and how to
recheck the policy.

[Render SPA rewrites](https://render.com/docs/redirects-rewrites) ·
[Render static hosting](https://render.com/docs/your-first-deploy) ·
[Angular tests](https://angular.dev/guide/testing)

## Docker alternative

From this directory:

```sh
docker build -t medminder-web .
docker run --rm -e PORT=10000 -p 127.0.0.1:10000:10000 medminder-web
```

For a Render Docker Web Service use this directory as Root Directory, Dockerfile
`./Dockerfile`, context `.`, and health path `/healthz`. The multistage image serves
only the production output with Nginx. SPA routes fall back to index.html; JS/CSS
assets are cached with immutable headers; index/config are revalidated or uncached.
`/api/*` and `/health` never return successful app-shell HTML. `PORT` is the only
Nginx substitution; Docker uses the same fixed HTTPS API origin as the static site.

## Verification and limitations

See [the API inventory](docs/api-contracts.md) for current live endpoint checks and
remaining blockers. The [earlier verification notes](docs/verification.md) and
images in `docs/screenshots` describe prior local checks and the demo. They do
not verify live sign-in, account creation, or protected clinical workflows.
