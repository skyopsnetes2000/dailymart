'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

type Address = {
  id: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

export default function AddressManager({ addresses }: { addresses: Address[] }) {
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
          <CardContent className="flex gap-2">
            <Button variant="ghost" size="sm">Edit</Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" /> Add New Address
      </Button>
    </div>
  );
}
