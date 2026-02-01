"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, Home, LogOut, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/components/notifications-provider"

export default function Header() {
  const pathname = usePathname()
  const { toast } = useToast()
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [cartTableExists, setCartTableExists] = useState(true)
  const { hasUnreadNotifications, markAllAsRead } = useNotifications()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClientClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUserId(session.user.id)
        checkCartTable()
      }
    }

    checkAuth()
  }, [pathname])

  const checkCartTable = async () => {
    try {
      const supabase = createClientClient()
      const { error } = await supabase.from("cart").select("id").limit(1)

      if (error && error.message.includes("does not exist")) {
        setCartTableExists(false)
        return
      }

      setCartTableExists(true)
      if (userId) {
        fetchCartCount(userId)
      }
    } catch (error) {
      console.error("Error checking cart table:", error)
      setCartTableExists(false)
    }
  }

  const fetchCartCount = async (uid: string) => {
    if (!cartTableExists) return

    try {
      const supabase = createClientClient()

      const { count, error } = await supabase.from("cart").select("*", { count: "exact" }).eq("user_id", uid)

      if (error) throw error

      setCartCount(count || 0)
    } catch (error) {
      console.error("Error fetching cart count:", error)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClientClient()
      await supabase.auth.signOut()
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive",
      })
    }
  }

  const handleNotificationsClick = () => {
    markAllAsRead()
    router.push("/orders")
  }

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              RetailPro
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/dashboard"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Home className="h-4 w-4 mr-2" />
              <span>Home</span>
            </Link>

            <Link
              href="/orders"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/orders"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Package className="h-4 w-4 mr-2" />
              <span>Orders</span>
            </Link>

            <Link
              href="/cart"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/cart"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span>Cart</span>
              {cartTableExists && cartCount > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={handleNotificationsClick}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {hasUnreadNotifications && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
