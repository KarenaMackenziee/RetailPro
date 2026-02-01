export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    case "processing":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "shipped":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100"
    case "delivered":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

export const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]
