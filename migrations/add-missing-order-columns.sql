-- Add missing columns to the orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_method TEXT,
ADD COLUMN IF NOT EXISTS expected_delivery_date BIGINT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Update existing orders with default values
UPDATE orders
SET 
  shipping_method = CASE 
    WHEN random() < 0.33 THEN 'standard'
    WHEN random() < 0.66 THEN 'express'
    ELSE 'economy'
  END,
  expected_delivery_date = (EXTRACT(EPOCH FROM (NOW() + (FLOOR(RANDOM() * 10) + 3) * INTERVAL '1 day')) * 1000)::BIGINT
WHERE shipping_method IS NULL;
