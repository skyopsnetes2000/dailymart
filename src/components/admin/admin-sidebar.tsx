

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, LayoutGrid, Settings, UtensilsCrossed, ArrowUpRightFromSquare, Tag, Users, Building, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'seller'] },
  { href: '/admin/products', label: 'Products', icon: Package, roles: ['admin', 'seller'] },
  { href: '/admin/recipes', label: 'Recipes', icon: UtensilsCrossed, roles: ['admin', 'seller'] },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, roles: ['admin', 'seller'] },
  { href: '/admin/categories', label: 'Categories', icon: LayoutGrid, roles: ['admin', 'seller'] },
  { href: '/admin/offers', label: 'Offers', icon: Tag, roles: ['admin', 'seller'] },
  { href: '/admin/appearance', label: 'Appearance', icon: Settings, roles: ['admin'] },
  { href: '/admin/employee', label: 'Employee', icon: Users, roles: ['admin'] },
  { href: '/admin/shops', label: 'Shops', icon: Building, roles: ['admin'] },
  { href: '/admin/approval-requests', label: 'Approval Requests', icon: CheckSquare, roles: ['admin'] },
];

type AdminSidebarProps = {
  isMobile?: boolean;
  onLinkClick?: () => void;
  userRoles: string[];
};

export default function AdminSidebar({ isMobile = false, onLinkClick, userRoles }: AdminSidebarProps) {
  const pathname = usePathname();
  
  const handleLinkClick = () => {
    if (isMobile && onLinkClick) {
      onLinkClick();
    }
  }
  
  const hasRole = (roles: string[]) => {
    return roles.some(role => userRoles.includes(role));
  }

  const visibleNavItems = navItems.filter(item => hasRole(item.roles));


  return (
    <aside className={cn(
        "flex-col border-r bg-muted/20 text-foreground",
        isMobile ? "flex h-full" : "hidden w-64 md:flex"
    )}>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold" onClick={handleLinkClick}>
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span>DailyMart Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {visibleNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleLinkClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary',
              pathname === item.href && 'bg-primary/10 font-medium text-primary'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <Separator className="my-2" />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary'
          )}
        >
          <ArrowUpRightFromSquare className="h-4 w-4" />
          View Store
        </a>
      </div>
    </aside>
  );
}
