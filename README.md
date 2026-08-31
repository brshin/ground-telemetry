# Ground Telemetry Simulator

A small ingest → store → query → chart slice. A simulator POSTs fake spacecraft measurements; Next.js writes them to local Postgres; the home page polls the last 15 minutes and draws a line chart.

No websockets, auth, or Docker. Postgres runs on this machine (`localhost`), not a hosted DB.

## Stack

- Next.js (App Router, TypeScript)
- PostgreSQL 16 on localhost
- Node simulator (`scripts/simulate.ts`)

## Setup

**1. Install and start Postgres** (Homebrew on macOS):

```bash
brew install postgresql@16
brew services start postgresql@16
createdb ground_telemetry
```

**2. Apply the schema** from the repo root (ordinary terminal, after `createdb`):

```bash
psql ground_telemetry -f schema.sql
```

This creates the `telemetry` table and index. It is not run from inside the `psql` prompt. Safe to repeat (`IF NOT EXISTS`).

**3. Env** — project root, `.env.local` (not committed):

```
DATABASE_URL=postgresql://YOUR_MAC_USER@localhost:5432/ground_telemetry
```

Homebrew Postgres usually has no password. Restart `npm run dev` after creating this file.

**4. App**

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**5. Simulator** (second terminal; app must already be running):

```bash
npx tsx scripts/simulate.ts
```

Posts 3 metrics (`temp`, `bus_voltage`, `cabin_pressure`) at 1 Hz to `/api/ingest`. Ctrl+C to stop.

## API


| Method | Path             | Role                                                                                                                                                           |
| ------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/health`    | Ping Postgres. 200 `{ "ok": true }` or 503 if DB is down.                                                                                                      |
| `POST` | `/api/ingest`    | Body `{ "points": [ { time, vehicle_id, metric, value } ] }`. 201 `{ "inserted": n }`. Bad batch → 400.                                                        |
| `GET`  | `/api/telemetry` | Query: `vehicle`, `metric`, `from`, `to` (ISO UTC). 200 `{ "points": [...] }` oldest first, cap 5000. Empty window is `[]`, not an error. `from` > `to` → 400. |


Metrics: `temp` \| `bus_voltage` \| `cabin_pressure`. Vehicle in the simulator: `sat-1`.

## Failure modes

- Simulator off → chart goes stale / empty; health still 200.
- Postgres off → health and ingest fail (503); page shows an error.

