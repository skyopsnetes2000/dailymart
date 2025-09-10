
'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/product-card';
import PageHeader from '@/components/shared/page-header';
import { type Category, type Product } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const PRODUCTS_STORAGE_KEY = 'admin_products';
const CATEGORIES_STORAGE_KEY = 'admin_categories';

export default function CategoryProductsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [category, setCategory] = useState<Category | null | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      
      let allCategories: Category[] = [];
      if (storedCategories) {
        allCategories = JSON.parse(storedCategories);
      }
      
      let allProducts: Product[] = [];
      if (storedProducts) {
        allProducts = JSON.parse(storedProducts);
      }

      const currentCategory = allCategories.find((c) => c.slug === slug);
      setCategory(currentCategory);

      if (currentCategory) {
        const categoryProducts = allProducts.filter((p) => p.categorySlug === slug);
        setProducts(categoryProducts);
      }
    } catch (error) {
        console.warn("Could not access localStorage. Content may not be up to date.");
    } finally {
        setLoading(false);
    }
  }, [slug]);

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
        <div className="grid grid-cols-3 gap-4 p-4 sm:p-6 md:grid-cols-4 lg:grid-cols-5">
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
