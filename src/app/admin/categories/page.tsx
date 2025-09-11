
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
import { type Category } from '@/lib/data';
import { Loader2, Pencil, PlusCircle, Search, Trash2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { addCategory, deleteCategory, getCategories, updateCategory, uploadImage } from '@/lib/firestore';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  image: z.any(),
});

function generateSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
    };
    fetchCategories();
  }, []);
  
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
  });

  const watchName = form.watch("name");
  useEffect(() => {
    if (watchName && !editingCategory) {
      form.setValue('slug', generateSlug(watchName));
    }
  }, [watchName, form, editingCategory]);
  
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

  const handleDelete = async (categoryId: string) => {
    try {
        await deleteCategory(categoryId);
        setCategories(categories.filter((c) => c.id !== categoryId));
        toast({ title: "Success", description: "Category deleted." });
    } catch (error) {
        toast({ title: "Error", description: "Could not delete category.", variant: "destructive" });
    }
  };

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined = editingCategory?.imageId;

      if (data.image && data.image.length > 0) {
        const file = data.image[0];
        const uploadResult = await uploadImage(file, 'categories');
        imageUrl = uploadResult.url; 
      } else if (!editingCategory) {
        const categoryImages = PlaceHolderImages.filter(img => img.id.startsWith('category-'));
        const randomImage = categoryImages[Math.floor(Math.random() * categoryImages.length)];
        imageUrl = randomImage.imageUrl;
      }

      const categoryData: Omit<Category, 'id'> = {
        name: data.name,
        slug: data.slug,
        imageId: imageUrl || (editingCategory?.imageId ?? ''),
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...categoryData, id: editingCategory.id } : c));
        toast({ title: "Success", description: "Category updated." });
      } else {
        const newCategoryId = await addCategory(categoryData);
        setCategories([...categories, { ...categoryData, id: newCategoryId }]);
        toast({ title: "Success", description: "Category created." });
      }

      setIsDialogOpen(false);
    } catch (error) {
       console.error("Failed to save category:", error);
       toast({ title: "Error", description: "An error occurred while saving the category.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>

       <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for categories..."
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCategory(null);
            form.reset();
          }
          setIsDialogOpen(open);
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
                      <Input {...field} readOnly={!editingCategory} />
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
              <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              {filteredCategories.map((category) => {
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.imageId && (
                        <Image
                          src={category.imageId}
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
