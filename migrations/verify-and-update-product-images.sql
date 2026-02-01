-- Step 1: Verify the image_url column exists in the products table
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
        RAISE NOTICE 'Added image_url column to products table';
    ELSE
        RAISE NOTICE 'image_url column already exists in products table';
    END IF;
END $$;

-- Step 2: Count products with missing images
DO $$
DECLARE
    missing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO missing_count FROM products WHERE image_url IS NULL OR image_url = '';
    RAISE NOTICE 'Found % products with missing images', missing_count;
END $$;

-- Step 3: Update products with missing images to have default images based on product name
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
    WHEN name ILIKE '%keyboard%' OR name ILIKE '%mouse%' OR name ILIKE '%peripheral%' 
        THEN 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ELSE 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
END
WHERE image_url IS NULL OR image_url = '';

-- Step 4: Insert sample products if the table is empty
INSERT INTO products (name, description, price, image_url, rating)
SELECT * FROM (
    VALUES 
    ('Premium Wireless Headphones', 'High-quality wireless headphones with noise cancellation and 30-hour battery life.', 12999, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.8),
    ('Smart Fitness Tracker', 'Track your fitness goals with this advanced smart tracker. Features heart rate monitoring, sleep tracking, and more.', 3499, 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.5),
    ('Ultra HD Smart TV', '55-inch Ultra HD Smart TV with HDR and built-in streaming apps. Experience stunning visuals and smart features.', 49999, 'https://images.unsplash.com/photo-1593784991095-a20500764cbd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.7),
    ('Professional DSLR Camera', 'Capture stunning photos and videos with this professional-grade DSLR camera. Includes 24-70mm lens.', 78999, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.9)
) AS sample_products
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
