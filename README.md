# ModellerHub website

Bilingual (Arabic/English) community site for ModellerHub, with an admin side protected by Google sign-in.

Stack: React + Vite (client), Express + tRPC (server), MySQL via Drizzle ORM.

## Local development

```bash
pnpm install
cp .env.example .env      # fill in the values
pnpm db:migrate           # create tables
pnpm dev                  # http://localhost:3000
```

Other scripts: `pnpm check` (types), `pnpm test`, `pnpm build`, `pnpm start`.

## Admin sign-in (Google)

1. Google Cloud Console → **APIs & Services → OAuth consent screen**: set it up (External, app name "ModellerHub").
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. Add the authorised redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://<your-railway-domain>/api/auth/google/callback`
4. Put the client ID and secret in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
5. List the admin Google accounts in `ADMIN_EMAILS` (comma-separated).

Only emails in `ADMIN_EMAILS` can sign in. Access is re-checked on every request, so removing an email locks that account out straight away.

## Deploying to Railway

1. New project → **Deploy from GitHub repo** → `ti2020/modellerhub`.
2. Add a **MySQL** database to the same project.
3. On the web service, set the variables:
   - `DATABASE_URL` = `${{MySQL.MYSQL_URL}}`
   - `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`
   - `PUBLIC_URL` = the service's public domain (Settings → Networking → Generate domain)
4. Deploy. `railway.json` builds with `pnpm build`, runs migrations before each deploy (`pnpm db:migrate`), starts with `pnpm start`, and health-checks `/api/health`.

The Telegram bot can run as a second service in the same Railway project and share the MySQL database.
