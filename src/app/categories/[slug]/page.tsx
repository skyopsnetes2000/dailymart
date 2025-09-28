
'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/product-card';
import PageHeader from '@/components/shared/page-header';
import { type Category, type Product } from '@/lib/data';
import { getCategories, getProducts } from '@/lib/firestore';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

function ProductGrid({ products }: { products: Product[] }) {
    if (products.length === 0) {
        return (
            <p className="p-4 text-center text-muted-foreground sm:p-6">
              No products found in this category.
            </p>
        );
    }
    return (
        <div className="grid grid-cols-3 gap-3 p-4 pt-0 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}


export default function CategoryProductsPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [category, setCategory] = useState<Category | null | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData(slug: string) {
        setLoading(true);
        try {
            const [categoryData, productsData] = await Promise.all([
                getCategories().then(cats => cats.find(c => c.slug === slug)),
                getProducts(slug)
            ]);

            if (!categoryData) {
                setCategory(null);
            } else {
                setCategory(categoryData);
                setProducts(productsData);
            }
        } catch (error) {
            console.error("Failed to fetch category data:", error);
            setCategory(null); // Triggers notFound in render
        } finally {
            setLoading(false);
        }
    }

    if (slug) {
        fetchData(slug);
    } else {
        setLoading(false);
        setCategory(null);
    }
  }, [slug]);

  if (category === null) {
      notFound();
  }
  
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader title={category?.name || 'Loading...'} />
      <div className="px-4 sm:px-6 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search in this category..."
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-3 gap-3 p-4 pt-0 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {Array.from({length: 12}).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[4/5] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
      ) : (
          <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}

