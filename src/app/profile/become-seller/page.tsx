

'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { submitShopRequest, uploadImage } from '@/lib/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const sellerSchema = z.object({
  shopName: z.string().min(3, 'Shop name must be at least 3 characters.'),
  contactNumber: z.string().min(10, 'Please enter a valid contact number.'),
  contactEmail: z.string().email('Please enter a valid email address.'),
  gstinNumber: z.string().optional(),
  aadharFront: z.instanceof(File).refine(file => file.size > 0, 'Aadhar front is required.'),
  aadharBack: z.instanceof(File).refine(file => file.size > 0, 'Aadhar back is required.'),
  electricityBill: z.instanceof(File).refine(file => file.size > 0, 'Electricity bill is required.'),
  passportPhoto: z.instanceof(File).refine(file => file.size > 0, 'Passport photo is required.'),
  businessPan: z.instanceof(File).refine(file => file.size > 0, 'Business PAN card is required.'),
});

type SellerFormValues = z.infer<typeof sellerSchema>;

export default function BecomeSellerPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      shopName: '',
      contactNumber: '',
      contactEmail: '',
      gstinNumber: '',
    }
  });

  async function onSubmit(data: SellerFormValues) {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to submit an application.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      // 1. Upload all files in parallel
      const uploadPromises = {
          aadharFrontUrl: uploadImage(data.aadharFront, `shop-requests/${user.uid}`),
          aadharBackUrl: uploadImage(data.aadharBack, `shop-requests/${user.uid}`),
          electricityBillUrl: uploadImage(data.electricityBill, `shop-requests/${user.uid}`),
          passportPhotoUrl: uploadImage(data.passportPhoto, `shop-requests/${user.uid}`),
          businessPanUrl: uploadImage(data.businessPan, `shop-requests/${user.uid}`),
      };

      const uploadedUrls = {
          aadharFrontUrl: (await uploadPromises.aadharFrontUrl).url,
          aadharBackUrl: (await uploadPromises.aadharBackUrl).url,
          electricityBillUrl: (await uploadPromises.electricityBillUrl).url,
          passportPhotoUrl: (await uploadPromises.passportPhotoUrl).url,
          businessPanUrl: (await uploadPromises.businessPanUrl).url,
      };

      // 2. Submit the request data with the file URLs
      await submitShopRequest({
        userId: user.uid,
        shopName: data.shopName,
        contactNumber: data.contactNumber,
        contactEmail: data.contactEmail,
        gstinNumber: data.gstinNumber,
        documents: uploadedUrls,
      });

      toast({
        title: 'Application Submitted!',
        description: 'Your request to become a seller has been submitted. We will review it shortly.',
      });
      router.push('/profile');

    } catch (error: any) {
      console.error("Seller Application Error:", error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'An unexpected error occurred while submitting your application.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if(loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if(!user) {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center p-4">
            <h2 className="text-xl font-semibold">Please Login</h2>
            <p className="text-muted-foreground">You need to be logged in to register as a seller.</p>
            <Button asChild>
                <Link href="/login?redirect=/profile/become-seller">Login</Link>
            </Button>
        </div>
    )
  }

  return (
    <div>
        <PageHeader title="Become a Seller" />
        <div className="p-4 sm:p-6 mx-auto max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>Business Registration</CardTitle>
                    <CardDescription>
                        Fill out the form below to register your business. Please ensure all documents are clear and legible.
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="shopName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Shop / Business Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Shop's Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactNumber"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Contact Number</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="Your primary contact number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactEmail"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Contact Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="your.business@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="gstinNumber"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>GSTIN Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your business GSTIN" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>Upload Documents</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md'>
                             <FormField
                                control={form.control}
                                name="aadharFront"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Aadhar Card (Front)</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/*,.pdf" onChange={(e) => field.onChange(e.target.files?.[0])} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="aadharBack"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Aadhar Card (Back)</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/*,.pdf" onChange={(e) => field.onChange(e.target.files?.[0])} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="electricityBill"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Electricity Bill</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/*,.pdf" onChange={(e) => field.onChange(e.target.files?.[0])} />
                                    </FormControl>
                                     <FormDescription>Must be for the shop's address.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="passportPhoto"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Passport-size Photo</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="businessPan"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business PAN Card</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/*,.pdf" onChange={(e) => field.onChange(e.target.files?.[0])} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Application
                    </Button>
                    </CardContent>
                </form>
                </Form>
            </Card>
        </div>
    </div>
  );
}
