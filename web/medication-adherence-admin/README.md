# MedMinder web

The public introduction and staff portal for the Medication Adherence project. The Angular app runs independently of the API and mobile app.

## Run locally

Use Node.js 24.15 or later in the 24.x LTS line (or a Node version supported by Angular 22). From the repository root:

```powershell
cd web/medication-adherence-admin
npm.cmd ci
npm.cmd start -- --host 127.0.0.1 --port 4200
```

Open [http://127.0.0.1:4200/](http://127.0.0.1:4200/). To make a production build, run `npm.cmd run build`. Serve `dist/medication-adherence-admin/browser` and rewrite unknown paths to `index.html` so that refreshed and bookmarked routes work.

## Run the Docker image locally

With Docker running in Linux containers mode, run these commands from the repository root.

```sh
cd web/medication-adherence-admin
docker build -t medication-adherence-admin .
docker run --rm -e PORT=18080 -p 127.0.0.1:18080:18080 medication-adherence-admin
```

Open [the homepage](http://127.0.0.1:18080/). In a second terminal, run `curl.exe -i http://127.0.0.1:18080/healthz` on Windows or `curl -i http://127.0.0.1:18080/healthz` on macOS or Linux. Expect HTTP 200 with `ok` in the response body. The container uses port `10000` when `PORT` is unset.

To check route refreshes, open `/login` and choose **Enter Doctor Demo**. Open **Patients** and refresh the page in the same tab. Repeat in a new tab from `/login` with **Enter Admin Demo**, then open **Doctor accounts** and refresh.

## Deploy to Render

Create a Web Service from the Git repository and select the branch containing the deployment files. The Angular build uses only files under `web/medication-adherence-admin`, so the Dockerfile path and build context are relative to that directory.

| Setting | Value |
| --- | --- |
| Service type | Web Service |
| Runtime | Docker |
| Root Directory | `web/medication-adherence-admin` |
| Dockerfile Path | `./Dockerfile` |
| Docker Build Context | `.` |
| Health Check Path | `/healthz` |

Leave **Docker Command** blank to use the image's default Nginx startup. Nginx listens on `0.0.0.0` using Render's `PORT` and serves Angular's `index.html` for client-side routes. Both staff demos use browser storage, and `/healthz` responds directly from Nginx without an API connection. [Render port binding](https://render.com/docs/web-services#port-binding) · [Render root-relative settings](https://render.com/docs/monorepo-support#root-relative-settings)

## Try the demo

- From the homepage, choose **Explore the demo**, then **Enter Doctor Demo** or **Enter Admin Demo**.
- The [staff login](http://127.0.0.1:4200/login) also has both demo buttons. To try the email and password flow, use `doctor@medminder.demo` or `admin@medminder.demo` with `MedMinderDemo!`.
- Demo records stay in this browser's local storage. The current session survives refresh in the same tab. To restore the fictional records, use **Account settings → Reset demo data**. That resets both workspaces and signs you out.

For a presentation, register a patient and copy their mobile access code, then issue a prescription. That prescription appears in the patient record. A new patient has no doses due until they set a schedule in the companion mobile app. Use a seeded patient such as Marcus Reed to show a populated report.

## Data and integration

| Feature | Running in the web app | Checkout contract |
| --- | --- | --- |
| Staff sign-in | Local demo account or one-click role entry. An HTTP sign-in adapter is available for contract testing. | `POST /api/auth/web-login` accepts email and password and returns staff identity and role. It issues neither a token nor a session cookie, so a successful response cannot authorize portal access. The adapter surfaces HTTP failures and refuses to create a protected live session. |
| Doctor accounts | Local list, creation, details, and account status. | `UsersController` has list, detail, update, freeze, and unfreeze routes. `AuthController` has a doctor creation route. The checkout lacks backend authentication and role authorization for these operations. |
| Patients and mobile codes | Local registration, generated access code, directory, and patient details. | No current controller for patient registration or code issuance/redemption. |
| Prescriptions and doses | Local multi-item prescription builder, history, and seeded dose outcomes. | No current prescription, schedule, or dose controller. Exact reminder times belong to the mobile flow. |
| Medication catalogue | Local create, edit, and delete. In-use entries are archived and prescription history is preserved. | No current medication catalogue controller. |
| Overview, reports, and settings | Computed from the same local records. Sign-out clears the browser session. | No report endpoint or protected session contract. Adherence is taken divided by due doses (taken + skipped + missed). |

The verified HTTP mapping and demo mode selection live in `src/app/core`. Demo is the default. To exercise HTTP sign-in against a development API, change the `MEDMINDER_CONFIG` factory in `src/app/core/app-mode.ts` to `mode: 'live'` with an HTTPS API base URL (or leave it empty for same-origin serving). No protected operations call live endpoints in this checkout. The public portal has no self-signup: administrators create doctor accounts, and doctors register patients for mobile access.

The Figma connector could not render the supplied boards because its Starter plan call limit was reached, and the direct board and Library prototype could not be loaded in this session. The screens were implemented from the written screen inventory and repository rules. Comparison with the supplied Figma frames remains unverified.

## Browser screenshots

See the [1440px and 390px screenshots](docs/screenshots/README.md) for the homepage, staff sign-in, doctor overview, and administrator overview.

Verified against the production build in Chrome: patient registration and access-code copying, a two-item prescription and the resulting patient history, populated and empty adherence reports, doctor account creation and status changes, catalogue add/edit/delete and archiving, protected-route refresh, role denial, and sign-out.
