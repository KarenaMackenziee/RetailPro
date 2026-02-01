"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import OrderDetailsModal from "@/components/order-details-modal"
import { Package, Eye, Truck, Calendar, ArrowUpDown, Bell } from "lucide-react"
import Image from "next/image"
import { createClientClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"

// Define a function to get status color
const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase()
  switch (statusLower) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "processing":
      return "bg-blue-100 text-blue-800"
    case "dispatched":
      return "bg-purple-100 text-purple-800"
    case "delivered":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Define a function to get status icon
const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return <span className="mr-1">⏳</span>
    case "processing":
      return <span className="mr-1">🔄</span>
    case "dispatched":
      return <span className="mr-1">🚚</span>
    case "delivered":
      return <span className="mr-1">✅</span>
    case "cancelled":
      return <span className="mr-1">❌</span>
    default:
      return <span className="mr-1">📦</span>
  }
}

interface OrderItem {
  id: number
  quantity: number
  price: number
  products: {
    id: number
    name: string
    image_url: string
  }
}

interface Order {
  id: number
  created_at: string
  status: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  shipping_method?: string
  expected_delivery_date?: number
  tracking_number?: string
  carrier?: string
  order_items: OrderItem[]
}

interface OrdersListProps {
  orders: Order[]
  userId: string
  isAdmin?: boolean
}

export default function OrdersList({ orders: initialOrders, userId, isAdmin = false }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  // Set up real-time subscription to order updates
  useEffect(() => {
    const supabase = createClientClient()

    // Subscribe to changes on the orders table for this user
    const subscription = supabase
      .channel("user-orders-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Update the order in the local state
          setOrders((currentOrders) =>
            currentOrders.map((order) => {
              if (order.id === payload.new.id) {
                // Check if status has changed
                if (order.status !== payload.new.status) {
                  // Mark as recently updated
                  setRecentlyUpdated((prev) => new Set(prev).add(order.id))

                  // Remove the highlight after 5 seconds
                  setTimeout(() => {
                    setRecentlyUpdated((prev) => {
                      const newSet = new Set(prev)
                      newSet.delete(order.id)
                      return newSet
                    })
                  }, 5000)

                  // Show toast notification for status change
                  toast({
                    title: "Order Status Updated",
                    description: `Order #${order.id} status has been updated to ${payload.new.status}`,
                    action: (
                      <Button variant="outline" size="sm">
                        <Bell className="h-4 w-4" />
                      </Button>
                    ),
                  })
                }
                return { ...order, ...payload.new }
              }
              return order
            }),
          )
        },
      )
      .subscribe()

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [userId, toast])

  // Filter orders by status
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true
    return order.status === statusFilter
  })

  // Sort orders by date
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB
  })

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsModalOpen(true)
  }

  // Get unique statuses from orders
  const statuses = Array.from(new Set(orders.map((order) => order.status)))

  // Format expected delivery date
  const formatDeliveryDate = (timestamp?: number) => {
    if (!timestamp) return "Not available"
    return format(new Date(timestamp), "PPP")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-1"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortOrder === "newest" ? "Newest First" : "Oldest First"}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {sortedOrders.length} of {orders.length} orders
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Orders Found</h3>
            <p className="text-gray-500 mb-6 text-center">
              {statusFilter === "all"
                ? "You haven't placed any orders yet."
                : `You don't have any orders with status "${statusFilter}".`}
            </p>
            <Button asChild>
              <a href="/dashboard">Browse Products</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {sortedOrders.map((order) => (
            <AccordionItem
              key={order.id}
              value={`order-${order.id}`}
              className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                recentlyUpdated.has(order.id) ? "ring-2 ring-blue-500 ring-opacity-50 shadow-lg" : ""
              }`}
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 text-left">
                  <div className="flex flex-col">
                    <div className="font-medium flex items-center gap-2">
                      Order #{order.id}
                      {recentlyUpdated.has(order.id) && <Bell className="h-4 w-4 text-blue-500 animate-pulse" />}
                    </div>
                    <div className="text-sm text-muted-foreground">{format(new Date(order.created_at), "PPP")}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded-full text-xs flex items-center ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    <div className="font-medium">₹{order.total.toLocaleString("en-IN")}</div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pt-2 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.order_items &&
                        order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 bg-muted/50 p-2 rounded-md">
                            <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-background">
                              <Image
                                src={item.products?.image_url || "/placeholder.svg?height=64&width=64"}
                                alt={item.products?.name || "Product"}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{item.products?.name || "Product"}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                              </div>
                            </div>
                            <div className="font-medium">₹{(item.quantity * item.price).toLocaleString("en-IN")}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Order Details</h4>
                    <div className="space-y-3 text-sm">
                      {order.shipping_method && (
                        <div className="flex items-start gap-2">
                          <Truck className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Shipping Method</div>
                            <div className="text-muted-foreground">
                              {order.shipping_method.charAt(0).toUpperCase() + order.shipping_method.slice(1)}
                            </div>
                          </div>
                        </div>
                      )}

                      {order.expected_delivery_date && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Expected Delivery</div>
                            <div className="text-muted-foreground">
                              {formatDeliveryDate(order.expected_delivery_date)}
                            </div>
                          </div>
                        </div>
                      )}

                      {order.tracking_number && (
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Tracking</div>
                            <div className="text-muted-foreground">
                              {order.carrier}: {order.tracking_number}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Details
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          orderId={selectedOrder.id}
        />
      )}
    </div>
  )
}
