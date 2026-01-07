# Critical Deployment Fixes

The errors you are seeing (CORS 500 and Auth 500) are caused by missing **Environment Variables** in your Vercel deployments and missing **Database Migrations** for the frontend authentication.

The Backend is crashing on startup because it cannot find the `DATABASE_URL`, which prevents it from sending CORS headers. The Frontend is failing because `better-auth` cannot connect to its database.

## Step 1: Configure Backend Environment Variables

1. Go to the **Vercel Dashboard** > **teot-phase2** project > **Settings** > **Environment Variables**.
2. Add the following variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon/PostgreSQL Connection String (e.g., `postgres://neondb_owner:npg_fKC4jlL0cPed@ep-tiny-queen-a123wk5l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`) |
| `JWT_SECRET` | *(You need to generate a new secret for this, e.g., using `openssl rand -hex 32`)* |
| `CORS_ORIGINS` | `["http://localhost:3000", "https://the-evolution-of-todo-ten.vercel.app"]` |

## Step 2: Configure Frontend Environment Variables

1. Go to the **Vercel Dashboard** > **the-evolution-of-todo** project > **Settings** > **Environment Variables**.
2. Add the following variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_APP_URL` | `https://the-evolution-of-todo-ten.vercel.app/` |
| `BETTER_AUTH_URL` | `https://the-evolution-of-todo-ten.vercel.app/` |
| `BETTER_AUTH_SECRET` | `128b59e8484aaf7853f6f72c0d5711ea7f57b52154cb6c26d657e1cfd0d78ba0` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_fKC4jlL0cPed@ep-tiny-queen-a123wk5l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `NEXT_PUBLIC_API_URL` | `https://teot-phase2.vercel.app/` |

## Step 3: Run Database Migrations (Frontend)

The `better-auth` tables need to be created in your production database.

1. **Locally**, ensure your `phase-2/frontend/.env` file has the correct `DATABASE_URL` pointing to your **production** database (the one above).
2. Navigate to the `phase-2/frontend` directory:
   ```bash
   cd phase-2/frontend
   ```
3. Run the migration command:
   ```bash
   npx @better-auth/cli migrate
   ```

## Step 4: Redeploy

1. After setting the Environment Variables, you **must redeploy** for them to take effect.
2. Go to **Deployments** tab in Vercel for both projects (`teot-phase2` and `the-evolution-of-todo`) and click **Redeploy** on the latest commit for each.