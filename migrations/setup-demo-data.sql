-- Step 1: Ensure profiles table has required columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Step 2: Seed the admin profile (requires corresponding Supabase auth user)
-- NOTE: Ensure you create a user in Supabase with id = '00000000-0000-0000-0000-000000000001'
INSERT INTO profiles (id, first_name, last_name, email, role, is_admin, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin',
  'User',
  'admin@retailpro.com',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_admin = true,
  email = 'admin@retailpro.com';

-- Step 3: Seed user profiles (must match Supabase auth.user IDs)
INSERT INTO profiles (id, first_name, last_name, email, phone_number, role, is_admin, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'John', 'Doe', 'john.doe@example.com', '+91-9876543210', 'user', false, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Jane', 'Smith', 'jane.smith@example.com', '+91-9876543211', 'user', false, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Mike', 'Johnson', 'mike.johnson@example.com', '+91-9876543212', 'user', false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone_number = EXCLUDED.phone_number;

-- Step 4: Seed demo orders (foreign key: user_id must match profiles.id)
INSERT INTO orders (user_id, subtotal, tax, shipping, total, status, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 25000.00, 4500.00, 0.00, 29500.00, 'pending', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000003', 15000.00, 2700.00, 200.00, 17900.00, 'processing', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000004', 35000.00, 6300.00, 0.00, 41300.00, 'dispatched', NOW() - INTERVAL '3 hours'),
  ('00000000-0000-0000-0000-000000000002', 8000.00, 1440.00, 150.00, 9590.00, 'delivered', NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000003', 12000.00, 2160.00, 0.00, 14160.00, 'pending', NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;
