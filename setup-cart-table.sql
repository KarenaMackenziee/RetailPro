-- Make sure the cart table has the correct structure
CREATE TABLE IF NOT EXISTS public.cart (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON public.cart(product_id);

-- Create a unique constraint to prevent duplicate products in cart
ALTER TABLE public.cart DROP CONSTRAINT IF EXISTS unique_user_product;
ALTER TABLE public.cart ADD CONSTRAINT unique_user_product UNIQUE (user_id, product_id);

-- Set up RLS policies for cart table
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can insert into their own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can update their own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can delete from their own cart" ON public.cart;

-- Create policies
CREATE POLICY "Users can view their own cart" 
ON public.cart FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own cart" 
ON public.cart FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" 
ON public.cart FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart" 
ON public.cart FOR DELETE 
USING (auth.uid() = user_id);
