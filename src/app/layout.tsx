
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Poppins } from 'next/font/google';
import ThemeProvider from '@/components/theme-provider';
import LayoutProvider from '@/components/layout-provider';

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
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF8C00" />
      </head>
      <body className={cn(poppins.variable, "font-body antialiased")}>
        <ThemeProvider>
          <LayoutProvider>
            {children}
          </LayoutProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
