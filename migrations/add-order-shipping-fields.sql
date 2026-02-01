-- Add shipping fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_method TEXT,
ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMP WITH TIME ZONE;

-- Add last_login field to profiles table if not already added
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
