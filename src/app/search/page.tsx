
import { Suspense } from 'react';
import ProductCard from '@/components/product-card';
import PageHeader from '@/components/shared/page-header';
import { type Product } from '@/lib/data';
import { getProducts } from '@/lib/firestore';
import { Search } from 'lucide-react';

async function SearchResults({ query }: { query: string }) {
  const allProducts = await getProducts();
  const products = allProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.description.toLowerCase().includes(query.toLowerCase())
  );

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

export default function SearchPage({ searchParams }: { searchParams: { q: string } }) {
    const query = searchParams.q || '';
    
    return (
      <div>
        <PageHeader title="Search Results" />
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults query={query} />
        </Suspense>
      </div>
    );
}
