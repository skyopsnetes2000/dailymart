
import React from 'react';
import HomeHeader from '@/components/home-header';
import CategoryCard from '@/components/category-card';
import ProductCard from '@/components/product-card';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Product, Category, AppearanceSettings } from '@/lib/data';
import { getCategories, getProducts, getSpecialOfferProducts, getAppearanceSettings } from '@/lib/firestore';
import AdCarousel from '@/components/ad-carousel';
import SearchBar from '@/components/shared/search-bar';

export default async function Home() {
  const [
    products,
    categories,
    specialOffers,
    appearance,
  ] = await Promise.all([
    getProducts(),
    getCategories(),
    getSpecialOfferProducts(),
    getAppearanceSettings(),
  ]);

  const topCategories = categories.slice(0, 4);

  const heroTitle = appearance?.heroTitle || "Freshness at Your Fingertips";
  const heroSubtitle = appearance?.heroSubtitle || "The best groceries, delivered fresh to your door daily.";
  const heroImageUrl = appearance?.heroImageUrl || "https://picsum.photos/seed/101/1200/800";

  return (
    <>
      <HomeHeader />
      <div className="space-y-8 p-4 pt-0 sm:p-6 sm:pt-0">
        <section 
          className="relative -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 h-64 w-auto overflow-hidden rounded-b-2xl bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImageUrl})`}}
        >
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
              <h1 className="font-headline text-3xl font-bold md:text-4xl">{heroTitle}</h1>
              <p className="mt-2 max-w-md text-base text-white/90">{heroSubtitle}</p>
            </div>
        </section>

        <section className="-mt-16 space-y-4">
          <SearchBar />
        </section>

        <AdCarousel ads={appearance?.ads || []} />

         {specialOffers.length > 0 && (
            <section className="space-y-4">
            <h2 className="font-headline text-xl font-bold">Special Offers</h2>
            <Carousel
                opts={{ align: 'start', loop: specialOffers.length > 3 }}
            >
                <CarouselContent className="-ml-2">
                {specialOffers.map((product) => (
                    <CarouselItem key={product.id} className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 pl-2">
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
          {topCategories.length > 0 ? (
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
                        <CarouselItem key={product.id} className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 pl-2">
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
