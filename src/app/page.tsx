
'use client'

import React from 'react';
import HomeHeader from '@/components/home-header';
import CategoryCard from '@/components/category-card';
import ProductCard from '@/components/product-card';
import { categories, products } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Autoplay from "embla-carousel-autoplay";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  const topCategories = categories.slice(0, 4);
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-bg');
  const specialOffers = products.slice(0, 4);
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  const ads = [
    PlaceHolderImages.find(img => img.id === 'ad-pharmacy'),
    PlaceHolderImages.find(img => img.id === 'ad-pet-care'),
    PlaceHolderImages.find(img => img.id === 'ad-baby-care'),
  ].filter(Boolean);


  return (
    <>
      <HomeHeader />
      <div className="space-y-8 p-4 pt-0 sm:p-6 sm:pt-0">
        <section className="relative -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 h-64 w-auto overflow-hidden rounded-b-2xl">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
              <h1 className="font-headline text-3xl font-bold md:text-4xl">Freshness at Your Fingertips</h1>
              <p className="mt-2 max-w-md text-base text-white/90">The best groceries, delivered fresh to your door daily.</p>
            </div>
        </section>

        <section className="-mt-16 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search for products..." className="pl-10 h-12 shadow-lg" />
          </div>
        </section>

        <section>
          <Carousel
            opts={{ align: 'start', loop: true }}
            plugins={[autoplayPlugin.current]}
            onMouseEnter={autoplayPlugin.current.stop}
            onMouseLeave={autoplayPlugin.current.reset}
          >
            <CarouselContent className="-ml-2">
              {ads.map((ad) => (
                ad && <CarouselItem key={ad.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 pl-2">
                  <Card className="overflow-hidden relative aspect-video">
                     <Image
                        src={ad.imageUrl}
                        alt={ad.description}
                        fill
                        className="object-cover"
                        data-ai-hint={ad.imageHint}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-1 md:p-2">
                        <h3 className="font-bold text-xs md:text-base">{ad.description}</h3>
                         <Button size="sm" variant="secondary" className="mt-1 h-6 text-xs md:h-7">Order Now</Button>
                      </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>

         <section className="space-y-4">
          <h2 className="font-headline text-xl font-bold">Special Offers</h2>
          <Carousel
            opts={{ align: 'start', loop: true }}
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

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-headline text-xl font-bold">Shop by Category</h2>
            <Link href="/categories" className="text-sm font-medium text-primary">See All</Link>
          </div>
          <div className="grid grid-cols-4 gap-3 md:grid-cols-5 lg:grid-cols-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
        
        <section className="space-y-6">
          <h2 className="font-headline text-xl font-bold">Best Sellers</h2>
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
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-headline text-xl font-bold">All Products</h2>
            <Link href="/products" className="text-sm font-medium text-primary">See All</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {products.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
