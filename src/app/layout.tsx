
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import BottomNav from '@/components/shared/bottom-nav';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  // We only want to add the padding-bottom if the bottom nav is visible
  const showBottomNav = !pathname.startsWith('/admin') && pathname !== '/login';
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className={cn(showBottomNav && "pb-20")}>{children}</div>
        <Toaster />
        {showBottomNav && <BottomNav />}
      </body>
    </html>
  );
}
