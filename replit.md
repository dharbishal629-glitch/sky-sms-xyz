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

- Frontend uses React, TypeScript, Tailwind CSS, shadcn/ui components, Wouter routing, React Query generated hooks, Inter typography, and a dark premium glassmorphism theme inspired by snowboosts.com.
- Landing page includes a centered pill navigation, dark hero, gradient headline, search-style service input, marquee banner, and premium feature cards.
- Auth uses Google-capable Clerk flow with custom branded `/sign-in` and `/sign-up` pages instead of directly rendering the default Clerk card on the page.
- API contract is defined in `lib/api-spec/openapi.yaml`; run codegen after API contract edits.
- Backend routes for the app live in `artifacts/api-server/src/routes/sim.ts`.
- The app uses PostgreSQL tables initialized by the API route on first request: `sim_users`, `sim_payments`, `sim_rentals`, and `sim_sms_messages`.
- New accounts start with zero credits, no rental history, and no payment history; old seeded demo payments/rentals are removed during schema initialization.
- Hero SMS and OxaPay provider status checks read secure secrets named `HERO_SMS_API_KEY` and `OXAPAY_MERCHANT_API_KEY`.
- When provider secrets are configured, provider statuses return `live`; otherwise, live provider actions are disabled with explicit setup messages.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/sim-rentals run dev` — run the SMS SIM Rentals web app locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
