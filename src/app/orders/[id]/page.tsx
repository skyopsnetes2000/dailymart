
'use client';

import PageHeader from "@/components/shared/page-header";
import { type Order, orders as staticOrders } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import OrderTracker from "@/components/order-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const ORDERS_STORAGE_KEY = 'user_orders';

export default function OrderDetailsPage() {
    const params = useParams();
    const { id } = params;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedOrdersRaw = localStorage.getItem(ORDERS_STORAGE_KEY);
            const storedOrders = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : staticOrders;
            const currentOrder = storedOrders.find((o: Order) => o.id === id);
            setOrder(currentOrder || null);
        } catch (error) {
            console.warn("Could not access localStorage. Using static orders.");
            const currentOrder = staticOrders.find(o => o.id === id);
            setOrder(currentOrder || null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return (
             <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
        )
    }

    if (!order) {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Order Details" />
            <div className="p-4 sm:p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{order.id}</CardTitle>
                        <CardDescription>Placed on {format(new Date(order.date), 'MM/dd/yyyy')} &bull; Total: ${order.total.toFixed(2)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-semibold mb-2">Items</h4>
                        <ul className="space-y-1 text-muted-foreground">
                            {order.items.map((item, index) => (
                                <li key={index} className="flex justify-between">
                                    <span>{item.productName} (x{item.quantity})</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <OrderTracker order={order} />
                    </CardContent>
                </Card>

                {order.shippingAddress && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{order.customerName}</p>
                            <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
                            {order.shippingAddress.landmark && <p className="text-muted-foreground">{order.shippingAddress.landmark}</p>}
                            <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                            <p className="text-muted-foreground">Mobile: {order.shippingAddress.mobile}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
