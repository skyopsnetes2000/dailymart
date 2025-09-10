
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { orders as initialOrders, Order, OrderStatus } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';

const statusColors: { [key in OrderStatus]: string } = {
  Pending: 'bg-yellow-500',
  Packed: 'bg-blue-500',
  'Out for Delivery': 'bg-indigo-500',
  Delivered: 'bg-green-500',
  'Return Initiated': 'bg-purple-500',
  'Return Successful': 'bg-pink-500',
  'Refund Completed': 'bg-gray-500',
  Cancelled: 'bg-red-500',
};


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(initialOrders);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const orderStatuses: OrderStatus[] = [
    'Pending',
    'Packed',
    'Out for Delivery',
    'Delivered',
    'Return Initiated',
    'Return Successful',
    'Refund Completed',
    'Cancelled',
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>
      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    {format(new Date(order.date), 'MM/dd/yyyy')}
                  </TableCell>
                  <TableCell>John Doe</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        handleStatusChange(order.id, value as OrderStatus)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue>
                           <Badge
                              className={`${
                                statusColors[order.status]
                              } hover:${statusColors[order.status]}`}
                            >
                              {order.status}
                            </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                             <Badge
                              className={`${statusColors[status]} hover:${statusColors[status]}`}
                            >
                              {status}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="icon">
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
