
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { getAppearanceSettings, saveAppearanceSettings, uploadImage, getCategories } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { type AppearanceSettings, type Category, type AdBanner } from '@/lib/data';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const appearanceSchema = z.object({
  heroTitle: z.string().min(1, 'Title is required.'),
  heroSubtitle: z.string().min(1, 'Subtitle is required.'),
  heroImage: z.any().optional(),
  
  ad1Description: z.string().optional(),
  ad1CategorySlug: z.string().optional(),
  ad1Image: z.any().optional(),

  ad2Description: z.string().optional(),
  ad2CategorySlug: z.string().optional(),
  ad2Image: z.any().optional(),
  
  ad3Description: z.string().optional(),
  ad3CategorySlug: z.string().optional(),
  ad3Image: z.any().optional(),
});

type AppearanceFormValues = z.infer<typeof appearanceSchema>;

export default function AdminAppearancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState<AppearanceSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settings, categoriesData] = await Promise.all([
          getAppearanceSettings(),
          getCategories(),
        ]);
        setInitialData(settings);
        setCategories(categoriesData);

        form.reset({
          heroTitle: settings?.heroTitle || '',
          heroSubtitle: settings?.heroSubtitle || '',
          ad1Description: settings?.ad1?.description || '',
          ad1CategorySlug: settings?.ad1?.categorySlug || '',
          ad2Description: settings?.ad2?.description || '',
          ad2CategorySlug: settings?.ad2?.categorySlug || '',
          ad3Description: settings?.ad3?.description || '',
          ad3CategorySlug: settings?.ad3?.categorySlug || '',
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


  const onSubmit = async (data: AppearanceFormValues) => {
    setSaving(true);
    try {
        const newSettings: Partial<AppearanceSettings> = {
            heroTitle: data.heroTitle,
            heroSubtitle: data.heroSubtitle,
            ad1: { 
                ...initialData?.ad1, 
                description: data.ad1Description,
                categorySlug: data.ad1CategorySlug,
            },
            ad2: { 
                ...initialData?.ad2, 
                description: data.ad2Description,
                categorySlug: data.ad2CategorySlug,
            },
            ad3: { 
                ...initialData?.ad3, 
                description: data.ad3Description,
                categorySlug: data.ad3CategorySlug,
            },
        };

        // Handle image uploads
        if (data.heroImage && data.heroImage[0]) {
            const result = await uploadImage(data.heroImage[0], 'appearance');
            newSettings.heroImageUrl = result.url;
        }

        if (data.ad1Image && data.ad1Image[0]) {
            const result = await uploadImage(data.ad1Image[0], 'appearance');
            newSettings.ad1 = { ...newSettings.ad1, imageUrl: result.url };
        }
        if (data.ad2Image && data.ad2Image[0]) {
            const result = await uploadImage(data.ad2Image[0], 'appearance');
            newSettings.ad2 = { ...newSettings.ad2, imageUrl: result.url };
        }
        if (data.ad3Image && data.ad3Image[0]) {
            const result = await uploadImage(data.ad3Image[0], 'appearance');
            newSettings.ad3 = { ...newSettings.ad3, imageUrl: result.url };
        }

        await saveAppearanceSettings(newSettings);
        
        // Optimistically update the displayed images and data
        const updatedInitialData = { ...initialData, ...newSettings };
        if (newSettings.heroImageUrl) updatedInitialData.heroImageUrl = newSettings.heroImageUrl;
        if (newSettings.ad1?.imageUrl) updatedInitialData.ad1 = { ...updatedInitialData.ad1, imageUrl: newSettings.ad1.imageUrl };
        if (newSettings.ad2?.imageUrl) updatedInitialData.ad2 = { ...updatedInitialData.ad2, imageUrl: newSettings.ad2.imageUrl };
        if (newSettings.ad3?.imageUrl) updatedInitialData.ad3 = { ...updatedInitialData.ad3, imageUrl: newSettings.ad3.imageUrl };

        setInitialData(updatedInitialData);

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

  const AdBannerField = ({ adNumber, adData }: { adNumber: 1 | 2 | 3; adData?: AdBanner }) => (
    <div className='space-y-4 rounded-md border p-4'>
        <h4 className='font-semibold'>Advertisement {adNumber}</h4>
        <FormField
            control={form.control}
            name={`ad${adNumber}Description`}
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
            name={`ad${adNumber}CategorySlug`}
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
                            <SelectItem value="">None</SelectItem>
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
            name={`ad${adNumber}Image`}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Image</FormLabel>
                    {adData?.imageUrl && (
                        <div className="relative aspect-video w-48 rounded-md overflow-hidden">
                            <Image src={adData.imageUrl} alt={`Ad ${adNumber}`} fill className="object-cover" />
                        </div>
                    )}
                    <FormControl>
                        <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    </div>
  );


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
                name="heroImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Image</FormLabel>
                    {initialData?.heroImageUrl && (
                        <div className="relative h-32 w-full rounded-md overflow-hidden">
                           <Image src={initialData.heroImageUrl} alt="Hero Background" fill className="object-cover" />
                        </div>
                    )}
                    <FormControl>
                      <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
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
              <AdBannerField adNumber={1} adData={initialData?.ad1} />
              <AdBannerField adNumber={2} adData={initialData?.ad2} />
              <AdBannerField adNumber={3} adData={initialData?.ad3} />
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
