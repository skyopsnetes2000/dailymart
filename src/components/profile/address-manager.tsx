'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AddressForm, AddressSchema } from './address-form';
import type { z } from 'zod';
import { user as staticUser } from '@/lib/data';

type Address = z.infer<typeof AddressSchema> & { id: string };

const STORAGE_KEY = 'user_addresses';

export default function AddressManager({ addresses: initialAddresses }: { addresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    try {
      const storedAddresses = localStorage.getItem(STORAGE_KEY);
      if (storedAddresses) {
        setAddresses(JSON.parse(storedAddresses));
      } else {
        // If nothing in storage, initialize with static data and save it.
        setAddresses(staticUser.addresses);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(staticUser.addresses));
      }
    } catch (error) {
        // If localStorage is not available, fall back to initial props
        console.warn("Could not access localStorage. Using initial addresses.");
        setAddresses(initialAddresses);
    }
  }, [initialAddresses]);

  const updateAndPersistAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAddresses));
    } catch (error) {
        console.warn("Could not save addresses to localStorage.");
    }
  };

  const handleAddNew = () => {
    if (addresses.length >= 6) {
      alert("You can only add a maximum of 6 addresses.");
      return;
    }
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleDelete = (addressId: string) => {
    const newAddresses = addresses.filter(addr => addr.id !== addressId);
    updateAndPersistAddresses(newAddresses);
  };
  
  const handleSetDefault = (addressId: string) => {
    const newAddresses = addresses.map(addr => ({ ...addr, isDefault: addr.id === addressId }));
    updateAndPersistAddresses(newAddresses);
  };

  const handleSaveAddress = (data: z.infer<typeof AddressSchema>) => {
    let newAddresses;
    let newAddressId = editingAddress ? editingAddress.id : Date.now().toString();

    if (editingAddress) {
      // Update existing address
      newAddresses = addresses.map(addr => addr.id === editingAddress.id ? { ...addr, ...data } : addr);
    } else {
      // Add new address
      const newAddress: Address = {
        id: newAddressId,
        ...data,
      };
      newAddresses = [...addresses, newAddress];
    }
    
    if (data.isDefault) {
        newAddresses = newAddresses.map(addr => ({ ...addr, isDefault: addr.id === newAddressId }));
    }

    updateAndPersistAddresses(newAddresses);
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <Card key={address.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">
                  {address.line1}
                </CardTitle>
                <CardDescription>
                  {address.city}, {address.state} {address.zip}
                </CardDescription>
                 <CardDescription>
                  {address.mobile}
                </CardDescription>
              </div>
              {address.isDefault && <Badge variant="outline">Default</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex gap-2 items-center">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(address)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this address.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(address.id)}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {!address.isDefault && (
                <Button variant="ghost" size="sm" onClick={() => handleSetDefault(address.id)}>Set as Default</Button>
            )}
          </CardContent>
        </Card>
      ))}

      <AddressForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveAddress}
        address={editingAddress}
      />
      
      <Button variant="outline" className="w-full" onClick={handleAddNew} disabled={addresses.length >= 6}>
        <Plus className="mr-2 h-4 w-4" /> Add New Address
      </Button>
    </div>
  );
}
