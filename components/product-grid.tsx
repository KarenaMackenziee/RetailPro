"use client"

import React, { useState } from "react"
import Link from "next/link"
import { createClientClient } from "@/lib/supabase-client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Star, ShoppingCart, ThumbsUp } from "lucide-react"
import { useRouter } from "next/navigation"

interface Product {
  id: number
  name: string
  price: number
  description: string
  image_url: string | null
  rating: number
}

interface ProductGridProps {
  products: Product[]
}

// Simple static placeholder images (make sure these files exist in your public folder)
const PLACEHOLDER_IMAGES = {
  default: "/placeholder.svg",
  electronics: "/placeholder-electronics.svg",
  headphones: "/placeholder-headphones.svg",
  camera: "/placeholder-camera.svg",
  phone: "/placeholder-phone.svg",
  watch: "/placeholder-watch.svg",
  laptop: "/placeholder-laptop.svg",
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [addingToCart, setAddingToCart] = useState<Record<number, boolean>>({})
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const { toast } = useToast()
  const router = useRouter()

  const addToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()

    setAddingToCart((prev) => ({ ...prev, [product.id]: true }))

    try {
      const supabase = createClientClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) throw new Error("You must be logged in to add items to cart")

      const { error: tableCheckError } = await supabase.from("cart").select("id").limit(1)
      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        toast({
          title: "System Setup Required",
          description: "The cart system is not set up yet. Please contact the administrator.",
          variant: "destructive",
        })
        return
      }

      const { data: existingItem, error: queryError } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("product_id", product.id)
        .maybeSingle()

      if (queryError && !queryError.message.includes("does not exist")) throw queryError

      if (existingItem) {
        const { error } = await supabase
          .from("cart")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)
        if (error) throw error
      } else {
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

      router.push("/cart")
    } catch (error: any) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      })
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }))
    }
  }

  const handleImageError = (productId: number) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }))
  }

  const renderRatingStars = (rating: number) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  )

  const getReviewCount = (productId: number) => ((productId * 17) % 50) + 5

  const getPlaceholderImage = (productName: string) => {
    const name = productName.toLowerCase()

    if (name.includes("headphone") || name.includes("speaker") || name.includes("audio")) {
      return PLACEHOLDER_IMAGES.headphones
    }
    if (name.includes("camera") || name.includes("lens")) {
      return PLACEHOLDER_IMAGES.camera
    }
    if (name.includes("phone") || name.includes("mobile") || name.includes("smartphone")) {
      return PLACEHOLDER_IMAGES.phone
    }
    if (name.includes("watch") || name.includes("tracker") || name.includes("fitness")) {
      return PLACEHOLDER_IMAGES.watch
    }
    if (name.includes("laptop") || name.includes("computer") || name.includes("notebook")) {
      return PLACEHOLDER_IMAGES.laptop
    }
    if (name.includes("electronics") || name.includes("device") || name.includes("gadget")) {
      return PLACEHOLDER_IMAGES.electronics
    }

    return PLACEHOLDER_IMAGES.default
  }

  const getImageUrl = (product: Product) => {
    if (imageErrors[product.id] || !product.image_url) {
      return getPlaceholderImage(product.name)
    }
    return product.image_url
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-xl font-medium">No products available</h3>
        <p className="text-gray-500">Please check back later or contact the administrator.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const imageUrl = getImageUrl(product)

        // DEBUG: Log image URL for troubleshooting
        console.log(`Product ID ${product.id} image URL:`, imageUrl)

        return (
          <Card key={product.id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <Link href={`/products/${product.id}`} className="group">
              <div className="relative h-60 bg-gray-100 overflow-hidden">
                <img
                  src={imageUrl || PLACEHOLDER_IMAGES.default}
                  alt={product.name || "Product image"}
                  className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={() => handleImageError(product.id)}
                />
              </div>
            </Link>
            <CardContent className="flex-grow p-4">
              <Link href={`/products/${product.id}`} className="hover:underline">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              </Link>
              <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-lg">₹{product.price.toLocaleString("en-IN")}</p>
                {renderRatingStars(product.rating)}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <ThumbsUp className="h-3 w-3 mr-1" />
                <span>{getReviewCount(product.id)} customer reviews</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" onClick={(e) => addToCart(e, product)} disabled={addingToCart[product.id]}>
                {addingToCart[product.id] ? (
                  "Adding..."
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
