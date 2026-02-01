"use client"

import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useState } from "react"

export function CreateSampleProductsButton({ isAdmin }: { isAdmin: boolean }) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  if (!isAdmin) return null

  const handleCreateSampleProducts = async () => {
    setIsLoading(true)
    try {
      // Sample product data with images
      const sampleProducts = [
        {
          name: "Premium Wireless Headphones",
          description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
          price: 12999,
          image_url:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          rating: 4.8,
        },
        {
          name: "Smart Fitness Tracker",
          description:
            "Track your fitness goals with this advanced smart tracker. Features heart rate monitoring, sleep tracking, and more.",
          price: 3499,
          image_url:
            "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          rating: 4.5,
        },
        {
          name: "Ultra HD Smart TV",
          description:
            "55-inch Ultra HD Smart TV with HDR and built-in streaming apps. Experience stunning visuals and smart features.",
          price: 49999,
          image_url:
            "https://images.unsplash.com/photo-1593784991095-a20500764cbd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          rating: 4.7,
        },
        {
          name: "Professional DSLR Camera",
          description:
            "Capture stunning photos and videos with this professional-grade DSLR camera. Includes 24-70mm lens.",
          price: 78999,
          image_url:
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          rating: 4.9,
        },
      ]

      // Insert sample products
      const { error } = await supabase.from("products").insert(sampleProducts)

      if (error) {
        console.error("Error creating sample products:", error)
        throw error
      }

      // Reload the page to show the new products
      window.location.reload()
    } catch (error) {
      console.error("Error in createSampleProducts:", error)
      alert("Failed to create sample products. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCreateSampleProducts} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
      {isLoading ? "Creating..." : "Create Sample Products"}
    </Button>
  )
}

export default CreateSampleProductsButton
