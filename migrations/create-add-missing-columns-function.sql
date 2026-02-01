-- Create a function to add missing columns to the orders table
CREATE OR REPLACE FUNCTION add_missing_order_columns()
RETURNS void AS $$
BEGIN
  -- Add shipping_method column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_method TEXT;
  END IF;

  -- Add expected_delivery_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'expected_delivery_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN expected_delivery_date BIGINT;
  END IF;

  -- Add tracking_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_number TEXT;
  END IF;

  -- Add carrier column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'carrier'
  ) THEN
    ALTER TABLE orders ADD COLUMN carrier TEXT;
  END IF;

  -- Add shipped_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipped_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add delivered_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
  END IF;
END;
$$ LANGUAGE plpgsql;
