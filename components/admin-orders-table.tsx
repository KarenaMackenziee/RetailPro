"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClientClient } from "@/lib/supabase-client"

interface Product {
  name: string
  image_url: string
}

interface OrderItem {
  quantity: number
  product_id: number
  products: Product
}

interface Order {
  id: number
  user_id: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: string
  created_at: string
  profiles: {
    first_name: string
    last_name: string
    email: string
    phone_number: string
  } | null
  products: {
    product_id: number
    quantity: number
    products: {
      name: string
      image_url: string
    }
  }[]
}

interface AdminOrdersTableProps {
  initialOrders: Order[]
}

export default function AdminOrdersTable({ initialOrders }: AdminOrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const supabase = createClientClient()

    const subscription = supabase
      .channel("admin-orders-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setOrders((currentOrders) =>
              currentOrders.map((order) => (order.id === payload.new.id ? { ...order, ...payload.new } : order))
            )
          } else if (payload.eventType === "INSERT") {
            setOrders((currentOrders) => [payload.new as Order, ...currentOrders])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const filteredOrders = orders.filter((order) => {
    const customerName = order.profiles ? `${order.profiles.first_name} ${order.profiles.last_name}` : "Unknown"
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.user_id.includes(searchTerm) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.profiles?.email && order.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setLoading(true)
    try {
      const supabase = createClientClient()
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      toast({
        title: "Order Status Updated Successfully",
        description: `Order #${orderId} has been marked as ${newStatus}. Customer will see this update in real-time.`,
      })
    } catch (error: any) {
      toast({
        title: "Error Updating Order",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "dispatched":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const refreshOrders = async () => {
    setLoading(true)
    try {
      const supabase = createClientClient()
      const { data: refreshedOrders, error } = await supabase
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
    profiles (
      first_name,
      last_name,
      email,
      phone_number
    ),
    order_items (
      product_id,
      quantity,
      products (
        name,
        image_url
      )
    )
  `)
  .order("created_at", { ascending: false })


      if (error) throw error

      setOrders(refreshedOrders || [])
      toast({
        title: "Orders Refreshed",
        description: "Order list has been updated with the latest data.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to refresh orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getUniqueStatuses = () => {
    const statuses = Array.from(new Set(orders.map((order) => order.status)))
    return statuses
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-white border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-gray-800">Customer Orders Management</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              View and update order statuses. Changes are reflected in real-time for customers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {getUniqueStatuses().map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search orders..."
                className="pl-8 w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={refreshOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b">
                <TableHead className="font-semibold text-gray-700">Order ID</TableHead>
                <TableHead className="font-semibold text-gray-700">User ID</TableHead>
                <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                <TableHead className="font-semibold text-gray-700">Products</TableHead>
                <TableHead className="font-semibold text-gray-700">Products</TableHead>

                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Date</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-2">📦</div>
                      <div className="text-lg font-medium mb-1">
                        {searchTerm || statusFilter !== "all" ? "No orders found" : "No orders yet"}
                      </div>
                      <div className="text-sm">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "Orders will appear here once customers start placing orders"}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50 border-b">
                    <TableCell className="font-medium text-blue-600">#{order.id}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-600">{order.user_id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.profiles
                            ? `${order.profiles.first_name} ${order.profiles.last_name}`
                            : "Unknown Customer"}
                        </div>
                        <div className="text-sm text-gray-500">{order.profiles?.email || "No email"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.order_items?.map((item) => (
                        <div key={item.product_id} className="flex items-center gap-2 mb-1">
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="text-sm text-gray-700">{item.products.name}</span>
                          <span className="text-xs text-gray-500 ml-1">x{item.quantity}</span>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                      {order.products?.map((item, index) => (
                      <img
                      key={index}
                      src={item.products?.image_url}
                      alt={item.products?.name}
                      title={item.products?.name}
                      className="w-8 h-8 rounded border object-cover" />
                       ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {format(new Date(order.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="dispatched">Dispatched</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-600 text-center">
            Showing {filteredOrders.length} of {orders.length} orders
            {(searchTerm || statusFilter !== "all") && (
              <span className="ml-2">
                • Filtered by: {searchTerm && `"${searchTerm}"`} {statusFilter !== "all" && `Status: ${statusFilter}`}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
