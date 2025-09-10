
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const appearanceSchema = z.object({
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  heroImageId: z.string().min(1),
  ad1ImageId: z.string().min(1),
  ad2ImageId: z.string().min(1),
  ad3ImageId: z.string().min(1),
});

export default function AdminAppearancePage() {
  const form = useForm<z.infer<typeof appearanceSchema>>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      heroTitle: 'Freshness at Your Fingertips',
      heroSubtitle: 'The best groceries, delivered fresh to your door daily.',
      heroImageId: 'hero-bg',
      ad1ImageId: 'ad-pharmacy',
      ad2ImageId: 'ad-pet-care',
      ad3ImageId: 'ad-baby-care',
    },
  });

  const onSubmit = (data: z.infer<typeof appearanceSchema>) => {
    // In a real app, you'd save this to a database
    console.log(data);
    alert('Appearance settings saved!');
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
                name="heroImageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Image</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an image" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PlaceHolderImages.map((image) => (
                          <SelectItem key={image.id} value={image.id}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={image.imageUrl}
                                alt={image.description}
                                width={24}
                                height={24}
                                className="rounded-sm object-cover"
                              />
                              <span>{image.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                name="ad1ImageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advertisement 1</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an image" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PlaceHolderImages.filter(img => img.id.startsWith('ad-')).map((image) => (
                            <SelectItem key={image.id} value={image.id}>
                               <div className="flex items-center gap-2">
                                <Image src={image.imageUrl} alt={image.description} width={24} height={24} className="rounded-sm object-cover" />
                                <span>{image.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="ad2ImageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advertisement 2</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an image" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PlaceHolderImages.filter(img => img.id.startsWith('ad-')).map((image) => (
                            <SelectItem key={image.id} value={image.id}>
                               <div className="flex items-center gap-2">
                                <Image src={image.imageUrl} alt={image.description} width={24} height={24} className="rounded-sm object-cover" />
                                <span>{image.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="ad3ImageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advertisement 3</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an image" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PlaceHolderImages.filter(img => img.id.startsWith('ad-')).map((image) => (
                            <SelectItem key={image.id} value={image.id}>
                               <div className="flex items-center gap-2">
                                <Image src={image.imageUrl} alt={image.description} width={24} height={24} className="rounded-sm object-cover" />
                                <span>{image.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
