import Link from 'next/link';
import PageHeader from '@/components/shared/page-header';
import { orders } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
    return (
        <div>
            <PageHeader title="My Orders" />
            <div className="p-4 sm:p-6 space-y-4">
                {orders.map(order => (
                    <Card key={order.id}>
                        <CardHeader>
                            <div className='flex justify-between items-center'>
                                <div>
                                    <CardTitle className="text-lg">{order.id}</CardTitle>
                                    <CardDescription>Placed on {format(new Date(order.date), 'MM/dd/yyyy')}</CardDescription>
                                </div>
                                <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full sm:w-auto">
                                <Link href={`/orders/${order.id}`}>
                                    Track Order <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
