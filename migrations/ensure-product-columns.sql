-- Check if image_url column exists in products table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
    
    -- Check if rating column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'rating'
    ) THEN
        ALTER TABLE products ADD COLUMN rating FLOAT DEFAULT 4.5;
    END IF;
END $$;

-- Update any products with null image_url to use a placeholder
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
WHERE image_url IS NULL;

-- Update any products with null rating to use a default value
UPDATE products
SET rating = 4.5
WHERE rating IS NULL;
