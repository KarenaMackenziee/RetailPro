-- Check if the image_url column exists in the products table
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'image_url'
    ) THEN
        -- Add the image_url column if it doesn't exist
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Update products with null image_url to have default images
UPDATE products
SET image_url = CASE
    WHEN name ILIKE '%headphone%' OR name ILIKE '%speaker%' OR name ILIKE '%audio%' 
        THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%camera%' OR name ILIKE '%lens%' 
        THEN 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%tv%' OR name ILIKE '%monitor%' OR name ILIKE '%display%' 
        THEN 'https://images.unsplash.com/photo-1593784991095-a20500764cbd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%phone%' OR name ILIKE '%mobile%' OR name ILIKE '%smartphone%' 
        THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%watch%' OR name ILIKE '%tracker%' OR name ILIKE '%fitness%' 
        THEN 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%laptop%' OR name ILIKE '%computer%' OR name ILIKE '%notebook%'
        THEN 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%tablet%' OR name ILIKE '%ipad%'
        THEN 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ELSE 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
END
WHERE image_url IS NULL OR image_url = '';

-- Add some specific product images for common products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' WHERE name ILIKE '%iphone%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' WHERE name ILIKE '%samsung%galaxy%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' WHERE name ILIKE '%macbook%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' WHERE name ILIKE '%ipad%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' WHERE name ILIKE '%smartwatch%';
