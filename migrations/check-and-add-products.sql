-- Check if products table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            image_url TEXT,
            rating DECIMAL(3, 1) DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END
$$;

-- Check if products table is empty
DO $$
DECLARE
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;
    
    IF product_count = 0 THEN
        -- Insert sample products
        INSERT INTO products (name, description, price, image_url, rating) VALUES
        ('Smartphone X', 'Latest smartphone with advanced features and high-resolution camera.', 49999.99, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 4.7),
        ('Laptop Pro', 'Powerful laptop for professionals with high performance and long battery life.', 89999.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 4.5),
        ('Wireless Earbuds', 'Premium wireless earbuds with noise cancellation and crystal clear sound.', 9999.99, 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 4.3),
        ('Smart Watch', 'Feature-rich smartwatch with health monitoring and fitness tracking.', 24999.99, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=2944&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 4.2),
        ('Bluetooth Speaker', 'Portable Bluetooth speaker with deep bass and long battery life.', 7999.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=2936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 4.0),
        ('Gaming Console', 'Next-generation gaming console with stunning graphics and immersive gameplay.', 49999.99, 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?q=80&w=2919&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 4.8),
        ('Digital Camera', 'Professional digital camera with high-resolution sensor and advanced features.', 59999.99, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 4.6),
        ('Tablet Pro', 'Versatile tablet with stunning display and powerful performance.', 39999.99, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2833&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 4.4);
    END IF;
END
$$;

-- Return the count of products
SELECT COUNT(*) as product_count FROM products;
