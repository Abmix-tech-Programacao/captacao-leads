# Captação de Leads

API segura para receber cadastros da landing page, deduplicar leads no Supabase e
ficar pronta para encaminhar o pipeline ao n8n quando a licença estiver disponível.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required integration: Supabase connector with a server credential that can
  write to `public.leads` under the table's RLS rules

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/routes/leads.ts` — endpoint `POST /api/leads`
- `artifacts/api-server/src/lib/leads.ts` — normalization, deduplication and pipeline selection
- `artifacts/api-server/src/lib/supabase.ts` — authenticated Supabase proxy
- `lib/api-spec/openapi.yaml` — source of truth for the API contract
- `docs/api-contract.md` — contract in Portuguese for the future frontend
- `docs/n8n-workflow.md` — workflow externo planejado

## Architecture decisions

- Supabase is the official source of lead data; Google Sheets is an operational view.
- The backend owns normalization, consent timestamp and deduplication.
- Direct Supabase mode is the current default; n8n is an alternate future pipeline.
- The frontend contract does not change when the pipeline implementation changes.
- RLS remains enabled; the app must use a server credential or a narrowly scoped RPC.

## Product

- Accepts lead data from a landing page.
- Validates required fields and consent.
- Creates or updates a lead by normalized e-mail or phone.
- Returns stable JSON responses for a separate frontend.

## User preferences

- Keep the frontend integration-ready for a colleague's separate frontend.
- Keep README and operational documentation versioned in the separate repository.
- Prefer n8n when available, but do not block the MVP on its license.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing OpenAPI.
- A Supabase anon key is not enough for the current deduplication flow when RLS
  has no public policies; use a server credential or secure RPC.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
