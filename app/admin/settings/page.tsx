import { createServerClient } from "@/lib/supabase-server"
import AdminSettingsForm from "@/components/admin-settings-form"

export default async function AdminSettingsPage() {
  const supabase = createServerClient()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get admin profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session?.user.id).single()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Settings</h1>
      <AdminSettingsForm profile={profile} />
    </div>
  )
}
