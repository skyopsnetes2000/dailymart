
'use client';

import { useState } from 'react';
import ProductCard from '@/components/product-card';
import { type Product } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function SearchableProductList({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="px-4 sm:px-6 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search in this category..."
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 p-4 pt-0 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="p-4 text-center text-muted-foreground sm:p-6">
          No products found matching your search.
        </p>
      )}
    </>
  );
}
