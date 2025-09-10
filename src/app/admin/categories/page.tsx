
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categories as initialCategories, type Category } from '@/lib/data';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  image: z.any(),
});

const STORAGE_KEY = 'admin_categories';
const IMAGE_STORAGE_PREFIX = 'category_image_';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    try {
      const storedCategories = localStorage.getItem(STORAGE_KEY);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(initialCategories);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCategories));
      }
    } catch (error) {
      console.warn("Could not access localStorage. Using initial categories.");
      setCategories(initialCategories);
    }
  }, []);

  const updateAndPersistCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
    } catch (error) {
        console.warn("Could not save categories to localStorage.");
    }
  };


  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
  });
  
  const handleAddNew = () => {
    setEditingCategory(null);
    form.reset({ name: '', slug: '', image: null });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      slug: category.slug,
      image: null
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    updateAndPersistCategories(categories.filter((c) => c.id !== categoryId));
     try {
      localStorage.removeItem(`${IMAGE_STORAGE_PREFIX}${categoryId}`);
    } catch (error) {
      console.warn(`Could not remove image for category ${categoryId} from localStorage`);
    }
  };

  const getCategoryImage = (category: Category) => {
    try {
        const storedImage = localStorage.getItem(`${IMAGE_STORAGE_PREFIX}${category.id}`);
        if (storedImage) {
            return storedImage;
        }
    } catch (error) {
        console.warn("Could not access localStorage for images");
    }
    const placeholder = PlaceHolderImages.find((img) => img.id === category.imageId);
    return placeholder?.imageUrl;
  }

  const onSubmit = (data: z.infer<typeof categorySchema>) => {
    const categoryId = editingCategory ? editingCategory.id : Date.now().toString();
    let imageId = editingCategory ? editingCategory.imageId : '';

     if (data.image && data.image.length > 0) {
      const file = data.image[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        try {
            localStorage.setItem(`${IMAGE_STORAGE_PREFIX}${categoryId}`, base64String);
            imageId = `local_${categoryId}`; // Mark that we are using a local image
            
            const finalCategoryData = { ...data, id: categoryId, imageId: imageId };
            
            let newCategories;
            if (editingCategory) {
              newCategories = categories.map((c) => c.id === categoryId ? { ...c, ...finalCategoryData } : c);
            } else {
              newCategories = [...categories, finalCategoryData];
            }
            updateAndPersistCategories(newCategories);
        } catch (error) {
            console.error("Could not save image to localStorage", error);
        }
      };
      reader.readAsDataURL(file);
    } else if (!editingCategory) {
        const categoryImages = PlaceHolderImages.filter(img => img.id.startsWith('category-'));
        const randomImage = categoryImages[Math.floor(Math.random() * categoryImages.length)];
        imageId = randomImage.id;
    }

    if (!data.image || data.image.length === 0) {
        const categoryData = { ...data, id: categoryId, imageId: imageId };
        let newCategories;
        if (editingCategory) {
          newCategories = categories.map((c) =>
              c.id === editingCategory.id ? { ...c, ...categoryData } : c
            );
        } else {
          newCategories = [
            ...categories,
            categoryData,
          ];
        }
        updateAndPersistCategories(newCategories);
    }
    
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
            form.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Image</FormLabel>
                      <FormControl>
                          <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit">
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
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
                <TableHead>Slug</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const imageUrl = getCategoryImage(category);
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={category.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(category.id)}
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
