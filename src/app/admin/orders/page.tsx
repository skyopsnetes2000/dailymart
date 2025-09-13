

'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Order, OrderStatus, Product, Category } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, RefreshCw, Search } from 'lucide-react';
import { getOrders, updateOrderStatus, getProducts, getCategories } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { calculateDiscountedPrice } from '@/lib/utils';

const statusColors: { [key in OrderStatus]: string } = {
  Pending: 'bg-yellow-500',
  Packed: 'bg-blue-500',
  'Out for Delivery': 'bg-indigo-500',
  Delivered: 'bg-green-500',
  'Return Initiated': 'bg-purple-500',
  'Return Successful': 'bg-pink-500',
  'Refund Completed': 'bg-gray-500',
  Cancelled: 'bg-red-500',
  'Return Requested': 'bg-orange-500',
};


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
        const [fetchedOrders, fetchedProducts, fetchedCategories] = await Promise.all([
          getOrders(),
          getProducts(),
          getCategories()
        ]);
        setOrders(fetchedOrders);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
    } catch (error) {
        console.error("Could not fetch data.", error);
        toast({
            title: "Error",
            description: "Failed to fetch data from the database.",
            variant: "destructive"
        });
    } finally {
        setIsRefreshing(false);
    }
  }, [toast]);


  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
    'Return Requested',
    'Return Initiated',
    'Return Successful',
    'Refund Completed',
    'Cancelled',
  ];

  const productToCategorySlugMap = new Map<string, string>();
  products.forEach(prod => {
    productToCategorySlugMap.set(prod.name, prod.categorySlug);
  });
  
  const productMap = new Map<string, Product>();
  products.forEach(prod => {
    productMap.set(prod.name, prod);
  });

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || 
        order.items.some(item => productToCategorySlugMap.get(item.productName) === filterCategory);
        
    return matchesStatus && matchesSearch && matchesCategory;
  });

  const productCategoryMap = new Map<string, string>();
  const categorySlugMap = new Map<string, string>();
  categories.forEach(cat => categorySlugMap.set(cat.slug, cat.name));
  products.forEach(prod => {
    const categoryName = categorySlugMap.get(prod.categorySlug);
    if (categoryName) {
      productCategoryMap.set(prod.name, categoryName);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button variant="outline" size="icon" onClick={fetchOrders} disabled={isRefreshing}>
          <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        </Button>
      </div>
       <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID or Customer..."
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select onValueChange={setFilterCategory} defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px] h-10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setFilterStatus(value as OrderStatus | 'all')} defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px] h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {orderStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
              {filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        {format(new Date(order.date), 'MM/dd/yyyy')}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>₹{order.total.toFixed(2)}</TableCell>
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
                            <div className='bg-muted/50 p-4 space-y-4'>
                                {order.returnRequest && (
                                    <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3">
                                        <h5 className="font-semibold text-yellow-800">Return Request</h5>
                                        <p className="text-sm text-yellow-700">
                                            <strong>Items:</strong> 
                                            {order.returnRequest.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                                        </p>
                                        <p className="text-sm text-yellow-700"><strong>Reason:</strong> {order.returnRequest.reason}</p>
                                    </div>
                                )}
                                
                                <div>
                                    <h4 className='font-semibold mb-2'>Shipping Details</h4>
                                    {order.shippingAddress ? (
                                      <div className='text-sm text-muted-foreground'>
                                        <p className='font-medium text-foreground'>{order.customerName}</p>
                                        <p>{order.shippingAddress.line1}</p>
                                        {order.shippingAddress.landmark && <p>{order.shippingAddress.landmark}</p>}
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                                        <p>Mobile: {order.shippingAddress.mobile}</p>
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">Shipping address not available for this order.</p>
                                    )}
                                </div>
                                
                                <div>
                                    <h4 className='font-semibold mb-2'>Order Items</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Product</TableHead>
                                          <TableHead>Category</TableHead>
                                          <TableHead>Weight</TableHead>
                                          <TableHead className='text-right'>Price</TableHead>
                                          <TableHead className='text-right'>Qty</TableHead>
                                          <TableHead className='text-right'>Subtotal</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {order.items.map((item, index) => {
                                          const product = productMap.get(item.productName);
                                          const price = product ? (calculateDiscountedPrice(product) ?? product.price) : 0;
                                          const subtotal = price * item.quantity;
                                          return (
                                            <TableRow key={index}>
                                              <TableCell>
                                                <div className='font-medium'>{item.productName}</div>
                                                <div className='text-xs text-muted-foreground'>{product?.brand || 'N/A'}</div>
                                              </TableCell>
                                              <TableCell>{productCategoryMap.get(item.productName) || 'N/A'}</TableCell>
                                              <TableCell>{product?.weight || 'N/A'}</TableCell>
                                              <TableCell className='text-right'>₹{price.toFixed(2)}</TableCell>
                                              <TableCell className='text-right'>{item.quantity}</TableCell>
                                              <TableCell className='text-right'>₹{subtotal.toFixed(2)}</TableCell>
                                            </TableRow>
                                          )
                                        })}
                                      </TableBody>
                                    </Table>
                                </div>
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
