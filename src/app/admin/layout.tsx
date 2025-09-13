
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
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (loading) return;

      if (!user) {
        setIsAuthorized(false);
        router.replace('/');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const roles = userData.roles || [];
            if (roles.includes('admin') || roles.includes('seller')) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                router.replace('/');
            }
        } else {
            // This case handles the main admin who might not have a doc initially
             if (user.email === 'dhandesaurav52@gmail.com') {
                setIsAuthorized(true);
             } else {
                setIsAuthorized(false);
                router.replace('/');
             }
        }
      } catch (error) {
          console.error("Authorization check failed:", error);
          setIsAuthorized(false);
          router.replace('/');
      }
    };
    
    checkAuthorization();
  }, [user, loading, router]);

  if (loading || isAuthorized === null) {
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
      <AdminSidebar user={user} />
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
                  <AdminSidebar isMobile={true} onLinkClick={() => setIsMobileSheetOpen(false)} user={user} />
                </SheetContent>
              </Sheet>
        </header>
        {children}
      </main>
    </div>
  );
}
