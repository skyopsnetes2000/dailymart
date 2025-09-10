import HomeHeader from '@/components/home-header';
import CategoryCard from '@/components/category-card';
import ProductCard from '@/components/product-card';
import { categories, products } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function Home() {
  const topCategories = categories.slice(0, 4);

  return (
    <>
      <HomeHeader />
      <div className="space-y-8 p-4 sm:p-6">
        <section className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search for products..." className="pl-10 h-12" />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-headline text-xl font-bold">Shop by Category</h2>
            <Link href="/categories" className="text-sm font-medium text-primary">See All</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
