# MedMinder frontend implementation plan

Scope: every write stays in `web/`; backend and Git metadata remain unchanged.

## Assessment and design

Preserve Angular 22 standalone routes, reactive forms, existing role workspaces,
shared icons and the forest-green/mint visual language. Extend the public page
with an honest care pathway rather than invented clinical statistics. Keep a
quiet clinical visual hierarchy, generous whitespace, and accessible controls.
Figma inspection was attempted on 2026-11-07; the connector returned no selection,
then its Starter plan limit. Visual parity cannot be asserted.

The backend has identity-only login and unprotected user/patient controllers.
Do not turn that identity into an authenticated session. No frontend-only change
can supply server authorization. Preserve the development demo explicitly while
making production fail closed and expose no fictional staff records.

## Deliverables

- [x] Test production defaults, identity-only login rejection, HTTP failures and configuration validation.
- [x] Load validated runtime API configuration before Angular bootstraps.
- [x] Make production live-only; avoid initializing demo storage in live mode.
- [x] Add typed login and health integration with bounded requests and useful errors.
- [x] Add public service availability and precise unsupported-capability states.
- [x] Refine homepage, login messaging, design tokens and brand asset organization.
- [x] Prepare static Render deployment and improve existing Docker caching/security configuration.
- [x] Run build, typecheck and tests; document actual evidence.
- [ ] Complete browser visual inspection (connector timed out).
- [x] Inventory every controller endpoint and document backend prerequisites and handoff.

Protected patient/user workflows remain blocked until backend authentication,
role policies and doctor-to-patient ownership enforcement are implemented.
Prescriptions, medication catalogue and adherence have no controller contract.
