-- Add shipping_method column to orders table if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_method TEXT;

-- Add expected_delivery_date column to orders table if it doesn't exist
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMP WITH TIME ZONE;
