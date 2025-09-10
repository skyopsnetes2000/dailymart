
'use client';

import { useEffect, useState } from 'react';
import CategoryCard from "@/components/category-card";
import PageHeader from "@/components/shared/page-header";
import { type Category } from "@/lib/data";
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getCategories } from '@/lib/firestore';


export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const categoriesData = await getCategories();
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error fetching categories", error);
        } finally {
            setLoading(false);
        }
    };
    fetchCategories();
  }, []);
  
  const getCategoryImage = (category: Category) => {
    const placeholder = PlaceHolderImages.find((img) => img.id === category.imageId || img.imageUrl === category.imageId);
    return category.imageId.startsWith('https') ? category.imageId : placeholder?.imageUrl;
  }

  return (
    <div>
      <PageHeader title="All Categories" />
       {loading ? (
        <div className="grid grid-cols-4 gap-3 p-4 sm:p-6 md:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-4 gap-3 p-4 sm:p-6 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} imageUrl={getCategoryImage(category)} />
          ))}
        </div>
      ) : (
        <div className="flex h-[50vh] flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground">No categories found.</p>
            <p className="text-sm text-muted-foreground">The admin has not added any categories yet.</p>
        </div>
      )}
    </div>
  )
}
