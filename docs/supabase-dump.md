**Purpose**

- Dump the remote/production Supabase database data into an SQL seed for local/staging use.

**Pre-Reqs**

- Supabase CLI available via devDependency (package.json includes `supabase`).
- Valid Postgres connection URI for production: set `PROD_DB_URL` in `.env.local` or pass `--db-url`.
- Ensure your IP is allowed under Supabase Project Settings → Database → Network Restrictions.
- Use the direct Postgres port 5432 (not the pooler 6543) and include `?sslmode=require`.

**Quick Start**

- Add to `.env.local`: `PROD_DB_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require`.
- Run: `pnpm db:dump:prod`
- Output: `supabase/seed.sql` (used by `supabase db reset` via `config.toml`)

**Include Auth Data (optional)**

- Run: `pnpm db:dump:prod --include-auth`
- Caution: may include sensitive PII. Consider excluding or sanitizing before sharing.

**Custom Options**

- Output path: `pnpm db:dump:prod --output supabase/seeds/prod-seed.sql`
- Schemas: `pnpm db:dump:prod --schemas public,storage,auth`
- Direct URL: `pnpm db:dump:prod --db-url postgresql://...`

**Troubleshooting**

- If Supabase CLI dump fails, script now tries `pg_dump` automatically.
- If `pg_dump` is missing, install PostgreSQL client tools and retry.
- Check credentials and network rules if connection errors occur.
- Use debug mode: `pnpm db:dump:prod --debug` to print resolved URL (redacted), schemas, and output.
- Force `pg_dump`: `pnpm db:dump:prod --use-pg-dump`.

**Notes**

- The dump is data-only. Schema migrations live under `supabase/migrations`.
- Seed import order is handled by the dump (FK-safe ordering or COPY blocks).
- Review/clean any sensitive data if seeds are shared outside the team.
