
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Loader2, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { getOrders, getProducts, getCategories } from '@/lib/firestore';
import { Order, Product, Category } from '@/lib/data';
import { subMonths, isWithinInterval, startOfMonth, endOfMonth, format } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type DashboardStats = {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  totalCategories: number;
};

type MonthlySales = {
  month: string;
  total: number;
}

type TopProduct = {
  name: string;
  sales: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [orders, products, categories] = await Promise.all([getOrders(), getProducts(), getCategories()]);

                const now = new Date();
                const lastMonthStart = startOfMonth(subMonths(now, 1));
                const lastMonthEnd = endOfMonth(subMonths(now, 1));
                const currentMonthStart = startOfMonth(now);

                let totalRevenue = 0;
                let currentMonthRevenue = 0;
                let lastMonthRevenue = 0;
                let currentMonthOrders = 0;
                let lastMonthOrders = 0;
                
                const salesByMonth: { [key: string]: number } = {};
                const salesByProduct: { [key: string]: number } = {};
                
                orders.forEach(order => {
                    const orderDate = new Date(order.date);
                    const monthKey = format(orderDate, 'MMM yyyy');

                    if (order.status === 'Delivered') {
                        totalRevenue += order.total;
                        
                        // Monthly Sales
                        salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + order.total;
                        
                        // Top Products
                        order.items.forEach(item => {
                            salesByProduct[item.productName] = (salesByProduct[item.productName] || 0) + 1;
                        });
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

                // Prepare monthly sales data for chart (last 6 months)
                const last6Months: MonthlySales[] = [];
                for (let i = 5; i >= 0; i--) {
                    const date = subMonths(now, i);
                    const monthKey = format(date, 'MMM yyyy');
                    last6Months.push({ month: format(date, 'MMM'), total: salesByMonth[monthKey] || 0 });
                }
                setMonthlySales(last6Months);

                // Prepare top products data
                const sortedProducts = Object.entries(salesByProduct)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([name, sales]) => ({ name, sales }));
                setTopProducts(sortedProducts);


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
                    totalCategories: categories.length,
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Total categories available
            </p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
             <CardDescription>Monthly revenue overview.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlySales}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              The most sold products this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Sales Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.length > 0 ? topProducts.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{product.sales}</TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={2} className="text-center">No sales data available.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
