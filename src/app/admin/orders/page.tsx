
'use client';

import React, { useState, useEffect } from 'react';
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
import { Order, OrderStatus } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getOrders, updateOrderStatus } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const fetchedOrders = await getOrders();
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Could not fetch orders.", error);
            toast({
                title: "Error",
                description: "Failed to fetch orders from the database.",
                variant: "destructive"
            });
        }
    }
    fetchOrders();
  }, [toast]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const newTrackingHistory = [...orderToUpdate.trackingHistory, { status: newStatus, date: new Date().toISOString() }];

    try {
        await updateOrderStatus(orderId, newStatus, newTrackingHistory);
        const updatedOrders = orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus, trackingHistory: newTrackingHistory } : order
        );
        setOrders(updatedOrders);
        toast({ title: "Success", description: `Order ${orderId} status updated to ${newStatus}.` });
    } catch (error) {
      console.error("Could not update order status.", error);
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
    }
  };
  
  const toggleRow = (orderId: string) => {
    setOpenOrderId(openOrderId === orderId ? null : orderId);
  }

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
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        {format(new Date(order.date), 'MM/dd/yyyy')}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
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
                      <TableCell className='text-right'>
                           <Button variant="ghost" size="icon" onClick={() => toggleRow(order.id)}>
                              {openOrderId === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                           </Button>
                      </TableCell>
                    </TableRow>
                    {openOrderId === order.id && (
                       <TableRow>
                         <TableCell colSpan={6} className='p-0'>
                            <div className='bg-muted/50 p-4'>
                                <h4 className='font-semibold mb-2'>Shipping Details</h4>
                                {order.shippingAddress ? (
                                  <>
                                    <p>{order.customerName}</p>
                                    <p>{order.shippingAddress.line1}</p>
                                    {order.shippingAddress.landmark && <p>{order.shippingAddress.landmark}</p>}
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                                    <p>Mobile: {order.shippingAddress.mobile}</p>
                                  </>
                                ) : (
                                  <p className="text-muted-foreground">Shipping address not available for this order.</p>
                                )}
                                <h4 className='font-semibold mt-4 mb-2'>Order Items</h4>
                                <ul>
                                    {order.items.map((item, index) => (
                                        <li key={index}>{item.productName} (x{item.quantity})</li>
                                    ))}
                                </ul>
                            </div>
                         </TableCell>
                       </TableRow>
                    )}
                  </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
