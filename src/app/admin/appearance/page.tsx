
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

const appearanceSchema = z.object({
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  heroImage: z.any(),
  ad1Image: z.any(),
  ad2Image: z.any(),
  ad3Image: z.any(),
});

type AppearanceFormValues = z.infer<typeof appearanceSchema>;

const STORAGE_KEY = 'admin_appearance';

const defaultValues: AppearanceFormValues = {
  heroTitle: 'Freshness at Your Fingertips',
  heroSubtitle: 'The best groceries, delivered fresh to your door daily.',
  heroImage: null,
  ad1Image: null,
  ad2Image: null,
  ad3Image: null,
};

export default function AdminAppearancePage() {
  const [initialData, setInitialData] = useState<AppearanceFormValues>(defaultValues);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Exclude file inputs from being loaded
        const { heroImage, ad1Image, ad2Image, ad3Image, ...rest } = parsedData;
        setInitialData({ ...defaultValues, ...rest });
      }
    } catch (error) {
      console.warn("Could not access localStorage. Using default values.");
    }
  }, []);

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    values: initialData,
  });

  useEffect(() => {
    form.reset(initialData);
  }, [initialData, form]);

  const onSubmit = (data: AppearanceFormValues) => {
    try {
      const { heroImage, ad1Image, ad2Image, ad3Image, ...dataToSave } = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      alert('Appearance settings saved!');
    } catch (error) {
      console.error("Could not save to localStorage", error);
      alert('Failed to save settings.');
    }
  };

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
                Manage the rotating advertisements on your homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="ad1Image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advertisement 1</FormLabel>
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
                    <FormControl>
                      <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
    </div>
  );
}
