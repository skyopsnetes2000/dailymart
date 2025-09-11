
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Product, Category, Offer } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, Trash2 } from 'lucide-react';
import { getCategories, getProducts, updateProductOffer, updateMultipleProductOffers } from '@/lib/firestore';
import { Checkbox } from '@/components/ui/checkbox';

type OfferInput = {
  type: 'percentage' | 'fixed';
  value: string;
};

export default function AdminOffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [offerInputs, setOfferInputs] = useState<{ [productId: string]: Partial<OfferInput> }>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkOffer, setBulkOffer] = useState<OfferInput>({ type: 'percentage', value: '' });
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOffersData = async () => {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        // Products will be fetched when a category is selected
    }
    fetchOffersData();
  }, []);

  useEffect(() => {
    const fetchProductsForCategory = async () => {
        if (!selectedCategory) {
            setProducts([]);
            return;
        }
        const productsData = await getProducts(selectedCategory);
        setProducts(productsData);
        setSelectedProducts([]);

        const initialInputs: { [productId: string]: Partial<OfferInput> } = {};
        productsData.forEach((p: Product) => {
            if (p.offer) {
                initialInputs[p.id] = { type: p.offer.type, value: p.offer.value.toString() };
            } else {
                initialInputs[p.id] = { type: 'percentage', value: '' };
            }
        });
        setOfferInputs(initialInputs);
    };
    fetchProductsForCategory();
  }, [selectedCategory])

  const handleInputChange = (productId: string, field: keyof OfferInput, value: string) => {
    setOfferInputs(prev => ({
        ...prev,
        [productId]: { ...prev[productId], [field]: value }
    }));
  };

  const handleSaveOrUpdateOffer = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const input = offerInputs[productId];
    if (!input || !input.value || !input.type) {
        toast({ title: 'Invalid Input', description: 'Please provide a valid offer type and value.', variant: 'destructive'});
        return;
    }

    const value = parseFloat(input.value);
    if (isNaN(value) || value <= 0) {
       toast({ title: 'Invalid Value', description: 'Please enter a positive number for the offer.', variant: 'destructive'});
       return;
    }
    
    const newOffer: Offer = {
        type: input.type,
        value: value,
    };
    
    try {
        await updateProductOffer(productId, newOffer);
        const updatedProducts = products.map(p => 
            p.id === productId ? { ...p, offer: newOffer } : p
        );
        setProducts(updatedProducts);
        toast({
            title: 'Success',
            description: `Special offer ${product.offer ? 'updated' : 'added'} successfully.`,
        });
    } catch (error) {
        toast({ title: 'Error', description: 'Could not save the offer.', variant: 'destructive'});
    }
  };

  const handleRemoveOffer = async (productId: string) => {
      try {
        await updateProductOffer(productId, null);
        const updatedProducts = products.map(p => 
            p.id === productId ? { ...p, offer: undefined } : p
        );
        setProducts(updatedProducts);

        setOfferInputs(prev => ({
            ...prev,
            [productId]: { ...prev[productId], value: '' }
        }));
        toast({
            title: 'Offer Removed',
            description: 'The special offer has been removed from the product.',
        });
      } catch (error) {
         toast({ title: 'Error', description: 'Could not remove the offer.', variant: 'destructive'});
      }
  }
  
  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(prev => 
        checked ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };
  
  const handleSelectAll = (checked: boolean) => {
    setSelectedProducts(checked ? products.map(p => p.id) : []);
  };
  
  const handleApplyBulkOffer = async () => {
    if (!bulkOffer.value || !bulkOffer.type) {
        toast({ title: 'Invalid Input', description: 'Please provide a valid bulk offer type and value.', variant: 'destructive'});
        return;
    }
    const value = parseFloat(bulkOffer.value);
    if (isNaN(value) || value <= 0) {
       toast({ title: 'Invalid Value', description: 'Please enter a positive number for the bulk offer.', variant: 'destructive'});
       return;
    }

    setIsBulkSubmitting(true);
    const newOffer: Offer = { type: bulkOffer.type, value };
    
    try {
        await updateMultipleProductOffers(selectedProducts, newOffer);
        const updatedProducts = products.map(p => 
            selectedProducts.includes(p.id) ? { ...p, offer: newOffer } : p
        );
        setProducts(updatedProducts);
        toast({ title: 'Success', description: `Offer applied to ${selectedProducts.length} products.` });
        setSelectedProducts([]);
    } catch (error) {
        toast({ title: 'Error', description: 'Could not apply bulk offer.', variant: 'destructive' });
    } finally {
        setIsBulkSubmitting(false);
    }
  };
  
  const handleRemoveBulkOffer = async () => {
    setIsBulkSubmitting(true);
    try {
        await updateMultipleProductOffers(selectedProducts, null);
        const updatedProducts = products.map(p => 
            selectedProducts.includes(p.id) ? { ...p, offer: undefined } : p
        );
        setProducts(updatedProducts);
        toast({ title: 'Success', description: `Offers removed from ${selectedProducts.length} products.` });
        setSelectedProducts([]);
    } catch (error) {
        toast({ title: 'Error', description: 'Could not remove bulk offers.', variant: 'destructive' });
    } finally {
        setIsBulkSubmitting(false);
    }
  };

  const getProductImage = (product: Product) => {
    if (product.imageUrls && product.imageUrls.length > 0) {
      return product.imageUrls[0];
    }
    return 'https://placehold.co/40';
  }

  const filteredProducts = products;
  const isAllSelected = filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Special Offers</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Select a Category</CardTitle>
          <Select onValueChange={setSelectedCategory} value={selectedCategory}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Choose a category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {selectedProducts.length > 0 && (
            <Card className="mb-6 bg-muted/50">
              <CardHeader>
                <CardTitle className='text-lg'>{selectedProducts.length} Product(s) Selected</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-end gap-4">
                 <div className="grid gap-2">
                    <label>Offer Type</label>
                    <Select value={bulkOffer.type} onValueChange={value => setBulkOffer(prev => ({...prev, type: value as 'percentage' | 'fixed'}))}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed ($)</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="grid gap-2">
                    <label>Value</label>
                    <Input 
                        type="number" 
                        placeholder="e.g., 15" 
                        className="w-[120px]" 
                        value={bulkOffer.value}
                        onChange={e => setBulkOffer(prev => ({...prev, value: e.target.value}))}
                    />
                 </div>
                 <div className="flex gap-2">
                    <Button onClick={handleApplyBulkOffer} disabled={isBulkSubmitting}>
                        {isBulkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Apply Offer
                    </Button>
                    <Button variant="destructive" onClick={handleRemoveBulkOffer} disabled={isBulkSubmitting}>
                        {isBulkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              </CardContent>
            </Card>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'>
                    <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                        aria-label="Select all"
                    />
                </TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className='w-[150px]'>Offer Type</TableHead>
                <TableHead className='w-[120px]'>Value</TableHead>
                <TableHead className='text-right w-[200px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                    const currentOffer = product.offer;
                    const hasOffer = currentOffer && currentOffer.value > 0;
                    return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox 
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={(checked) => handleSelectProduct(product.id, Boolean(checked))}
                            aria-label={`Select ${product.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                            src={getProductImage(product)}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                        />
                      </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                       <Select
                         value={offerInputs[product.id]?.type || 'percentage'}
                         onValueChange={(value) => handleInputChange(product.id, 'type', value as 'percentage' | 'fixed')}
                       >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="fixed">Fixed ($)</SelectItem>
                            </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell>
                        <Input 
                           type="number"
                           placeholder="e.g., 10"
                           value={offerInputs[product.id]?.value ?? ''}
                           onChange={(e) => handleInputChange(product.id, 'value', e.target.value)}
                        />
                    </TableCell>
                    <TableCell className="text-right">
                        <div className='flex gap-2 justify-end'>
                            {hasOffer ? (
                                <>
                                    <Button size="sm" onClick={() => handleSaveOrUpdateOffer(product.id)}>Update</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleRemoveOffer(product.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                 <Button size="sm" onClick={() => handleSaveOrUpdateOffer(product.id)}>Add Offer</Button>
                            )}
                        </div>
                    </TableCell>
                  </TableRow>
                )})
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    {selectedCategory ? 'No products in this category.' : 'Please select a category to see products.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    