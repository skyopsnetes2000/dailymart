
'use client';

import { Home, LayoutGrid, ShoppingCart, User, Archive, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const ADMIN_EMAIL = 'dhandesaurav52@gmail.com';

const baseNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/products', label: 'Products', icon: Archive },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/profile', label: 'Profile', icon: User },
];


export default function BottomNav() {
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);

  // Do not render the nav on admin pages or the login page.
  if (pathname.startsWith('/admin') || pathname === '/login') {
    return null;
  }
  
  if (loading) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 border-t bg-card/80 backdrop-blur-sm">
            <div className="mx-auto grid h-full max-w-lg grid-cols-5 items-center justify-center font-medium">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center justify-center gap-1">
                        <Skeleton className="h-6 w-6 rounded-md" />
                        <Skeleton className="h-2.5 w-10 rounded-sm" />
                    </div>
                ))}
            </div>
        </nav>
    )
  }

  const navItems = baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 border-t bg-card/80 backdrop-blur-sm">
      <div className="mx-auto grid h-full max-w-lg grid-cols-5 font-medium">
        {navItems.map((item) => {
          const isActive = (pathname === '/' && item.href === '/') || (pathname !== '/' && item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex flex-col items-center justify-center px-5 text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                isActive && 'text-primary'
              )}
            >
              <item.icon className="mb-1 h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
