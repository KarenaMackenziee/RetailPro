"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClientClient } from "@/lib/supabase-client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Trash2, ShoppingBag, Loader2, AlertTriangle, CreditCard, Truck, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

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

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<Record<number, boolean>>({})
  const [checkingOut, setCheckingOut] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deliveryOption, setDeliveryOption] = useState("standard")
  const { toast } = useToast()
  const router = useRouter()

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
      .channel("cart-changes")
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
    setError(null)

    try {
      const supabase = createClientClient()

      // First, check if the cart table exists
      const { error: tableCheckError } = await supabase.from("cart").select("id").limit(1)

      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        setError("The cart system is not set up yet. Please contact the administrator.")
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
    } catch (error: any) {
      console.error("Error fetching cart items:", error)
      setError(error.message || "Failed to load cart items")
      toast({
        title: "Error",
        description: error.message || "Failed to load cart items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdating((prev) => ({ ...prev, [itemId]: true }))

    try {
      const supabase = createClientClient()

      const { error } = await supabase.from("cart").update({ quantity: newQuantity }).eq("id", itemId)

      if (error) throw error

      setCartItems(cartItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))

      toast({
        title: "Cart Updated",
        description: "Item quantity has been updated.",
      })
    } catch (error: any) {
      console.error("Error updating cart:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update item quantity",
        variant: "destructive",
      })
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const removeItem = async (itemId: number) => {
    setUpdating((prev) => ({ ...prev, [itemId]: true }))

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
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const checkout = async () => {
    if (cartItems.length === 0 || !userId) return

    setCheckingOut(true)

    try {
      const supabase = createClientClient()

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const tax = subtotal * 0.18 // 18% GST
      const shipping = calculateShipping(subtotal, deliveryOption)
      const total = subtotal + tax + shipping

      // Create order with basic fields
      const orderData: any = {
        user_id: userId,
        subtotal,
        tax,
        shipping,
        total,
        status: "pending",
      }

      // Create order - don't include shipping_method or expected_delivery_date to avoid errors
      const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

      if (orderError) throw orderError

      // Now that we have created the order, try to update it with additional fields
      try {
        // Prepare update data
        const updateData: any = {}

        // Try to add shipping_method
        updateData.shipping_method = deliveryOption

        // Get the expected delivery date as a Unix timestamp (milliseconds since epoch)
        const deliveryDateTimestamp = getExpectedDeliveryDateAsTimestamp(deliveryOption)
        updateData.expected_delivery_date = deliveryDateTimestamp

        // Update the order with additional fields
        await supabase.from("orders").update(updateData).eq("id", order.id)
      } catch (updateError) {
        // Log the error but continue with the checkout process
        console.warn("Could not update order with additional fields:", updateError)
      }

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      const { error: clearCartError } = await supabase
        .from("cart")
        .delete()
        .in(
          "id",
          cartItems.map((item) => item.id),
        )

      if (clearCartError) throw clearCartError

      toast({
        title: "Order Placed",
        description: `Your order #${order.id} has been placed successfully.`,
      })

      // Redirect to orders page
      router.push("/orders")
    } catch (error: any) {
      console.error("Error during checkout:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      })
    } finally {
      setCheckingOut(false)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.18 // 18% GST
  }

  const calculateShipping = (subtotal: number, option: string) => {
    if (subtotal > 5000) return 0 // Free shipping for orders over ₹5000

    // Different shipping rates based on delivery option
    switch (option) {
      case "express":
        return 200
      case "standard":
        return 100
      case "economy":
        return 50
      default:
        return 100
    }
  }

  // Return the expected delivery date as a Unix timestamp (milliseconds since epoch)
  const getExpectedDeliveryDateAsTimestamp = (option: string) => {
    const today = new Date()
    let daysToAdd = 0

    switch (option) {
      case "express":
        daysToAdd = 2
        break
      case "standard":
        daysToAdd = 5
        break
      case "economy":
        daysToAdd = 8
        break
      default:
        daysToAdd = 5
    }

    const deliveryDate = new Date(today)
    deliveryDate.setDate(today.getDate() + daysToAdd)

    // Return as Unix timestamp (milliseconds since epoch)
    return Math.floor(deliveryDate.getTime())
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal + calculateTax() + calculateShipping(subtotal, deliveryOption)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <CardTitle className="text-xl mb-2">System Error</CardTitle>
          <p className="text-gray-500 mb-6 text-center">{error}</p>
          <Button asChild>
            <a href="/dashboard">Return to Dashboard</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!userId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
          <CardTitle className="text-xl mb-2">Please Log In</CardTitle>
          <p className="text-gray-500 mb-6">You need to be logged in to view your cart.</p>
          <Button asChild>
            <a href="/login">Log In</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
          <CardTitle className="text-xl mb-2">Your Cart is Empty</CardTitle>
          <p className="text-gray-500 mb-6">Add items to your cart to see them here.</p>
          <Button asChild>
            <a href="/dashboard">Browse Products</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Shopping Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-gray-50">
                          <Image
                            src={item.products.image_url || "/placeholder.svg?height=64&width=64"}
                            alt={item.products.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="font-medium">{item.products.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">₹{item.price.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updating[item.id]}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                          className="h-8 w-16 mx-2 text-center"
                          disabled={updating[item.id]}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating[item.id]}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
                        disabled={updating[item.id]}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{calculateSubtotal().toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18% GST)</span>
                <span>₹{calculateTax().toLocaleString("en-IN")}</span>
              </div>

              <div className="pt-2 border-t">
                <h3 className="font-medium mb-2">Delivery Options</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="express"
                      name="delivery"
                      value="express"
                      checked={deliveryOption === "express"}
                      onChange={() => setDeliveryOption("express")}
                      className="mr-2"
                    />
                    <label htmlFor="express" className="flex-1">
                      <div className="font-medium">Express Delivery (2 days)</div>
                      <div className="text-sm text-gray-500">{calculateSubtotal() > 5000 ? "Free" : "₹200"}</div>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="standard"
                      name="delivery"
                      value="standard"
                      checked={deliveryOption === "standard"}
                      onChange={() => setDeliveryOption("standard")}
                      className="mr-2"
                    />
                    <label htmlFor="standard" className="flex-1">
                      <div className="font-medium">Standard Delivery (5 days)</div>
                      <div className="text-sm text-gray-500">{calculateSubtotal() > 5000 ? "Free" : "₹100"}</div>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="economy"
                      name="delivery"
                      value="economy"
                      checked={deliveryOption === "economy"}
                      onChange={() => setDeliveryOption("economy")}
                      className="mr-2"
                    />
                    <label htmlFor="economy" className="flex-1">
                      <div className="font-medium">Economy Delivery (8 days)</div>
                      <div className="text-sm text-gray-500">{calculateSubtotal() > 5000 ? "Free" : "₹50"}</div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t font-bold text-lg">
                <span>Total</span>
                <span>₹{calculateTotal().toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 mr-2 text-green-600" />
                <span>Secure checkout with end-to-end encryption</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Truck className="h-4 w-4 mr-2 text-green-600" />
                <span>Free shipping on orders over ₹5,000</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={checkout} disabled={checkingOut}>
              {checkingOut ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Checkout Now
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
