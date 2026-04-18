# Shamba Records — Field Monitoring System

A full-stack web application for managing agricultural fields, tracking crop stages, and coordinating field agents. Admins manage the full estate; agents see only their assigned fields.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Local Setup](#local-setup)
4. [Environment Variables](#environment-variables)
5. [API Reference](#api-reference)
6. [Role-Based Access](#role-based-access)
7. [Field Status Logic](#field-status-logic)
8. [Production Deployment (Render)](#production-deployment-render)
9. [Design Decisions](#design-decisions)
10. [Assumptions](#assumptions)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 4.9, React Router v6, Recharts, Axios, lucide-react |
| Backend | Node.js, Express 4.18, TypeScript 5.3 |
| ORM | Sequelize 6 |
| Database | SQLite 3 (file-based, `backend/database.sqlite`) |
| Auth | JWT (jsonwebtoken 9), bcryptjs |
| Styling | Inline `React.CSSProperties` objects (no CSS modules or Tailwind) |
| Deployment | Render Web Service (single service — Express serves the React build) |

---

## Project Structure

```
Shamba Records app/
├── backend/
│   ├── config/          # Sequelize database connection
│   ├── middleware/       # JWT authenticate + requireAdmin guards
│   ├── models/           # Sequelize models (User, Field, Update)
│   ├── routes/           # Express routers (auth, users, fields, updates, dashboard)
│   ├── types/            # Shared TypeScript types (Stage, FieldStatus, FieldJSON …)
│   ├── utils/            # computeFieldStatus logic
│   ├── server.ts         # Entry point; serves API + React build in production
│   ├── seed.ts           # One-shot seed script (wipes DB and inserts demo data)
│   ├── tsconfig.json
│   └── package.json
└── frontend/
    ├── public/           # index.html, shamba.svg (favicon + logo)
    └── src/
        ├── api/          # Axios instance with JWT interceptor
        ├── components/   # Layout, shared UI
        ├── context/      # AuthContext, ThemeContext
        ├── pages/        # LoginPage, Dashboard, Fields, FieldDetail, Agents, Register
        └── types/        # Shared TypeScript types
```

---

## Local Setup

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1 — Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required for the frontend because some packages (lucide-react, recharts) have peer dependency conflicts with React 18.

### 2 — Configure environment

Create `backend/.env` (see [Environment Variables](#environment-variables) below).

### 3 — Seed the database

```bash
cd backend
npm run seed
```

This **wipes and recreates** all tables, then inserts demo users and fields.

### 4 — Run in development

Open two terminals:

```bash
# Terminal 1 — backend (auto-restarts on file changes)
cd backend
npm run dev

# Terminal 2 — frontend (Create React App dev server with proxy)
cd frontend
npm start
```

The frontend dev server proxies `/api/*` requests to `http://localhost:5000` (configured in `frontend/package.json`).

### 5 — Demo credentials

| Role  | Email                       | Password   |
|-------|-----------------------------|------------|
| Admin | admin@smartseason.com       | admin123   |
| Agent | alice@smartseason.com       | agent123   |
| Agent | brian@smartseason.com       | agent123   |

---

## Environment Variables

Create `backend/.env`:

```dotenv
PORT=5000
JWT_SECRET=your_secret_here
NODE_ENV=development
```

| Variable     | Required | Description |
|-------------|----------|-------------|
| `PORT`       | No       | HTTP port (defaults to `5000`) |
| `JWT_SECRET` | Yes      | Secret used to sign/verify JWT tokens |
| `NODE_ENV`   | No       | Set to `production` on Render |

> **Never commit `.env` to git.** It is listed in `.gitignore`.

---

## API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | None | Returns JWT token |

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create a new user |
| PUT | `/api/users/:id` | Admin | Update a user |
| DELETE | `/api/users/:id` | Admin | Delete a user |

### Fields

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/fields` | Any | Admin sees all; agents see only their assigned fields |
| GET | `/api/fields/:id` | Any | Field detail with updates history |
| POST | `/api/fields` | Admin | Create a field |
| PUT | `/api/fields/:id` | Admin | Update a field |
| DELETE | `/api/fields/:id` | Admin | Delete a field |

### Field Updates (Observations)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/updates` | Any | Log an observation for a field |
| GET | `/api/updates/field/:fieldId` | Any | Get observations for a specific field |

### Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard` | Any | Aggregated stats (field counts by status, stage, recent activity) |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Returns `{ status: 'ok' }` |

---

## Role-Based Access

Two roles exist: `admin` and `agent`.

| Feature | Admin | Agent |
|---------|-------|-------|
| View all fields | ✅ | ❌ (own fields only) |
| Create / edit / delete fields | ✅ | ❌ |
| View all agents | ✅ | ❌ |
| Create / manage users | ✅ | ❌ |
| Log field observations | ✅ | ✅ |
| View dashboard | ✅ | ✅ (filtered to their fields) |

Route-level enforcement: the `authenticate` middleware validates the JWT on every protected route. The `requireAdmin` middleware is applied to mutating field and user routes.

---

## Field Status Logic

Each field is assigned a computed `status` (not stored in the database — derived at query time by `utils/statusLogic.ts`):

| Status | Conditions |
|--------|-----------|
| **Completed** | Stage is `Harvested` |
| **At Risk** | Stage is `Planted` AND planting date > 90 days ago |
| **At Risk** | No observation ever logged AND field is > 7 days old |
| **At Risk** | Last observation was > 14 days ago |
| **Active** | Everything else |

---

## Production Deployment (Render)

The app is deployed as a **single Render Web Service**. Express compiles the React app into `frontend/build/` during the build step and then serves it as static files at runtime.

### Render Settings

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

`npm run build` (in `backend/package.json`) does:
1. `cd ../frontend && npm install && npm run build` — produces `frontend/build/`
2. `tsc` — compiles backend TypeScript to `backend/dist/`

`npm start` runs `node dist/server.js`.

### Environment Variables on Render

Set these in **Render → your service → Environment**:

```
NODE_ENV=production
JWT_SECRET=<a long random string>
```

### Auto-seeding

On a fresh deploy the SQLite database is empty. The server detects this (`User.count() === 0`) on startup and seeds demo data automatically. No manual shell commands are needed.

---

## Design Decisions

### Single-service deployment
Render's free tier gives one Web Service. Rather than two separate services (separate frontend hosting + backend API), Express serves the compiled React build. This avoids cross-origin issues in production and keeps infrastructure simple.

### SQLite over PostgreSQL
SQLite requires zero external infrastructure, which is ideal for a demo/MVP. The Sequelize ORM abstracts the database layer, so migrating to PostgreSQL later requires only a connection string change and replacing `sqlite3` with `pg`.

### JWT stored in localStorage
JWTs are stored in `localStorage` for simplicity. A production hardening step would move tokens to `HttpOnly` cookies to prevent XSS access.

### Computed field status (not stored)
`status` (`Active` / `At Risk` / `Completed`) is derived fresh on every query rather than stored as a column. This avoids stale data and the need for a background job to update statuses — the rules are applied in one place (`utils/statusLogic.ts`).

### Inline styles throughout the frontend
All components use `const S: Record<string, React.CSSProperties> = { ... }` rather than CSS modules or a utility framework. This keeps all styling co-located with the component and avoids class-name collisions, at the cost of reusability.

### Role access enforced at the API layer
The frontend hides admin-only UI, but access control is enforced server-side via `authenticate` + `requireAdmin` middleware. Frontend restrictions are UX-only.

### `sequelize.sync()` instead of migrations
`sync()` auto-creates tables from model definitions. This is fast for a prototype but not suitable for production schema evolution. A migration tool (Sequelize CLI or Umzug) would be the next step before real data is stored.

---

## Assumptions

- **Single organisation** — there is no multi-tenancy. All admins can see and manage all fields.
- **One agent per field** — `assignedAgentId` is a single foreign key. A field can be unassigned (`null`) but cannot be assigned to multiple agents simultaneously.
- **Observation ≠ stage change** — logging an update records notes and the current stage, but changing the stage on the field record itself is a separate admin action.
- **No password reset flow** — user accounts are created and managed by the admin. There is no self-service password recovery.
- **SQLite persistence on Render** — Render's free tier does not provide persistent disk storage; the SQLite file is ephemeral and will reset on every redeploy. The auto-seed on startup ensures demo data is always available. For real data persistence, the database should be migrated to a managed PostgreSQL instance.
- **No email validation** — the registration and user-creation forms accept any string as an email. A real deployment would validate format and uniqueness more robustly.
