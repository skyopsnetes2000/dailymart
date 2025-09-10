
'use client';

import { Home, LayoutGrid, ShoppingCart, User, Archive, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/products', label: 'Products', icon: Archive },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/admin', label: 'Admin', icon: UserCog },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on admin pages and login page
  if (pathname.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 border-t bg-card/80 backdrop-blur-sm">
      <div className="mx-auto grid h-full max-w-lg grid-cols-6 font-medium">
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
