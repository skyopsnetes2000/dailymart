'use client';

import { useState } from 'react';
import { MapPin, ChevronDown, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const locations = ['Greenfield, CA', 'Spring Valley, CA', 'Northwood, CA'];

export default function HomeHeader() {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);

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
              <span className="font-semibold">{selectedLocation.split(',')[0]}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-lg">
            <SheetHeader>
              <SheetTitle>Choose your location</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-2">
              {locations.map((location) => (
                <SheetTrigger asChild key={location}>
                  <Button
                    variant={selectedLocation === location ? 'default' : 'outline'}
                    onClick={() => setSelectedLocation(location)}
                    className="justify-start p-4 text-left"
                  >
                    {location}
                  </Button>
                </SheetTrigger>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
