-- Ensure the image_url column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Update products with specific images based on their names or categories
UPDATE products
SET image_url = CASE
    -- Smartphones
    WHEN name ILIKE '%iphone%' THEN 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%samsung%' AND (name ILIKE '%galaxy%' OR name ILIKE '%phone%') THEN 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%pixel%' OR name ILIKE '%google%phone%' THEN 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%xiaomi%' OR name ILIKE '%redmi%' THEN 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%oneplus%' THEN 'https://images.unsplash.com/photo-1557690756-62754e561982?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    
    -- Laptops
    WHEN name ILIKE '%macbook%' OR (name ILIKE '%apple%' AND name ILIKE '%laptop%') THEN 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%dell%' THEN 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%hp%' OR name ILIKE '%hewlett%packard%' THEN 'https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%lenovo%' THEN 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%asus%' THEN 'https://images.unsplash.com/photo-1636211990414-8edec17ba047?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    
    -- Headphones
    WHEN name ILIKE '%airpods%' OR (name ILIKE '%apple%' AND name ILIKE '%headphone%') THEN 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%sony%' AND name ILIKE '%headphone%' THEN 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%bose%' THEN 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%beats%' THEN 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%jbl%' THEN 'https://images.unsplash.com/photo-1578319439584-104c94d37305?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    
    -- Smartwatches
    WHEN name ILIKE '%apple watch%' THEN 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%galaxy watch%' OR (name ILIKE '%samsung%' AND name ILIKE '%watch%') THEN 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%fitbit%' THEN 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%garmin%' THEN 'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    
    -- Tablets
    WHEN name ILIKE '%ipad%' THEN 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%galaxy tab%' OR (name ILIKE '%samsung%' AND name ILIKE '%tablet%') THEN 'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%surface%' OR (name ILIKE '%microsoft%' AND name ILIKE '%tablet%') THEN 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    
    -- Cameras
    WHEN name ILIKE '%canon%' THEN 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%nikon%' THEN 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%sony%' AND (name ILIKE '%camera%' OR name ILIKE '%alpha%') THEN 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%gopro%' THEN 'https://images.unsplash.com/photo-1526317899637-7e0e48ddb359?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    
    -- TVs
    WHEN name ILIKE '%tv%' OR name ILIKE '%television%' THEN 'https://images.unsplash.com/photo-1593784991095-a20500764cbd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%monitor%' THEN 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    
    -- Gaming
    WHEN name ILIKE '%playstation%' OR name ILIKE '%ps5%' OR name ILIKE '%ps4%' THEN 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%xbox%' THEN 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%nintendo%' OR name ILIKE '%switch%' THEN 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    
    -- Speakers
    WHEN name ILIKE '%speaker%' THEN 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%homepod%' OR (name ILIKE '%apple%' AND name ILIKE '%speaker%') THEN 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%echo%' OR name ILIKE '%alexa%' THEN 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    
    -- Default by category
    WHEN name ILIKE '%phone%' OR name ILIKE '%smartphone%' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%laptop%' OR name ILIKE '%notebook%' THEN 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%headphone%' OR name ILIKE '%earphone%' OR name ILIKE '%earbud%' THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%watch%' OR name ILIKE '%smartwatch%' THEN 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%tablet%' THEN 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    WHEN name ILIKE '%camera%' THEN 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    
    -- Generic fallback
    ELSE 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
END
WHERE image_url IS NULL OR image_url = '' OR image_url = '/placeholder.svg?height=192&width=384';

-- Add sample products if none exist
INSERT INTO products (name, description, price, image_url, rating)
SELECT * FROM (
    VALUES
    ('iPhone 14 Pro', 'Latest Apple smartphone with advanced camera system', 999.99, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.8),
    ('Samsung Galaxy S23', 'Flagship Android smartphone with stunning display', 899.99, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.7),
    ('MacBook Pro 16"', 'Powerful laptop for professionals with M2 chip', 2499.99, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.9),
    ('Sony WH-1000XM5', 'Premium noise-cancelling headphones', 349.99, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.8),
    ('Apple Watch Series 8', 'Advanced health and fitness tracking smartwatch', 399.99, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.7),
    ('iPad Pro 12.9"', 'Powerful tablet with M2 chip and Liquid Retina XDR display', 1099.99, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.8),
    ('Canon EOS R5', 'Professional mirrorless camera with 8K video', 3899.99, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.9),
    ('Sony PlayStation 5', 'Next-gen gaming console with ultra-high-speed SSD', 499.99, 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.7),
    ('Bose QuietComfort Earbuds', 'True wireless noise cancelling earbuds', 279.99, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.6),
    ('Samsung 65" QLED 4K TV', 'Premium 4K smart TV with Quantum Dot technology', 1299.99, 'https://images.unsplash.com/photo-1593784991095-a20500764cbd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.7)
) AS new_products (name, description, price, image_url, rating)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
