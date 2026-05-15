# Custody Tracker

Mobile-first co-parenting custody day tracker built with Next.js, MongoDB, and ShadCN UI.

## Requirements

- Node.js 20+
- MongoDB running locally (`mongod`)

## Setup

1. Install dependencies:

```bash
npm install
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
npm run seed
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run seed` | Reset and seed MongoDB |
| `npm run lint` | Run ESLint |

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
