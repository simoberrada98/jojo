# Supabase Setup Guide

This guide will walk you through setting up Supabase for your MineHub ecommerce application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Project Name: `jhuangnyc` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for the project to be provisioned (~2 minutes)

## 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (under Project API URL)
   - **anon/public key** (under Project API keys)
   - **service_role key** (under Project API keys - keep this secret!)

## 3. Configure Environment Variables

1. Create a `.env.local` file in the root of your project:

   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## 4. Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** to execute the migration

This will create all necessary tables:

- ✅ User profiles
- ✅ Addresses
- ✅ Products
- ✅ Wishlist
- ✅ Shopping cart
- ✅ Orders & order items
- ✅ Payment methods
- ✅ Row-level security policies
- ✅ Helper functions

## 5. Configure Authentication

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **Email** provider (enabled by default)
3. Optional: Configure additional providers (Google, GitHub, etc.)

### Email Settings (Optional but Recommended)

1. Go to **Authentication** > **Email Templates**
2. Customize email templates for:
   - Confirm signup
   - Reset password
   - Magic link

### URL Configuration

1. Go to **Authentication** > **URL Configuration**
2. Add your site URL:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Add redirect URLs:
   - `http://localhost:3000/**`
   - `https://yourdomain.com/**`

## 6. Seed Sample Data (Optional)

To test your application, you can add sample products:

```sql
INSERT INTO public.products (name, description, price, stock_quantity, category, hash_rate, power_consumption, is_featured, is_active)
VALUES
  ('Bitmain Antminer S19 Pro', 'High-performance Bitcoin ASIC miner', 2499.00, 50, 'ASIC', '110 TH/s', '3250W', true, true),
  ('Whatsminer M50', 'Efficient mining solution for Bitcoin', 3299.00, 30, 'ASIC', '114 TH/s', '3306W', true, true),
  ('GPU Mining Rig - 8x RTX 4090', 'Ultimate GPU mining rig', 15999.00, 10, 'GPU', '7.5 GH/s', '4000W', true, true),
  ('Antminer L7', 'Litecoin and Dogecoin miner', 4999.00, 25, 'ASIC', '9.5 GH/s', '3425W', false, true),
  ('Mining Power Supply 3000W', 'High-efficiency PSU for mining rigs', 299.00, 100, 'Accessories', null, '3000W', false, true);
```

## 7. Test the Setup

1. Start your development server:

   ```bash
   pnpm dev
   ```

2. Test authentication:
   - Navigate to `http://localhost:3000/auth/signup`
   - Create a new account
   - Verify the profile is created in **Database** > **profiles** table

3. Test the dashboard:
   - After signup, you should be redirected to `/dashboard`
   - Check all sections: Profile, Orders, Wishlist, Cart

## 8. Verify Database Tables

In Supabase dashboard, go to **Database** > **Tables** and verify:

- [x] profiles
- [x] addresses
- [x] products
- [x] wishlist
- [x] cart
- [x] orders
- [x] order_items
- [x] payment_methods

## Features Implemented

### ✅ User Authentication

- Email/password signup and login
- Session management
- Protected routes via middleware
- Automatic profile creation on signup

### ✅ User Dashboard

- Profile management (name, phone, email)
- Order history with status tracking
- Wishlist management
- Shopping cart with quantity controls

### ✅ Database Security

- Row-level security (RLS) enabled on all tables
- Users can only access their own data
- Public read access for products
- Automatic timestamps and triggers

### ✅ Ecommerce Essentials

- Product catalog with categories
- Cart with real-time updates
- Wishlist functionality
- Order tracking
- Crypto payment support (structure ready)
- Address management
- Payment methods storage

## Next Steps

1. **Add products**: Use the Supabase dashboard or create an admin panel
2. **Implement checkout**: Complete the checkout flow with payment integration
3. **Add crypto payments**: Integrate crypto payment gateways
4. **Email notifications**: Set up order confirmation emails
5. **Admin panel**: Create admin dashboard for managing products and orders

## Troubleshooting

### "Invalid API key" error

- Check that environment variables are correctly set in `.env.local`
- Restart the dev server after updating env vars

### "Row-level security" errors

- Ensure you're logged in when accessing protected data
- Check RLS policies in Supabase dashboard

### Authentication not working

- Verify URL configuration in Supabase dashboard
- Check that redirect URLs include your domain

## Support

For more information:

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
