"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal, ShoppingBag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  created_at: string
}

interface AdminCustomersTableProps {
  initialCustomers: Customer[]
}

export default function AdminCustomersTable({ initialCustomers }: AdminCustomersTableProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone_number && customer.phone_number.includes(searchTerm))
    )
  })

  const viewCustomerOrders = async (customerId: string) => {
    router.push(`/admin/orders?customer=${customerId}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Customers</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search customers..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone_number || "N/A"}</TableCell>
                    <TableCell>{format(new Date(customer.created_at), "PPP")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewCustomerOrders(customer.id)}>
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            View Orders
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
  )
}
