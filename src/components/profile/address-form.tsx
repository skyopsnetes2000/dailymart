'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import { Loader2, LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export const AddressSchema = z.object({
  line1: z.string().min(1, 'Address is required.'),
  landmark: z.string().optional(),
  city: z.string().min(1, 'City is required.'),
  state: z.string().min(1, 'State is required.'),
  zip: z.string().min(1, 'ZIP code is required.'),
  mobile: z.string().min(10, 'A valid mobile number is required.'),
  isDefault: z.boolean().default(false),
});

type AddressFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: z.infer<typeof AddressSchema>) => void;
  address: z.infer<typeof AddressSchema> & { id: string } | null;
};

export function AddressForm({ isOpen, onClose, onSave, address }: AddressFormProps) {
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  
  const form = useForm<z.infer<typeof AddressSchema>>({
    resolver: zodResolver(AddressSchema),
    defaultValues: address || {
      line1: '',
      landmark: '',
      city: '',
      state: '',
      zip: '',
      mobile: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    form.reset(address || {
      line1: '',
      landmark: '',
      city: '',
      state: '',
      zip: '',
      mobile: '',
      isDefault: false,
    });
  }, [address, form]);


  const onSubmit = (data: z.infer<typeof AddressSchema>) => {
    onSave(data);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd use a reverse geocoding service here.
          // For now, we'll just fill in with placeholder data.
          form.setValue('line1', '1600 Amphitheatre Parkway');
          form.setValue('city', 'Mountain View');
          form.setValue('state', 'CA');
          form.setValue('zip', '94043');
          setIsLocating(false);
          toast({ title: "Location Filled", description: "Address details have been pre-filled." });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({ title: "Error", description: "Could not retrieve your location.", variant: "destructive" });
          setIsLocating(false);
        }
      );
    } else {
      toast({ title: "Error", description: "Geolocation is not supported by your browser.", variant: "destructive" });
      setIsLocating(false);
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{address ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>
            {address ? 'Update your address details.' : 'Add a new address to your profile.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[60vh] p-1">
              <div className='space-y-4 p-4'>
                <Button type="button" variant="outline" className="w-full" onClick={handleUseCurrentLocation} disabled={isLocating}>
                  {isLocating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LocateFixed className="mr-2 h-4 w-4" />
                  )}
                  Use My Current Location
                </Button>
                <FormField
                  control={form.control}
                  name="line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="landmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landmark (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Near the park" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Anytown" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="123-456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Set as default address
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4 px-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Address</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
