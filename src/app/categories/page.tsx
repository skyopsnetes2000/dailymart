
'use client';

import { useEffect, useState } from 'react';
import CategoryCard from "@/components/category-card";
import PageHeader from "@/components/shared/page-header";
import { type Category } from "@/lib/data";
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';


const CATEGORIES_STORAGE_KEY = 'admin_categories';
const IMAGE_STORAGE_PREFIX = 'category_image_';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
       console.warn("Could not access localStorage. Categories may not be up to date.");
    } finally {
        setLoading(false);
    }
  }, []);
  
  const getCategoryImage = (category: Category) => {
    try {
        const storedImage = localStorage.getItem(`${IMAGE_STORAGE_PREFIX}${category.id}`);
        if (storedImage) {
            return storedImage;
        }
    } catch (error) {
        console.warn("Could not access localStorage for images");
    }
    const placeholder = PlaceHolderImages.find((img) => img.id === category.imageId);
    return placeholder?.imageUrl;
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
