
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
import { calculateDiscountedPrice } from '@/lib/utils';

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

                const productPriceMap = new Map(products.map(p => [p.name, p]));

                const getRefundAmount = (order: Order): number => {
                    if (!order.returnRequest) return 0;
                    
                    return order.returnRequest.items.reduce((sum, item) => {
                        const product = productPriceMap.get(item.productName);
                        if (product) {
                            const originalOrderItem = order.items.find(i => i.productName === item.productName);
                            if (originalOrderItem) {
                               const totalQuantity = order.items.reduce((acc, i) => acc + i.quantity, 0);
                               const pricePerItem = totalQuantity > 0 ? (order.total / totalQuantity) : 0;
                               const originalProduct = products.find(p => p.name === item.productName);
                               const discountedPrice = originalProduct ? (calculateDiscountedPrice(originalProduct) ?? originalProduct.price) : pricePerItem;

                                return sum + (discountedPrice * item.quantity);
                            }
                        }
                        const totalItemsInOrder = order.items.length || 1;
                        return sum + (order.total / totalItemsInOrder) * item.quantity;
                    }, 0);
                };

                const grossRevenueOrders = orders.filter(o => 
                    ['Delivered', 'Return Requested', 'Return Initiated', 'Return Successful', 'Refund Completed'].includes(o.status)
                );
                const refundedOrders = orders.filter(o => 
                    ['Return Successful', 'Refund Completed'].includes(o.status)
                );
                
                const totalGrossRevenue = grossRevenueOrders.reduce((sum, order) => sum + order.total, 0);
                const totalRefunds = refundedOrders.reduce((sum, order) => sum + getRefundAmount(order), 0);
                const totalRevenue = totalGrossRevenue - totalRefunds;

                const currentMonthGross = grossRevenueOrders
                    .filter(o => isWithinInterval(new Date(o.date), { start: currentMonthStart, end: now }))
                    .reduce((sum, order) => sum + order.total, 0);
                const currentMonthRefunds = refundedOrders
                    .filter(o => isWithinInterval(new Date(o.date), { start: currentMonthStart, end: now }))
                    .reduce((sum, order) => sum + getRefundAmount(order), 0);
                const currentMonthRevenue = currentMonthGross - currentMonthRefunds;

                const lastMonthGross = grossRevenueOrders
                    .filter(o => isWithinInterval(new Date(o.date), { start: lastMonthStart, end: lastMonthEnd }))
                    .reduce((sum, order) => sum + order.total, 0);
                const lastMonthRefunds = refundedOrders
                    .filter(o => isWithinInterval(new Date(o.date), { start: lastMonthStart, end: lastMonthEnd }))
                    .reduce((sum, order) => sum + getRefundAmount(order), 0);
                const lastMonthRevenue = lastMonthGross - lastMonthRefunds;
                
                const currentMonthOrdersCount = orders.filter(o => isWithinInterval(new Date(o.date), { start: currentMonthStart, end: now })).length;
                const lastMonthOrdersCount = orders.filter(o => isWithinInterval(new Date(o.date), { start: lastMonthStart, end: lastMonthEnd })).length;

                const salesByProduct: { [key: string]: number } = {};
                const salesByCategory: { [key: string]: number } = {};
                const productToCategoryMap = new Map(products.map(p => [p.name, p.categorySlug]));
                const categorySlugToNameMap = new Map(categories.map(c => [c.slug, c.name]));
                
                orders.filter(o => o.status === 'Delivered').forEach(order => {
                    order.items.forEach(item => {
                        salesByProduct[item.productName] = (salesByProduct[item.productName] || 0) + item.quantity;
                        
                        const categorySlug = productToCategoryMap.get(item.productName);
                        if (categorySlug) {
                            const categoryName = categorySlugToNameMap.get(categorySlug) || categorySlug;
                            salesByCategory[categoryName] = (salesByCategory[categoryName] || 0) + item.quantity;
                        }
                    });
                });
                
                const salesByMonth: { [key: string]: { sales: number; refunds: number } } = {};
                 for (let i = 5; i >= 0; i--) {
                    const date = subMonths(now, i);
                    const monthKey = format(date, 'MMM yyyy');
                    const monthStart = startOfMonth(date);
                    const monthEnd = endOfMonth(date);

                    const monthGross = grossRevenueOrders
                        .filter(o => isWithinInterval(new Date(o.date), { start: monthStart, end: monthEnd }))
                        .reduce((sum, order) => sum + order.total, 0);
                    
                    const monthRefunds = refundedOrders
                        .filter(o => isWithinInterval(new Date(o.date), { start: monthStart, end: monthEnd }))
                        .reduce((sum, order) => sum + getRefundAmount(order), 0);

                    salesByMonth[monthKey] = { sales: monthGross, refunds: monthRefunds };
                }

                const last6Months: MonthlySales[] = [];
                for (let i = 5; i >= 0; i--) {
                    const date = subMonths(now, i);
                    const monthKey = format(date, 'MMM yyyy');
                    const monthData = salesByMonth[monthKey] || { sales: 0, refunds: 0 };
                    last6Months.push({ month: format(date, 'MMM'), total: Math.max(0, monthData.sales - monthData.refunds) });
                }
                setMonthlySales(last6Months);

                const sortedProducts = Object.entries(salesByProduct)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([name, sales]) => ({ name, sales }));
                setTopProducts(sortedProducts);
                
                const sortedCategories = Object.entries(salesByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([name, sales]) => ({ name, sales }));
                setTopCategories(sortedCategories);


                const revenueChange = lastMonthRevenue > 0
                    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                    : currentMonthRevenue > 0 ? 100 : 0;
                
                const ordersChange = lastMonthOrdersCount > 0
                    ? ((currentMonthOrdersCount - lastMonthOrdersCount) / lastMonthOrdersCount) * 100
                    : currentMonthOrdersCount > 0 ? 100 : 0;

                setStats({
                    totalRevenue: Math.max(0, totalRevenue),
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
        <div className="col-span-4 lg:col-span-3 space-y-4">
          <Card>
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
                      <TableHead className="text-right">Sales</TableHead>
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
                The most popular categories this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCategories.length > 0 ? topCategories.map((category) => (
                      <TableRow key={category.name}>
                        <TableCell className="font-medium">{category.name}</TableCell>
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
