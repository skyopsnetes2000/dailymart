import PageHeader from "@/components/shared/page-header";
import { orders } from "@/lib/data";
import { notFound } from "next/navigation";
import OrderTracker from "@/components/order-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
    const order = orders.find(o => o.id === params.id);
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
            </div>
        </div>
    )
}
