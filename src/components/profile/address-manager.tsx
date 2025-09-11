
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AddressForm, AddressSchema } from './address-form';
import type { z } from 'zod';
import { type Address } from '@/lib/data';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '@/lib/firestore';

export default function AddressManager() {
  const [user] = useAuthState(auth);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
        if (user) {
            const userAddresses = await getAddresses(user.uid);
            setAddresses(userAddresses);
        }
    };
    fetchAddresses();
  }, [user]);

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

  const handleDelete = async (addressId: string) => {
    if (!user) return;
    await deleteAddress(user.uid, addressId);
    setAddresses(addresses.filter(addr => addr.id !== addressId));
  };

  const handleSaveAddress = async (data: z.infer<typeof AddressSchema>) => {
    if (!user) return;

    if (editingAddress) {
      // Update existing address
      await updateAddress(user.uid, editingAddress.id, data);
      const updatedAddresses = addresses.map(addr => addr.id === editingAddress.id ? { ...addr, ...data } : addr);
       if (data.isDefault) {
           setAddresses(updatedAddresses.map(addr => ({ ...addr, isDefault: addr.id === editingAddress.id })));
       } else {
           setAddresses(updatedAddresses);
       }
    } else {
      // Add new address
      const newId = await addAddress(user.uid, data);
      const newAddress: Address = { id: newId, ...data };
      const newAddresses = [...addresses, newAddress];
       if (data.isDefault) {
           setAddresses(newAddresses.map(addr => ({ ...addr, isDefault: addr.id === newId })));
       } else {
           setAddresses(newAddresses);
       }
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
                <Button variant="ghost" size="sm" onClick={() => handleSaveAddress({ ...address, isDefault: true })}>Set as Default</Button>
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
