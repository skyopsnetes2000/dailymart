

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
import { type Product, type Category } from '@/lib/data';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { addProduct, deleteProduct, getCategories, getProducts, updateProduct, uploadImage } from '@/lib/firestore';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  weight: z.string().min(1, 'Weight is required'),
  categorySlug: z.string().min(1, 'Category is required'),
  image: z.any(),
});


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
        const productsData = await getProducts();
        const categoriesData = await getCategories();
        setProducts(productsData);
        setCategories(categoriesData);
    };
    fetchProductsAndCategories();
  }, []);

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

  const handleDelete = async (productId: string) => {
    try {
        await deleteProduct(productId);
        setProducts(products.filter((p) => p.id !== productId));
        toast({ title: "Success", description: "Product deleted." });
    } catch (error) {
        toast({ title: "Error", description: "Could not delete product.", variant: "destructive" });
    }
  };

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    try {
      let imageUrl: string | undefined = editingProduct?.imageId;

      if (data.image && data.image.length > 0) {
        const file = data.image[0];
        const uploadResult = await uploadImage(file, 'products');
        imageUrl = uploadResult.url;
      } else if (!editingProduct) {
        const productImages = PlaceHolderImages.filter(img => img.id.startsWith('product-'));
        const randomImage = productImages[Math.floor(Math.random() * productImages.length)];
        imageUrl = randomImage.imageUrl;
      }
      
      const productData: Omit<Product, 'id'> = {
        name: data.name,
        description: data.description,
        price: data.price,
        weight: data.weight,
        categorySlug: data.categorySlug,
        imageId: imageUrl || (editingProduct?.imageId ?? ''),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, { ...productData, imageId: imageUrl || editingProduct.imageId });
        setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...productData, imageId: imageUrl || editingProduct.imageId } : p));
        toast({ title: "Success", description: "Product updated." });
      } else {
        const newProductId = await addProduct(productData);
        setProducts([...products, { ...productData, id: newProductId }]);
        toast({ title: "Success", description: "Product created." });
      }

      setIsDialogOpen(false);
    } catch (error) {
       console.error("Failed to save product:", error);
       toast({ title: "Error", description: "An error occurred while saving the product.", variant: "destructive" });
    }
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
                return (
                  <TableRow key={product.id}>
                     <TableCell>
                      {product.imageId && (
                        <Image
                          src={product.imageId}
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
}
