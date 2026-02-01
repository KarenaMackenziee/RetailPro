-- Check if products table exists, if not create it
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  rating DECIMAL(3, 1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if there are any products, if not insert sample data
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM products) = 0 THEN
    INSERT INTO products (name, description, price, image_url, rating) VALUES
    ('Premium Wireless Headphones', 'High-quality wireless headphones with noise cancellation and 30-hour battery life.', 12999, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.8),
    ('Smart Fitness Tracker', 'Track your fitness goals with this advanced smart tracker. Features heart rate monitoring, sleep tracking, and more.', 3499, 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.5),
    ('Ultra HD Smart TV', '55-inch Ultra HD Smart TV with HDR and built-in streaming apps. Experience stunning visuals and smart features.', 49999, 'https://images.unsplash.com/photo-1593784991095-a20500764cbd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.7),
    ('Professional DSLR Camera', 'Capture stunning photos and videos with this professional-grade DSLR camera. Includes 24-70mm lens.', 78999, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 4.9);
  END IF;
END $$;
