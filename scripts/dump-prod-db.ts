#!/usr/bin/env tsx
/**
 * Dump remote Supabase database data into a seed SQL file.
 *
 * Usage:
 *   pnpm db:dump:prod                # dumps public + storage schemas
 *   pnpm db:dump:prod --include-auth # also dumps auth schema
 *   pnpm db:dump:prod --output supabase/seed.sql
 *   pnpm db:dump:prod --schemas public,storage
 *
 * Looks for DB URL in this precedence:
 *   1) CLI arg --db-url=<url>
 *   2) env.PROD_DB_URL
 *   3) env.SUPABASE_DB_URL
 *   4) env.DATABASE_URL
 *
 * Requires Supabase CLI (installed via devDependency) or pg_dump.
 */

import { config as dotenvConfig } from 'dotenv'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

type Args = {
  includeAuth: boolean
  output: string
  schemas: string[]
  dbUrl?: string
  forcePgDump?: boolean
  debug?: boolean
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    includeAuth: argv.includes('--include-auth'),
    output: 'supabase/seed.sql',
    schemas: ['public', 'storage'],
    forcePgDump: argv.includes('--use-pg-dump'),
    debug: argv.includes('--debug'),
  }

  for (const a of argv) {
    if (a.startsWith('--output=')) args.output = a.split('=')[1]
    if (a.startsWith('--schemas=')) {
      const val = a.split('=')[1]
      args.schemas = val.split(',').map((s) => s.trim()).filter(Boolean)
    }
    if (a.startsWith('--db-url=')) args.dbUrl = a.split('=')[1]
  }

  if (args.includeAuth && !args.schemas.includes('auth')) {
    args.schemas.push('auth')
  }

  return args
}

function getDbUrl(override?: string): string {
  let url = override || process.env.PROD_DB_URL || process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
  if (!url) {
    console.error(
      'Missing database URL. Set --db-url, or PROD_DB_URL / SUPABASE_DB_URL / DATABASE_URL in your environment or .env.local/.env.'
    )
    process.exit(1)
  }
  // For Supabase hosted DBs, ensure sslmode=require is present
  try {
    const u = new URL(url)
    if (u.hostname.endsWith('.supabase.co') && !u.searchParams.has('sslmode')) {
      u.searchParams.set('sslmode', 'require')
      url = u.toString()
    }
  } catch {}
  return url
}

function binExists(bin: string): boolean {
  const check = process.platform === 'win32' ? `${bin}.cmd` : bin
  const candidate = resolve('node_modules', '.bin', check)
  return existsSync(candidate)
}

function run(cmd: string, args: string[]) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: false })
  return res.status === 0
}

function dumpWithSupabaseCli(dbUrl: string, output: string, schemas: string[]): boolean {
  const supabaseBin = process.platform === 'win32' ? 'node_modules/.bin/supabase.cmd' : 'node_modules/.bin/supabase'
  if (!existsSync(supabaseBin)) {
    return false
  }

  const args = ['db', 'dump', '--db-url', dbUrl, '--data-only', '-f', output]
  for (const s of schemas) args.push('--schema', s)

  console.log(`[info] Using Supabase CLI to dump data → ${output}`)
  return run(supabaseBin, args)
}

function dumpWithPgDump(dbUrl: string, output: string, schemas: string[]): boolean {
  const pgDumpBin = 'pg_dump'
  const args = ['--data-only', '--no-owner', '--no-privileges', '-f', output, '-d', dbUrl]
  for (const s of schemas) args.push('-n', s)
  // Exclude noisy or internal tables if present; ignore failures silently
  const excludes = [
    'storage.migrations',
    'pgbouncer.*',
    'realtime.*',
    'net.http_request',
  ]
  for (const ex of excludes) args.push('--exclude-table-data', ex)

  console.log(`[info] Falling back to pg_dump to dump data → ${output}`)
  return run(pgDumpBin, args)
}

function redactUrl(dbUrl: string): string {
  try {
    const u = new URL(dbUrl)
    if (u.password) u.password = '*****'
    return u.toString()
  } catch {
    return dbUrl
  }
}

function adviceFor(dbUrl: string): string[] {
  const tips: string[] = []
  try {
    const u = new URL(dbUrl)
    if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') {
      tips.push('Local DB detected. Start it first: pnpm db:start')
    }
    if (u.hostname.endsWith('.supabase.co')) {
      if (u.port === '6543') tips.push('Use direct Postgres port 5432 (not the pooler 6543) for dumps')
      if (!u.searchParams.has('sslmode')) tips.push('Append ?sslmode=require to the connection string for TLS')
    }
  } catch {}
  tips.push('Allow your IP in Supabase: Database → Network restrictions')
  return tips
}

async function main() {
  loadEnv()
  const args = parseArgs(process.argv.slice(2))
  const dbUrl = getDbUrl(args.dbUrl)
  const out = resolve(args.output)

  if (args.debug) {
    console.log(`[debug] dbUrl: ${redactUrl(dbUrl)}`)
    console.log(`[debug] schemas: ${args.schemas.join(', ')}`)
    console.log(`[debug] output: ${out}`)
  }

  let ok = false
  const supabaseAvailable = binExists('supabase')
  if (!args.forcePgDump && supabaseAvailable) {
    ok = dumpWithSupabaseCli(dbUrl, out, args.schemas)
    if (!ok) {
      console.warn('[warn] Supabase CLI dump failed, trying pg_dump fallback...')
    }
  }
  if (!ok) {
    ok = dumpWithPgDump(dbUrl, out, args.schemas)
  }

  if (!ok) {
    console.error('\n[error] Database dump failed.')
    for (const tip of adviceFor(dbUrl)) console.error(`- ${tip}`)
    console.error('- If using pg_dump, install PostgreSQL client tools and ensure pg_dump is in PATH.')
    process.exit(1)
  }

  console.log('\n[done] Database data dump complete.')
  console.log(`       File: ${out}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
// Load env vars from .env.local (preferred) then .env
function loadEnv() {
  const envFiles = ['.env.local', '.env']
  for (const file of envFiles) {
    const p = resolve(process.cwd(), file)
    if (existsSync(p)) {
      dotenvConfig({ path: p, override: false })
    }
  }
}
