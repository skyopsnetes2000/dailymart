
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product-card';
import PageHeader from '@/components/shared/page-header';
import { type Product } from '@/lib/data';
import { getProducts } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const allProducts = await getProducts();
        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) || 
            p.description.toLowerCase().includes(query.toLowerCase())
        );
        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching products for search:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3 p-4 pt-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <Search className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No results found for "{query}"</h2>
        <p className="text-muted-foreground">Try searching for something else.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 p-4 pt-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}


export default function SearchPage() {
    return (
      <div>
        <PageHeader title="Search Results" />
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
      </div>
    );
}

