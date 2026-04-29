# Artifact Museum

A Next.js companion app for [Artifact Logger](https://github.com/Rothens/artifact-logger). Displays a curated, publicly browsable collection of logged artifacts — accessible by QR/barcode scan or by browsing. All data is stored locally in a SQLite file; no external services required.

> **Artifact Logger** — log artifacts on the go → [try it live](https://rothens.github.io/artifact-logger/) · [repo](https://github.com/Rothens/artifact-logger)

## What it does

- **Admin** imports a JSON export from artifact-logger, then edits each item's display name, notes, photo, metadata fields, and per-field visibility flags
- **Guests** visit the site, scan a code to jump directly to an item, or browse the full collection
- **Optional visitor password** — set `VISITOR_PASSWORD` in `.env.local` to prevent unauthenticated public access (useful while the collection is still private or the deployment is online)
- **Language switcher** — UI available in Hungarian (default) and English

## Requirements

- Node.js 18+
- npm

## Setup

```bash
cp .env.local.example .env.local
# Edit .env.local — set ADMIN_PASSWORD, COOKIE_SECRET, and optionally VISITOR_PASSWORD
npm install
npm run dev        # http://localhost:3000
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PASSWORD` | Yes | Password for the `/admin` area |
| `COOKIE_SECRET` | Yes | 32+ character random string used to sign auth cookies |
| `VISITOR_PASSWORD` | No | If set, all public pages require this password before entry |
| `DB_PATH` | No | Path to the SQLite file (default: `./data/museum.db`) |

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint
```

## Architecture

**Stack:** Next.js 15 App Router · React 19 · sql.js (WASM SQLite) · Bootstrap 5

**No external services.** All data lives in a single SQLite file (`data/museum.db`) managed entirely in-process via sql.js. There is no database server, no cloud storage, no analytics.

### Data flow

```
artifact-logger (PWA)
  └─ Export JSON
       └─ /admin (upload)
            └─ lib/import.js → upsertAll()
                 └─ SQLite (data/museum.db)
                      ├─ /admin/items  — edit visibility + item data
                      ├─ /browse       — guest collection view
                      └─ /item/[id]    — guest item detail (scan or browse)
```

### Database tables

| Table | Purpose |
|---|---|
| `code_definitions` | Scanned code metadata (type, value, name, category) |
| `item_records` | Artifact instances — visibility flags, photo, metadata, notes |
| `page_views` | One row per guest visit, with referrer (scan / browse / direct) |

### Auth

- **Admin** — single HMAC-signed HttpOnly cookie (`am_auth`). Protected at Edge Runtime in `middleware.js`.
- **Visitor** — if `VISITOR_PASSWORD` is set, a plain cookie (`am_visitor`) is checked on every non-exempt route. Set via `/visitor-login`.

### Visibility system

Each item has a master `is_public` flag plus per-field flags (`show_photo`, `show_notes`, `show_price`, etc.). `lib/visibility.js → filterPublicFields()` strips everything not explicitly enabled before rendering to guests. Re-importing from artifact-logger never overwrites these flags.

### Key files

```
app/
  admin/item/[id]/page.jsx   — Edit item: display text, photo, metadata, visibility
  admin/items/page.jsx        — Items list with inline stats
  item/[id]/page.jsx          — Public item detail
  browse/page.jsx             — Public collection grid
  scan/                       — QR/barcode scanner (client component)
  visitor-login/page.jsx      — Optional visitor password gate
lib/
  i18n.js                     — EN/HU translations
  visibility.js               — filterPublicFields()
  import.js                   — JSON export parser + upsert
  auth.js                     — HMAC sign/verify helpers
db/
  client.js                   — sql.js singleton (async init, sync ops, persist)
migrations/
  001_initial.sql             — Schema (CREATE TABLE IF NOT EXISTS)
middleware.js                 — Edge Runtime: admin gate + optional visitor gate
```

## Deployment

The app is a standard Next.js application. Any Node.js host works (VPS, Railway, Render, etc.).

Important: the `data/` directory must be writable and **persistent** across deploys — it contains the SQLite database. Mount it as a volume or bind-mount if using containers.

> Docker support is planned for a future release.

## Development notes

- `await initDb()` must be called at the top of every Server Component and API route before any synchronous DB helper is used — sql.js initialises asynchronously once, then all operations are synchronous.
- Server Actions have a 10 MB body size limit (configured in `next.config.mjs`) to accommodate photo data URLs.
- The Edge Runtime middleware cannot use Node.js crypto — HMAC is implemented with the Web Crypto API (`crypto.subtle`).
