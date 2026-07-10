Database integration and free hosting suggestions

This document shows how to integrate the backend with a real database and suggests free DB and hosting providers for deployment.

1) Required env vars (backend)

- DATABASE_URL: a Postgres connection string, e.g. `postgresql://user:password@host:5432/pimchim`
- JWT_SECRET: a strong secret string for signing JWTs
- PORT: optional (defaults to 4000)
- FRONTEND_URL: URL of the frontend (e.g. http://localhost:5173 or your production URL)

Create `backend/.env` from `.env.example` and fill values.

2) Local setup (Postgres)

- Install Postgres locally or use Docker:

  Docker example:
  ```powershell
  docker run --name pimchim-postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=pimchim -p 5432:5432 -d postgres:15
  ```

- Set DATABASE_URL in `backend/.env` to `postgresql://user:password@localhost:5432/pimchim`

- Install dependencies and push schema + seed:

  ```powershell
  npm install --prefix backend
  npm run db:push --prefix backend
  npm run db:seed --prefix backend
  ```

3) Use a free cloud Postgres provider (recommended options)

- Railway (https://railway.app)
  - Offers free tier
  - Easy to provision Postgres and provides DATABASE_URL
  - Connect via `DATABASE_URL` in `backend/.env`

- Neon (https://neon.tech)
  - Free tier with serverless Postgres
  - Good performance for hobby projects

- Supabase (https://supabase.com)
  - Free tier Postgres, plus authentication and storage
  - You can use Supabase Postgres directly as DATABASE_URL

- Render (https://render.com)
  - Free Postgres with certain limits

Notes: All providers give you a connection string you paste into `backend/.env`.

4) Hosting the app for free

- Frontend (static):
  - Vercel (https://vercel.com) — great for Vite React apps; connect to repo and deploy. Free tier available.
  - Netlify (https://netlify.com) — also excellent for static sites.
  - Both support custom domains and provide HTTPS by default.

- Backend (Node + Postgres):
  - Railway, Render, or Fly.io can host the backend; they often include a free Postgres add-on or easy integration with the database.
  - Render has a free web service plan (sleeping) and managed Postgres.
  - Railway simple to get started with both web service and Postgres.
  - Supabase functions can host serverless endpoints but you may prefer to keep the Express backend on Render/Railway.

Deployment flow (simple)
- Provision Postgres on Railway/Neon/Supabase and copy the DATABASE_URL
- Create a secret JWT_SECRET in your host's environment config
- Deploy backend to Railway/Render and set env vars (DATABASE_URL, JWT_SECRET, FRONTEND_URL)
- Deploy frontend to Vercel/Netlify and set VITE_API_URL to your backend's public URL + "/api"

5) Quick checklist before deploying
- Ensure `prisma/schema.prisma` matches the production DB provider (Postgres is default in repo)
- Run `npx prisma generate` after `npm install --prefix backend` when using Prisma client
- Run `npm run db:push --prefix backend` or do migrations
- Run `npm run db:seed --prefix backend` to seed initial accounts
- Confirm CORS: `FRONTEND_URL` should be the frontend origin on your host
- Set `VITE_API_URL` in the frontend's dashboard (Vercel/Netlify) to the backend endpoint

6) Security notes
- Never commit `.env` to git. Use host secrets.
- Use a strong `JWT_SECRET` for production.

If you'd like, I can:
- Add a Vite proxy (already present in `frontend/vite.config.js`) so local dev uses `/api` -> `http://localhost:4000` (already configured).
- Create sample `backend/.env` in repo (I won't commit secrets; I can add `.env.example` is already present).
- Help you provision Railway/Supabase project step-by-step and prepare deployment environment variables.

Which provider would you like help provisioning (Railway, Supabase, Neon, Render, or another)?
