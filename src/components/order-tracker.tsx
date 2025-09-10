'use client';

import { Check, Package, Truck, Home as HomeIcon } from 'lucide-react';
import type { Order } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const statusSteps = [
  { name: 'Pending', icon: Package },
  { name: 'Packed', icon: Package },
  { name: 'Out for Delivery', icon: Truck },
  { name: 'Delivered', icon: HomeIcon },
];

export default function OrderTracker({ order }: { order: Order }) {
  const currentStatusIndex = statusSteps.findIndex(step => step.name === order.status);

  return (
    <div className="flex flex-col">
      {statusSteps.map((step, index) => {
        const isCompleted = index <= currentStatusIndex;
        const trackingEvent = order.trackingHistory.find(h => h.status === step.name);

        return (
          <div key={step.name} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2',
                  isCompleted ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground'
                )}
              >
                {index < currentStatusIndex ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
              </div>
              {index < statusSteps.length - 1 && (
                <div className={cn('w-0.5 flex-1', isCompleted ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
            <div className="pb-8 pt-2">
              <p className={cn('font-semibold', isCompleted ? 'text-foreground' : 'text-muted-foreground')}>
                {step.name}
              </p>
              {trackingEvent && isCompleted && (
                 <p className="text-sm text-muted-foreground">
                    {format(new Date(trackingEvent.date), "MMM d, yyyy 'at' h:mm a")}
                 </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
