'use client';

import { useState } from 'react';
import ProductCard from '@/components/product-card';
import { products, categories } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AllProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.categorySlug === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="flex gap-2 p-4 sm:p-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-12 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select onValueChange={setSelectedCategory} defaultValue="all">
          <SelectTrigger className="w-[150px] h-12">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 p-4 pt-0 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="p-4 pt-0 text-center text-muted-foreground sm:p-6">
          No products found. Try adjusting your search or filters.
        </p>
      )}
    </div>
  );
}
