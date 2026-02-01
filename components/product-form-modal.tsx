"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createClientClient } from "@/lib/supabase-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { uploadProductImage, listProductImages } from "@/utils/supabase-storage"
import { ImageIcon, Upload, X, Eye, Loader2 } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  description: string
  image_url: string
  rating: number
  created_at: string
}

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: Product) => void
  title: string
  product?: Product
}

export default function ProductFormModal({ isOpen, onClose, onSubmit, title, product }: ProductFormModalProps) {
  const [name, setName] = useState(product?.name || "")
  const [price, setPrice] = useState(product?.price.toString() || "")
  const [description, setDescription] = useState(product?.description || "")
  const [imageUrl, setImageUrl] = useState(product?.image_url || "")
  const [rating, setRating] = useState(product?.rating.toString() || "0")
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(product?.image_url || null)
  const [existingImages, setExistingImages] = useState<
    Array<{ name: string; url: string; size: number; created: string }>
  >([])
  const [showExistingImages, setShowExistingImages] = useState(false)
  const [loadingGallery, setLoadingGallery] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName(product?.name || "")
      setPrice(product?.price.toString() || "")
      setDescription(product?.description || "")
      setImageUrl(product?.image_url || "")
      setRating(product?.rating.toString() || "0")
      setPreviewImage(product?.image_url || null)
      fetchExistingImages()
    } else {
      // Reset form when modal closes
      setName("")
      setPrice("")
      setDescription("")
      setImageUrl("")
      setRating("0")
      setPreviewImage(null)
      setShowExistingImages(false)
    }
  }, [isOpen, product])

  const fetchExistingImages = async () => {
    try {
      setLoadingGallery(true)
      const images = await listProductImages()
      setExistingImages(images)
    } catch (error) {
      console.error("Error fetching existing images:", error)
      toast({
        title: "Gallery Error",
        description: "Could not load existing images. You can still upload new ones.",
        variant: "destructive",
      })
    } finally {
      setLoadingGallery(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, GIF, WebP)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingImage(true)

      // Create a preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file)
      setPreviewImage(previewUrl)

      // Upload the image to Supabase Storage
      const url = await uploadProductImage(file)
      setImageUrl(url)

      // Clean up the preview URL
      URL.revokeObjectURL(previewUrl)
      setPreviewImage(url)

      toast({
        title: "Image uploaded successfully",
        description: "Your product image has been uploaded and is ready to use.",
      })

      // Refresh the gallery
      fetchExistingImages()
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      // Reset preview if upload fails
      setPreviewImage(product?.image_url || null)
      setImageUrl(product?.image_url || "")
    } finally {
      setUploadingImage(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const selectExistingImage = (url: string) => {
    setImageUrl(url)
    setPreviewImage(url)
    setShowExistingImages(false)
    toast({
      title: "Image selected",
      description: "Selected image from gallery",
    })
  }

  const clearImage = () => {
    setPreviewImage(null)
    setImageUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !price) {
      toast({
        title: "Validation Error",
        description: "Product name and price are required",
        variant: "destructive",
      })
      return
    }

    const priceValue = Number.parseFloat(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      })
      return
    }

    const ratingValue = Number.parseFloat(rating)
    if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
      toast({
        title: "Invalid Rating",
        description: "Rating must be between 0 and 5",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClientClient()

      const productData = {
        name: name.trim(),
        price: priceValue,
        description: description.trim(),
        image_url: imageUrl || "/placeholder.svg?height=300&width=300&text=No+Image",
        rating: ratingValue,
      }

      if (product) {
        // Update existing product
        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id)
          .select()
          .single()

        if (error) throw error

        toast({
          title: "Product updated",
          description: `${productData.name} has been updated successfully`,
        })

        onSubmit(data)
      } else {
        // Add new product
        const { data, error } = await supabase.from("products").insert(productData).select().single()

        if (error) throw error

        toast({
          title: "Product added",
          description: `${productData.name} has been added successfully`,
        })

        onSubmit(data)
      }

      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Price (₹) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating" className="text-sm font-medium">
                  Rating (0-5)
                </Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Product Image</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExistingImages(!showExistingImages)}
                    disabled={loadingGallery}
                  >
                    {loadingGallery ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {showExistingImages ? "Hide Gallery" : "Browse Gallery"}
                  </Button>
                </div>

                {/* Existing Images Gallery */}
                {showExistingImages && (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="text-sm text-gray-600 mb-2">
                      Select from existing images ({existingImages.length} available)
                    </div>
                    {existingImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {existingImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative cursor-pointer border rounded-md overflow-hidden h-20 hover:border-blue-500 transition-colors"
                            onClick={() => selectExistingImage(image.url)}
                          >
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80&text=Error"
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                              <Eye className="h-4 w-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No images in gallery yet. Upload your first image below.
                      </div>
                    )}
                  </div>
                )}

                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Product preview"
                        className="mx-auto h-48 w-full object-contain rounded-md bg-gray-50"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=192&width=192&text=Error"
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                        onClick={clearImage}
                        disabled={uploadingImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload product image</p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF, WebP up to 5MB</p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />

                  <div className="mt-4 space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={triggerFileInput}
                      disabled={uploadingImage}
                      className="w-full"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {previewImage ? "Change Image" : "Upload Image"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading || uploadingImage}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingImage}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
