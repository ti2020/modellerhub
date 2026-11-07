# ModellerHub

Bilingual (English / Arabic) community website for **Modeller Hub** — *We Thrive Together*.

- **Public site:** Home, Courses, Events, Batches, About, Mission & Vision, Modelling Field
- **Admin (`/admin`):** add, edit and delete courses, events, batches, team members and the Mission / Vision / Modelling Field text, in both languages
- **Sign-in:** Google. Only the emails in `ADMIN_EMAILS` get admin access
- **Stack:** React + Vite + Tailwind (client), Express + tRPC (server), MySQL + Drizzle (database)

---

## Deploy on Railway (one-time setup)

### 1. Create the Google sign-in keys
1. Open <https://console.cloud.google.com/apis/credentials> and create a project (e.g. "ModellerHub").
2. **OAuth consent screen** → External → app name *ModellerHub*, your email → Save. Add your Gmail under *Test users* (or click *Publish app*).
3. **Credentials → Create credentials → OAuth client ID** → *Web application*.
4. Under **Authorized redirect URIs** add:
   - `https://YOUR-RAILWAY-DOMAIN/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (for local testing)
5. Copy the **Client ID** and **Client secret**.

> You get the Railway domain in step 2.4 — come back and add it to the redirect URIs then.

### 2. Create the Railway project
1. <https://railway.com/new> → **Deploy from GitHub repo** → `ti2020/modellerhub`.
2. In the same project: **+ New → Database → MySQL**.
3. Open the website service → **Variables**, and add:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | `${{MySQL.MYSQL_URL}}` |
   | `JWT_SECRET` | a random 64-character string (see `.env.example`) |
   | `GOOGLE_CLIENT_ID` | from step 1 |
   | `GOOGLE_CLIENT_SECRET` | from step 1 |
   | `ADMIN_EMAILS` | your Gmail address (comma-separate more admins) |
   | `PUBLIC_URL` | `https://YOUR-RAILWAY-DOMAIN` |

4. **Settings → Networking → Generate Domain** to get the public address (or attach your own domain).
5. Deploy. On first start the app creates the database tables and adds starter content (one course and the mission text). Edit or delete it in `/admin`.

Every push to `main` redeploys automatically. Database changes ship as migration files in `/drizzle` and are applied on start.

---

## Run locally

```bash
pnpm install
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, Google keys, ADMIN_EMAILS
pnpm dev                  # http://localhost:3000
```

| Command | What it does |
|---|---|
| `pnpm dev` | Start the site with live reload |
| `pnpm check` | Type-check |
| `pnpm test` | Run tests |
| `pnpm build` / `pnpm start` | Production build / run |
| `pnpm db:generate` | After editing `drizzle/schema.ts`, create a new migration file |

## Project layout

```
client/src/pages        Public pages and admin pages (Admin*.tsx)
client/src/components   Layout, navigation, AdminCrud (shared admin editor)
client/src/contexts     Language (EN/AR, right-to-left) and theme
server/routers.ts       API: public content + admin actions
server/db.ts            Database queries
server/_core/auth.ts    Google sign-in and sessions
server/_core/migrate.ts Auto-migrations and starter content
drizzle/                Database schema and migrations
shared/const.ts         Shared settings (e.g. the Telegram link)
```

To change the Telegram link, edit `TELEGRAM_URL` in `shared/const.ts`.
