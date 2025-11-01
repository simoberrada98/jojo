# Jhuangnyc Deployment Guide

This guide covers deploying Jhuangnyc to production (Vercel + Supabase).

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Products seeded in database
- [ ] TypeScript errors resolved
- [ ] Build succeeds locally
- [ ] Tests passing (if applicable)

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Start Supabase
pnpm db:start

# Seed database with products
pnpm db:seed

# Start development server
pnpm dev
```

Visit: http://localhost:3000

## 🗄️ Database Setup

### Local Supabase

```bash
# Start Supabase (includes migrations)
pnpm db:start

# Check status
pnpm db:status

# Access Studio
pnpm studio
```

### Production Supabase

1. **Create Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name it (e.g., "jhuangnyc-prod")
   - Choose region
   - Set strong database password

2. **Apply Migrations**

   ```bash
   # Link to production project
   supabase link --project-ref <your-project-ref>

   # Push migrations
   pnpm db:push
   ```

3. **Get Credentials**
   - Go to Project Settings → API
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` secret key

## 🔐 Environment Variables

### Local Development (`.env.local`)

```bash
# Already configured from supabase start
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-key>
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Vercel)

Add these in Vercel Project Settings → Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-production-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-production-service-role-key>
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**⚠️ IMPORTANT:** Never commit these values to git!

## 📦 Data Import

### Option 1: Using Seed Script (Recommended)

```bash
# Make sure .env.local is configured with production credentials
# or set them temporarily:
NEXT_PUBLIC_SUPABASE_URL=<prod-url> \
SUPABASE_SERVICE_ROLE_KEY=<prod-key> \
pnpm db:seed
```

### Option 2: Using CSV Import

1. Generate CSV files:

   ```bash
   pnpm json-to-csv
   ```

2. Import via Supabase Dashboard:
   - Go to Table Editor
   - Select `products` table
   - Click "Insert" → "Import data from CSV"
   - Upload `lib/data/csv/products.csv`
   - Repeat for `product_variants.csv`

### Option 3: Manual SQL

See `lib/data/csv/README.md` for SQL import commands.

## 🚢 Deployment to Vercel

### Initial Setup

1. **Install Vercel CLI**

   ```bash
   pnpm add -g vercel
   ```

2. **Login**

   ```bash
   vercel login
   ```

3. **Link Project**

   ```bash
   vercel link
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_APP_URL
   ```

### Deploy

#### Staging/Preview

```bash
vercel
```

#### Production

```bash
vercel --prod
```

Or use the automated script:

```bash
pnpm deploy:production
```

### GitHub Integration

For automatic deployments:

1. Go to Vercel Dashboard
2. Import your GitHub repository
3. Configure environment variables
4. Enable automatic deployments for:
   - Production: `main` branch
   - Preview: All other branches

## 📊 Post-Deployment Verification

1. **Check Build**

   ```bash
   pnpm build
   ```

2. **Verify Database Connection**
   - Visit your deployed URL
   - Check if products load
   - Test authentication

3. **Check Logs**

   ```bash
   vercel logs <deployment-url>
   ```

4. **Test Key Features**
   - [ ] Product listing loads
   - [ ] Product detail pages work
   - [ ] Search functionality
   - [ ] Cart operations
   - [ ] User authentication
   - [ ] Checkout flow

## 🔧 Troubleshooting

### Build Fails

**Problem:** TypeScript errors

```bash
# Check errors locally
pnpm type-check

# Common issues:
# - Missing UI components (input, label, card, badge)
# - Type mismatches in product interfaces
```

**Solution:**

```bash
# Install missing UI components
npx shadcn@latest add input label card badge

# Or temporarily set strict mode to false in tsconfig.json
```

### Database Connection Issues

**Problem:** Can't connect to Supabase

- Verify environment variables are set correctly
- Check Project URL format: `https://<project-ref>.supabase.co`
- Ensure anon key starts with `eyJ...`

**Problem:** RLS (Row Level Security) blocks queries

- Check RLS policies in migrations
- Verify service role key for admin operations
- Test with `anon` key for public operations

### Migration Errors

**Problem:** Migrations fail to apply

```bash
# Reset local database
pnpm db:reset

# Check migration status
supabase migration list
```

**Problem:** Production migration conflicts

```bash
# Create new migration to fix
pnpm db:migrate fix_issue

# Edit the new migration file
# Push to production
pnpm db:push
```

### Import Errors

**Problem:** Seed script fails

- Check environment variables
- Verify JSON files exist in `lib/data/json-optimized/`
- Check Supabase service role key has permission

**Problem:** CSV import fails

- Ensure schema matches CSV columns
- Check for data type mismatches
- Verify array format: `{"item1","item2"}`

## 📈 Monitoring

### Vercel Analytics

Already integrated via `@vercel/analytics` package.

### Supabase Monitoring

- Dashboard → Database → Query Performance
- Check slow queries
- Monitor connection pool
- Review RLS policy performance

### Error Tracking

Consider adding:

- Sentry for error tracking
- LogRocket for session replay
- Hotjar for user behavior

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - run: pnpm type-check

      - run: pnpm lint

      - run: pnpm build

      - uses: amondnet/vercel-action@v25
        if: github.ref == 'refs/heads/main'
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🛡️ Security Checklist

- [ ] Environment variables in Vercel (not in code)
- [ ] RLS policies enabled on all tables
- [ ] Service role key secured (server-side only)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Database passwords are strong
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Auth email confirmations enabled (production)

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

## 🆘 Support

- GitHub Issues: [Link to your repo issues]
- Documentation: This file
- Supabase Support: contact@supabase.com
- Vercel Support: contact@vercel.com

## 📝 Changelog

### v1.0.0 - Initial Release

- Database schema with products and variants
- Product import and optimization scripts
- CSV export for data migration
- Local development setup
- Production deployment configuration
