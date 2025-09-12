

'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import useCart from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { type Order, type Address } from '@/lib/data';
import type { z } from 'zod';

import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, LogIn } from 'lucide-react';
import { AddressForm, AddressSchema } from '@/components/profile/address-form';
import { calculateDiscountedPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { addOrder, getAddresses, addAddress } from '@/lib/firestore';


const MINIMUM_ORDER_VALUE = 149;

export default function CheckoutPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?tab=login&redirect=/checkout');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder) {
      router.replace('/cart');
    }
    
    const newSubtotal = items.reduce((total, item) => {
        const price = calculateDiscountedPrice(item.product) ?? item.product.price;
        return total + price * item.quantity;
    }, 0);
    setSubtotal(newSubtotal);

  }, [items, router, isPlacingOrder]);

  useEffect(() => {
    async function fetchAddresses() {
        if (user) {
            const userAddresses = await getAddresses(user.uid);
            setAddresses(userAddresses);
            const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
            }
        }
    }
    fetchAddresses();
  }, [user]);

  const handleSaveAddress = async (data: z.infer<typeof AddressSchema>) => {
      if (!user) return;
      const newAddressId = await addAddress(user.uid, data);
      const newAddress: Address = { id: newAddressId, ...data };
      
      let updatedAddresses = [...addresses, newAddress];
       if (data.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({...addr, isDefault: addr.id === newAddress.id }));
      }
      setAddresses(updatedAddresses);
      setSelectedAddressId(newAddress.id);
      setIsFormOpen(false);
  };

  const isOrderValueMet = subtotal >= MINIMUM_ORDER_VALUE;
  const amountNeeded = MINIMUM_ORDER_VALUE - subtotal;

  const handlePlaceOrder = async () => {
    if (!isOrderValueMet) {
        toast({ title: "Minimum Order Value", description: `You need to add ₹${amountNeeded.toFixed(2)} more to place an order.`, variant: "destructive"});
        return;
    }
    if (!selectedAddressId) {
        toast({ title: "Address Required", description: "Please select a delivery address.", variant: "destructive"});
        return;
    }
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddress || !user) {
        toast({ title: "Error", description: "Could not find selected address or user.", variant: "destructive"});
        return;
    }

    setIsPlacingOrder(true);
    
    try {
      const newOrder: Omit<Order, 'id'> = {
        userId: user.uid,
        date: new Date().toISOString(),
        status: 'Pending',
        total: subtotal,
        items: items.map(item => ({ productName: item.product.name, quantity: item.quantity })),
        trackingHistory: [{ status: 'Pending', date: new Date().toISOString() }],
        customerName: user.displayName || 'Guest User',
        shippingAddress: selectedAddress,
      };

      await addOrder(newOrder);

      toast({
          title: "Order Placed!",
          description: "Your order has been successfully placed."
      });
      clearCart();
      router.push('/orders');
    } catch (error) {
      console.error("Failed to save order", error);
      toast({
        title: 'Error',
        description: 'There was a problem placing your order.',
        variant: 'destructive',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
       <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center p-4">
            <LogIn className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Login to Checkout</h2>
            <p className="text-muted-foreground">You need to be logged in to place an order.</p>
            <Button asChild>
                <Link href="/login?tab=login&redirect=/checkout">Login</Link>
            </Button>
        </div>
    )
  }

  return (
    <div>
      <PageHeader title="Checkout" />
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
              <CardDescription>Select where you'd like your order delivered.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAddressId || ''} onValueChange={setSelectedAddressId} className="space-y-4">
                {addresses.map(address => (
                  <Label key={address.id} htmlFor={address.id} className="flex items-start gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/80">
                    <RadioGroupItem value={address.id} id={address.id} />
                    <div className="flex-1 text-sm">
                          <div className="flex justify-between">
                              <p className="font-semibold">{address.line1}</p>
                              {address.isDefault && <Badge variant="outline">Default</Badge>}
                          </div>
                          <p className="text-muted-foreground">{address.city}, {address.state} {address.zip}</p>
                          <p className="text-muted-foreground">{address.mobile}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
              <Button variant="outline" className="w-full mt-4" onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Address
              </Button>
            </CardContent>
          </Card>
          
          <AddressForm 
              isOpen={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              onSave={handleSaveAddress}
              address={null}
          />

          <Card>
              <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                      <span>Taxes & Fees</span>
                      <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>₹0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                   {!isOrderValueMet && (
                        <div className="text-center text-sm text-destructive font-medium p-2 rounded-md bg-destructive/10">
                            You need ₹{amountNeeded.toFixed(2)} more for a minimum order of ₹{MINIMUM_ORDER_VALUE}.
                        </div>
                   )}
              </CardContent>
              <CardFooter className="flex-col gap-2">
                  <Button className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder || items.length === 0 || !isOrderValueMet}>
                      {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      COD
                  </Button>
                  <Button variant="outline" className="w-full" disabled={true}>
                      Pay Online
                  </Button>
              </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
