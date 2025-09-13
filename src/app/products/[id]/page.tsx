
'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/firestore';
import type { Product } from '@/lib/data';
import useCart from '@/hooks/use-cart';
import { calculateDiscountedPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ProductCard from '@/components/product-card';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DietarySymbol } from '@/components/dietary-symbol';

export default function ProductDetailPage() {
    const params = useParams();
    const { id } = params;
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();

    useEffect(() => {
        if (!id || typeof id !== 'string') {
            setLoading(false);
            notFound();
            return;
        }

        const fetchProduct = async () => {
            setLoading(true);
            const fetchedProduct = await getProduct(id as string);
            if (fetchedProduct) {
                setProduct(fetchedProduct);
                const allProducts = await getProducts(fetchedProduct.categorySlug);
                setRelatedProducts(allProducts.filter(p => p.id !== fetchedProduct.id));
            } else {
                notFound();
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    if (loading || !product) {
        return (
            <div>
                <PageHeader title="Loading..." />
                <div className="p-4 sm:p-6 mx-auto max-w-4xl">
                     <div className="grid md:grid-cols-2 gap-8">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const discountedPrice = calculateDiscountedPrice(product);
    const hasOffer = discountedPrice !== null && discountedPrice < product.price;

    return (
        <div>
            <PageHeader title={product.name} />
            <div className="p-4 sm:p-6">
                <div className="mx-auto max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="overflow-hidden">
                           <Carousel className="w-full">
                                <CarouselContent>
                                    {product.imageUrls.map((url, index) => (
                                        <CarouselItem key={index}>
                                            <div className="relative aspect-square w-full">
                                                <Image
                                                    src={url}
                                                    alt={`${product.name} image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                {product.imageUrls.length > 1 && (
                                    <>
                                        <CarouselPrevious className="left-2" />
                                        <CarouselNext className="right-2" />
                                    </>
                                )}
                            </Carousel>
                        </Card>
                        <Card>
                             <CardHeader>
                                {product.brand && <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>}
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-3xl">{product.name}</CardTitle>
                                  <DietarySymbol type={product.dietaryType} size='lg' />
                                </div>
                                <CardDescription>{product.weight}</CardDescription>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                <div className="flex items-baseline gap-2">
                                     {hasOffer ? (
                                        <>
                                            <p className="text-3xl font-bold">₹{discountedPrice.toFixed(2)}</p>
                                            <p className="text-xl text-muted-foreground line-through">
                                            ₹{product.price.toFixed(2)}
                                            </p>
                                            <Badge variant="destructive">
                                                {product.offer?.type === 'percentage' ? `${product.offer.value}% OFF` : `₹${product.offer?.value} OFF`}
                                            </Badge>
                                        </>
                                        ) : (
                                        <p className="text-3xl font-bold">₹{product.price.toFixed(2)}</p>
                                        )}
                                </div>
                                <p className="text-base text-muted-foreground">{product.description}</p>
                             </CardContent>
                             <CardFooter>
                                 <Button size="lg" className="w-full" onClick={() => addItem(product)}>
                                    <Plus className="mr-2 h-5 w-5" /> Add to Cart
                                </Button>
                             </CardFooter>
                        </Card>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold mb-4">Related Products</h2>
                        <Carousel opts={{ align: 'start', loop: relatedProducts.length > 3 }}>
                            <CarouselContent className="-ml-2">
                            {relatedProducts.map((p) => (
                                <CarouselItem key={p.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-2">
                                <ProductCard product={p} />
                                </CarouselItem>
                            ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden sm:flex" />
                            <CarouselNext className="hidden sm:flex" />
                        </Carousel>
                    </div>
                )}
            </div>
        </div>
    );
}
