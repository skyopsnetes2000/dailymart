

'use client';

import { useEffect, useState, use } from 'react';
import ProductCard from '@/components/product-card';
import PageHeader from '@/components/shared/page-header';
import { type Category, type Product } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories, getProducts } from '@/lib/firestore';

export default function CategoryProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: encodedSlug } = use(params);
  const [category, setCategory] = useState<Category | null | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
        <div>
            <PageHeader title={<Skeleton className="h-8 w-48" />} />
            <div className="grid grid-cols-3 gap-3 p-4 pt-0 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
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
      {products.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 p-4 pt-0 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="p-4 text-center text-muted-foreground sm:p-6">
          No products found in this category yet.
        </p>
      )}
    </div>
  );
}
