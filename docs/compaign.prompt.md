You are GPT-Codex, an expert full-stack developer. Your job is to scaffold a production-ready Next.js 16 (App Router) TypeScript application implementing a campaign system for a crypto-mining hardware e-commerce site (dark tech aesthetic). Use TailwindCSS (globals provided in prompt), shadcn/ui, Framer Motion, react-three-fiber (three.js) for WebGL, and Supabase for backend data. Provide full code + SQL migrations + seed data + environment variables + recommended RLS policies and indexes.

GOALS:

1. Two dedicated campaign pages:
   - /campaigns/halloween-2025
   - /campaigns/black-friday-2025
2. One unified seasonal timeline page:
   - /campaigns/seasonal-timeline-2025 (covers Halloween → Veterans Day → Thanksgiving → Black Friday → Cyber Monday)
3. Shared layout, theme toggle, header/footer components.
4. Supabase integration to store signups, VIP entries, promo usages and coupons.
5. API routes for subscription, vip signup, coupon validation, analytics tracking.
6. Lazy-load heavy WebGL scenes; fallback to animated CSS particles on mobile.
7. Use provided Tailwind globals and utilities exactly as given (imported via globals.css).

PROJECT STRUCTURE (generate files accordingly)
src/
├─ app/
│ ├─ layout.tsx # global layout: header/footer/theme toggle, LayoutGroup for Framer Motion
│ ├─ globals.css # import provided Tailwind globals
│ ├─ head.tsx
│ ├─ page.tsx # homepage (placeholder)
│ ├─ (marketing)/
│ │ ├─ page.tsx
│ │ ├─ campaigns/
│ │ │ ├─ halloween-2025/
│ │ │ │ ├─ page.tsx
│ │ │ │ └─ components/
│ │ │ │ ├─ HeroSection.tsx
│ │ │ │ ├─ CountdownTimer.tsx
│ │ │ ├─ PromoBanner.tsx
│ │ │ ├─ ProductShowcase.tsx
│ │ │ ├─ CouponCard.tsx
│ │ │ └─ WebGLScene.tsx
│ │ │ ├─ black-friday-2025/
│ │ │ │ ├─ page.tsx
│ │ │ │ └─ components/
│ │ │ │ ├─ HeroSection.tsx
│ │ │ │ ├─ DealTiles.tsx
│ │ │ │ ├─ EarlyAccessForm.tsx
│ │ │ │ ├─ CountdownTimer.tsx
│ │ │ │ ├─ ProductGrid.tsx
│ │ │ │ └─ WebGLScene.tsx
│ │ │ └─ seasonal-timeline-2025/
│ │ │ ├─ page.tsx
│ │ │ └─ components/
│ │ │ ├─ Timeline.tsx
│ │ │ ├─ HolidayCallouts.tsx
│ │ │ └─ CTAStrip.tsx
│ │ ├─ api/
│ │ │ ├─ subscribe/route.ts # POST -> supabase insert newsletter_subscribers
│ │ │ ├─ vip-signup/route.ts # POST -> supabase insert vip_access
│ │ │ ├─ validate-coupon/route.ts # POST -> verify coupon from supabase coupons table; returns discount metadata
│ │ │ └─ track-event/route.ts # POST -> supabase insert into analytics_events
│ └─ (shared)/
│ ├─ components/
│ │ ├─ Navbar.tsx
│ │ ├─ Footer.tsx
│ │ ├─ ThemeToggle.tsx
│ │ └─ ProductCard.tsx
│ ├─ lib/
│ │ ├─ supabaseClient.ts # wrapper to use Supabase in server and client
│ │ └─ utils.ts # helpers (formatCurrency, formatDate, isMobile)
│ └─ styles/
│ └─ globals.css # imports prompt CSS at top, plus Tailwind entry
├─ prisma/ (optional) # if using prisma instead of direct SQL
├─ scripts/
│ └─ seed-supabase.ts # Node script to run seed SQL via supabase client
├─ public/
│ └─ assets/ # placeholder product images and shaders
└─ package.json

ENVIRONMENT (.env.example)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_NAME="JHuangNYC Mining"
NEXT_PUBLIC_CAMPAIGN_HALLOWEEN_END="2025-11-02T23:59:00Z"
NEXT_PUBLIC_CAMPAIGN_BLACKFRIDAY_START="2025-11-25T00:00:00Z"
NEXT_PUBLIC_CAMPAIGN_BLACKFRIDAY_END="2025-12-02T23:59:59Z"

SUPABASE SQL MIGRATIONS
-- 1_create_tables.sql
-- Run in Supabase SQL Editor or via CLI
CREATE TABLE public.newsletter_subscribers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
email text NOT NULL,
source text,
created_at timestamptz DEFAULT now(),
unsubscribed boolean DEFAULT false
);

CREATE TABLE public.vip_access (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
email text NOT NULL,
name text,
phone text,
campaign text NOT NULL,
created_at timestamptz DEFAULT now(),
notes text
);

CREATE TABLE public.coupons (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
code text UNIQUE NOT NULL,
description text,
discount_type text NOT NULL CHECK (discount_type IN ('percentage','fixed')),
discount_value numeric NOT NULL,
min_order_amount numeric DEFAULT 0,
max_uses integer DEFAULT 0, -- 0 = unlimited
uses_count integer DEFAULT 0,
start_at timestamptz,
expires_at timestamptz,
active boolean DEFAULT true,
created_at timestamptz DEFAULT now()
);

CREATE TABLE public.promo_usage (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
coupon_code text,
user_email text,
order_id text,
order_amount numeric,
discount_amount numeric,
created_at timestamptz DEFAULT now()
);

CREATE TABLE public.analytics_events (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
event_type text NOT NULL,
payload jsonb,
user_id text,
source text,
created_at timestamptz DEFAULT now()
);

-- Recommended indexes for fast reads
CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers (email);
CREATE INDEX idx_coupons_code ON public.coupons (code);
CREATE INDEX idx_promo_usage_coupon ON public.promo_usage (coupon_code);
CREATE INDEX idx_analytics_event_type ON public.analytics_events (event_type);

SEED DATA (insert sample coupon rows)
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, start_at, expires_at, active)
VALUES
('HALLOMINE26', 'Halloween extra $50 off + up to 75% seasonal deals', 'fixed', 50, 5000, 1000, '2025-10-25T00:00:00Z', '2025-11-02T23:59:00Z', true),
('BLACKDEAL25', 'Black Friday extra 10% off sitewide up to 80% discounts', 'percentage', 10, 0, 50000, '2025-11-24T00:00:00Z', '2025-12-02T23:59:59Z', true);

SUPABASE RLS & POLICIES (recommended)
-- Allow anonymous inserts to newsletter_subscribers and vip_access via anon key but restrict updates:
-- In Supabase UI: For newsletter_subscribers table create policy:
-- Policy: "Allow insert for anon" USING (true) WITH CHECK (true) FOR INSERT TO anon
-- For security-sensitive operations (incrementing uses_count, inserting promo_usage) require service_role key via server route.

-- For coupons, do NOT allow direct public modifications via anon key.

API ROUTES (Next.js App Router server routes - TypeScript)

1. src/app/(marketing)/api/subscribe/route.ts

- Accepts: POST { email, source }
- Behavior: Insert into newsletter_subscribers (use service_role key on server or server-side Supabase client). Return { ok: true }

2. src/app/(marketing)/api/vip-signup/route.ts

- Accepts: POST { email, name, phone, campaign, notes }
- Behavior: Insert into vip_access; returns status and created_at.

3. src/app/(marketing)/api/validate-coupon/route.ts

- Accepts: POST { code, order_amount }
- Behavior:
  - Query coupons by code where active = true and (start_at IS NULL OR now() >= start_at) and (expires_at IS NULL OR now() <= expires_at)
  - Check min_order_amount and max_uses (if > 0 compare uses_count < max_uses)
  - Return coupon object with computed discount (if percentage compute discount_value% of order_amount, for fixed just discount_value)
  - Do NOT increment uses_count here; increment only after confirmed checkout (call /api/record-promo-use)

4. src/app/(marketing)/api/record-promo-use/route.ts (requires Service Role)

- Accepts: POST { coupon_code, user_email, order_id, order_amount, discounted_amount }
- Behavior:
  - Insert into promo_usage
  - Update coupons set uses_count = uses_count + 1 WHERE code = coupon_code
  - Return OK

5. src/app/(marketing)/api/track-event/route.ts

- Accepts: POST { event_type, payload, user_id, source }
- Behavior: Insert into analytics_events

Implement server-side Supabase client wrapper:

- src/app/(shared)/lib/supabaseClient.ts
  - export const createServerSupabase = () => createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) // only used in server routes
  - export const createAnonSupabase = () => createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) // client usage

FRONTEND BEHAVIOR & COMPONENTS (high level specifics for Codex generation)

- HeroSection.tsx:
  - Big headline (font-tech), subheading, action buttons
  - CouponCard shows code and CTA "Copy" which triggers small motion + calls /api/validate-coupon when user inputs order amount
  - Use `animated-border` and `glow-accent` utilities

- CountdownTimer.tsx:
  - Accepts `targetDate` prop (ISO)
  - Server-props fallback to NEXT*PUBLIC*... env
  - Uses React useEffect + interval to update remaining time
  - Framer Motion entrance + subtle pulse on last 60s

- WebGLScene.tsx:
  - react-three-fiber scene (lazy load via dynamic import with suspense)
  - Add rotating GPU rig mesh (simple box + emissive map) or floating coin particles (use Points + shaderMaterial)
  - On mobile show animated CSS particle fallback (divs or canvas2D)

- ProductShowcase/ProductGrid:
  - Fetch limited product list from an imaginary products API (or static props). Provide placeholders that use your screenshot aesthetic (shadow, card gradient).
  - Each ProductCard animates on hover via Framer Motion and adds subtle WebGL gloss effect via CSS `animated-border` or overlay.

- EarlyAccessForm / VIP:
  - POST to /api/vip-signup
  - validate email client-side
  - show success toast (use shadcn/ui Toast or a motion modal)

- Promo usage flow:
  - Validate coupon client-side via /api/validate-coupon
  - On actual checkout (you likely have external checkout), call /api/record-promo-use with order details from server webhook (must be server-to-server using service_role key).

PERFORMANCE & DEPLOYMENT NOTES

- Lazy-load react-three-fiber scenes and heavy assets; use Suspense + dynamic import to avoid blocking FCP.
- Cache campaign pages aggressively at CDN (Edge) but revalidate on coupon updates.
- Use Cloudflare Workers or Vercel Edge middleware to handle high concurrency during Black Friday.
- For big product images use optimized CDN + next/image (or external loader) and placeholders.

EXAMPLE: server route validate-coupon/route.ts (concise)

```ts
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const supa = createServerSupabase();
  const body = await req.json();
  const { code, order_amount = 0 } = body;

  const { data: coupon } = await supa
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('active', true)
    .limit(1)
    .single();

  if (!coupon)
    return NextResponse.json(
      { ok: false, error: 'Invalid or expired coupon' },
      { status: 404 }
    );

  const now = new Date();
  if (coupon.start_at && new Date(coupon.start_at) > now)
    return NextResponse.json(
      { ok: false, error: 'Coupon not started' },
      { status: 400 }
    );
  if (coupon.expires_at && new Date(coupon.expires_at) < now)
    return NextResponse.json(
      { ok: false, error: 'Coupon expired' },
      { status: 400 }
    );
  if (coupon.min_order_amount && order_amount < coupon.min_order_amount)
    return NextResponse.json(
      { ok: false, error: 'Order amount below minimum' },
      { status: 400 }
    );
  if (coupon.max_uses > 0 && coupon.uses_count >= coupon.max_uses)
    return NextResponse.json(
      { ok: false, error: 'Coupon max uses reached' },
      { status: 400 }
    );

  let discount = 0;
  if (coupon.discount_type === 'percentage')
    discount = (Number(coupon.discount_value) / 100) * Number(order_amount);
  else discount = Number(coupon.discount_value);

  return NextResponse.json({ ok: true, coupon: { ...coupon, discount } });
}
```

SUPABASE SEED SCRIPT (Node)

- Create a short `scripts/seed-supabase.ts` that uses the service role key to insert example coupons and optionally sample subscribers.

SAMPLE UI COPY & SEO META

- Provide per-page meta tags: title, description, og:image, twitter card; include campaign name and dates.
- Structured data (JSON-LD) for offers and events (dates).

DELIVERABLES (what Codex should emit)

- Full file scaffolding for pages and components listed above (TypeScript + React).
- Implement server routes shown (subscribe/vip/validate/record/track).
- Provide SQL migration file content and seed SQL included in repository under /db/migrations.
- README.md with instructions:
  - env variables
  - how to run dev (`npm install && npm run dev`)
  - run seed script (`node ./scripts/seed-supabase.ts`)
  - deploy notes for Vercel + Supabase

GENERAL UX RULES

- Dark-first by default; follow your CSS tokens. Respect `prefers-color-scheme` and provide a ThemeToggle to switch.
- Accessibility: all interactive elements keyboard focusable, buttons have aria-labels.
- Mobile responsiveness and compressed assets.
- Keep the heavy WebGL as eye candy only; primary CTA + coupon must be HTML/CSS for reliability.

END.

-- After generating code, also output:

1. The Supabase SQL migration files (named and content).
2. A /db/seed.sql with the coupon inserts.
3. README with exact commands to run locally and seed Supabase.
4. Example curl commands for each server route (subscribe, validate-coupon, vip-signup, track-event, record-promo-use).
