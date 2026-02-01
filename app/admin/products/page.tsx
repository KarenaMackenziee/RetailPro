import { createServerClient } from "@/lib/supabase-server"
import AdminProductsTable from "@/components/admin-products-table"

export default async function AdminProductsPage() {
  const supabase = createServerClient()

  // Fetch all products
  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Products</h1>
      <AdminProductsTable initialProducts={products || []} />
    </div>
  )
}
