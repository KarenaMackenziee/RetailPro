import { createServerClient } from "@/lib/supabase-server"
import AdminOrdersTable from "@/components/admin-orders-table"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { customer?: string }
}) {
  const supabase = createServerClient()

  // Get customer ID from query params
  const customerId = searchParams.customer

  // Build query
  let query = supabase.from("orders").select(`
  id,
  user_id,
  subtotal,
  tax,
  shipping,
  total,
  status,
  created_at,
  profiles (
    first_name,
    last_name,
    email,
    phone_number
  ),
  order_items (
    quantity,
    product_id,
    products (
      name,
      image_url
    )
  )
`)


  // Filter by customer if provided
  if (customerId) {
    query = query.eq("user_id", customerId)
  }

  // Execute query
  const { data: orders } = await query.order("created_at", { ascending: false })

  // Get customer details if filtering by customer
  let customerName = ""
  if (customerId) {
    const { data: customer } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", customerId)
      .single()

    if (customer) {
      customerName = `${customer.first_name} ${customer.last_name}`
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{customerId ? `Orders for ${customerName}` : "Manage Orders"}</h1>

      {customerId && (
        <div className="mb-4">
          <a href="/admin/orders" className="text-blue-600 hover:underline">
            ← Back to all orders
          </a>
        </div>
      )}

      <AdminOrdersTable initialOrders={orders || []} />
    </div>
  )
}
