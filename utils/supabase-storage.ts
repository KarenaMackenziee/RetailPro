import { createClientClient } from "@/lib/supabase-client"
import { v4 as uuidv4 } from "uuid"

// Function to check if a bucket exists and create it if it doesn't
export async function ensureStorageBucket(bucketName: string, isPublic = true) {
  try {
    const supabase = createClientClient()

    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error checking buckets:", listError)
      throw listError
    }

    // Check if our bucket exists
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        throw createError
      }

      console.log(`Bucket ${bucketName} created successfully`)
    } else {
      console.log(`Bucket ${bucketName} already exists`)
    }

    return true
  } catch (error) {
    console.error("Error in ensureStorageBucket:", error)
    throw error
  }
}

// Function to upload an image to Supabase Storage
export async function uploadProductImage(file: File): Promise<string> {
  try {
    const supabase = createClientClient()

    // Ensure the product-images bucket exists
    await ensureStorageBucket("product-images", true)

    // Create a unique file name to avoid collisions
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `products/${fileName}`

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      throw uploadError
    }

    // Get the public URL for the uploaded file
    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

// Function to get a list of all images in the product-images bucket
export async function listProductImages() {
  try {
    const supabase = createClientClient()

    // Ensure the product-images bucket exists
    await ensureStorageBucket("product-images", true)

    // List all files in the products folder
    const { data, error } = await supabase.storage.from("product-images").list("products", {
      limit: 100,
      offset: 0,
    })

    if (error) {
      throw error
    }

    // Get public URLs for all files
    return data.map((file) => {
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(`products/${file.name}`)

      return {
        name: file.name,
        url: urlData.publicUrl,
        size: file.metadata?.size || 0,
        created: file.created_at,
      }
    })
  } catch (error) {
    console.error("Error listing product images:", error)
    return []
  }
}

// Function to delete an image from Supabase Storage
export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  try {
    const supabase = createClientClient()

    // Extract the file path from the URL
    const urlParts = imageUrl.split("/")
    const fileName = urlParts[urlParts.length - 1]
    const filePath = `products/${fileName}`

    // Delete the file from Supabase Storage
    const { error } = await supabase.storage.from("product-images").remove([filePath])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error deleting image:", error)
    return false
  }
}
