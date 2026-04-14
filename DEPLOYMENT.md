# Deployment Guide

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. Enable the **Google Identity API**
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized Redirect URI: `https://YOUR-API-DOMAIN/api/callback`
7. Copy the **Client ID** and **Client Secret**

---

## API Server — Render

1. Connect your GitHub repo to [render.com](https://render.com)
2. Create a new **Web Service** pointing to `artifacts/api-server`
3. Build command: `pnpm install && pnpm --filter @workspace/api-server run build`
4. Start command: `node artifacts/api-server/dist/index.mjs`
5. Set environment variables:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `GOOGLE_CLIENT_ID` — from Google Console
   - `GOOGLE_CLIENT_SECRET` — from Google Console
   - `FRONTEND_URL` — your Cloudflare Pages URL (e.g. `https://sms-rentals.pages.dev`)
   - `ALLOWED_ORIGINS` — same as FRONTEND_URL
   - `NODE_ENV` — `production`
   - `PORT` — `10000` (Render default)

---

## Frontend — Cloudflare Pages

1. Connect your GitHub repo to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Framework preset: **Vite**
3. Build command: `pnpm install && pnpm --filter @workspace/sim-rentals run build`
4. Build output directory: `artifacts/sim-rentals/dist/public`
5. Set environment variables (build-time):
   - `VITE_API_URL` — your Render API URL (e.g. `https://sms-rentals-api.onrender.com`)
   - `PORT` — `3000` (only needed for Vite config, not used in static builds)
   - `BASE_PATH` — `/`

---

## Notes

- Session cookies are set with `sameSite=none; Secure` in production for cross-origin support
- CORS is restricted to `ALLOWED_ORIGINS` in production
- Add `https://sms-rentals-api.onrender.com/api/callback` to Google Console's authorized redirect URIs
