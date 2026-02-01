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

-- Update product images with realistic URLs
UPDATE products
SET image_url = CASE
    -- Smartphones
    WHEN name ILIKE '%iphone%' OR name ILIKE '%apple%phone%' 
        THEN 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%samsung%' OR name ILIKE '%galaxy%' 
        THEN 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%pixel%' OR name ILIKE '%google%phone%' 
        THEN 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%oneplus%' 
        THEN 'https://images.unsplash.com/photo-1636825422726-3a8d84a0cf2f?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    
    -- Laptops
    WHEN name ILIKE '%macbook%' OR name ILIKE '%apple%laptop%' 
        THEN 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%dell%' 
        THEN 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%hp%' OR name ILIKE '%hewlett%packard%' 
        THEN 'https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%lenovo%' 
        THEN 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    
    -- Tablets
    WHEN name ILIKE '%ipad%' OR name ILIKE '%apple%tablet%' 
        THEN 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%galaxy%tab%' OR name ILIKE '%samsung%tablet%' 
        THEN 'https://images.unsplash.com/photo-1589739900243-4b52cd9dd8df?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    
    -- Headphones
    WHEN name ILIKE '%airpods%' OR name ILIKE '%apple%headphone%' 
        THEN 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%sony%' AND (name ILIKE '%headphone%' OR name ILIKE '%earphone%') 
        THEN 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%bose%' 
        THEN 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%beats%' OR name ILIKE '%dr%dre%' 
        THEN 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    
    -- Smartwatches
    WHEN name ILIKE '%apple%watch%' 
        THEN 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%galaxy%watch%' OR name ILIKE '%samsung%watch%' 
        THEN 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%fitbit%' 
        THEN 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    
    -- Cameras
    WHEN name ILIKE '%canon%' 
        THEN 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%nikon%' 
        THEN 'https://images.unsplash.com/photo-1617799899086-c15b5a0e2cff?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%sony%' AND name ILIKE '%camera%' 
        THEN 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    
    -- TVs
    WHEN name ILIKE '%tv%' OR name ILIKE '%television%' 
        THEN 'https://images.unsplash.com/photo-1593784991095-a20500764cbd?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%samsung%' AND (name ILIKE '%tv%' OR name ILIKE '%television%') 
        THEN 'https://images.unsplash.com/photo-1601944177325-f8867652837f?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%lg%' AND (name ILIKE '%tv%' OR name ILIKE '%television%') 
        THEN 'https://images.unsplash.com/photo-1577979749830-f1d742b96791?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    
    -- Gaming
    WHEN name ILIKE '%playstation%' OR name ILIKE '%ps5%' OR name ILIKE '%ps4%' 
        THEN 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%xbox%' 
        THEN 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    WHEN name ILIKE '%nintendo%' OR name ILIKE '%switch%' 
        THEN 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
    
    -- Default image for other products
    ELSE 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3'
END
WHERE image_url IS NULL OR image_url = '';

-- Insert sample products if none exist
INSERT INTO products (name, description, price, image_url, rating)
SELECT * FROM (
    VALUES 
    ('iPhone 14 Pro', 'Latest Apple smartphone with advanced camera system', 999.99, 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.8),
    ('Samsung Galaxy S23', 'Flagship Android smartphone with stunning display', 899.99, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.7),
    ('MacBook Pro 16"', 'Powerful laptop for professionals with M2 chip', 2499.99, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.9),
    ('iPad Air', 'Versatile tablet for work and entertainment', 599.99, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.6),
    ('Sony WH-1000XM5', 'Premium noise-cancelling headphones', 349.99, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.8),
    ('Apple Watch Series 8', 'Advanced health and fitness tracking smartwatch', 399.99, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.7),
    ('Canon EOS R6', 'Professional mirrorless camera for photography enthusiasts', 2499.99, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.9),
    ('Samsung 65" QLED TV', 'Ultra HD smart TV with vibrant colors', 1299.99, 'https://images.unsplash.com/photo-1601944177325-f8867652837f?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.5),
    ('PlayStation 5', 'Next-gen gaming console with immersive experiences', 499.99, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.8),
    ('Bose QuietComfort Earbuds', 'Wireless noise-cancelling earbuds for on-the-go', 279.99, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.6),
    ('Dell XPS 15', 'Premium Windows laptop with InfinityEdge display', 1799.99, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.7),
    ('Google Pixel 7 Pro', 'Android smartphone with exceptional camera capabilities', 899.99, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3', 4.6)
) AS new_products (name, description, price, image_url, rating)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
