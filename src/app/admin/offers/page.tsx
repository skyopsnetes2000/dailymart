
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
import { Product, Category, Offer, products as initialProducts, categories as initialCategories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Trash2 } from 'lucide-react';

const PRODUCTS_STORAGE_KEY = 'admin_products';
const CATEGORIES_STORAGE_KEY = 'admin_categories';
const IMAGE_STORAGE_PREFIX = 'product_image_';

type OfferInput = {
  type: 'percentage' | 'fixed';
  value: string;
};

export default function AdminOffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [offerInputs, setOfferInputs] = useState<{ [productId: string]: Partial<OfferInput> }>({});
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      const productsData = storedProducts ? JSON.parse(storedProducts) : initialProducts;
      setProducts(productsData);

      const initialInputs: { [productId: string]: Partial<OfferInput> } = {};
      productsData.forEach((p: Product) => {
          if (p.offer) {
              initialInputs[p.id] = { type: p.offer.type, value: p.offer.value.toString() };
          } else {
              initialInputs[p.id] = { type: 'percentage', value: '' };
          }
      });
      setOfferInputs(initialInputs);
      
      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      setCategories(storedCategories ? JSON.parse(storedCategories) : initialCategories);
      
    } catch (error) {
      console.warn("Could not access localStorage. Using initial data.");
       setProducts(initialProducts);
       setCategories(initialCategories);
    }
  }, []);

  const updateAndPersistProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
    } catch (error) {
      console.error("Could not save products to localStorage", error);
      toast({
        title: 'Error',
        description: 'Could not save your changes.',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (productId: string, field: keyof OfferInput, value: string) => {
    setOfferInputs(prev => ({
        ...prev,
        [productId]: { ...prev[productId], [field]: value }
    }));
  };

  const handleSaveOrUpdateOffer = (productId: string) => {
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

    const updatedProducts = products.map(p => 
        p.id === productId ? { ...p, offer: newOffer } : p
    );
    updateAndPersistProducts(updatedProducts);
    toast({
        title: 'Success',
        description: `Special offer ${product.offer ? 'updated' : 'added'} successfully.`,
    });
  };

  const handleRemoveOffer = (productId: string) => {
      const updatedProducts = products.map(p => 
            p.id === productId ? { ...p, offer: null } : p
        );
        updateAndPersistProducts(updatedProducts);

        setOfferInputs(prev => ({
            ...prev,
            [productId]: { ...prev[productId], value: '' }
        }));
        toast({
            title: 'Offer Removed',
            description: 'The special offer has been removed from the product.',
        });
  }

  const getProductImage = (product: Product) => {
    try {
        const storedImage = localStorage.getItem(`${IMAGE_STORAGE_PREFIX}${product.id}`);
        if (storedImage) {
            return storedImage;
        }
    } catch (error) {
        console.warn("Could not access localStorage for images");
    }
    const placeholder = PlaceHolderImages.find((img) => img.id === product.imageId);
    return placeholder?.imageUrl;
  }

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categorySlug === selectedCategory)
    : [];

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
          <Table>
            <TableHeader>
              <TableRow>
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
                        <Image
                            src={getProductImage(product) || 'https://placehold.co/40'}
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
                  <TableCell colSpan={6} className="text-center">
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

