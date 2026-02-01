-- Create a function to check if the cart table exists and create it if it doesn't
CREATE OR REPLACE FUNCTION create_stored_procedure_for_cart_table()
RETURNS void AS $$
BEGIN
  -- Create the function to create the cart table if it doesn't exist
  CREATE OR REPLACE FUNCTION create_cart_table_if_not_exists()
  RETURNS void AS $func$
  BEGIN
    -- Check if the cart table exists
    IF NOT EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = 'cart'
    ) THEN
      -- Create the cart table
      CREATE TABLE public.cart (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create index for faster queries
      CREATE INDEX idx_cart_user_id ON public.cart(user_id);
      CREATE INDEX idx_cart_product_id ON public.cart(product_id);

      -- Create a unique constraint to prevent duplicate products in cart
      ALTER TABLE public.cart ADD CONSTRAINT unique_user_product UNIQUE (user_id, product_id);

      -- Set up RLS policies for cart table
      ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

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
    END IF;
  END;
  $func$ LANGUAGE plpgsql;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create the stored procedure
SELECT create_stored_procedure_for_cart_table();

-- Execute the stored procedure to create the cart table if it doesn't exist
SELECT create_cart_table_if_not_exists();
