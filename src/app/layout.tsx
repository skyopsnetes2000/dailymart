
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import BottomNav from '@/components/shared/bottom-nav';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Poppins } from 'next/font/google';
import ThemeProvider from '@/components/theme-provider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});


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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF8C00" />
      </head>
      <body className={cn(poppins.variable, "font-body antialiased")}>
        <ThemeProvider>
          <div className={cn(showBottomNav && "pb-20")}>{children}</div>
          <Toaster />
          {showBottomNav && <BottomNav />}
        </ThemeProvider>
      </body>
    </html>
  );
}
