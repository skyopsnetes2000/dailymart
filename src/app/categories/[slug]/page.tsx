

'use client';

import { useEffect, useState, use } from 'react';
import ProductCard from '@/components/product-card';
import PageHeader from '@/components/shared/page-header';
import { type Category, type Product } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories, getProducts } from '@/lib/firestore';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function CategoryProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: encodedSlug } = use(params);
  const [category, setCategory] = useState<Category | null | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const slug = decodeURIComponent(encodedSlug);
    const fetchData = async () => {
        try {
            const allCategories = await getCategories();
            const currentCategory = allCategories.find((c) => c.slug === slug);
            setCategory(currentCategory);

            if (currentCategory) {
                const categoryProducts = await getProducts(currentCategory.slug);
                setProducts(categoryProducts);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [encodedSlug]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
        <div>
            <PageHeader title={<Skeleton className="h-8 w-48" />} />
             <div className="px-4 sm:px-6">
                <Skeleton className="h-12 w-full" />
            </div>
            <div className="grid grid-cols-3 gap-3 p-4 pt-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                ))}
            </div>
        </div>
    )
  }

  if (category === undefined) {
      // Still loading or error state
      return null;
  }
  
  if (!category) {
    notFound();
  }

  return (
    <div>
      <PageHeader title={category.name} />
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
    </div>
  );
}
