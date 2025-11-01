# Order Tracking Setup Guide

The order tracking feature on the thank you page will work with or without Supabase, but for real-time tracking updates, you'll need to set up the Supabase database.

## Current Behavior

**Without Supabase configured:**

- Shows default "Order Received" status
- No database errors (graceful fallback)
- Basic tracking UI still displays

**With Supabase configured:**

- Real-time order status updates
- Full tracking history with timestamps and locations
- Live updates via Supabase Realtime

## Setting Up Supabase (Optional)

### 1. Apply the Migration

Run the migration file to create the `order_tracking` table:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL from:
# supabase/migrations/20240115_create_order_tracking.sql
```

### 2. Verify Table Creation

Check that the table was created:

- Go to your Supabase dashboard
- Navigate to "Table Editor"
- Look for `order_tracking` table

### 3. Test with Sample Data

The migration includes sample tracking data for order `MH-SAMPLE001`. You can test by:

1. Go to `/thank-you?order=MH-SAMPLE001`
2. You should see 3 tracking events

### 4. Add Tracking Events (Admin/Backend)

To add tracking events for real orders, insert into the table:

```sql
INSERT INTO order_tracking (order_number, status, message, location)
VALUES
  ('MH-ABC123', 'processing', 'Payment confirmed, preparing hardware', 'Denver, CO');
```

### 5. Realtime Updates

The component automatically subscribes to realtime updates. When new tracking events are inserted, they'll appear instantly on the thank you page without refreshing.

## Table Schema

```sql
order_tracking:
  - id (UUID, primary key)
  - order_number (TEXT)
  - status (TEXT: pending|processing|shipped|delivered)
  - message (TEXT)
  - location (TEXT, optional)
  - timestamp (TIMESTAMPTZ)
  - created_at (TIMESTAMPTZ)
```

## Status Flow

1. **pending** → Order Received
2. **processing** → Processing (payment confirmed, preparing hardware)
3. **shipped** → Shipped (tracking number assigned)
4. **delivered** → Delivered

## API Integration Example

When creating orders in your backend, you can insert tracking events:

```typescript
// Example: After order creation
await supabase.from('order_tracking').insert({
  order_number: orderId,
  status: 'pending',
  message: 'Order received and awaiting processing',
  location: 'Denver, CO',
});

// Example: When payment is confirmed
await supabase.from('order_tracking').insert({
  order_number: orderId,
  status: 'processing',
  message: 'Payment confirmed, preparing hardware',
  location: 'Denver, CO',
});
```

## Troubleshooting

**Console warnings about tracking table:**

- This is normal if Supabase isn't set up yet
- The app will use default tracking status
- No functionality is broken

**Realtime not working:**

- Verify Realtime is enabled in Supabase dashboard (Database → Replication)
- Check that the table is added to `supabase_realtime` publication
- The migration should handle this automatically

## Future Enhancements

Possible improvements:

- Email notifications on status changes
- SMS notifications
- Carrier tracking integration
- Estimated delivery date calculation
- Package photos on delivery
