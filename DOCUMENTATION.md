# Sahha AI (سحة AI) — Architecture & Technical Documentation

> **Clinical clarity, in any language.**  
> A production-minded full-stack Medical AI platform landing page, waitlist system, Clerk authentication integration, and own-database user synchronization.

---

## Table of Contents

1. [Executive Summary & High-Level Architecture](#1-executive-summary--high-level-architecture)
2. [Technology Stack & Dependency Breakdown](#2-technology-stack--dependency-breakdown)
3. [Complete File-by-File Codebase Directory](#3-complete-file-by-file-codebase-directory)
4. [Database Design & Drizzle Migration Workflow](#4-database-design--drizzle-migration-workflow)
5. [Backend API Routes & Middleware](#5-backend-api-routes--middleware)
6. [Authentication & Webhook Synchronization Flow](#6-authentication--webhook-synchronization-flow)
7. [Arabic / RTL Implementation & Localization](#7-arabic--rtl-implementation--localization)
8. [Configuration & Environment Variables](#8-configuration--environment-variables)
9. [Key Engineering Decisions & Edge Case Solutions](#9-key-engineering-decisions--edge-case-solutions)
10. [Deployment & Operations Guide](#10-deployment--operations-guide)

---

## 1. Executive Summary & High-Level Architecture

Sahha AI is designed for healthcare providers in the Gulf region (UAE, Saudi Arabia, Qatar, etc.) where bilingual clinical documentation in both Arabic and English is essential. 

The architecture follows a unified monorepo model:
- **Client**: Single Page Application (SPA) built with React 19, Vite, and Tailwind CSS v4.
- **Server**: Long-lived Node.js Express 5 API running in TypeScript.
- **Database**: PostgreSQL hosted on Neon with connection pooling.
- **Auth Provider**: Clerk with prebuilt authenticated components.
- **Deployment**: Single Render Web Service where Express serves both the REST API and the compiled React production bundle.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User's Web Browser                              │
│  - React 19 + TypeScript (Vite SPA)                                    │
│  - Custom i18n Context (en / ar) + dir="rtl" / dir="ltr"               │
│  - Clerk Auth Components (<SignIn />, <SignUp />, <UserButton />)      │
└──────────────┬──────────────────────────────────────────▲──────────────┘
               │                                          │
       API Requests (/api/*)                      Static Assets / SPA Fallback
               │                                          │
┌──────────────▼──────────────────────────────────────────┴──────────────┐
│                  Express 5 Server (Node.js + TS)                       │
│                                                                        │
│  ┌───────────────────────┐           ┌───────────────────────────────┐ │
│  │ Public Routes         │           │ Protected Routes              │ │
│  │ - GET  /api/health    │           │ - GET /api/me                 │ │
│  │ - POST /api/waitlist  │           │   (via requireAuth & Clerk)   │ │
│  └───────────────────────┘           └──────────────┬────────────────┘ │
│                                                     │                  │
│  ┌────────────────────────────────────────────────┐ │                  │
│  │ Webhook Route                                  │ │                  │
│  │ - POST /api/webhooks/clerk                     │ │                  │
│  │   (Raw Buffer -> Svix Signature Verification)  │ │                  │
│  └───────────────────────┬────────────────────────┘ │                  │
└──────────────────────────┼──────────────────────────┼──────────────────┘
                           │                          │
              Idempotent Upsert (user.created)        │ Query (email, date)
                           │                          │
                           ▼                          ▼
               ┌──────────────────────────────────────────┐
               │         Neon PostgreSQL Database         │
               │  - Pool connection via `node-postgres`   │
               │  - Drizzle ORM Schema:                   │
               │    * `users`    (clerk_user_id, email)   │
               │    * `waitlist` (name, email)            │
               └──────────────────────────────────────────┘
```

---

## 2. Technology Stack & Dependency Breakdown

### 2.1 Backend Dependencies (`server/package.json`)

| Package | Version | Purpose & Rationale |
| :--- | :--- | :--- |
| `express` | `^5.2.1` | Fast, lightweight HTTP server framework. Handles routing, raw body buffering, static asset serving, and JSON APIs. |
| `pg` | `^8.23.1` | The `node-postgres` client. We instantiate `new Pool(...)` because the Express server is a long-lived process on Render. This is preferred over the Neon serverless HTTP driver which is intended for edge functions. |
| `drizzle-orm` | `^0.45.3` | Lightweight TypeScript ORM offering full type safety, SQL-like query builders, zero overhead, and native integration with `node-postgres`. |
| `drizzle-kit` | `^0.31.9` | CLI companion for Drizzle to generate versioned SQL migration files and apply them to Neon. |
| `@clerk/express` | `^2.1.75` | Official Clerk middleware for Node/Express. Parses session tokens from the `Authorization: Bearer <token>` header without custom JWT parsing. |
| `svix` | `^1.99.1` | Clerk's official webhook verification library. Verifies cryptographic signatures (`svix-id`, `svix-timestamp`, `svix-signature`) using HMAC SHA256 against raw request payload bytes. |
| `dotenv` | `^18.0.5` | Loads environment variables from the root `.env` into `process.env`. |
| `cors` | `^2.8.6` | Configures Cross-Origin Resource Sharing. Enables the Vite dev server (`http://localhost:5173`) to call the Express API (`http://localhost:3000`) during development. |
| `tsx` | `^4.19.4` | TypeScript Execute engine. Runs and watches TypeScript files in development without manual transpile steps. |
| `@types/*` | Latest | Type definitions for Node, Express, PG, and CORS. |

### 2.2 Frontend Dependencies (`client/package.json`)

| Package | Version | Purpose & Rationale |
| :--- | :--- | :--- |
| `react` & `react-dom` | `^19.2.0` | Modern React UI library utilizing the latest concurrent rendering features and hooks. |
| `react-router-dom` | `^7.13.1` | Client-side declarative routing for `/`, `/sign-in/*`, `/sign-up/*`, and `/dashboard`. |
| `@clerk/react` | `^6.12.0` | Prebuilt, accessible authentication components (`<SignIn />`, `<SignUp />`, `<UserButton />`) and hooks (`useAuth`, `useClerk`). |
| `@clerk/localizations` | `^3.13.0` | Official Clerk language dictionaries (including `arSA`). Injected into `<ClerkProvider>` to localize auth interfaces into Arabic. |
| `tailwindcss` | `^4.3.3` | Tailwind CSS v4 engine using CSS-first configuration via `@theme`. |
| `@tailwindcss/vite` | `^4.3.3` | Native Vite plugin for Tailwind v4 for instant build and HMR performance. |
| `vite` | `^8.3.2` | Next-generation frontend build tool and dev server. |

### 2.3 Root Dev Tooling (`package.json`)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `concurrently` | `^9.2.4` | Concurrently launches `dev:server` and `dev:client` via a single `npm run dev` command. |

---

## 3. Complete File-by-File Codebase Directory

```
sahha/
├── .env                          → Local secrets (gitignored)
├── .env.example                  → Template of all required root environment variables
├── .gitignore                    → Ignore list (node_modules, dist, .env, *.log)
├── DOCUMENTATION.md              → This architecture and implementation reference
├── README.md                     → Assignment submission summary & quickstart
├── package.json                  → Root monorepo scripts & orchestration
├── package-lock.json             → Root lockfile
│
├── drizzle/                      → Versioned database migrations
│   ├── 0000_unknown_the_hand.sql → Generated SQL DDL creating 'users' and 'waitlist'
│   └── meta/                     → Drizzle migration metadata snapshots
│       ├── _journal.json
│       └── 0000_snapshot.json
│
├── server/                       → Express 5 backend
│   ├── package.json              → Server scripts & backend dependencies
│   ├── tsconfig.json             → Node ES2022 TypeScript configuration
│   ├── drizzle.config.ts         → Drizzle Kit migration configuration
│   ├── index.ts                  → Express entry point, middleware chain & static serving
│   ├── db/
│   │   ├── schema.ts             → Drizzle table definitions ('users' & 'waitlist')
│   │   └── index.ts              → Pooled pg client & Drizzle ORM instance
│   ├── routes/
│   │   ├── health.ts             → GET /api/health (uptime check)
│   │   ├── waitlist.ts           → POST /api/waitlist (anonymous signups)
│   │   ├── webhooks.ts           → POST /api/webhooks/clerk (Svix verified Clerk webhook)
│   │   └── me.ts                 → GET /api/me (authenticated user DB lookup)
│   └── middleware/
│       └── requireAuth.ts        → Server-side Clerk session verification guard
│
└── client/                       → React 19 frontend
    ├── package.json              → Frontend scripts & dependencies
    ├── vite.config.ts            → Vite configuration with Tailwind plugin & API proxy
    ├── tsconfig.json             → TS project reference coordinator
    ├── tsconfig.app.json         → Client application TS settings
    ├── tsconfig.node.json        → Tooling TS settings
    ├── index.html                → HTML shell with metadata & favicon
    ├── .env                      → Client environment file (gitignored)
    ├── .env.example              → Client environment template
    ├── public/
    │   └── favicon.svg           → Sahha medical gradient brand icon
    └── src/
        ├── main.tsx              → React root mount point with StrictMode
        ├── App.tsx               → Root application with ClerkProvider & I18nProvider
        ├── index.css             → Tailwind v4 @theme, custom palette, glass & animations
        ├── vite-env.d.ts         → TypeScript typing for Vite environment variables
        ├── i18n/
        │   └── I18nContext.tsx   → Lightweight bilingual context & full dictionaries
        ├── components/
        │   ├── Navbar.tsx        → Responsive glass navbar with brand, lang toggle & auth state
        │   └── Footer.tsx        → Clinical branding, copyright & links
        └── pages/
            ├── LandingPage.tsx   → Hero, features grid, trust badges & waitlist form
            ├── DashboardPage.tsx → Protected view fetching from /api/me with retry sync
            ├── SignInPage.tsx    → Clerk <SignIn /> wrapper with clinical styling
            └── SignUpPage.tsx    → Clerk <SignUp /> wrapper with clinical styling
```

---

## 4. Database Design & Drizzle Migration Workflow

### 4.1 Schema Definition (`server/db/schema.ts`)

The database consists of two deliberately independent tables:

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").unique().notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### Why are `users` and `waitlist` strictly decoupled?
1. **Separation of Concerns**: A prospective clinician or hospital administrator may express interest by joining the waitlist without undergoing identity creation.
2. **Data Minimization**: Anonymous waitlist leads do not require authentication tokens, password managers, or third-party OAuth links.
3. **Audit Clarity**: The `users` table serves exclusively as an authoritative mirror of verified clinical accounts authorized to access the system.

### 4.2 Migration Strategy
Rather than using ephemeral prototypes (`drizzle-kit push`), versioned migration files are generated and applied:
- **`npm run db:generate`**: Inspects `schema.ts`, compares it against the latest snapshot in `drizzle/meta`, and outputs a versioned SQL file (e.g., `0000_unknown_the_hand.sql`).
- **`npm run db:migrate`**: Executes pending migration statements against the target Neon PostgreSQL instance via `drizzle-kit migrate`.

---

## 5. Backend API Routes & Middleware

### 5.1 Route Map

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | No | Returns `200 { "status": "ok" }`. Used by external monitoring (e.g., Render cron) to prevent cold starts. |
| `POST` | `/api/waitlist` | No | Accepts `{ name, email }`. Validates input strings and email format, then writes to the `waitlist` table. Returns `201`. |
| `POST` | `/api/webhooks/clerk` | Signed (Svix) | Webhook target for Clerk events. Validates cryptographic signatures using the raw payload. Handles `user.created` with an idempotent upsert into `users`. |
| `GET` | `/api/me` | Yes (Clerk JWT) | Protected endpoint. Extracts `clerkUserId` from verified session, queries the local PostgreSQL `users` table, and returns `{ email, createdAt }`. |
| `GET` | `{*path}` | No | Production SPA catch-all. Delivers `client/dist/index.html` for client-side routing. |

### 5.2 Middleware Execution Order (`server/index.ts`)

Middleware ordering is critical to avoid request payload corruption:

1. **`cors()`**: Permits requests from the frontend during development.
2. **`clerkMiddleware()`**: Parses `Authorization: Bearer <token>` and validates the session against Clerk's public JWKS keys.
3. **`express.raw({ type: "application/json" })` on `/api/webhooks/clerk`**:
   > ⚠️ **Critical Architectural Requirement**: Svix signature verification computes an HMAC over the exact bytes sent by Clerk. If `express.json()` parses the request first, key reordering or whitespace changes will cause signature validation to fail. Mounting `express.raw()` specifically for the webhook route preserves the exact byte buffer.
4. **`express.json()`**: Standard JSON parsing for all remaining API endpoints (`/api/waitlist`, etc.).
5. **Static Middleware**: `express.static("../client/dist")` to serve built assets.
6. **Express 5 Catch-All**: `app.get("{*path}", ...)` serves `index.html`.

---

## 6. Authentication & Webhook Synchronization Flow

### 6.1 User Synchronization Pipeline

```
[Visitor] ──(Fills Signup Form)──> [Clerk Auth Service]
                                            │
                                            ├─> Sets Client Session Token
                                            │
                                            ▼ Fires HTTP POST
                                   [POST /api/webhooks/clerk]
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │ 1. Extract svix-id, svix-timestamp, svix-sig  │
                    │ 2. Verify HMAC SHA256 with Signing Secret     │
                    └───────────────────────┬───────────────────────┘
                                            │ Verified
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │ Extract clerkUserId & primary email           │
                    │ INSERT INTO users (...)                       │
                    │ ON CONFLICT (clerk_user_id) DO NOTHING        │
                    └───────────────────────┬───────────────────────┘
                                            │
[User Browser] ──(Navigates /dashboard)─────┤
       │                                    │
       ▼ Calls GET /api/me                  │
[GET /api/me]                               │
       │                                    │
       ├─> Verifies Bearer Token            │
       └─> SELECT FROM users WHERE clerk_user_id = $userId
             │
             ├─> Found: Returns { email, createdAt }
             └─> Not found (Webhook race): Returns 404
                   │
                   ▼ Frontend triggers 2s backoff retry (up to 5x)
```

### 6.2 Why Webhooks vs. Lazy Creation?

* **Lazy Creation**: Waiting until a user visits `/dashboard` to create the database row.
  * *Flaws*: If the user closes their browser after signup, or if an administrator looks at the database, the user does not exist. It couples user creation to client page visits.
* **Webhook Synchronization**:
  * *Strengths*: Event-driven and decoupled. The user record is created immediately upon account creation. Clerk guarantees delivery through automatic exponential retries if the server is temporarily unreachable.

### 6.3 Idempotency via `ON CONFLICT DO NOTHING`

Clerk guarantees *at-least-once* delivery, meaning network interruptions or delays can cause duplicate webhook transmissions. The database query guarantees idempotency:

```typescript
await db
  .insert(users)
  .values({ clerkUserId, email: primaryEmail })
  .onConflictDoNothing({ target: users.clerkUserId });
```

If the same `user.created` event is received multiple times, the duplicate is ignored without throwing errors or creating duplicate rows.

### 6.4 The Webhook Latency Race Condition

There is a brief window (typically 200ms–1500ms) between when Clerk creates the user on the client and when the webhook arrives at the server. If the user is redirected immediately to `/dashboard`, `/api/me` may return a `404 (User not yet synced)`.

**Client Solution (`client/src/pages/DashboardPage.tsx`)**:
Instead of displaying an error screen, the dashboard detects a 404 from `/api/me`, displays an amber *"Setting up your account..."* indicator, and schedules retries every 2 seconds (up to 5 attempts). As soon as the webhook completes, the dashboard transitions to display the user's data.

---

## 7. Arabic / RTL Implementation & Localization

### 7.1 Custom Context (`client/src/i18n/I18nContext.tsx`)

Rather than importing heavyweight internationalization frameworks, Sahha AI uses a focused React Context:
- Holds active `locale` (`"en"` | `"ar"`).
- Automatically persists user language preferences in `localStorage`.
- Syncs the DOM dynamically on change:
  ```typescript
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = locale;
  ```

### 7.2 Tailwind CSS Logical Properties

Directional CSS properties (`left`, `right`, `margin-left`, `padding-right`) do not adapt to RTL layouts. Sahha AI strictly uses CSS Logical Properties via Tailwind utilities:

| Directional (Avoided) | Logical (Implemented) | Behavior in LTR | Behavior in RTL |
| :--- | :--- | :--- | :--- |
| `ml-4` / `mr-4` | `ms-4` / `me-4` | Margin Left / Right | Margin Right / Left |
| `pl-6` / `pr-6` | `ps-6` / `pe-6` | Padding Left / Right | Padding Right / Left |
| `left-0` / `right-0` | `start-0` / `end-0` | Left / Right | Right / Left |

### 7.3 LTR Isolation for Email & Coordinates

Email addresses and specific identifiers are inherently LTR strings. If rendered inside an RTL parent without isolation, punctuation such as `@` and `.` can display incorrectly (e.g., `user@hospital.ae` displaying as `ae.hospital@user`).

All displayed emails and input fields are explicitly isolated:
```tsx
<span dir="ltr">{userData.email}</span>
<input dir="ltr" type="email" ... />
```

### 7.4 Clerk Auth Component Localization

Clerk's `<SignIn />` and `<SignUp />` components dynamically adopt the active language. The root `<ClerkProvider>` receives the official Arabic localization dictionary from `@clerk/localizations`:

```tsx
<ClerkProvider
  publishableKey={CLERK_PUBLISHABLE_KEY}
  localization={locale === "ar" ? arSA : undefined}
>
```
When a user clicks the language toggle in the navigation bar, the Clerk authentication modals instantly translate labels, placeholders, and action buttons into Arabic.

---

## 8. Configuration & Environment Variables

### 8.1 Server Environment (`.env`)

| Key | Description | Format / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon pooled PostgreSQL connection URI | `postgresql://user:pass@ep-xyz-pooler.region.neon.tech/neondb?sslmode=require` |
| `CLERK_PUBLISHABLE_KEY` | Clerk instance public identifier | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk backend secret API key | `sk_test_...` |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Signing secret generated for the webhook endpoint | `whsec_...` |
| `PORT` | Local server port (optional, defaults to 3000) | `3000` |

### 8.2 Client Environment (`client/.env`)

| Key | Description | Format / Example |
| :--- | :--- | :--- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Same Clerk publishable key, exposed to the Vite browser bundle | `pk_test_...` |

---

## 9. Key Engineering Decisions & Edge Case Solutions

### 9.1 ES Module Dotenv Hoisting Gotcha
* **Problem**: In ES modules (`"type": "module"`), static `import` declarations are evaluated before runtime statements execute. When `server/index.ts` imported database routes, `server/db/index.ts` was instantiated before `dotenv.config()` ran. As a result, `process.env.DATABASE_URL` was `undefined` when `new Pool(...)` was initialized, causing `ECONNREFUSED` on port 5432.
* **Solution**: `server/db/index.ts` explicitly invokes `dotenv.config(...)` before creating the PostgreSQL pool, guaranteeing connection parameters are loaded regardless of import order.

### 9.2 Express 5 Wildcard Routing Migration
* **Problem**: Express 5 uses an updated version of `path-to-regexp`. The legacy wildcard syntax `app.get("*", ...)` throws:
  `Missing parameter name at index 1: *`.
* **Solution**: Migrated the static asset fallback handler to Express 5 syntax:
  ```typescript
  app.get("{*path}", (_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
  ```

### 9.3 PostgreSQL SSL Modes
* **Notice**: Modern versions of `pg` emit a deprecation notice regarding `sslmode=require` vs `verify-full`. The connection string is configured for secure communication with Neon's pooled proxy endpoints.

---

## 10. Deployment & Operations Guide

### 10.1 Single Render Web Service Deployment

Because Express serves the compiled React app as static files, the entire project deploys as a single Web Service on Render:

1. **Build Command**:
   ```bash
   npm install && cd client && npm install && npm run build && cd ../server && npm install && npm run build
   ```
2. **Start Command**:
   ```bash
   cd server && npx tsx index.ts
   ```
3. **Environment Variables on Render**:
   - `DATABASE_URL`: Your Neon pooled connection string.
   - `CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key.
   - `CLERK_SECRET_KEY`: Your Clerk secret key.
   - `CLERK_WEBHOOK_SIGNING_SECRET`: Obtained in the next step.
   - `NODE_ENV`: `production`

### 10.2 Registering the Production Webhook

1. Navigate to the **Clerk Dashboard → Webhooks**.
2. Click **Add Endpoint**:
   - **Endpoint URL**: `https://<your-render-app>.onrender.com/api/webhooks/clerk`
   - **Subscribe to events**: `user.created`
3. Copy the **Signing Secret** (starts with `whsec_`).
4. Paste it as `CLERK_WEBHOOK_SIGNING_SECRET` into Render's Environment Variables settings.

### 10.3 Uptime Monitoring
Set up a 10-minute ping against `https://<your-render-app>.onrender.com/api/health` using an uptime monitor (such as UptimeRobot or Cron-job.org) to keep Render's free-tier instance warm and avoid spin-up latency.
