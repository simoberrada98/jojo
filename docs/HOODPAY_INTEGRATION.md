# HoodPay Payment Integration

Complete production-ready payment integration with HoodPay, Supabase, localStorage, and Web Payment API.

## Features

- ✅ HoodPay API integration with webhook support
- ✅ Web Payment Request API (Apple Pay, Google Pay, Cards)
- ✅ Supabase database integration with retry logic
- ✅ LocalStorage state management with crash recovery
- ✅ HMAC SHA256 webhook signature verification
- ✅ Comprehensive error handling and payment recovery
- ✅ Full TypeScript type safety

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
# HoodPay Configuration
HOODPAY_API_KEY=your_api_key_here
HOODPAY_BUSINESS_ID=your_business_id_here
HOODPAY_WEBHOOK_SECRET=whsec_Ez1ErDOvHXNEoSSty8QeNV1xefM1Osly

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 2. Database Migration

Run the Supabase migration to create the necessary tables:

```bash
npm run db:push
```

This creates:

- `payments` table - stores payment records
- `webhook_events` table - tracks webhook events
- `payment_attempts` table - logs payment retry attempts

### 3. Webhook Configuration

Your webhook endpoint is already configured at:

```
https://jhuangnyc.com/api/hoodpay/webhook
```

**Webhook Details:**

- URL: `https://jhuangnyc.com/api/hoodpay/webhook`
- Secret: `whsec_Ez1ErDOvHXNEoSSty8QeNV1xefM1Osly`
- Events:
  - `PAYMENT_CREATED`
  - `PAYMENT_METHOD_SELECTED`
  - `PAYMENT_COMPLETED`
  - `PAYMENT_CANCELLED`
  - `PAYMENT_EXPIRED`

## Usage

### Basic Payment Flow

```typescript
import { createPaymentOrchestrator, PaymentMethod } from '@/lib/payment';
import { logger } from '@/lib/utils/logger';

// Initialize orchestrator with hooks
const orchestrator = createPaymentOrchestrator({
  hooks: {
    onCreated: async (event) => {
      logger.info('Payment created', event);
    },
    onCompleted: async (event) => {
      logger.info('Payment completed', event);
      // Send confirmation email, update order, etc.
    },
    onFailed: async (event) => {
      logger.error('Payment failed', event);
      // Handle failure, notify user
    },
  },
});

// 1. Initialize payment
const checkoutData = {
  items: [
    {
      id: 'product-1',
      name: 'Premium Plan',
      quantity: 1,
      unitPrice: 99.99,
      total: 99.99,
    },
  ],
  subtotal: 99.99,
  tax: 8.0,
  shipping: 0,
  total: 107.99,
  currency: 'USD',
};

const paymentIntent = await orchestrator.initializePayment(
  107.99,
  'USD',
  checkoutData,
  {
    customerEmail: 'customer@example.com',
    description: 'Premium Plan Purchase',
  }
);

// 2. Process payment with HoodPay
const result = await orchestrator.processPayment(PaymentMethod.HOODPAY, {
  redirectUrl: 'https://yoursite.com/payment/success',
  notifyUrl: 'https://yoursite.com/api/hoodpay/webhook',
});

if (result.success) {
  // Redirect to HoodPay payment page
  window.location.href = result.metadata.paymentUrl;
}
```

### Using Web Payment API

```typescript
import { webPaymentService, isPaymentRequestSupported } from '@/lib/payment';

// Check if Web Payment API is available
if (isPaymentRequestSupported()) {
  const result = await orchestrator.processPayment(
    PaymentMethod.WEB_PAYMENT_API
  );

  if (result.success) {
    logger.info('Payment completed via Web Payment API');
  }
}
```

### Payment Recovery

```typescript
import { paymentStorage } from '@/lib/payment';

// On page load, check for interrupted payment
const state = paymentStorage.loadState();
if (state && state.currentStep !== PaymentStep.COMPLETE) {
  // Resume payment flow
  const recovered = await orchestrator.recoverPayment();
  if (recovered) {
    logger.info('Recovered payment', recovered);
  }
}
```

### Direct HoodPay API Usage

```typescript
import {
  getPayments,
  createPayment,
  getWebhooks,
  createWebhook,
} from '@/lib/payment';

// Fetch payments
const payments = await getPayments(
  process.env.HOODPAY_API_KEY!,
  process.env.HOODPAY_BUSINESS_ID!,
  {
    PageNumber: 1,
    PageSize: 20,
    status: 'completed',
  }
);

// Create payment
const payment = await createPayment(
  process.env.HOODPAY_API_KEY!,
  process.env.HOODPAY_BUSINESS_ID!,
  {
    currency: 'USD',
    amount: 99.99,
    name: 'Product Name',
    customerEmail: 'customer@example.com',
  }
);

// Get webhooks
const webhooks = await getWebhooks(
  process.env.HOODPAY_API_KEY!,
  process.env.HOODPAY_BUSINESS_ID!
);
```

## Webhook Handling

The webhook endpoint at `/api/hoodpay/webhook` automatically:

1. **Verifies signature** using HMAC SHA256
2. **Stores event** in `webhook_events` table
3. **Updates payment status** in `payments` table
4. **Processes event** based on type

### Webhook Events

| Event                     | Description                   | Action                         |
| ------------------------- | ----------------------------- | ------------------------------ |
| `PAYMENT_CREATED`         | Payment initialized           | Creates/updates payment record |
| `PAYMENT_METHOD_SELECTED` | Customer chose payment method | Updates payment method         |
| `PAYMENT_COMPLETED`       | Payment successful            | Updates status to completed    |
| `PAYMENT_CANCELLED`       | Customer cancelled            | Updates status to cancelled    |
| `PAYMENT_EXPIRED`         | Payment timed out             | Updates status to expired      |

### Testing Webhooks Locally

Use a tunnel service to expose your local server:

```bash
# Using ngrok
ngrok http 3000

# Update webhook URL in HoodPay dashboard
https://your-ngrok-url.ngrok.io/api/hoodpay/webhook
```

## Database Schema

### Payments Table

```sql
create table payments (
  id uuid primary key,
  hp_payment_id text unique,
  business_id text not null,
  session_id text not null,
  amount numeric not null,
  currency text not null,
  status text not null,
  method text,
  customer_email text,
  metadata jsonb,
  checkout_data jsonb,
  hoodpay_response jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  completed_at timestamptz
);
```

### Webhook Events Table

```sql
create table webhook_events (
  id uuid primary key,
  event_type text not null,
  payment_id text,
  business_id text,
  payload jsonb not null,
  signature text,
  verified boolean not null,
  processed boolean not null,
  received_at timestamptz not null,
  processed_at timestamptz,
  retry_count integer not null
);
```

## Error Handling

The integration includes comprehensive error handling:

### Retry Logic

```typescript
// Automatic retry with exponential backoff
const dbService = createPaymentService();
// Retries up to 3 times with 1s delay between attempts
```

### Payment Recovery

```typescript
// LocalStorage automatically saves state every step
// Can recover from:
// - Browser crashes
// - Page reloads
// - Network interruptions
// - Session timeouts (30 min)
```

### Error Logging

All errors are logged to:

- `payment_attempts` table (per attempt)
- `error_log` field in payments table
- Console with full stack traces

## Security

✅ **Webhook Signature Verification**

- HMAC SHA256 with constant-time comparison
- Prevents spoofed webhook requests

✅ **Environment Variables**

- All secrets stored in environment variables
- Never committed to git

✅ **Supabase RLS**

- Configure Row Level Security policies
- Restrict access to payment data

✅ **HTTPS Only**

- All API calls use HTTPS
- Webhook endpoint requires HTTPS

## Testing

```bash
# Type checking
npm run type-check

# Run development server
npm run dev

# Test webhook endpoint
curl http://localhost:3000/api/hoodpay/webhook
# Response: {"status":"ok","message":"HoodPay webhook endpoint is active",...}
```

## Monitoring

Monitor your payment integration:

1. **Supabase Dashboard** - View payment records and webhook events
2. **Console Logs** - Check webhook processing logs
3. **Payment Status** - Query payments table for status updates

```sql
-- Get payment statistics
SELECT status, COUNT(*) as count, SUM(amount) as total
FROM payments
GROUP BY status;

-- Recent webhook events
SELECT event_type, verified, processed, received_at
FROM webhook_events
ORDER BY received_at DESC
LIMIT 20;
```

## Troubleshooting

### Webhook not receiving events

1. Verify webhook URL is publicly accessible
2. Check webhook secret matches
3. Verify signature verification is working
4. Check Supabase credentials are correct

### Payment not updating

1. Check webhook events table for errors
2. Verify `hp_payment_id` matches HoodPay payment ID
3. Check Supabase service role key has write permissions

### LocalStorage issues

1. Check browser allows localStorage
2. Verify session hasn't expired (30 min timeout)
3. Check for console errors

## Support

For issues or questions:

- Check HoodPay documentation: https://docs.hoodpay.io
- Review Supabase docs: https://supabase.com/docs
- File an issue in the repository
