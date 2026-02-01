import type React from "react"
import { createServerClient } from "@/lib/supabase-server"
import Header from "@/components/header"
import MiniCart from "@/components/mini-cart"
import { NotificationsProvider } from "@/components/notifications-provider"
import { redirect } from "next/navigation"

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <NotificationsProvider userId={session.user.id}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <MiniCart />
        <main className="flex-grow">{children}</main>
      </div>
    </NotificationsProvider>
  )
}
