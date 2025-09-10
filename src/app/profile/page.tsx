'use client';

import PageHeader from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { user as staticUser } from "@/lib/data";
import ProfileForm from "@/components/profile/profile-form";
import AddressManager from "@/components/profile/address-manager";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2 } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    // This could be extracted into a higher-order component or middleware
    if (!loading && !user) {
      // User is not logged in, you can keep them on this page to show login options
      // or redirect them. For now, we show the login prompt.
    }
  }, [user, loading, router]);


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

  return (
    <div>
      <PageHeader title="My Profile" />
      <div className="p-4 sm:p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-6">
            <ProfileForm user={profileData} />
          </TabsContent>
          <TabsContent value="addresses" className="mt-6">
            <AddressManager addresses={staticUser.addresses} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-semibold mb-4">My Orders</h3>
            <p className="text-muted-foreground mb-4">View your past and current orders.</p>
            <Button asChild>
                <Link href="/orders">View All Orders</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
