<div align="center">

# 💊 MedMinder

### Medication Adherence System

**One platform. Two applications. Three user roles.**

An Angular clinical portal and Flutter patient application connected through an ASP.NET Core API and PostgreSQL database.

<p>
  <img alt="Angular" src="https://img.shields.io/badge/Angular-Clinical%20web%20portal-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img alt="Flutter" src="https://img.shields.io/badge/Flutter-Patient%20mobile%20app-02569B?style=for-the-badge&logo=flutter&logoColor=white" />
</p>
<p>
  <img alt="ASP.NET Core" src="https://img.shields.io/badge/ASP.NET%20Core-Web%20API-512BD4?style=flat-square&logo=dotnet&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Deployment-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

[Repository](https://github.com/CS-U-G/medication-adherence) · [Backend deployment](https://medication-adherence.onrender.com/) · [Swagger endpoint](https://medication-adherence.onrender.com/swagger/index.html)

</div>

---

## Overview

**MedMinder** brings clinical medication management and patient-facing medication workflows into one project. Doctors and administrators use the **Angular web portal**; patients use the **Flutter mobile app**. Both clients communicate with the shared **ASP.NET Core API**, which connects to **PostgreSQL**.

| Experience | Intended user | Documented scope |
| :-- | :-- | :-- |
| **Clinical portal** · Angular | Doctors | Patient records and prescription workflows |
| **Administration** · Angular | Administrators | Doctor accounts and medication catalogue |
| **Patient app** · Flutter | Patients | Patient access and medication-facing experience |

## Architecture

```mermaid
flowchart TB
    subgraph Clients[Client applications]
        W["Angular web portal<br/>Doctors · Administrators"]
        M["Flutter mobile app<br/>Patients"]
    end
    W -->|HTTP / JSON| API["ASP.NET Core Web API"]
    M -->|HTTP / JSON| API
    API --> BLL["Business Logic Layer"]
    BLL --> DAL["Data Access Layer"]
    DAL --> PG[(PostgreSQL)]
    classDef client fill:#E5F5EF,stroke:#178365,color:#174B3D;
    classDef server fill:#EEF0FF,stroke:#6554C0,color:#27214F;
    classDef data fill:#E8F1FF,stroke:#4169E1,color:#183567;
    class W,M client;
    class API,BLL,DAL server;
    class PG data;
```

The backend is split into **API**, **business logic** and **data access** projects. Database operations stay behind the API rather than being performed directly by either client.

## Application surface

The repository contains implementations and API contracts for **staff authentication**, **patient registration and retrieval**, **doctor account management**, **medication catalogue operations** and **prescription management**. The web portal has a shared staff sign-in entry point with distinct doctor and administrator workspaces.

The documented authentication routes are:

| Client | Endpoint | Request |
| :-- | :-- | :-- |
| Staff web portal | `POST /api/auth/web-login` | `email`, `password` |
| Patient access flow | `POST /api/patients/code-login` | `accessCode` |

*These are API routes, not a claim that every client workflow is fully integrated or deployed without errors.*

## Repository structure

```text
medication-adherence/
├── backend/
│   ├── MedicationAdherence.Api/   # ASP.NET Core API
│   ├── MedicationAdherence.BLL/   # Business logic
│   └── MedicationAdherence.DAL/   # Data access
├── web/
│   └── medication-adherence-admin/  # Angular portal
├── mobile/
│   └── medication_adherence/       # Flutter app
└── docs/                         # Project documentation
```

## Development

Start each application from its own project directory after installing the relevant **.NET**, **Node.js/npm** and **Flutter** toolchains and configuring the backend's PostgreSQL connection.

```bash
# API — from the repository root
dotnet run --project backend/MedicationAdherence.Api

# Angular — from the repository root
cd web/medication-adherence-admin
npm ci
npm start

# Flutter — from the repository root
cd mobile/medication_adherence
flutter pub get
flutter run
```

> Run the Angular and Flutter commands in **separate terminals** from the repository root. API URLs and backend credentials must be configured for the selected environment; do not commit secrets.

---

<div align="center">

**CS-U-G · Medication Adherence Project**

</div>
