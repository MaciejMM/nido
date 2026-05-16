# Nido

Mobile-first app for co-parenting families in two homes — custody scheduling today, shared finances and more planned. Built with Next.js, MongoDB, and ShadCN UI.

**Tagline:** *Dwa domy, jedno gniazdo*

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

## Architecture

- **UI** (`app/`, `components/`, `hooks/`) — rendering and API calls only
- **API** (`app/api/`) — route handlers with Zod validation
- **Services** (`services/`) — business logic (overlap checks, stats)
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

## MongoDB

The default database name is `nido`. If you previously used `custody-tracker`, either update `MONGODB_URI` to keep the old database or run `pnpm run seed` after pointing to the new database name.
