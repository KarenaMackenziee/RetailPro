import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Add missing columns to orders table
    await supabase.rpc("add_missing_order_columns")

    // Create cart table if it doesn't exist
    await supabase.rpc("create_cart_table_if_not_exists", {})

    return NextResponse.json({ success: true, message: "Database setup completed successfully" })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// Create a stored procedure to create the cart table if it doesn't exist
async function createStoredProcedure() {
  const supabase = createServerClient()

  const { error } = await supabase.rpc("create_stored_procedure_for_cart_table", {})

  if (error) {
    console.error("Error creating stored procedure:", error)
  }
}

// Call this function when the route is first loaded
createStoredProcedure()
