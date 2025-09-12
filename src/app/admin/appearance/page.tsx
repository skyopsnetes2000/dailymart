
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { getAppearanceSettings, saveAppearanceSettings, uploadImage, getCategories } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, X } from 'lucide-react';
import { type AppearanceSettings, type Category, type AdBanner } from '@/lib/data';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const adBannerSchema = z.object({
    id: z.string(),
    description: z.string().optional(),
    categorySlug: z.string().optional(),
    imageUrl: z.string().optional(),
    imageFile: z.any().optional(),
});

const appearanceSchema = z.object({
  heroTitle: z.string().min(1, 'Title is required.'),
  heroSubtitle: z.string().min(1, 'Subtitle is required.'),
  heroImages: z.any().optional(),
  ads: z.array(adBannerSchema),
});

type AppearanceFormValues = z.infer<typeof appearanceSchema>;

export default function AdminAppearancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState<AppearanceSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  const [heroImagePreviews, setHeroImagePreviews] = useState<string[]>([]);


  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
        heroTitle: '',
        heroSubtitle: '',
        ads: [],
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ads"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settings, categoriesData] = await Promise.all([
          getAppearanceSettings(),
          getCategories(),
        ]);
        
        setInitialData(settings);
        setHeroImagePreviews(settings?.heroImageUrls || []);
        setCategories(categoriesData);

        form.reset({
          heroTitle: settings?.heroTitle || '',
          heroSubtitle: settings?.heroSubtitle || '',
          ads: settings?.ads || [],
        });
      } catch (error) {
        console.error("Failed to fetch appearance settings:", error);
        toast({
          title: 'Error',
          description: 'Could not load appearance settings.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form, toast]);


  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setHeroImagePreviews(prev => [...prev, ...newPreviews]);
      
      const currentFiles = form.getValues('heroImages') || [];
      const updatedFiles = [...currentFiles, ...Array.from(files)];
      form.setValue('heroImages', updatedFiles);
    }
  };

  const handleRemoveHeroImage = (index: number) => {
    const newImagePreviews = [...heroImagePreviews];
    newImagePreviews.splice(index, 1);
    setHeroImagePreviews(newImagePreviews);

    // Also remove from initialData to reflect deletion of existing images
    const updatedInitialUrls = initialData?.heroImageUrls?.filter((_, i) => i !== index);
    setInitialData(prev => prev ? { ...prev, heroImageUrls: updatedInitialUrls } : null);

    const currentFiles = form.getValues('heroImages');
    if (currentFiles && typeof currentFiles !== 'string') {
        const newFiles = Array.from(currentFiles);
        newFiles.splice(index, 1);
        const dataTransfer = new DataTransfer();
        newFiles.forEach(file => dataTransfer.items.add(file));
        form.setValue('heroImages', dataTransfer.files.length > 0 ? dataTransfer.files : null);
    }
  };


  const onSubmit = async (data: AppearanceFormValues) => {
    setSaving(true);
    try {
        const adUploadPromises = data.ads.map(async (ad, index) => {
            if (ad.imageFile && ad.imageFile[0]) {
                const result = await uploadImage(ad.imageFile[0], 'appearance');
                return { ...ad, imageUrl: result.url, imageFile: undefined };
            }
            return ad;
        });
        
        const updatedAds = await Promise.all(adUploadPromises);

        let newHeroImageUrls: string[] = initialData?.heroImageUrls || [];
        if (data.heroImages && data.heroImages.length > 0) {
            const filesToUpload = Array.from(data.heroImages as FileList);
            const uploadPromises = filesToUpload.map(file => uploadImage(file, 'appearance'));
            const uploadResults = await Promise.all(uploadPromises);
            newHeroImageUrls.push(...uploadResults.map(res => res.url));
        }

        const newSettings: Partial<AppearanceSettings> = {
            heroTitle: data.heroTitle,
            heroSubtitle: data.heroSubtitle,
            heroImageUrls: newHeroImageUrls,
            ads: updatedAds.map(ad => ({
                id: ad.id,
                description: ad.description,
                categorySlug: ad.categorySlug === '_none_' ? '' : ad.categorySlug,
                imageUrl: ad.imageUrl,
            })),
        };

        await saveAppearanceSettings(newSettings);
        
        const updatedInitialData = { ...initialData, ...newSettings } as AppearanceSettings;
        setInitialData(updatedInitialData);
        
        form.reset({
            ...data,
            heroImages: null,
            ads: updatedAds.map(ad => ({...ad, imageFile: null}))
        });

        setHeroImagePreviews(newHeroImageUrls);

        toast({
            title: 'Success!',
            description: 'Appearance settings have been saved.',
        });
        
    } catch (error) {
        console.error("Failed to save settings", error);
        toast({
            title: 'Error',
            description: 'Failed to save settings.',
            variant: 'destructive'
        });
    } finally {
        setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Appearance</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Customize the main hero section on your homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="heroTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroImages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Images</FormLabel>
                     {heroImagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {heroImagePreviews.map((src, index) => (
                                <div key={index} className="relative">
                                    <Image src={src} alt={`Preview ${index}`} width={100} height={100} className="rounded-md object-cover w-full aspect-square" />
                                    <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => handleRemoveHeroImage(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                      )}
                    <FormControl>
                      <Input type="file" multiple onChange={handleHeroImageChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advertisement Banners</CardTitle>
              <CardDescription>
                Manage the rotating advertisements on your homepage. Dimensions should be 800x400 for best results.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className='space-y-4 rounded-md border p-4 relative'>
                    <div className='flex justify-between items-center'>
                        <h4 className='font-semibold'>Advertisement {index + 1}</h4>
                         <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                    <FormField
                        control={form.control}
                        name={`ads.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='e.g., Fresh Arrivals' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`ads.${index}.categorySlug`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Link to Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="_none_">None</SelectItem>
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`ads.${index}.imageFile`}
                        render={({ field: fileField }) => {
                             const adField = form.getValues(`ads.${index}`);
                             return (
                                <FormItem>
                                    <FormLabel>Image</FormLabel>
                                    {adField?.imageUrl && (
                                        <div className="relative aspect-video w-48 rounded-md overflow-hidden">
                                            <Image src={adField.imageUrl} alt={`Ad ${index + 1}`} fill className="object-cover" />
                                        </div>
                                    )}
                                    <FormControl>
                                        <Input type="file" onChange={(e) => fileField.onChange(e.target.files)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                </div>
              ))}
               <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ id: `ad_${Date.now()}`, description: '', categorySlug: '' })}
                >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Advertisement
              </Button>
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
