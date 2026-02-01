-- Add tracking fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;

-- Add last_login field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update existing orders with random tracking data for demo purposes
-- This is just for demonstration, in a real system this would come from actual shipping data
DO $$
DECLARE
    order_rec RECORD;
    random_days INTEGER;
    shipping_carriers TEXT[] := ARRAY['FedEx', 'DHL', 'UPS', 'USPS', 'BlueDart'];
    random_carrier TEXT;
BEGIN
    FOR order_rec IN SELECT id, status, created_at FROM public.orders
    LOOP
        -- Only update orders that are shipped or delivered
        IF order_rec.status = 'shipped' OR order_rec.status = 'delivered' THEN
            -- Random days between 1-3 after order creation for shipping date
            random_days := floor(random() * 3) + 1;
            UPDATE public.orders 
            SET shipped_at = order_rec.created_at + (random_days || ' days')::INTERVAL
            WHERE id = order_rec.id;
            
            -- Generate random tracking number
            random_carrier := shipping_carriers[floor(random() * array_length(shipping_carriers, 1)) + 1];
            UPDATE public.orders 
            SET tracking_number = UPPER(
                    substring(md5(random()::text) from 1 for 4) || '-' || 
                    substring(md5(random()::text) from 5 for 4) || '-' || 
                    substring(md5(random()::text) from 9 for 4)
                ),
                shipping_carrier = random_carrier
            WHERE id = order_rec.id;
            
            -- Set expected delivery date 3-7 days after shipping
            random_days := floor(random() * 5) + 3;
            UPDATE public.orders 
            SET expected_delivery_date = shipped_at + (random_days || ' days')::INTERVAL
            WHERE id = order_rec.id;
            
            -- If delivered, set delivered_at date
            IF order_rec.status = 'delivered' THEN
                -- Delivered 0-2 days before expected date (early delivery)
                random_days := floor(random() * 3);
                UPDATE public.orders 
                SET delivered_at = expected_delivery_date - (random_days || ' days')::INTERVAL
                WHERE id = order_rec.id;
            END IF;
        END IF;
    END LOOP;
END $$;
