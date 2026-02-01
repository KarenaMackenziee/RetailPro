import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function UserOrdersPage() {
  const supabase = createServerClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch orders only for the logged-in user
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      subtotal,
      tax,
      shipping,
      total,
      status,
      created_at,
      order_items (
        product_name,
        quantity,
        price
      )
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user orders:", error)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 container mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders && orders.length > 0 ? (
        orders.map((order) => (
          <Card key={order.id} className="mb-6">
            <CardHeader>
              <CardTitle>Order #{order.id}</CardTitle>
              <Badge
                variant={
                  order.status === "delivered"
                    ? "success"
                    : order.status === "pending"
                    ? "warning"
                    : "secondary"
                }
                className="capitalize"
              >
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Placed on:</strong> {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p>
                <strong>Total:</strong> ₹{order.total.toLocaleString()}
              </p>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Items:</h4>
                <ul className="list-disc list-inside">
                  {order.order_items.map((item, idx) => (
                    <li key={idx}>
                      {item.product_name} x {item.quantity} @ ₹{item.price.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>You have no orders yet.</p>
      )}
    </div>
  )
}
