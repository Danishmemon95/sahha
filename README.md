# Sahha AI — سحة AI

**Clinical clarity, in any language.**

A full-stack Medical AI platform landing page with waitlist functionality, Clerk-based authentication, and a user dashboard that demonstrates webhook-based user synchronization between Clerk and a PostgreSQL database.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (Neon, pooled connection) |
| ORM | Drizzle ORM with `node-postgres` (`pg`) driver |
| Auth | Clerk (prebuilt components) |
| Webhook Verification | Svix |
| Deployment | Single Render Web Service |

---

## Setup & Run (Local)

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.dev) project (Development instance is fine)
- A [Neon](https://neon.tech) PostgreSQL database

### 1. Clone and install

```bash
git clone <repo-url>
cd sahha

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Configure environment variables

**Root `.env`** (for the server):
```bash
cp .env.example .env
```

Fill in:
```
DATABASE_URL=postgresql://...        # Neon pooled connection string
CLERK_PUBLISHABLE_KEY=pk_test_...    # From Clerk Dashboard → API Keys
CLERK_SECRET_KEY=sk_test_...         # From Clerk Dashboard → API Keys
CLERK_WEBHOOK_SIGNING_SECRET=whsec_... # From Clerk Dashboard → Webhooks → your endpoint
PORT=3000
```

**Client `.env`** (for Vite):
```bash
cp client/.env.example client/.env
```

Fill in:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...   # Same publishable key as above
```

### 3. Run database migrations

```bash
cd server
npm run db:generate   # Generate migration SQL files
npm run db:migrate    # Apply migrations to Neon
cd ..
```

### 4. Set up Clerk webhook

1. Go to your Clerk Dashboard → **Webhooks**
2. Add a new endpoint:
   - URL: `https://your-domain.com/api/webhooks/clerk` (or use an [ngrok](https://ngrok.com) tunnel for local testing)
   - Events: Subscribe to `user.created`
3. Copy the **Signing Secret** into your `.env` as `CLERK_WEBHOOK_SIGNING_SECRET`

### 5. Start the dev servers

```bash
npm run dev
```

This runs both the Express server (port 3000) and the Vite dev server (port 5173) concurrently. The Vite dev server proxies `/api` requests to Express.

Open **http://localhost:5173** in your browser.

---

## Required Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Root `.env` | Neon pooled PostgreSQL connection string |
| `CLERK_PUBLISHABLE_KEY` | Root `.env` | Clerk publishable key (starts with `pk_test_`) |
| `CLERK_SECRET_KEY` | Root `.env` | Clerk secret key (starts with `sk_test_`) |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Root `.env` | Webhook signing secret from Clerk (starts with `whsec_`) |
| `PORT` | Root `.env` | Server port (defaults to 3000) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Client `.env` | Same publishable key, prefixed for Vite |

---

## Clerk Project Note

This project uses a **Clerk Development instance** for authentication. This is a deliberate scope decision — Development keys are sufficient for this take-home assignment and local/preview deployments. In production, you would upgrade to a Clerk Production instance with a custom domain.

---

## User Sync Architecture: Webhook-Based Approach

### How it works

When a user signs up through Clerk, the platform needs its own copy of the user in PostgreSQL. This is handled via **Clerk webhooks**:

1. User signs up → Clerk creates the account
2. Clerk fires a `user.created` event to `POST /api/webhooks/clerk`
3. The server verifies the webhook signature using `svix` (Clerk's signing library)
4. On successful verification, the server inserts a row into the `users` table with `clerk_user_id` and `email`

### Why webhooks over lazy creation?

**Lazy creation** (creating the user row on first `/api/me` request) is simpler but has drawbacks:

- **Race conditions**: Multiple concurrent requests could create duplicate rows
- **Missing data**: The user row wouldn't exist until the user visits the dashboard, making server-side queries unreliable
- **No single source of truth**: User creation timing would depend on client behavior, not the actual signup event

**Webhooks** are the correct architectural choice because:

- **Event-driven**: The user row is created as close to the actual signup as possible
- **Decoupled**: The server doesn't need to know about the client's navigation flow
- **Reliable**: Clerk retries failed webhook deliveries automatically

### Idempotency

The webhook handler uses `ON CONFLICT DO NOTHING` on `clerk_user_id`:

```sql
INSERT INTO users (clerk_user_id, email) VALUES ($1, $2) ON CONFLICT (clerk_user_id) DO NOTHING;
```

This means if Clerk retries the webhook (e.g., due to a network timeout on the first attempt), the handler won't create a duplicate row or throw an error. It's safe to receive the same event multiple times.

### Handling the sync delay

There's an inherent race condition: the user might land on `/dashboard` before the webhook has been processed. The frontend handles this gracefully with retry logic — if `/api/me` returns 404, it retries up to 5 times with 2-second intervals, showing a "syncing" state.

---

## What I'd Do Differently With More Time

1. **Webhook failure handling**: Add a dead letter queue or at least persistent logging for failed webhook processing, not just console.error
2. **Lazy creation fallback**: As a belt-and-suspenders approach, add a fallback in the `/api/me` route that creates the user row from the Clerk session if the webhook hasn't fired yet
3. **Email uniqueness**: Add a unique constraint on email in the waitlist table to prevent duplicate signups
4. **Form validation**: Use a schema validation library (Zod) for both client and server-side validation with shared types
5. **Error boundaries**: Add React error boundaries for graceful failure handling
6. **Accessibility audit**: Full WCAG 2.1 AA compliance testing, especially for the RTL layout
7. **Integration tests**: Test the webhook flow end-to-end, including signature verification
8. **Rate limiting**: Add basic rate limiting on the waitlist endpoint to prevent abuse
9. **Clerk localization prop**: Pass the full Arabic localization object to Clerk's components via their `localization` prop for complete Arabic auth UI
10. **Loading skeletons**: Replace spinner-based loading states with skeleton screens for better perceived performance

---

## Project Structure

```
sahha/
├── client/                  → React + TS + Vite frontend
│   ├── src/
│   │   ├── components/      → Navbar, Footer
│   │   ├── i18n/            → I18nContext (lightweight, no framework)
│   │   ├── pages/           → LandingPage, DashboardPage, SignInPage, SignUpPage
│   │   ├── App.tsx          → Root component with routing
│   │   ├── main.tsx         → Entry point
│   │   └── index.css        → Tailwind v4 + custom theme
│   └── index.html
├── server/                  → Express + TS backend
│   ├── db/
│   │   ├── schema.ts        → Drizzle schema (users, waitlist)
│   │   └── index.ts         → PostgreSQL pool connection
│   ├── routes/
│   │   ├── health.ts        → GET /api/health
│   │   ├── waitlist.ts      → POST /api/waitlist
│   │   ├── webhooks.ts      → POST /api/webhooks/clerk
│   │   └── me.ts            → GET /api/me (protected)
│   ├── middleware/
│   │   └── requireAuth.ts   → Clerk session verification
│   ├── index.ts             → Express app entry
│   └── drizzle.config.ts    → Drizzle Kit configuration
├── drizzle/                 → Generated migration files
├── .env.example             → Server env template
└── README.md
```
