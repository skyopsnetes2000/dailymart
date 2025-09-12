
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import BottomNav from '@/components/shared/bottom-nav';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  // We only want to add the padding-bottom if the bottom nav is visible
  const showBottomNav = !pathname.startsWith('/admin') && pathname !== '/login';

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'system';
     if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
  }, []);
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF8C00" />
      </head>
      <body className="font-body antialiased">
        <div className={cn(showBottomNav && "pb-20")}>{children}</div>
        <Toaster />
        {showBottomNav && <BottomNav />}
      </body>
    </html>
  );
}
