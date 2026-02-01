"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClientClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart, X, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: number
  product_id: number
  quantity: number
  price: number
  products: {
    name: string
    image_url: string
  }
}

export default function MiniCart() {
  const [isOpen, setIsOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClientClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUserId(session.user.id)
        fetchCartItems(session.user.id)
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Set up real-time subscription for cart changes
  useEffect(() => {
    if (!userId) return

    const supabase = createClientClient()
    const channel = supabase
      .channel("mini-cart-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchCartItems(userId)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const fetchCartItems = async (uid: string) => {
    setLoading(true)

    try {
      const supabase = createClientClient()

      // Check if cart table exists
      const { error: tableCheckError } = await supabase.from("cart").select("id").limit(1)

      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("cart")
        .select(`
          id,
          product_id,
          quantity,
          price,
          products (
            name,
            image_url
          )
        `)
        .eq("user_id", uid)
        .order("id")

      if (error) throw error

      setCartItems(data || [])
    } catch (error) {
      console.error("Error fetching cart items:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: number) => {
    try {
      const supabase = createClientClient()

      const { error } = await supabase.from("cart").delete().eq("id", itemId)

      if (error) throw error

      setCartItems(cartItems.filter((item) => item.id !== itemId))

      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      })
    } catch (error: any) {
      console.error("Error removing item:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (!userId || loading) {
    return null
  }

  return (
    <div className="fixed top-16 right-4 z-40">
      <Button variant="outline" size="sm" className="relative bg-white shadow-md" onClick={() => setIsOpen(!isOpen)}>
        <ShoppingCart className="h-4 w-4 mr-2" />
        <span>Cart</span>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 shadow-lg">
          <CardContent className="p-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Your Cart ({totalItems})</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Your cart is empty</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 border-b pb-2">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden border bg-gray-50 flex-shrink-0">
                      <Image
                        src={item.products.image_url || "/placeholder.svg?height=48&width=48"}
                        alt={item.products.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.products.name}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="mt-3 pt-2 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>₹{calculateTotal().toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-3 pt-0">
            <Button asChild className="w-full" disabled={cartItems.length === 0}>
              <Link href="/cart" className="flex items-center justify-center">
                View Cart & Checkout
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
