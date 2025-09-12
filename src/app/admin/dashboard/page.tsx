
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Package, ShoppingCart, Loader2, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { getOrders, getProducts, getCategories } from '@/lib/firestore';
import { Order, Product, Category } from '@/lib/data';
import { subMonths, isWithinInterval, startOfMonth, endOfMonth, format } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { calculateDiscountedPrice } from '@/lib/utils';
import Link from 'next/link';

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

type TopItem = {
  name: string;
  sales: number;
  slug?: string;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
    const [topProducts, setTopProducts] = useState<TopItem[]>([]);
    const [topCategories, setTopCategories] = useState<TopItem[]>([]);
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
                
                const productMap = new Map(products.map(p => [p.name, p]));

                const getRefundAmount = (order: Order): number => {
                    if (!order.returnRequest || !['Return Successful', 'Refund Completed'].includes(order.status)) {
                        return 0;
                    }
                    return order.returnRequest.items.reduce((sum, item) => {
                        const product = productMap.get(item.productName);
                        if (!product) return sum;
                        const price = calculateDiscountedPrice(product) ?? product.price;
                        return sum + (price * item.quantity);
                    }, 0);
                };

                // Gross revenue is the total of all orders that have been successfully delivered or are in a post-delivery state.
                const deliveredAndReturnedOrders = orders.filter(o => 
                    ['Delivered', 'Return Requested', 'Return Initiated', 'Return Successful', 'Refund Completed'].includes(o.status)
                );
                
                const totalGrossRevenue = deliveredAndReturnedOrders.reduce((sum, order) => sum + order.total, 0);
                
                // Total refunds is the sum of money returned to customers for successfully returned items.
                const totalRefunds = orders.reduce((sum, order) => sum + getRefundAmount(order), 0);
                
                // Net revenue is gross revenue minus refunds.
                const totalRevenue = Math.max(0, totalGrossRevenue - totalRefunds);
                
                const calculateNetRevenueForPeriod = (start: Date, end: Date) => {
                    const periodDeliveredOrders = deliveredAndReturnedOrders.filter(o => isWithinInterval(new Date(o.date), { start, end }));
                    const periodRefundOrders = orders.filter(o => {
                        return ['Return Successful', 'Refund Completed'].includes(o.status) && o.returnRequest?.date && isWithinInterval(new Date(o.returnRequest.date), { start, end })
                    });
                    
                    const gross = periodDeliveredOrders.reduce((sum, order) => sum + order.total, 0);
                    const refunds = periodRefundOrders.reduce((sum, order) => sum + getRefundAmount(order), 0);
                    
                    return Math.max(0, gross - refunds);
                };

                const currentMonthRevenue = calculateNetRevenueForPeriod(currentMonthStart, now);
                const lastMonthRevenue = calculateNetRevenueForPeriod(lastMonthStart, lastMonthEnd);
                
                const currentMonthOrdersCount = orders.filter(o => isWithinInterval(new Date(o.date), { start: currentMonthStart, end: now })).length;
                const lastMonthOrdersCount = orders.filter(o => isWithinInterval(new Date(o.date), { start: lastMonthStart, end: lastMonthEnd })).length;

                const salesByProduct: { [key: string]: { sales: number; slug?: string; } } = {};
                const salesByCategory: { [key: string]: { sales: number; slug?: string; } } = {};
                
                const productToCategoryMap = new Map(products.map(p => [p.name, p.categorySlug]));
                const categorySlugToNameMap = new Map(categories.map(c => [c.slug, {name: c.name, slug: c.slug}]));
                
                orders.filter(o => o.status === 'Delivered').forEach(order => {
                    order.items.forEach(item => {
                        if (!salesByProduct[item.productName]) salesByProduct[item.productName] = { sales: 0 };
                        salesByProduct[item.productName].sales += item.quantity;
                        
                        const categorySlug = productToCategoryMap.get(item.productName);
                        if (categorySlug) {
                            const categoryInfo = categorySlugToNameMap.get(categorySlug);
                            if (categoryInfo) {
                                if (!salesByCategory[categoryInfo.name]) salesByCategory[categoryInfo.name] = { sales: 0, slug: categoryInfo.slug };
                                salesByCategory[categoryInfo.name].sales += item.quantity;
                            }
                        }
                    });
                });
                
                const last6Months: MonthlySales[] = [];
                 for (let i = 5; i >= 0; i--) {
                    const date = subMonths(now, i);
                    const monthStart = startOfMonth(date);
                    const monthEnd = endOfMonth(date);
                    const monthNetRevenue = calculateNetRevenueForPeriod(monthStart, monthEnd);
                    last6Months.push({ month: format(date, 'MMM'), total: Math.max(0, monthNetRevenue) });
                }
                setMonthlySales(last6Months);

                const sortedProducts = Object.entries(salesByProduct)
                    .sort(([, a], [, b]) => b.sales - a.sales)
                    .slice(0, 5)
                    .map(([name, data]) => ({ name, sales: data.sales }));
                setTopProducts(sortedProducts);
                
                const sortedCategories = Object.entries(salesByCategory)
                    .sort(([, a], [, b]) => b.sales - a.sales)
                    .slice(0, 5)
                    .map(([name, data]) => ({ name, sales: data.sales, slug: data.slug }));
                setTopCategories(sortedCategories);
                
                const revenueChange = lastMonthRevenue > 0
                    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                    : currentMonthRevenue > 0 ? 100 : 0;
                
                const ordersChange = lastMonthOrdersCount > 0
                    ? ((currentMonthOrdersCount - lastMonthOrdersCount) / lastMonthOrdersCount) * 100
                    : currentMonthOrdersCount > 0 ? 100 : 0;

                setStats({
                    totalRevenue: totalRevenue,
                    revenueChange: isFinite(revenueChange) ? revenueChange : 0,
                    totalOrders: orders.length,
                    ordersChange: isFinite(ordersChange) ? ordersChange : 0,
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
        const color = change >= 0 ? 'text-green-600' : 'text-red-600';
        return <span className={color}>{`${sign}${change.toFixed(1)}%`}</span>;
    }

    return (
        <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
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
                 <Button asChild variant="link" className="text-xs p-0 h-auto">
                  <Link href="/admin/products">View all products</Link>
                </Button>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalCategories}</div>
                 <Button asChild variant="link" className="text-xs p-0 h-auto">
                  <Link href="/admin/categories">Manage categories</Link>
                </Button>
            </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Monthly net revenue for the last 6 months.</CardDescription>
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
                    tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--accent))' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
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
            <div className="col-span-4 lg:col-span-3 space-y-4">
            <Card>
                <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>
                    The most sold products based on delivered orders.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Units Sold</TableHead>
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
            <Card>
                <CardHeader>
                <CardTitle>Top Selling Categories</CardTitle>
                <CardDescription>
                    The most popular categories based on delivered orders.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Units Sold</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topCategories.length > 0 ? topCategories.map((category) => (
                        <TableRow key={category.name}>
                            <TableCell className="font-medium">
                               <Button asChild variant="link" className="p-0 h-auto font-medium">
                                <Link href={`/admin/products?category=${category.slug}`}>{category.name}</Link>
                               </Button>
                            </TableCell>
                            <TableCell className="text-right">{category.sales}</TableCell>
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
        </div>
    );
}
