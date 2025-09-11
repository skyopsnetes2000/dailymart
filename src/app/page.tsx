

'use client'

import React, { useEffect, useState } from 'react';
import HomeHeader from '@/components/home-header';
import CategoryCard from '@/components/category-card';
import ProductCard from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Autoplay from "embla-carousel-autoplay";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Product, Category, AppearanceSettings } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories, getProducts, getSpecialOfferProducts, getAppearanceSettings } from '@/lib/firestore';

function LoadingSkeletons() {
    return (
        <div className="space-y-8 p-4 sm:p-6">
            <Skeleton className="relative -mx-4 -mt-4 h-64 w-auto rounded-b-2xl" />
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                 {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video" />
                ))}
            </div>
            <Skeleton className="h-8 w-1/4" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:basis-1/4 lg:basis-1/5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
            <Skeleton className="h-8 w-1/4" />
             <div className="grid grid-cols-4 gap-3 md:grid-cols-5 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                ))}
            </div>
        </div>
    )
}


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [specialOffers, setSpecialOffers] = useState<Product[]>([]);
  const [appearance, setAppearance] = useState<AppearanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [productsData, categoriesData, specialOffersData, appearanceData] = await Promise.all([
                getProducts(),
                getCategories(),
                getSpecialOfferProducts(),
                getAppearanceSettings(),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setSpecialOffers(specialOffersData);
            setAppearance(appearanceData);
        } catch (error) {
            console.error("Error fetching data from Firestore", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);
  
  const topCategories = categories.slice(0, 4);
  const placeholderHero = PlaceHolderImages.find((img) => img.id === 'hero-bg');
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  const ads = [
    { id: 'ad1', url: appearance?.ad1ImageUrl, description: 'New Deals' },
    { id: 'ad2', url: appearance?.ad2ImageUrl, description: 'Fresh Arrivals' },
    { id: 'ad3', url: appearance?.ad3ImageUrl, description: 'Seasonal Picks' },
  ].filter(ad => ad.url);

  if (loading) {
      return (
        <>
            <HomeHeader />
            <LoadingSkeletons />
        </>
      )
  }

  const heroTitle = appearance?.heroTitle || "Freshness at Your Fingertips";
  const heroSubtitle = appearance?.heroSubtitle || "The best groceries, delivered fresh to your door daily.";
  const heroImageUrl = appearance?.heroImageUrl || placeholderHero?.imageUrl;

  return (
    <>
      <HomeHeader />
      <div className="space-y-8 p-4 pt-0 sm:p-6 sm:pt-0">
        <section className="relative -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 h-64 w-auto overflow-hidden rounded-b-2xl">
            {heroImageUrl && (
              <Image
                src={heroImageUrl}
                alt="Hero background"
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
              <h1 className="font-headline text-3xl font-bold md:text-4xl">{heroTitle}</h1>
              <p className="mt-2 max-w-md text-base text-white/90">{heroSubtitle}</p>
            </div>
        </section>

        <section className="-mt-16 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search for products..." className="pl-10 h-12 shadow-lg" />
          </div>
        </section>

        {ads.length > 0 &&
            <section>
            <Carousel
                opts={{ align: 'start', loop: true }}
                plugins={[autoplayPlugin.current]}
                onMouseEnter={autoplayPlugin.current.stop}
                onMouseLeave={autoplayPlugin.current.reset}
            >
                <CarouselContent className="-ml-2">
                {ads.map((ad) => (
                    ad && <CarouselItem key={ad.id} className="pl-2 basis-auto">
                    <Card className="overflow-hidden relative aspect-video w-48">
                        {ad.url && 
                            <Image
                                src={ad.url}
                                alt={ad.description}
                                fill
                                className="object-cover"
                            />
                        }
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-1 md:p-2">
                            <h3 className="font-bold text-xs md:text-sm text-white">{ad.description}</h3>
                            <Button size="sm" variant="secondary" className="mt-1 h-6 text-xs md:h-7">Order Now</Button>
                        </div>
                    </Card>
                    </CarouselItem>
                ))}
                </CarouselContent>
            </Carousel>
            </section>
        }

         {specialOffers.length > 0 && (
            <section className="space-y-4">
            <h2 className="font-headline text-xl font-bold">Special Offers</h2>
            <Carousel
                opts={{ align: 'start', loop: specialOffers.length > 3 }}
            >
                <CarouselContent className="-ml-2">
                {specialOffers.map((product) => (
                    <CarouselItem key={product.id} className="basis-2/5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-2">
                    <ProductCard product={product} />
                    </CarouselItem>
                ))}
                </CarouselContent>
            </Carousel>
            </section>
        )}

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-headline text-xl font-bold">Shop by Category</h2>
            <Link href="/categories" className="text-sm font-medium text-primary">See All</Link>
          </div>
           {categories.length > 0 ? (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
                ))}
            </div>
            ) : (
                <p className="text-muted-foreground">No categories found. Please check back later.</p>
            )}
        </section>
        
        <section className="space-y-6">
          <h2 className="font-headline text-xl font-bold">Best Sellers</h2>
          {categories.length > 0 ? (
          <div className="space-y-8">
            {topCategories.map((category) => {
              const categoryProducts = products.filter(p => p.categorySlug === category.slug);
              if (categoryProducts.length === 0) return null;

              return (
                <div key={category.id}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <Link href={`/categories/${category.slug}`} className="text-sm font-medium text-primary">
                      See All
                    </Link>
                  </div>
                  <Carousel opts={{ align: 'start', dragFree: true }}>
                    <CarouselContent className="-ml-2">
                      {categoryProducts.map((product) => (
                        <CarouselItem key={product.id} className="basis-2/5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-2">
                          <ProductCard product={product} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              );
            })}
          </div>
          ) : (
            <p className="text-muted-foreground">No best-selling products yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
