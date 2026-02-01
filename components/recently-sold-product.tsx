import { createServerClient } from "@/lib/supabase-server"
import { ShoppingBag } from "lucide-react"

export async function RecentlySoldProduct() {
  const supabase = createServerClient()

  // Fetch the most recently sold product with more details
  const { data: recentOrder } = await supabase
    .from("order_items")
    .select(`
      products (
        id,
        name,
        price,
        image_url
      ),
      order_id,
      orders (
        created_at,
        status
      )
    `)
    .order("id", { ascending: false })
    .limit(1)
    .single()

  if (!recentOrder?.products) {
    return null
  }

  // Format the time ago
  const timeAgo = getTimeAgo(new Date(recentOrder.orders.created_at))

  return (
    <div className="bg-amber-50 text-amber-800 px-4 py-2 text-sm font-medium text-center sticky top-0 z-50 flex items-center justify-center">
      <ShoppingBag className="h-4 w-4 mr-2" />
      <span>
        Recently Sold: <strong>{recentOrder.products.name}</strong> – ₹
        {recentOrder.products.price.toLocaleString("en-IN")} ({timeAgo})
      </span>
    </div>
  )
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
}
