# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- **API Server** (`artifacts/api-server`) — shared Express API mounted at `/api`.
- **SMS SIM Rentals** (`artifacts/sim-rentals`) — React + TypeScript web app at `/` for renting temporary SMS numbers, buying credits, viewing rentals/payments, and managing admin views.
- **Canvas** (`artifacts/mockup-sandbox`) — design/mockup sandbox.

## SMS SIM Rentals Implementation

- Frontend uses React, TypeScript, Tailwind CSS, shadcn/ui components, Wouter routing, React Query generated hooks, Inter typography, light theme, and primary accent `#1978E5`.
- Auth is configured with Google-capable managed sign-in pages at `/sign-in` and `/sign-up`.
- API contract is defined in `lib/api-spec/openapi.yaml`; run codegen after API contract edits.
- Backend routes for the app live in `artifacts/api-server/src/routes/sim.ts`.
- The app uses PostgreSQL tables initialized by the API route on first request: `sim_users`, `sim_payments`, `sim_rentals`, and `sim_sms_messages`.
- Hero SMS and OxaPay are represented by server-side provider status checks. Live mode requires secure secrets named `HERO_SMS_API_KEY` and `OXAPAY_MERCHANT_API_KEY`.
- If provider secrets are not configured, the API returns explicit `setup_required` provider statuses and safe demo data so the UI remains functional without exposing or hardcoding keys.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/sim-rentals run dev` — run the SMS SIM Rentals web app locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
