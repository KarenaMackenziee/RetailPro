-- Create sample orders for testing the admin dashboard
-- First, ensure we have sample users
INSERT INTO profiles (id, first_name, last_name, email, role, is_admin)
VALUES 
  ('user1-sample-id', 'John', 'Doe', 'john.doe@example.com', 'user', false),
  ('user2-sample-id', 'Jane', 'Smith', 'jane.smith@example.com', 'user', false),
  ('admin-sample-id', 'Admin', 'User', 'admin@retailpro.com', 'admin', true)
ON CONFLICT (id) DO NOTHING;

-- Create sample orders
INSERT INTO orders (user_id, subtotal, tax, shipping, total, status, created_at)
VALUES 
  ('user1-sample-id', 25000, 4500, 500, 30000, 'pending', NOW() - INTERVAL '2 hours'),
  ('user2-sample-id', 15000, 2700, 300, 18000, 'processing', NOW() - INTERVAL '1 day'),
  ('user1-sample-id', 35000, 6300, 700, 42000, 'dispatched', NOW() - INTERVAL '3 days'),
  ('user2-sample-id', 8000, 1440, 200, 9640, 'delivered', NOW() - INTERVAL '1 week')
ON CONFLICT DO NOTHING;

-- Ensure products table has sample data
INSERT INTO products (name, description, price, category, stock_quantity, image_url, rating, reviews_count)
VALUES 
  ('iPhone 14 Pro', 'Latest iPhone with advanced camera system', 99999, 'Electronics', 50, '/placeholder.svg?height=300&width=300&text=iPhone+14+Pro', 4.5, 128),
  ('Samsung Galaxy S23', 'Flagship Android smartphone', 79999, 'Electronics', 30, '/placeholder.svg?height=300&width=300&text=Galaxy+S23', 4.3, 95),
  ('MacBook Air M2', 'Lightweight laptop with M2 chip', 119999, 'Electronics', 25, '/placeholder.svg?height=300&width=300&text=MacBook+Air', 4.7, 203),
  ('Sony WH-1000XM4', 'Noise-canceling wireless headphones', 29999, 'Electronics', 75, '/placeholder.svg?height=300&width=300&text=Sony+Headphones', 4.6, 156)
ON CONFLICT (name) DO NOTHING;
