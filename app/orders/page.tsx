import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import OrdersList from "@/components/orders-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function OrdersPage() {
  const supabase = createServerClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/orders")
  }

  // Fetch user details
  const { data: user } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Fetch user's orders with basic fields only to avoid column not found errors
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id, 
      user_id,
      created_at, 
      status, 
      subtotal, 
      tax, 
      shipping, 
      total,
      order_items (
        id, 
        quantity, 
        price,
        product_id,
        products (
          id, 
          name, 
          image_url
        )
      )
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  console.log("Orders fetch result:", { orders, error })

  // If there's an error fetching orders
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Error Loading Orders</CardTitle>
            </div>
            <CardDescription>There was a problem loading your orders. Please try again later.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
              <p>Error details: {error.message}</p>
              <p className="mt-2">
                This error might occur if the database schema is not up to date. Please run the database migrations.
              </p>
            </div>
            <div className="flex gap-4">
              <Button asChild>
                <a href="/dashboard">Return to Dashboard</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/api/setup-database">Run Database Setup</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <CardTitle>My Orders</CardTitle>
          </div>
          <CardDescription>
            Track and manage your orders. View order status, delivery information, and order history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersList orders={orders || []} userId={session.user.id} isAdmin={user?.role === "admin"} />
        </CardContent>
      </Card>
    </div>
  )
}
