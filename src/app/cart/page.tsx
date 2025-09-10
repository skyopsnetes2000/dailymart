
'use client';

import Link from 'next/link';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import useCart from '@/hooks/use-cart';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { calculateDiscountedPrice } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const subtotal = items.reduce((total, item) => {
    const price = calculateDiscountedPrice(item.product) ?? item.product.price;
    return total + price * item.quantity;
  }, 0);

  if (!isClient) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Shopping Cart" />
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Shopping Cart">
        <Button variant="outline" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </PageHeader>
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {items.map(({ product, quantity }) => {
            const finalPrice = calculateDiscountedPrice(product) ?? product.price;
            return (
              <Card key={product.id} className="flex items-center gap-4 p-4">
                <Image
                  src={product.imageId}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover"
                />
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">${finalPrice.toFixed(2)}</p>
                    {product.offer && <p className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(product.id, quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span>{quantity}</span>
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(product.id, quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-muted-foreground" onClick={() => removeItem(product.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </Card>
            )
          })}
        </div>
        
        <Card className="mt-6">
          <CardContent className="p-6 space-y-4">
             <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
             <div className="flex justify-between text-muted-foreground">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
            </div>
             <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
