'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';

type Order = Database['public']['Tables']['orders']['Row'];

export default function AdminDashboard() {
  const supabase = createClientComponentClient<Database>();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error.message);
      toast.error('Failed to fetch orders');
    } else {
      setOrders(data || []);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Order status updated');
      fetchOrders(); // Refresh orders
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard - Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-4 space-y-2">
            <div>
              <strong>Order ID:</strong> {order.id}
            </div>
            <div>
              <strong>User ID:</strong> {order.user_id}
            </div>
            <div>
              <strong>Total:</strong> ₹{order.total}
            </div>
            <div>
              <Label>Status:</Label>
              <Select
                value={order.status}
                onValueChange={(value) => updateStatus(order.id, value)}
              >
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </Select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
