
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import AdminSidebar from '@/components/admin/admin-sidebar';
import { Loader2, PanelLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[] | null>(null);
  const isAuthorized = userRoles && (userRoles.includes('admin') || userRoles.includes('seller'));

  useEffect(() => {
    const checkAuthorization = async () => {
      if (loading) return;

      if (!user) {
        setUserRoles([]);
        router.replace('/');
        return;
      }
      
      // Prioritize hardcoded admin email to prevent read-permission race conditions
      if (user.email === 'dhandesaurav52@gmail.com') {
          setUserRoles(['admin']);
          return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const roles = userData.roles || [];
            setUserRoles(roles);
            if (!roles.includes('admin') && !roles.includes('seller')) {
                router.replace('/');
            }
        } else {
            // If the user document doesn't exist and they are not the hardcoded admin,
            // they have no roles. This prevents permission errors for new users.
            setUserRoles([]);
            router.replace('/');
        }
      } catch (error) {
          console.error("Authorization check failed:", error);
          setUserRoles([]);
          router.replace('/');
      }
    };
    
    checkAuthorization();
  }, [user, loading, router]);

  if (loading || userRoles === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    // This part should ideally not be reached due to the redirect, but it's a good fallback.
    return null; 
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userRoles={userRoles} />
      <main className="flex-1 p-4 sm:p-6">
        <header className="md:hidden border-b pb-4 mb-4 flex justify-between items-center">
             <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs p-0">
                  <SheetHeader className='p-4'>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                  </SheetHeader>
                  <AdminSidebar isMobile={true} onLinkClick={() => setIsMobileSheetOpen(false)} userRoles={userRoles} />
                </SheetContent>
              </Sheet>
        </header>
        {children}
      </main>
    </div>
  );
}
