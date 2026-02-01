"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { createClientClient } from "@/lib/supabase-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Clock, Package, Truck, CheckCircle, AlertCircle } from "lucide-react"
import { getStatusColor } from "@/utils/order-status"

interface OrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: number
}

interface OrderItem {
  id: number
  product_id: number
  quantity: number
  price: number
  product: {
    name: string
    image_url: string
  }
}

interface OrderDetails {
  id: number
  user_id: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: string
  created_at: string
  shipping_method: string | null
  expected_delivery_date: number | null // Changed to number for timestamp
  shipped_at: string | null
  delivered_at: string | null
  tracking_number: string | null
  shipping_carrier: string | null
  profiles: {
    first_name: string
    last_name: string
    email: string
    phone_number: string
  } | null
}

export default function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails()
    }
  }, [isOpen, orderId])

  const fetchOrderDetails = async () => {
    setLoading(true)

    try {
      const supabase = createClientClient()

      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          id,
          user_id,
          subtotal,
          tax,
          shipping,
          total,
          status,
          created_at,
          shipped_at,
          delivered_at,
          expected_delivery_date,
          tracking_number,
          shipping_carrier,
          shipping_method,
          profiles (
            first_name,
            last_name,
            email,
            phone_number
          )
        `)
        .eq("id", orderId)
        .single()

      if (orderError) throw orderError

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
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
        .eq("order_id", orderId)

      if (itemsError) throw itemsError

      setOrderDetails(orderData)
      setOrderItems(itemsData || [])
    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />
      case "processing":
        return <Package className="h-4 w-4 mr-1" />
      case "shipped":
        return <Truck className="h-4 w-4 mr-1" />
      case "delivered":
        return <CheckCircle className="h-4 w-4 mr-1" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4 mr-1" />
      default:
        return <Clock className="h-4 w-4 mr-1" />
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Order has been received and is awaiting processing."
      case "processing":
        return "Order is being prepared for shipping."
      case "shipped":
        return "Order has been shipped and is on its way to the customer."
      case "delivered":
        return "Order has been delivered successfully."
      case "cancelled":
        return "This order has been cancelled."
      default:
        return ""
    }
  }

  const getStatusTimeline = (status: string) => {
    const statuses = ["pending", "processing", "shipped", "delivered"]
    const currentIndex = statuses.indexOf(status.toLowerCase())

    if (currentIndex === -1 || status.toLowerCase() === "cancelled") {
      return null
    }

    return (
      <div className="flex items-center mt-4 mb-2">
        {statuses.map((s, index) => (
          <div key={s} className="flex flex-1 items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                index <= currentIndex ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-400"
              }`}
            >
              {index + 1}
            </div>
            {index < statuses.length - 1 && (
              <div className={`h-1 flex-1 ${index < currentIndex ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  // Format the expected delivery date from timestamp to readable date
  const formatExpectedDeliveryDate = (timestamp: number | null) => {
    if (!timestamp) return "Not available"

    try {
      // Convert timestamp to Date object
      const date = new Date(timestamp)
      return format(date, "PPP")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : orderDetails ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-medium">Order #{orderDetails.id}</h3>
                <p className="text-sm text-gray-500">Placed on {format(new Date(orderDetails.created_at), "PPP")}</p>
              </div>
              <Badge className={`flex items-center ${getStatusColor(orderDetails.status)}`}>
                {getStatusIcon(orderDetails.status)}
                {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
              </Badge>
            </div>

            {getStatusTimeline(orderDetails.status)}

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-700">{getStatusDescription(orderDetails.status)}</p>

              {orderDetails.expected_delivery_date && (
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-medium">Expected Delivery:</span>{" "}
                  {formatExpectedDeliveryDate(orderDetails.expected_delivery_date)}
                </p>
              )}

              {orderDetails.tracking_number && (
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Tracking Number:</span> {orderDetails.tracking_number}
                  {orderDetails.shipping_carrier && ` (${orderDetails.shipping_carrier})`}
                </p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Customer Information</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                {orderDetails.profiles ? (
                  <>
                    <p>
                      <span className="font-medium">Name:</span> {orderDetails.profiles.first_name}{" "}
                      {orderDetails.profiles.last_name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {orderDetails.profiles.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span> {orderDetails.profiles.phone_number || "Not provided"}
                    </p>
                  </>
                ) : (
                  <p>Customer information not available</p>
                )}
              </div>
            </div>

            <div>
              {orderDetails.shipping_method && (
                <p className="text-sm mb-2">
                  <span className="font-medium">Shipping Method:</span>{" "}
                  {orderDetails.shipping_method.charAt(0).toUpperCase() + orderDetails.shipping_method.slice(1)}
                </p>
              )}
              <h4 className="text-sm font-medium mb-2">Order Items</h4>
              {orderItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell className="text-right">₹{item.price.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500">No items found for this order</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Order Summary</h4>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Subtotal</TableCell>
                    <TableCell className="text-right">₹{orderDetails.subtotal.toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tax (18% GST)</TableCell>
                    <TableCell className="text-right">₹{orderDetails.tax.toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Shipping</TableCell>
                    <TableCell className="text-right">
                      {orderDetails.shipping === 0 ? "Free" : `₹${orderDetails.shipping.toLocaleString("en-IN")}`}
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">₹{orderDetails.total.toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Order not found</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
