-- Update product images with reliable URLs
UPDATE products
SET image_url = CASE
    WHEN LOWER(name) LIKE '%headphone%' OR LOWER(name) LIKE '%speaker%' OR LOWER(name) LIKE '%audio%' 
        THEN 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500'
    WHEN LOWER(name) LIKE '%camera%' OR LOWER(name) LIKE '%lens%' 
        THEN 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500'
    WHEN LOWER(name) LIKE '%phone%' OR LOWER(name) LIKE '%mobile%' OR LOWER(name) LIKE '%smartphone%' 
        THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500'
    WHEN LOWER(name) LIKE '%watch%' OR LOWER(name) LIKE '%tracker%' OR LOWER(name) LIKE '%fitness%' 
        THEN 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500'
    WHEN LOWER(name) LIKE '%laptop%' OR LOWER(name) LIKE '%computer%' OR LOWER(name) LIKE '%notebook%' 
        THEN 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500'
    WHEN LOWER(name) LIKE '%electronics%' OR LOWER(name) LIKE '%device%' OR LOWER(name) LIKE '%gadget%' 
        THEN 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=500'
    ELSE 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500'
END
WHERE image_url IS NULL OR image_url = '' OR image_url LIKE '%photo-1591337676887-a217a6970a8a%';

-- Verify the update
SELECT id, name, image_url FROM products;
