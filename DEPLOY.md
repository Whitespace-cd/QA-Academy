# Deploying QA Training Platform

This project has two parts to deploy separately:
1. **Frontend** (React app) → Vercel
2. **Backend** (Express API) → Railway, Render, or Fly.io
3. **Database** (PostgreSQL) → Neon, Supabase, or Railway

---

## Step 1: Deploy the Database

Use a free PostgreSQL service:

### Option A: Neon (recommended, free tier)
1. Go to https://neon.tech and create a free account
2. Create a new project
3. Copy the connection string (looks like `postgresql://user:pass@host/dbname`)

### Option B: Supabase
1. Go to https://supabase.com and create a project
2. Go to Settings > Database > Connection string (URI mode)

---

## Step 2: Deploy the Backend API

### Using Railway (easiest)
1. Go to https://railway.app and sign in with GitHub
2. Create a new project → "Deploy from GitHub repo"
3. Select this repository
4. Set the **Root Directory** to `artifacts/api-server`
5. Set the **Start Command** to: `node dist/index.cjs`
6. Set the **Build Command** to: `pnpm install && pnpm run build`
7. Add these environment variables:
   ```
   DATABASE_URL=postgresql://your-neon-connection-string
   JWT_SECRET=your-super-secret-key-here-make-it-long
   NODE_ENV=production
   PORT=3000
   ```
8. Deploy and copy the public URL (e.g. `https://qa-api.up.railway.app`)

### Using Render
1. Go to https://render.com → New Web Service
2. Connect your GitHub repo
3. Root directory: `artifacts/api-server`
4. Build command: `pnpm install && pnpm run build`
5. Start command: `node dist/index.cjs`
6. Add the same environment variables as above

---

## Step 3: Push the Database Schema

After your backend is deployed with `DATABASE_URL` set, run the schema push.

From your local machine:
```bash
DATABASE_URL=your-neon-connection-string pnpm --filter @workspace/db run push
```

Or you can connect to Railway's shell and run the command there.

---

## Step 4: Deploy the Frontend to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project" and import this repository
3. Set the **Root Directory** to `artifacts/qa-platform`
4. Vercel will auto-detect Vite
5. Override the **Build Command** to: `pnpm run build:vercel`
6. Add this environment variable:
   ```
   VITE_API_URL=https://your-railway-api-url.up.railway.app
   ```
7. Click Deploy!

---

## Environment Variables Summary

### Backend (Railway/Render)
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | A long random secret string |
| `NODE_ENV` | `production` |
| `PORT` | `3000` (or whatever Railway assigns) |

### Frontend (Vercel)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Railway backend URL |

---

## Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@qaplatform.com | password123 |
| Instructor | instructor@qaplatform.com | password123 |
| Student | student@qaplatform.com | password123 |

To seed the database, temporarily make the seed script available or run the SQL inserts manually from your database dashboard.
