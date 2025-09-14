
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
import { type Product, type Category, type DietaryType } from '@/lib/data';
import { Loader2, Pencil, PlusCircle, Search, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { addProduct, deleteProduct, getCategories, getProducts, updateProduct, uploadImage } from '@/lib/firestore';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DietarySymbol } from '@/components/dietary-symbol';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  weight: z.string().min(1, 'Weight is required'),
  categorySlug: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  dietaryType: z.enum(['veg', 'non-veg', 'egg']).optional(),
  images: z.any(),
});


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
    setImagePreviews(product.imageUrls || []);
    form.reset({
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      weight: product.weight,
      categorySlug: product.categorySlug,
      subCategory: product.subCategory,
      dietaryType: product.dietaryType,
      images: null
    });
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingProduct(null);
    setImagePreviews([]);
    form.reset({
      name: '',
      brand: '',
      description: '',
      price: 0,
      weight: '',
      categorySlug: '',
      subCategory: '',
      dietaryType: undefined,
      images: null,
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
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      form.setValue('images', files);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImagePreviews = [...imagePreviews];
    newImagePreviews.splice(index, 1);
    setImagePreviews(newImagePreviews);

    const currentFiles = form.getValues('images');
    if (currentFiles && typeof currentFiles !== 'string') {
        const newFiles = Array.from(currentFiles);
        newFiles.splice(index, 1);
        const dataTransfer = new DataTransfer();
        newFiles.forEach(file => dataTransfer.items.add(file));
        form.setValue('images', dataTransfer.files.length > 0 ? dataTransfer.files : null);
    }
  };


  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    setIsSubmitting(true);
    try {
        let newImageUrls: string[] = editingProduct?.imageUrls || [];

        if (data.images && data.images.length > 0) {
            const uploadPromises = Array.from(data.images as FileList).map(file => uploadImage(file, 'products'));
            const uploadResults = await Promise.all(uploadPromises);
            newImageUrls = [...newImageUrls, ...uploadResults.map(res => res.url)];
        }

        if (newImageUrls.length === 0) {
            const productImages = PlaceHolderImages.filter(img => img.id.startsWith('product-'));
            const randomImage = productImages[Math.floor(Math.random() * productImages.length)];
            newImageUrls.push(randomImage.imageUrl);
        }
      
      const productData: Omit<Product, 'id'> = {
        name: data.name,
        brand: data.brand,
        description: data.description,
        price: data.price,
        weight: data.weight,
        categorySlug: data.categorySlug,
        subCategory: data.subCategory,
        dietaryType: data.dietaryType,
        imageUrls: newImageUrls,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, { ...productData });
        setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...productData } : p));
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.categorySlug === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for products..."
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select onValueChange={setSelectedCategory} defaultValue="all">
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. DailyMart Farms" {...field} />
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
                      name="subCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sub Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Leafy Greens" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dietaryType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Dietary Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex items-center space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="veg" />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center gap-2">
                                  <DietarySymbol type="veg" /> Veg
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="non-veg" />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center gap-2">
                                  <DietarySymbol type="non-veg" /> Non-Veg
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="egg" />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center gap-2">
                                  <DietarySymbol type="egg" /> Egg
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="relative">
                                    <Image src={src} alt={`Preview ${index}`} width={100} height={100} className="rounded-md object-cover w-full aspect-square" />
                                    <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => handleRemoveImage(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                      )}
                      <FormControl>
                        <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                 </div>
              </ScrollArea>
              <div className="flex justify-end px-4">
                 <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                return (
                  <TableRow key={product.id}>
                     <TableCell>
                      {product.imageUrls && product.imageUrls[0] && (
                        <Image
                          src={product.imageUrls[0]}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>₹{product.price.toFixed(2)}</TableCell>
                    <TableCell>
                        <DietarySymbol type={product.dietaryType} />
                    </TableCell>
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
