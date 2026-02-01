-- Add shipping_method column to orders table if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_method TEXT;

-- Add expected_delivery_date column to orders table if it doesn't exist
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMP WITH TIME ZONE;

-- Add last_login field to profiles table if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add tracking fields to orders table if they don't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;

-- Create RLS policies for orders table if they don't exist
DO $$
BEGIN
    -- Check if RLS is enabled on orders table
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND rowsecurity = true
    ) THEN
        -- Enable RLS on orders table
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Create policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND policyname = 'Users can view their own orders'
    ) THEN
        CREATE POLICY "Users can view their own orders" 
        ON public.orders FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND policyname = 'Users can insert their own orders'
    ) THEN
        CREATE POLICY "Users can insert their own orders" 
        ON public.orders FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Admins can view all orders
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND policyname = 'Admins can view all orders'
    ) THEN
        CREATE POLICY "Admins can view all orders" 
        ON public.orders FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.is_admin = true
            )
        );
    END IF;

    -- Admins can update all orders
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND policyname = 'Admins can update all orders'
    ) THEN
        CREATE POLICY "Admins can update all orders" 
        ON public.orders FOR UPDATE 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.is_admin = true
            )
        );
    END IF;
END $$;
