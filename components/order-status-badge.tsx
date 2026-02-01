import { Badge } from "@/components/ui/badge"
import { Clock, Package, Truck, CheckCircle, AlertCircle, RefreshCcw, Box } from "lucide-react"

interface OrderStatusBadgeProps {
  status: string
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusLower = status.toLowerCase()

  // Define status configurations
  const statusConfig = {
    pending: {
      icon: <Clock className="h-3.5 w-3.5 mr-1" />,
      color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
    },
    processing: {
      icon: <Package className="h-3.5 w-3.5 mr-1" />,
      color: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
    },
    packed: {
      icon: <Box className="h-3.5 w-3.5 mr-1" />,
      color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80",
    },
    shipped: {
      icon: <Truck className="h-3.5 w-3.5 mr-1" />,
      color: "bg-purple-100 text-purple-800 hover:bg-purple-100/80",
    },
    delivered: {
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
      color: "bg-green-100 text-green-800 hover:bg-green-100/80",
    },
    cancelled: {
      icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
      color: "bg-red-100 text-red-800 hover:bg-red-100/80",
    },
    refunded: {
      icon: <RefreshCcw className="h-3.5 w-3.5 mr-1" />,
      color: "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
    },
  }

  // Get configuration or use default
  const config = statusConfig[statusLower as keyof typeof statusConfig] || {
    icon: <Clock className="h-3.5 w-3.5 mr-1" />,
    color: "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
  }

  return (
    <Badge variant="outline" className={`flex items-center font-medium ${config.color}`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
