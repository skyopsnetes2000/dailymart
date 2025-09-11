
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { getOrders, getProducts } from '@/lib/firestore';
import { Order, Product } from '@/lib/data';
import { subMonths, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

type DashboardStats = {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
};

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [orders, products] = await Promise.all([getOrders(), getProducts()]);

                const now = new Date();
                const lastMonthStart = startOfMonth(subMonths(now, 1));
                const lastMonthEnd = endOfMonth(subMonths(now, 1));
                const currentMonthStart = startOfMonth(now);

                let totalRevenue = 0;
                let currentMonthRevenue = 0;
                let lastMonthRevenue = 0;
                let currentMonthOrders = 0;
                let lastMonthOrders = 0;

                orders.forEach(order => {
                    const orderDate = new Date(order.date);
                    if (order.status === 'Delivered') {
                        totalRevenue += order.total;
                    }

                    if (isWithinInterval(orderDate, { start: currentMonthStart, end: now })) {
                        currentMonthOrders++;
                        if (order.status === 'Delivered') {
                            currentMonthRevenue += order.total;
                        }
                    } else if (isWithinInterval(orderDate, { start: lastMonthStart, end: lastMonthEnd })) {
                        lastMonthOrders++;
                        if (order.status === 'Delivered') {
                            lastMonthRevenue += order.total;
                        }
                    }
                });

                const revenueChange = lastMonthRevenue > 0
                    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                    : currentMonthRevenue > 0 ? 100 : 0;
                
                const ordersChange = lastMonthOrders > 0
                    ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
                    : currentMonthOrders > 0 ? 100 : 0;

                setStats({
                    totalRevenue,
                    revenueChange,
                    totalOrders: orders.length,
                    ordersChange,
                    totalProducts: products.length,
                });

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                toast({
                    title: 'Error',
                    description: 'Could not load dashboard data.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [toast]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!stats) {
        return <p>Could not load dashboard data.</p>
    }
    
    const formatPercentage = (change: number) => {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
    }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(stats.revenueChange)} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalOrders}</div>
             <p className="text-xs text-muted-foreground">
              {formatPercentage(stats.ordersChange)} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Total products in store
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
