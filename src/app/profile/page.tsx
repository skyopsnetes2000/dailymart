
'use client';

import PageHeader from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { user as staticUser, type Order } from "@/lib/data";
import ProfileForm from "@/components/profile/profile-form";
import AddressManager from "@/components/profile/address-manager";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2, ChevronRight, UserCog, LogOut } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import AccountSettings from "@/components/profile/account-settings";
import { getOrders } from "@/lib/firestore";

const ADMIN_EMAIL = 'dhandesaurav52@gmail.com';


export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    if (!loading && !user) {
      // User is not logged in, show the login prompt.
    }
  }, [user, loading, router]);
  
  useEffect(() => {
      const fetchOrders = async () => {
        if (user) {
            try {
                const userOrders = await getOrders(user.uid);
                setOrders(userOrders);
            } catch (error) {
                console.error("Could not fetch orders.", error);
            }
        }
      }
      fetchOrders();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
      console.error("Logout Error:", error);
      toast({ title: "Error", description: "Failed to log out.", variant: "destructive" });
    }
  };


  const getTitleForTab = (tab: string) => {
    switch (tab) {
        case 'profile':
            return 'My Profile';
        case 'addresses':
            return 'My Addresses';
        case 'orders':
            return 'My Orders';
        case 'settings':
            return 'Account Settings'
        default:
            return 'My Profile';
    }
  }


  if (loading) {
    return (
        <div>
            <PageHeader title="Profile" />
            <div className="flex h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Loading profile...</p>
            </div>
        </div>
    )
  }

  if (!user) {
    return (
      <div>
        <PageHeader title="Profile" />
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <LogIn className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Login to view your profile</h2>
            <p className="text-muted-foreground">You need to be logged in to access your profile and orders.</p>
            <div className="flex gap-4">
                <Button asChild>
                    <Link href="/login?tab=login">Login</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/login?tab=signup">Sign Up</Link>
                </Button>
            </div>
        </div>
      </div>
    );
  }

  const profileData = {
      name: user.displayName || staticUser.name,
      email: user.email || staticUser.email,
  }

  const recentOrders = orders.slice(0, 3);
  const isAdmin = user.email === ADMIN_EMAIL;

  return (
    <div>
      <PageHeader title={getTitleForTab(activeTab)} />
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          {isAdmin && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Admin Access</CardTitle>
                <CardDescription>You have administrative privileges.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <Link href="/admin">
                    <UserCog className="mr-2 h-4 w-4" />
                    Go to Admin Panel
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
          <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <ProfileForm user={profileData} />
            </TabsContent>
            <TabsContent value="addresses" className="mt-6">
              <AddressManager />
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
              <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">My Recent Orders</h3>
                      <Button asChild variant="link">
                          <Link href="/orders">View All</Link>
                      </Button>
                  </div>
                  {recentOrders.length > 0 ? recentOrders.map(order => (
                      <Card key={order.id}>
                          <CardHeader>
                              <div className='flex justify-between items-center'>
                                  <div>
                                      <CardTitle className="text-base">{order.id}</CardTitle>
                                      <CardDescription>Placed on {format(new Date(order.date), 'MM/dd/yyyy')}</CardDescription>
                                  </div>
                                  <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <p className="font-semibold text-lg">₹{order.total.toFixed(2)}</p>
                          </CardContent>
                          <CardFooter>
                              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                                  <Link href={`/orders/${order.id}`}>
                                      View Details <ChevronRight className="ml-2 h-4 w-4" />
                                  </Link>
                              </Button>
                          </CardFooter>
                      </Card>
                  )) : (
                    <p className='text-center text-muted-foreground'>No recent orders to show.</p>
                  )}
              </div>
            </TabsContent>
            <TabsContent value="settings" className="mt-6">
                <AccountSettings isAdmin={isAdmin} />
            </TabsContent>
          </Tabs>

          <div className="mt-8">
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
