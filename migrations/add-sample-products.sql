-- Check if products table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
    ) THEN
        CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            image_url TEXT,
            category VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            rating DECIMAL(3, 2) DEFAULT 0,
            reviews_count INTEGER DEFAULT 0
        );
    END IF;
END
$$;

-- Check if there are any products
DO $$
DECLARE
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;
    
    IF product_count = 0 THEN
        -- Insert sample products
        INSERT INTO products (name, description, price, stock, image_url, category, rating, reviews_count) VALUES
        ('Smartphone X', 'Latest smartphone with advanced features and high-resolution camera.', 49999.99, 50, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&h=500&fit=crop', 'Electronics', 4.7, 128),
        
        ('Laptop Pro', 'Powerful laptop for professionals with high performance and long battery life.', 89999.99, 25, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop', 'Electronics', 4.8, 95),
        
        ('Wireless Headphones', 'Premium noise-cancelling headphones with crystal clear sound.', 12999.99, 100, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', 'Electronics', 4.5, 210),
        
        ('Smart Watch', 'Track your fitness and stay connected with this stylish smart watch.', 15999.99, 75, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&h=500&fit=crop', 'Electronics', 4.3, 87),
        
        ('Coffee Maker', 'Automatic coffee maker with multiple brewing options for the perfect cup.', 7999.99, 40, 'https://images.unsplash.com/photo-1570087407133-46b5bfdda89a?w=500&h=500&fit=crop', 'Home Appliances', 4.6, 64),
        
        ('Fitness Tracker', 'Monitor your health and fitness goals with this advanced tracker.', 3999.99, 120, 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500&h=500&fit=crop', 'Fitness', 4.2, 156),
        
        ('Bluetooth Speaker', 'Portable speaker with rich sound and long battery life for music on the go.', 5999.99, 85, 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&h=500&fit=crop', 'Electronics', 4.4, 112),
        
        ('Digital Camera', 'Capture your memories with this high-resolution digital camera.', 35999.99, 30, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop', 'Electronics', 4.7, 78),
        
        ('Gaming Console', 'Next-generation gaming console for immersive gaming experience.', 45999.99, 20, 'https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=500&h=500&fit=crop', 'Gaming', 4.9, 203),
        
        ('Blender', 'Powerful blender for smoothies, soups, and more with multiple speed settings.', 4999.99, 60, 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&h=500&fit=crop', 'Home Appliances', 4.1, 92);
    END IF;
END
$$;
