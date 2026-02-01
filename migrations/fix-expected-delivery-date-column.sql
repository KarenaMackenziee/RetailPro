-- Check if expected_delivery_date column exists and is of the wrong type
DO $$
DECLARE
    column_exists BOOLEAN;
    column_type TEXT;
BEGIN
    -- Check if the column exists
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'expected_delivery_date'
    ) INTO column_exists;

    IF column_exists THEN
        -- Get the column type
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'expected_delivery_date'
        INTO column_type;
        
        -- If the column is not a bigint, alter it
        IF column_type != 'bigint' THEN
            -- Drop the column and recreate it as bigint
            ALTER TABLE public.orders DROP COLUMN expected_delivery_date;
            ALTER TABLE public.orders ADD COLUMN expected_delivery_date BIGINT;
        END IF;
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.orders ADD COLUMN expected_delivery_date BIGINT;
    END IF;
END $$;
