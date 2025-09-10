'use client';

import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { user as staticUser, type Address } from '@/lib/data';

const STORAGE_KEY = 'user_addresses';

export default function HomeHeader() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    let storedAddresses: Address[] = [];
    try {
      const storedAddressesRaw = localStorage.getItem(STORAGE_KEY);
      if (storedAddressesRaw) {
        storedAddresses = JSON.parse(storedAddressesRaw);
      } else {
        storedAddresses = staticUser.addresses;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(staticUser.addresses));
      }
    } catch (error) {
      console.warn("Could not access localStorage. Using initial addresses.");
      storedAddresses = staticUser.addresses;
    }

    setAddresses(storedAddresses);
    const defaultAddress = storedAddresses.find(addr => addr.isDefault) || storedAddresses[0] || null;
    setSelectedAddress(defaultAddress);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-background/80 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <UtensilsCrossed className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-2xl font-bold text-primary">DailyMart</h1>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Deliver to: </span>
              {selectedAddress ? (
                <>
                  <span className="font-semibold">{selectedAddress.city}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </>
              ) : (
                <span className="font-semibold">Set Location</span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-lg">
            <SheetHeader>
              <SheetTitle>Choose your location</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-2">
              {addresses.map((address) => (
                <SheetTrigger asChild key={address.id}>
                  <Button
                    variant={selectedAddress?.id === address.id ? 'default' : 'outline'}
                    onClick={() => setSelectedAddress(address)}
                    className="justify-start p-4 text-left h-auto"
                  >
                    <div className="flex flex-col">
                      <span>{address.line1}</span>
                      <span className="text-sm text-muted-foreground">{address.city}, {address.state}</span>
                    </div>
                  </Button>
                </SheetTrigger>
              ))}
               {addresses.length === 0 && (
                <p className="text-center text-muted-foreground p-4">You have no saved addresses. Please add one in your profile.</p>
               )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
