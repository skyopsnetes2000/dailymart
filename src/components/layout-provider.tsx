
'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/shared/bottom-nav';
import { cn } from '@/lib/utils';

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // We only want to add the padding-bottom if the bottom nav is visible
  const showBottomNav = !pathname.startsWith('/admin') && !pathname.startsWith('/login');

  return (
    <>
      <main className={cn(showBottomNav && "pb-20")}>{children}</main>
      {showBottomNav && <BottomNav />}
    </>
  );
}
