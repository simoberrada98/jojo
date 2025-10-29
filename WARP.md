# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**MintyOS (MineHub)** is a Next.js 16 e-commerce application for a cryptocurrency mining hardware store. The app features:
- Crypto payment integration (BTC, ETH, USDC)
- Admin dashboard for order and product management
- 3D product visualization using React Three Fiber
- Dark-themed UI with shadcn/ui components

## Tech Stack

- **Framework**: Next.js 16.0.0 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui (New York style)
- **Forms**: React Hook Form + Zod validation
- **3D**: React Three Fiber + Drei
- **Analytics**: Vercel Analytics
- **TypeScript**: Strict mode enabled

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Architecture

### Directory Structure

```
app/                    # Next.js App Router pages
  ├── admin/           # Admin dashboard (orders, products, analytics)
  ├── cart/            # Shopping cart
  ├── checkout/        # Multi-step checkout with crypto payment
  ├── collection/      # Product collections
  ├── contact/         # Contact page
  ├── thank-you/       # Order confirmation
  ├── layout.tsx       # Root layout with Vercel Analytics
  └── page.tsx         # Homepage with hero + catalog

components/            # React components
  ├── ui/             # shadcn/ui primitives (button, card, etc.)
  ├── *-section.tsx   # Feature sections (hero, analytics, dashboard)
  ├── *-management.tsx # Admin components
  └── crypto-payment-form.tsx # Payment handling

lib/
  └── utils.ts         # cn() utility for className merging
```

### Key Patterns

**Path Aliases**: All imports use `@/*` alias mapping to root (configured in `tsconfig.json` and `components.json`)

```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

**Component Structure**: 
- Server components by default (no "use client" directive)
- Client components explicitly marked with `"use client"`
- Admin pages use client-side state management
- Product data is hardcoded in `components/product-catalog.tsx`

**Styling System**:
- Custom CSS variables in `app/globals.css` using OKLCH color space
- Dark theme by default with mining/tech aesthetic
- Uses Tailwind CSS 4 with PostCSS plugin
- Design tokens: `--primary`, `--accent`, `--background`, etc.
- Semantic tokens for success, warning, info states

**Form Handling**: 
- React Hook Form for form state
- Zod schemas for validation
- `@hookform/resolvers` for schema integration

**3D Models**: 
- Located in `/public/assets/3d/`
- Loaded via `@react-three/fiber` and `@react-three/drei`
- Used in product visualization (e.g., `model-3d-viewer.tsx`)

## Crypto Payment Flow

The checkout process (`app/checkout/page.tsx`) uses `crypto-payment-form.tsx` which:
1. Accepts BTC, ETH, or USDC
2. Generates payment QR codes via external API
3. Shows wallet address with copy functionality
4. Mock confirmation flow (no real blockchain integration)

## shadcn/ui Configuration

- Style: `new-york`
- Components path: `@/components`
- Utils path: `@/lib/utils`
- Base color: `neutral`
- CSS variables: enabled
- Icon library: `lucide-react`

To add new shadcn components, use the CLI respecting the existing config in `components.json`.

## Linting & Type Checking

- ESLint configured with Next.js core-web-vitals and TypeScript rules
- TypeScript strict mode enabled
- Target: ES2017
- No separate typecheck script; use `npm run lint` for linting

## Development Notes

- **No backend**: Product data, orders, and payments are mocked in component state
- **Radix UI**: Extensive use of Radix primitives for accessible components
- **Vercel deployment**: Optimized for Vercel platform (Analytics included)
- **Font**: Uses Geist and Geist Mono from next/font/google
- **3D assets**: Duck.glb placeholder used for all products

## Adding New Features

When adding components:
1. Use existing path aliases (`@/components`, `@/lib`, etc.)
2. Follow shadcn/ui patterns for UI components
3. Use `cn()` utility for conditional className merging
4. Respect the dark theme color system (OKLCH variables)
5. Mark client components with `"use client"` when using hooks/state

When modifying product data:
- Edit the `PRODUCTS` array in `components/product-catalog.tsx`
- Update categories in `CATEGORIES` constant if needed
