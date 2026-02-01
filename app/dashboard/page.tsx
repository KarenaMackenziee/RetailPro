import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import ProductGrid from "@/components/product-grid"
import { WelcomeBanner } from "@/components/welcome-banner"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import CreateSampleProductsButton from "@/components/create-sample-products-button"

export default async function DashboardPage() {
  const supabase = createServerClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/dashboard")
  }

  try {
    // Fetch products with images - with error handling
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, description, price, image_url, rating")
      .order("id")

    // If there's an error, log it but continue with empty products array
    if (error) {
      console.error("Error fetching products:", error.message)
    }

    // Debug: Log the products to see what we're getting
    console.log("Products from database:", products)

    // Use a fallback array of products if none are found
    const displayProducts = products || []

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product Dashboard</h1>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/cart" className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>View Cart</span>
            </Link>
          </Button>
        </div>

        {/* @ts-expect-error Server Component */}
        <WelcomeBanner />

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">Our Products</h2>

          {displayProducts.length > 0 ? (
            <ProductGrid products={displayProducts} />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No products available</h3>
              <p className="text-gray-500 mb-6">We're currently updating our inventory. Please check back soon.</p>

              {/* Create a separate client component for this button */}
              <CreateSampleProductsButton isAdmin={session.user.email === "admin@example.com"} />
            </div>
          )}
        </div>
      </div>
    )
  } catch (err) {
    console.error("Unexpected error in dashboard:", err)

    // Fallback UI in case of errors
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <h3 className="text-xl font-medium mb-2 text-red-700">Something went wrong</h3>
          <p className="text-gray-700 mb-4">We encountered an error while loading the products.</p>
          <Button asChild>
            <Link href="/dashboard">Retry</Link>
          </Button>
        </div>
      </div>
    )
  }
}
