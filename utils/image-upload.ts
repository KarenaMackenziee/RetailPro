import { createClientClient } from "@/lib/supabase-client"
import { v4 as uuidv4 } from "uuid"

export async function uploadProductImage(file: File): Promise<string> {
  try {
    const supabase = createClientClient()

    // Create a unique file name to avoid collisions
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `product-images/${fileName}`

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    // Get the public URL for the uploaded file
    const { data } = supabase.storage.from("products").getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}
