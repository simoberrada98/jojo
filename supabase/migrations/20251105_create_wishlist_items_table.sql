-- Create the 'wishlist_items' table
CREATE TABLE public.wishlist_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT unique_wishlist_item UNIQUE (user_id, product_id)
);

-- Enable Row Level Security for 'wishlist_items'
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policy for 'wishlist_items': Users can view their own wishlist items
CREATE POLICY "Users can view their own wishlist items" ON public.wishlist_items
FOR SELECT USING (auth.uid() = user_id);

-- Policy for 'wishlist_items': Users can insert their own wishlist items
CREATE POLICY "Users can insert their own wishlist items" ON public.wishlist_items
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for 'wishlist_items': Users can delete their own wishlist items
CREATE POLICY "Users can delete their own wishlist items" ON public.wishlist_items
FOR DELETE USING (auth.uid() = user_id);
