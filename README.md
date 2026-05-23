# Nido

Mobile-first app for co-parenting families in two homes — custody scheduling today, shared finances and more planned. Built with Next.js, MongoDB, and ShadCN UI.

## Requirements

- Node.js 20+
- [pnpm](https://pnpm.io/) 10+ (enable via Corepack: `corepack enable`)
- MongoDB running locally (`mongod`)

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Start MongoDB (if not already running):

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Or run directly
mongod --dbpath /usr/local/var/mongodb
```

4. Seed the database with sample users and entries:

```bash
pnpm run seed
```

5. Start the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel (`/admin` panel)

The admin panel requires the following environment variables:

| Variable | Description |
|----------|-------------|
| `ADMIN_PASSWORD` | Login password for `/admin` |
| `ADMIN_SESSION_TOKEN` | Random string, at least 32 characters (session cookie value after login) |
| `MONGODB_URI` | Connection string for MongoDB Atlas |

In Vercel: **Project → Settings → Environment Variables** — set them for **Production** (and Preview if you test preview deploys). After adding or changing variables, run **Redeploy** (new values are not applied to an already running build).

Generate a session token (locally):

```bash
openssl rand -base64 32
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start Next.js dev server |
| `pnpm run build` | Production build |
| `pnpm run start` | Start production server |
| `pnpm run seed` | Reset and seed MongoDB |
| `pnpm run lint` | Run ESLint |

## Mock auth

Use the user switcher in the header to toggle between **Parent A (Anna)** and **Parent B (Bartek)**. Both parents can see all entries; the active user is used as the default owner when creating new entries.

## Personal Finance (`/finance`)

Household-shared expense tracking with monthly budget, analytics (Recharts), mock AI insights, and optional Web Push reminders.

1. Open **Finanse** in the app nav.
2. Set a monthly limit under **Ustawienia**.
3. Add expenses via the FAB or **Wydatki**.
4. Seed creates default categories on first API call; run `pnpm run seed` to reset demo data.

### Finance environment variables

| Variable | Description |
|----------|-------------|
| `AI_PROVIDER` | `mock` (default), `openai`, or `claude` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push keys (`npx web-push generate-vapid-keys`) |
| `VAPID_SUBJECT` | e.g. `mailto:you@example.com` |
| `CRON_SECRET` | Bearer token for `/api/cron/push-reminders` |

Push reminders are triggered by a Vercel Cron Job (`vercel.json`, daily at 19:00 UTC). On the **Hobby** plan, crons may run at most once per day; use `0 19 * * *` (not hourly). For reminders at each user’s chosen hour, upgrade to **Pro** and set the schedule to `0 * * * *`.

## Architecture

- **UI** (`app/`, `components/`, `hooks/`) — rendering and API calls only
- **API** (`app/api/`) — route handlers with Zod validation
- **Services** (`services/`) — business logic (overlap checks, stats, finance, AI)
- **Models** (`models/`) — Mongoose schemas
- **Utils** (`utils/`) — date math and error types

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/entries?ownerId=` | List entries |
| POST | `/api/entries` | Create entry |
| PUT | `/api/entries/:id` | Update entry |
| DELETE | `/api/entries/:id` | Delete entry |
| GET | `/api/stats` | Aggregated statistics |
| GET | `/api/users` | List parents |
| GET/POST | `/api/expenses` | List / create expenses |
| PUT/DELETE | `/api/expenses/:id` | Update / delete expense |
| GET/POST | `/api/categories` | List / create categories |
| GET/PUT | `/api/budget` | Get / set monthly limit |
| GET | `/api/finance/dashboard` | Budget dashboard metrics |
| GET | `/api/finance/analytics` | Chart aggregates |
| GET | `/api/ai/month-analysis` | AI insights (mock provider) |
| GET/PUT | `/api/notifications/settings` | Push reminder settings |
| POST | `/api/notifications/subscribe` | Save push subscription |

## MongoDB

The default database name is `nido`. If you previously used `custody-tracker`, either update `MONGODB_URI` to keep the old database or run `pnpm run seed` after pointing to the new database name.
