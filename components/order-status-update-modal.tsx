"use client"

import React from "react"

import { useState } from "react"
import { createClientClient } from "@/lib/supabase-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Clock, Package, Truck, CheckCircle, AlertCircle } from "lucide-react"
import { addDays } from "date-fns"

interface OrderStatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (orderId: number, newStatus: string) => void
  orderId: number
  currentStatus: string
}

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", icon: Clock, description: "Order received, awaiting processing" },
  { value: "processing", label: "Processing", icon: Package, description: "Order is being prepared for shipping" },
  { value: "shipped", label: "Shipped", icon: Truck, description: "Order has been shipped and is in transit" },
  { value: "delivered", label: "Delivered", icon: CheckCircle, description: "Order has been delivered successfully" },
  { value: "cancelled", label: "Cancelled", icon: AlertCircle, description: "Order has been cancelled" },
]

const SHIPPING_CARRIERS = ["FedEx", "DHL", "UPS", "USPS", "BlueDart"]

export default function OrderStatusUpdateModal({
  isOpen,
  onClose,
  onStatusUpdate,
  orderId,
  currentStatus,
}: OrderStatusUpdateModalProps) {
  const [status, setStatus] = useState(currentStatus)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shippingCarrier, setShippingCarrier] = useState(SHIPPING_CARRIERS[0])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus)
      setTrackingNumber("")
      setShippingCarrier(SHIPPING_CARRIERS[0])
    }
  }, [isOpen, currentStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClientClient()
      const now = new Date().toISOString()

      // Prepare update data based on status
      const updateData: Record<string, any> = { status }

      if (status === "shipped" && currentStatus !== "shipped") {
        // If changing to shipped, add shipping details
        updateData.shipped_at = now
        updateData.tracking_number = trackingNumber
        updateData.shipping_carrier = shippingCarrier

        // Set expected delivery date as a timestamp (milliseconds since epoch)
        const deliveryDate = addDays(new Date(), 5)
        updateData.expected_delivery_date = Math.floor(deliveryDate.getTime())
      } else if (status === "delivered" && currentStatus !== "delivered") {
        // If changing to delivered, add delivery date
        updateData.delivered_at = now
      }

      // Update order status in the database
      const { error } = await supabase.from("orders").update(updateData).eq("id", orderId)

      if (error) throw error

      // Call the callback to update the UI
      onStatusUpdate(orderId, status)

      toast({
        title: "Status Updated",
        description: `Order #${orderId} status has been updated to ${status}.`,
      })

      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Order #{orderId}</Label>
            <RadioGroup value={status} onValueChange={setStatus} className="flex flex-col space-y-3">
              {ORDER_STATUSES.map((orderStatus) => {
                const Icon = orderStatus.icon
                return (
                  <div
                    key={orderStatus.value}
                    className={`flex items-center space-x-2 rounded-md border p-3 ${
                      status === orderStatus.value ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <RadioGroupItem value={orderStatus.value} id={orderStatus.value} />
                    <Label htmlFor={orderStatus.value} className="flex-1 cursor-pointer">
                      <div className="flex items-center">
                        <Icon
                          className={`h-4 w-4 mr-2 ${status === orderStatus.value ? "text-blue-500" : "text-gray-500"}`}
                        />
                        <span className="font-medium">{orderStatus.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{orderStatus.description}</p>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Show shipping details form when status is "shipped" */}
          {status === "shipped" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Shipping Details</h3>

              <div className="space-y-2">
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carrier">Shipping Carrier</Label>
                <select
                  id="carrier"
                  value={shippingCarrier}
                  onChange={(e) => setShippingCarrier(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {SHIPPING_CARRIERS.map((carrier) => (
                    <option key={carrier} value={carrier}>
                      {carrier}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || status === currentStatus}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
