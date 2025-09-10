
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import useCart from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { user as staticUser } from '@/lib/data';
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


type Address = z.infer<typeof AddressSchema> & { id: string };
const ADDRESS_STORAGE_KEY = 'user_addresses';


export default function CheckoutPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?tab=login&redirect=/checkout');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder) {
      router.replace('/cart');
    }
  }, [items, router, isPlacingOrder]);

  useEffect(() => {
    try {
      const storedAddressesRaw = localStorage.getItem(ADDRESS_STORAGE_KEY);
      const storedAddresses = storedAddressesRaw ? JSON.parse(storedAddressesRaw) : staticUser.addresses;
      setAddresses(storedAddresses);

      const defaultAddress = storedAddresses.find((addr: Address) => addr.isDefault) || storedAddresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.warn("Could not access localStorage. Using initial addresses.");
      setAddresses(staticUser.addresses);
      const defaultAddress = staticUser.addresses.find(addr => addr.isDefault) || staticUser.addresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, []);

  const updateAndPersistAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    try {
        localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(newAddresses));
    } catch (error) {
        console.warn("Could not save addresses to localStorage.");
    }
  };

  const handleSaveAddress = (data: z.infer<typeof AddressSchema>) => {
      const newAddress: Address = { id: Date.now().toString(), ...data };
      const newAddresses = [...addresses, newAddress];
      if (data.isDefault) {
        const finalAddresses = newAddresses.map(addr => ({...addr, isDefault: addr.id === newAddress.id }));
        updateAndPersistAddresses(finalAddresses);
        setSelectedAddressId(newAddress.id);
      } else {
        updateAndPersistAddresses(newAddresses);
        setSelectedAddressId(newAddress.id);
      }
      setIsFormOpen(false);
  };


  const subtotal = items.reduce((total, item) => {
    const price = calculateDiscountedPrice(item.product) ?? item.product.price;
    return total + price * item.quantity;
  }, 0);

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
        toast({ title: "Address Required", description: "Please select a delivery address.", variant: "destructive"});
        return;
    }
    setIsPlacingOrder(true);
    // In a real app, you would process payment here.
    setTimeout(() => {
        toast({
            title: "Order Placed!",
            description: "Your order has been successfully placed."
        });
        clearCart();
        router.push('/orders');
        setIsPlacingOrder(false);
    }, 1500);
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
      <div className="p-4 sm:p-6 space-y-6">
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
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Taxes & Fees</span>
                    <span>$0.00</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                    {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Place Order
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
