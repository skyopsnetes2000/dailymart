
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page now simply redirects to the new 'all' products page.
export default function ProductsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/products/all');
  }, [router]);

  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
