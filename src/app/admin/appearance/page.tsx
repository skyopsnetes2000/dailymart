
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
import { getAppearanceSettings, saveAppearanceSettings, uploadImage } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { type AppearanceSettings } from '@/lib/data';
import Image from 'next/image';

const appearanceSchema = z.object({
  heroTitle: z.string().min(1, 'Title is required.'),
  heroSubtitle: z.string().min(1, 'Subtitle is required.'),
  heroImage: z.any().optional(),
  ad1Image: z.any().optional(),
  ad2Image: z.any().optional(),
  ad3Image: z.any().optional(),
});

type AppearanceFormValues = z.infer<typeof appearanceSchema>;

export default function AdminAppearancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState<AppearanceSettings | null>(null);
  const { toast } = useToast();

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getAppearanceSettings();
        setInitialData(settings);
        form.reset({
          heroTitle: settings?.heroTitle || '',
          heroSubtitle: settings?.heroSubtitle || '',
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
        };

        // Handle image uploads
        if (data.heroImage && data.heroImage[0]) {
            const result = await uploadImage(data.heroImage[0], 'appearance');
            newSettings.heroImageUrl = result.url;
        }
        if (data.ad1Image && data.ad1Image[0]) {
            const result = await uploadImage(data.ad1Image[0], 'appearance');
            newSettings.ad1ImageUrl = result.url;
        }
        if (data.ad2Image && data.ad2Image[0]) {
            const result = await uploadImage(data.ad2Image[0], 'appearance');
            newSettings.ad2ImageUrl = result.url;
        }
        if (data.ad3Image && data.ad3Image[0]) {
            const result = await uploadImage(data.ad3Image[0], 'appearance');
            newSettings.ad3ImageUrl = result.url;
        }

        await saveAppearanceSettings(newSettings);
        
        // Optimistically update the displayed images
        if(initialData) {
            setInitialData({
                ...initialData,
                ...newSettings
            });
        }


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
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="ad1Image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advertisement 1</FormLabel>
                    {initialData?.ad1ImageUrl && (
                         <div className="relative aspect-video w-48 rounded-md overflow-hidden">
                           <Image src={initialData.ad1ImageUrl} alt="Ad 1" fill className="object-cover" />
                        </div>
                    )}
                     <FormControl>
                      <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="ad2Image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advertisement 2</FormLabel>
                    {initialData?.ad2ImageUrl && (
                         <div className="relative aspect-video w-48 rounded-md overflow-hidden">
                           <Image src={initialData.ad2ImageUrl} alt="Ad 2" fill className="object-cover" />
                        </div>
                    )}
                    <FormControl>
                      <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="ad3Image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advertisement 3</FormLabel>
                    {initialData?.ad3ImageUrl && (
                        <div className="relative aspect-video w-48 rounded-md overflow-hidden">
                           <Image src={initialData.ad3ImageUrl} alt="Ad 3" fill className="object-cover" />
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

          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
