import Link from 'next/link';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export default function CartPage() {
  return (
    <div>
      <PageHeader title="Shopping Cart" />
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
