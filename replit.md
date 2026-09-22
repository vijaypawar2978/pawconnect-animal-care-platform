# PawConnect

PawConnect is an animal welfare command center for rescue, adoption, veterinary care, lost-and-found reports, and shared animal records.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/pawconnect/src/App.tsx` — responsive web app shell and product routes
- `artifacts/pawconnect/src/index.css` — PawConnect visual theme and motion
- `artifacts/api-server/src/routes/pawconnect.ts` — dashboard, animal, SOS, report, vet, appointment, and assistant routes
- `lib/api-spec/openapi.yaml` — API source of truth
- `lib/db/src/schema/` — Drizzle tables for animals, emergencies, reports, vets, and appointments

## Architecture decisions

- The frontend uses generated React Query hooks from the OpenAPI contract instead of hand-written request types.
- Animal statuses and species are matched case-insensitively at the API boundary so forms and seeded records remain interoperable.
- The care assistant intentionally provides triage guidance and escalation steps, not a medical diagnosis.
- Seed data is included for the development database so the first dashboard view demonstrates the complete MVP flow.

## Product

- Care pulse dashboard with live emergency, adoption, vet, and lost-and-found counts
- Emergency SOS intake and response board
- Adoption discovery with search and species filters
- Lost-and-found report creation and filtering
- Nearby veterinary directory and appointment booking
- Basic animal-care assistant with safety disclaimers and emergency escalation
- Digital animal profiles with vaccination status and edit flow

## User preferences

 - Keep the product focused on animal rescue, care coordination, adoption, and community outcomes.

## Gotchas

- Run API codegen after editing `lib/api-spec/openapi.yaml`.
- The app workflow supplies `PORT` and `BASE_PATH`; do not hardcode either in frontend code.
- Seeded image URLs are remote demo assets; replace them with managed storage before production use.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
