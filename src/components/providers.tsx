
'use client';

import ThemeProvider from '@/components/theme-provider';
import LayoutProvider from '@/components/layout-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <LayoutProvider>
                {children}
            </LayoutProvider>
        </ThemeProvider>
    )
}
