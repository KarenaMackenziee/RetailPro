import { createServerClient } from "@/lib/supabase-server"
import AdminCustomersTable from "@/components/admin-customers-table"

export default async function AdminCustomersPage() {
  const supabase = createServerClient()

  // Fetch all customers (profiles that are not admins)
  const { data: customers } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_admin", false)
    .order("created_at", { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Customers</h1>
      <AdminCustomersTable initialCustomers={customers || []} />
    </div>
  )
}
