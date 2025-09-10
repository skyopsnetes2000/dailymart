import HomeHeader from '@/components/home-header';
import CategoryCard from '@/components/category-card';
import ProductCard from '@/components/product-card';
import { categories, products } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Home() {
  const featuredProducts = products.slice(0, 4);

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
          <h2 className="font-headline text-xl font-bold">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
        
        <section className="space-y-4">
          <h2 className="font-headline text-xl font-bold">Best Sellers</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
