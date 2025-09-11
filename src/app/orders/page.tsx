
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/shared/page-header';
import { type Order } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getOrders } from '@/lib/firestore';

export default function OrdersPage() {
    const [user] = useAuthState(auth);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            };
            try {
                const userOrders = await getOrders(user.uid);
                setOrders(userOrders);
            } catch (error) {
                console.error("Could not fetch orders.", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, [user]);

    if (loading) {
        return (
             <div>
                <PageHeader title="My Orders" />
                <div className="p-4 sm:p-6">
                  <div className="mx-auto max-w-3xl space-y-4">
                      {Array.from({length: 3}).map((_, i) => (
                          <Card key={i}>
                              <CardHeader>
                                  <Skeleton className="h-6 w-1/2" />
                                  <Skeleton className="h-4 w-1/4" />
                              </CardHeader>
                              <CardContent>
                                  <Skeleton className="h-6 w-1/3" />
                              </CardContent>
                              <CardFooter>
                                  <Skeleton className="h-10 w-full sm:w-32" />
                              </CardFooter>
                          </Card>
                      ))}
                  </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader title="My Orders" />
             {orders.length > 0 ? (
                <div className="p-4 sm:p-6">
                  <div className="mx-auto max-w-3xl space-y-4">
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
                                <p className="font-semibold text-lg">₹{order.total.toFixed(2)}</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="outline" className="w-full sm:w-auto">
                                    <Link href={`/orders/${order.id}`}>
                                        View Details <ChevronRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                  </div>
                </div>
             ) : (
                <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
                    <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">No Orders Yet</h2>
                    <p className="text-muted-foreground">You haven't placed any orders yet. Start shopping to see them here.</p>
                    <Button asChild>
                        <Link href="/products">Start Shopping</Link>
                    </Button>
                </div>
             )}
        </div>
    )
}
