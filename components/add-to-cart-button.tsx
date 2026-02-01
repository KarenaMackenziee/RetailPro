"use client"

import { useState } from "react"
import { createClientClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
}

interface AddToCartButtonProps {
  product: Product
  size?: "default" | "sm" | "lg"
  className?: string
}

export default function AddToCartButton({ product, size = "lg", className }: AddToCartButtonProps) {
  const [adding, setAdding] = useState(false)
  const { toast } = useToast()

  const addToCart = async () => {
    setAdding(true)

    try {
      const supabase = createClientClient()

      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("You must be logged in to add items to cart")
      }

      // First, check if the cart table exists by trying to query it
      const { error: tableCheckError } = await supabase.from("cart").select("id").limit(1)

      // If there's an error about the table not existing, show a specific message
      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        toast({
          title: "System Setup Required",
          description: "The cart system is not set up yet. Please contact the administrator.",
          variant: "destructive",
        })
        return
      }

      // Check if product already exists in cart
      const { data: existingItem, error: queryError } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("product_id", product.id)
        .maybeSingle()

      if (queryError && !queryError.message.includes("does not exist")) throw queryError

      if (existingItem) {
        // Update quantity if product already in cart
        const { error } = await supabase
          .from("cart")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Add new item to cart
        const { error } = await supabase.from("cart").insert({
          user_id: session.user.id,
          product_id: product.id,
          quantity: 1,
          price: product.price,
        })

        if (error) throw error
      }

      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error: any) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      })
    } finally {
      setAdding(false)
    }
  }

  return (
    <Button size={size} className={className} onClick={addToCart} disabled={adding}>
      {adding ? (
        "Adding..."
      ) : (
        <>
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  )
}
