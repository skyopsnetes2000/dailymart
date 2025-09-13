

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Pencil, Trash2, Search, Check, Users, X } from 'lucide-react';
import { type Recipe, type Product } from '@/lib/data';
import { getRecipes, getProducts, addRecipe, updateRecipe, deleteRecipe, uploadImage } from '@/lib/firestore';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';


const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  instructions: z.string().min(1, 'Instructions are required.'),
  videoUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  image: z.any().optional(),
  productIds: z.array(z.string()).min(1, 'Please select at least one product.'),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

export default function AdminRecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { toast } = useToast();
    
    const form = useForm<RecipeFormValues>({
        resolver: zodResolver(recipeSchema),
        defaultValues: {
            title: '',
            description: '',
            instructions: '',
            videoUrl: '',
            image: null,
            productIds: [],
        },
    });

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [recipesData, productsData] = await Promise.all([
                    getRecipes(),
                    getProducts(),
                ]);
                setRecipes(recipesData);
                setAllProducts(productsData);
            } catch (error) {
                toast({ title: 'Error', description: 'Could not load data.', variant: 'destructive'});
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [toast]);
    
    const handleAddNew = () => {
        setEditingRecipe(null);
        form.reset();
        setImagePreview(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (recipe: Recipe) => {
        setEditingRecipe(recipe);
        form.reset({
            title: recipe.title,
            description: recipe.description,
            instructions: recipe.instructions,
            videoUrl: recipe.videoUrl,
            productIds: recipe.productIds,
            image: null,
        });
        setImagePreview(recipe.imageUrl);
        setIsDialogOpen(true);
    };

    const handleDelete = async (recipeId: string) => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;
        try {
            await deleteRecipe(recipeId);
            setRecipes(recipes.filter(r => r.id !== recipeId));
            toast({ title: 'Success', description: 'Recipe deleted.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Could not delete recipe.', variant: 'destructive' });
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            form.setValue('image', file);
        }
    };

    const onSubmit = async (data: RecipeFormValues) => {
        setIsSubmitting(true);
        try {
            let imageUrl: string | undefined = editingRecipe?.imageUrl;
            
            if (data.image) {
                const uploadResult = await uploadImage(data.image, 'recipes');
                imageUrl = uploadResult.url;
            }

            if (!imageUrl) {
                 toast({ title: 'Image required', description: 'Please upload an image for the recipe.', variant: 'destructive'});
                 setIsSubmitting(false);
                 return;
            }

            const recipeData = {
                ...data,
                imageUrl: imageUrl,
            };
            
            delete recipeData.image;

            if (editingRecipe) {
                await updateRecipe(editingRecipe.id, recipeData);
                setRecipes(recipes.map(r => r.id === editingRecipe.id ? { ...editingRecipe, ...recipeData } : r));
                toast({ title: 'Success', description: 'Recipe updated.'});
            } else {
                const newId = await addRecipe(recipeData);
                setRecipes([...recipes, { id: newId, ...recipeData }]);
                toast({ title: 'Success', description: 'Recipe created.'});
            }

            setIsDialogOpen(false);
        } catch (error) {
            console.error("Recipe save error:", error);
            toast({ title: "Error", description: "Could not save recipe.", variant: "destructive"});
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const filteredRecipes = recipes.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Recipes</h1>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Recipe
                </Button>
            </div>
            
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search for recipes..."
                    className="pl-10 h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredRecipes.map(recipe => (
                    <Card key={recipe.id} className='flex flex-col'>
                        <CardHeader>
                            <div className="relative aspect-video">
                                <Image src={recipe.imageUrl} alt={recipe.title} fill className="rounded-md object-cover" />
                            </div>
                            <CardTitle className="pt-4">{recipe.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                           <h4 className="font-semibold text-sm mb-1">Products ({recipe.productIds.length})</h4>
                           <div className="flex flex-wrap gap-1">
                            {recipe.productIds.slice(0, 3).map(id => {
                                const product = allProducts.find(p => p.id === id);
                                return product ? <span key={id} className="text-xs bg-muted px-2 py-1 rounded-full">{product.name}</span> : null;
                            })}
                            {recipe.productIds.length > 3 && <span className="text-xs bg-muted px-2 py-1 rounded-full">+{recipe.productIds.length - 3} more</span>}
                           </div>
                        </CardContent>
                         <div className="flex gap-2 p-4 pt-0">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(recipe)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(recipe.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}</DialogTitle>
                        <DialogDescription>Fill out the details for your recipe below.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <ScrollArea className="h-[70vh]">
                            <div className="space-y-4 p-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Description</FormLabel>
                                        <FormControl><Textarea {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="instructions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructions</FormLabel>
                                        <FormControl><Textarea rows={8} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="videoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>YouTube Video URL (Optional)</FormLabel>
                                        <FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormItem>
                                <FormLabel>Recipe Image</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*" onChange={handleImageChange} />
                                </FormControl>
                                {imagePreview && (
                                     <div className="relative mt-2 w-48 aspect-video rounded-md overflow-hidden">
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => {setImagePreview(null); form.setValue('image', null)}}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>

                             <FormField
                                control={form.control}
                                name="productIds"
                                render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Related Products</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                                                        <div className='flex gap-1 items-center'>
                                                            <PlusCircle className='h-4 w-4' />
                                                            {field.value?.length ? `${field.value.length} selected` : 'Select products'}
                                                        </div>
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search products..." />
                                                    <CommandList>
                                                        <CommandEmpty>No products found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {allProducts.map(product => (
                                                                <CommandItem
                                                                    key={product.id}
                                                                    value={product.name}
                                                                    onSelect={() => {
                                                                        const currentIds = field.value || [];
                                                                        if (currentIds.includes(product.id)) {
                                                                            field.onChange(currentIds.filter(id => id !== product.id));
                                                                        } else {
                                                                            field.onChange([...currentIds, product.id]);
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", field.value?.includes(product.id) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                                      <Check className={cn("h-4 w-4")} />
                                                                    </div>
                                                                    {product.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </div>
                          </ScrollArea>
                          <div className='flex justify-end p-4 pt-0'>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingRecipe ? 'Save Changes' : 'Create Recipe'}
                            </Button>
                          </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
