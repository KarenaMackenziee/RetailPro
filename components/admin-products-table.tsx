"use client"

import { useState } from "react"
import Image from "next/image"
import { createClientClient } from "@/lib/supabase-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Search, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ProductFormModal from "@/components/product-form-modal"
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog"

interface Product {
  id: number
  name: string
  price: number
  description: string
  image_url: string
  rating: number
  created_at: string
}

interface AdminProductsTableProps {
  initialProducts: Product[]
}

export default function AdminProductsTable({ initialProducts }: AdminProductsTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleAddProduct = (newProduct: Product) => {
    setProducts([newProduct, ...products])
    setIsAddModalOpen(false)
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added successfully.`,
    })
  }

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)))
    setIsEditModalOpen(false)
    setSelectedProduct(null)
    toast({
      title: "Product Updated",
      description: `${updatedProduct.name} has been updated successfully.`,
    })
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    try {
      const supabase = createClientClient()

      const { error } = await supabase.from("products").delete().eq("id", selectedProduct.id)

      if (error) throw error

      setProducts(products.filter((product) => product.id !== selectedProduct.id))
      setIsDeleteDialogOpen(false)
      setSelectedProduct(null)

      toast({
        title: "Product Deleted",
        description: `${selectedProduct.name} has been deleted successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Products</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search products..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-gray-50">
                          <Image
                            src={product.image_url || "/placeholder.svg?height=64&width=64"}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>₹{product.price.toLocaleString("en-IN")}</TableCell>
                      <TableCell>{product.rating} / 5</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(product)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(product)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProduct}
        title="Add New Product"
      />

      {selectedProduct && (
        <>
          <ProductFormModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedProduct(null)
            }}
            onSubmit={handleEditProduct}
            title="Edit Product"
            product={selectedProduct}
          />

          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDeleteProduct}
            title="Delete Product"
            description={`Are you sure you want to delete "${selectedProduct.name}"? This action cannot be undone.`}
          />
        </>
      )}
    </>
  )
}
