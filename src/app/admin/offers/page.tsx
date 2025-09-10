
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
import { PlaceHolderImages } from '@/lib/placeholder-images';

const PRODUCTS_STORAGE_KEY = 'admin_products';
const CATEGORIES_STORAGE_KEY = 'admin_categories';
const IMAGE_STORAGE_PREFIX = 'product_image_';

type OfferInput = {
  productId: string;
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
      if (storedProducts) {
        const parsedProducts: Product[] = JSON.parse(storedProducts);
        setProducts(parsedProducts);
        // Initialize offerInputs from stored product offers
        const initialInputs: { [productId: string]: Partial<OfferInput> } = {};
        parsedProducts.forEach(p => {
            if (p.offer) {
                initialInputs[p.id] = { type: p.offer.type, value: p.offer.value.toString() };
            }
        });
        setOfferInputs(initialInputs);
      }

      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.warn("Could not access localStorage. Using empty lists.");
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

  const handleInputChange = (productId: string, field: keyof Offer, value: string) => {
    setOfferInputs(prev => ({
        ...prev,
        [productId]: { ...prev[productId], [field]: value }
    }));
  };

  const handleSaveOffer = (productId: string) => {
    const input = offerInputs[productId];
    const value = parseFloat(input?.value || '');

    if (!input || !input.type || isNaN(value) || value <= 0) {
        // Clear the offer if input is invalid or empty
        const updatedProducts = products.map(p => 
            p.id === productId ? { ...p, offer: null } : p
        );
        updateAndPersistProducts(updatedProducts);
        setOfferInputs(prev => {
            const newInputs = { ...prev };
            delete newInputs[productId];
            return newInputs;
        });
        toast({
            title: 'Offer Removed',
            description: 'Offer details cleared for the product.',
        });
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
        description: 'Special offer saved successfully.',
    });
  };


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
                <TableHead className='w-[120px]'>Offer Type</TableHead>
                <TableHead className='w-[100px]'>Value</TableHead>
                <TableHead className='w-[120px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
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
                         value={offerInputs[product.id]?.type || product.offer?.type || 'percentage'}
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
                           value={offerInputs[product.id]?.value || ''}
                           onChange={(e) => handleInputChange(product.id, 'value', e.target.value)}
                        />
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSaveOffer(product.id)}>Save</Button>
                    </TableCell>
                  </TableRow>
                ))
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
