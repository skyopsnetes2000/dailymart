

'use client';

import { Home, LayoutGrid, ShoppingCart, User, Archive } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import useCart from '@/hooks/use-cart';

const baseNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/products/all', label: 'Products', icon: Archive },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/profile', label: 'Profile', icon: User },
];


export default function BottomNav() {
  const pathname = usePathname();
  const { items, isInitialized } = useCart();
  const [user, loading] = useAuthState(auth);

  // Do not render the nav on admin pages or the login page.
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return null;
  }
  
  if (loading || !isInitialized) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-sm">
            <div className="mx-auto grid h-full max-w-lg grid-cols-5 items-center justify-center">
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

  const navItems = baseNavItems.map(item => {
      // Special handling for products page to match '/products/all'
      if (item.href === '/products/all') {
          return { ...item, isActive: pathname.startsWith('/products') };
      }
      const isActive = (pathname === '/' && item.href === '/') || (pathname !== '/' && item.href !== '/' && pathname.startsWith(item.href));
      return { ...item, isActive };
  });

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-sm">
      <div className="mx-auto grid h-full max-w-lg grid-cols-5">
        {navItems.map((item) => {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative inline-flex flex-col items-center justify-center px-5 text-muted-foreground hover:text-primary transition-colors duration-200',
                item.isActive && 'text-primary'
              )}
            >
              {item.href === '/cart' && cartItemCount > 0 && isInitialized && (
                <Badge className="absolute right-3 top-1 h-5 w-5 justify-center rounded-full p-0">
                  {cartItemCount}
                </Badge>
              )}
              <item.icon className="mb-1 h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
