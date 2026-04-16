# Deployment Guide

---

## Step 0 — Set Your Admin Email (Do This First)

Open `artifacts/api-server/src/lib/adminConfig.ts` and add your Gmail address:

```ts
export const HARDCODED_ADMIN_EMAILS: string[] = [
  "yourname@gmail.com",  // ← replace with your email
];
```

This is the **only way** to get admin access. No other user can see or use the admin panel.
You can also set `ADMIN_EMAILS` on Render as a comma-separated list — both are merged.

---

## Step 1 — Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. Enable the **Google Identity API**
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized Redirect URI: `https://YOUR-RENDER-API-URL/api/callback`
7. Copy the **Client ID** and **Client Secret**

---

## Step 2 — API Server on Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo
4. Configure the service:
   - **Root directory**: leave blank
   - **Build command**: `npm install -g pnpm && pnpm install && pnpm --filter @workspace/api-server run build`
   - **Start command**: `node artifacts/api-server/dist/index.mjs`
   - **Environment**: Node
5. Set these **Environment Variables** on Render:

| Variable | Value |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (create a free Render Postgres DB) |
| `GOOGLE_CLIENT_ID` | From Google Console |
| `GOOGLE_CLIENT_SECRET` | From Google Console |
| `FRONTEND_URL` | Your Cloudflare Pages URL (e.g. `https://sky-sms.pages.dev`) |
| `ALLOWED_ORIGINS` | Same as FRONTEND_URL |
| `ADMIN_EMAILS` | Your Gmail (e.g. `yourname@gmail.com`) |
| `HERO_SMS_API_KEY` | From Hero SMS provider |
| `OXAPAY_MERCHANT_API_KEY` | From OxaPay dashboard |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

6. Click **Deploy** and wait for it to go live
7. Copy your Render URL (e.g. `https://sky-sms-api.onrender.com`)

---

## Step 3 — Frontend on Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project**
2. Connect your GitHub repo
3. Configure the build:
   - **Framework preset**: Vite
   - **Build command**: `npm install -g pnpm && pnpm install && pnpm --filter @workspace/sim-rentals run build`
   - **Build output directory**: `artifacts/sim-rentals/dist/public`
4. Add **Environment Variable** (build-time):

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your Render API URL (e.g. `https://sky-sms-api.onrender.com`) |

5. Click **Save and Deploy**

---

## Step 4 — Final Cross-Connection

After both are live:
- Go back to Render → update `FRONTEND_URL` and `ALLOWED_ORIGINS` to your Cloudflare Pages URL
- Go to Google Console → OAuth 2.0 Client → add:
  - Authorized JavaScript origins: your Cloudflare Pages URL
  - Authorized redirect URIs: `https://YOUR-RENDER-API-URL/api/callback`

---

## Notes

- Session cookies use `sameSite=none; Secure` in production for cross-origin support
- CORS is restricted to `ALLOWED_ORIGINS` in production
- `pnpm` must be installed before build commands — the `npm install -g pnpm` prefix handles this

---

## What Are the Other Folders?

| Folder | What it does |
|---|---|
| `lib/api-spec/` | The **OpenAPI YAML spec** — source of truth for all API routes and types |
| `lib/api-client-react/` | Auto-generated React Query hooks (`useGetMe`, `useListServices`, etc.) — **do not edit manually** |
| `lib/api-zod/` | Auto-generated Zod validation schemas — used on both frontend and backend |
| `lib/db/` | **Drizzle ORM** schema — defines all PostgreSQL tables |
| `scripts/` | Dev utility scripts (codegen, migrations, etc.) |
| `artifacts/mockup-sandbox/` | Design sandbox — only used on Replit for UI prototyping, not deployed |

**You only deploy two things: the API server (Render) and the frontend (Cloudflare Pages).**  
The `lib/` folders are shared packages automatically included during the build step — you don't deploy them separately.
