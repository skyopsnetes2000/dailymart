'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AddressForm, AddressSchema } from './address-form';
import type { z } from 'zod';

type Address = {
  id: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

export default function AddressManager({ addresses: initialAddresses }: { addresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

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
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
  };
  
  const handleSetDefault = (addressId: string) => {
    setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: addr.id === addressId })));
  };

  const handleSaveAddress = (data: z.infer<typeof AddressSchema>) => {
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => addr.id === editingAddress.id ? { ...addr, ...data } : addr));
    } else {
      // Add new address
      const newAddress: Address = {
        id: (addresses.length + 1).toString(),
        ...data,
      };
      setAddresses(prev => [...prev, newAddress]);
    }
    if (data.isDefault) {
        handleSetDefault(editingAddress ? editingAddress.id : (addresses.length + 1).toString());
    }
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
