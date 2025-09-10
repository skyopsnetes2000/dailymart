
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { products as initialProducts, categories as initialCategories, type Product, type Category } from '@/lib/data';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  weight: z.string().min(1, 'Weight is required'),
  categorySlug: z.string().min(1, 'Category is required'),
  image: z.any(),
});

const PRODUCTS_STORAGE_KEY = 'admin_products';
const CATEGORIES_STORAGE_KEY = 'admin_categories';
const IMAGE_STORAGE_PREFIX = 'product_image_';


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Load products
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(initialProducts);
        if (typeof window !== 'undefined') {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
        }
      }
    } catch (error) {
      console.warn("Could not access localStorage for products. Using initial products.");
      setProducts(initialProducts);
    }
    
    // Load categories
    try {
      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(initialCategories);
         if (typeof window !== 'undefined') {
          localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(initialCategories));
        }
      }
    } catch (error) {
      console.warn("Could not access localStorage for categories. Using initial categories.");
      setCategories(initialCategories);
    }
  }, []);

  const updateAndPersistProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
    } catch (error) {
        console.warn("Could not save products to localStorage.");
    }
  };

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({...product, image: null});
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingProduct(null);
    form.reset({
      name: '',
      description: '',
      price: 0,
      weight: '',
      categorySlug: '',
      image: null,
    });
    setIsDialogOpen(true);
  }

  const handleDelete = (productId: string) => {
    updateAndPersistProducts(products.filter((p) => p.id !== productId));
    // Also remove the image from localStorage
    try {
      localStorage.removeItem(`${IMAGE_STORAGE_PREFIX}${productId}`);
    } catch (error) {
      console.warn(`Could not remove image for product ${productId} from localStorage`);
    }
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

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    const productId = editingProduct ? editingProduct.id : Date.now().toString();
    let imageId = editingProduct ? editingProduct.imageId : '';
    
    // Handle image upload
    if (data.image && data.image.length > 0) {
      const file = data.image[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        try {
            localStorage.setItem(`${IMAGE_STORAGE_PREFIX}${productId}`, base64String);
            imageId = `local_${productId}`; // Mark that we are using a local image
            
            // This part is duplicated to ensure execution after file read
            const finalProductData = {
              ...data,
              id: productId,
              imageId: imageId,
            };
            
            let newProducts;
            if (editingProduct) {
              newProducts = products.map((p) =>
                  p.id === productId ? { ...p, ...finalProductData } : p
                );
            } else {
              newProducts = [
                ...products,
                finalProductData,
              ];
            }
            updateAndPersistProducts(newProducts);
        } catch (error) {
            console.error("Could not save image to localStorage", error);
        }
      };
      reader.readAsDataURL(file);
    } else if (editingProduct) {
        // Keep existing image if not changed
        imageId = editingProduct.imageId;
    } else {
        // Assign random placeholder if it's a new product without an image
        const productImages = PlaceHolderImages.filter(img => img.id.startsWith('product-'));
        const randomImage = productImages[Math.floor(Math.random() * productImages.length)];
        imageId = randomImage.id;
    }
    
    // Save other product data immediately if no image is being uploaded
    if (!data.image || data.image.length === 0) {
        const productData = {
            ...data,
            id: productId,
            imageId: imageId,
        };
        let newProducts;
        if (editingProduct) {
          newProducts = products.map((p) =>
              p.id === editingProduct.id ? { ...p, ...productData } : p
            );
        } else {
          newProducts = [
            ...products,
            productData,
          ];
        }
        updateAndPersistProducts(newProducts);
    }
    
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <ScrollArea className="h-[60vh] p-4">
                 <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="categorySlug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <ScrollArea className="h-48">
                                {categories.map((c) => (
                                  <SelectItem key={c.id} value={c.slug}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Image</FormLabel>
                          <FormControl>
                            <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
              </ScrollArea>
              <div className="flex justify-end px-4">
                 <Button type="submit">
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const imageUrl = getProductImage(product);
                return (
                  <TableRow key={product.id}>
                     <TableCell>
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
