
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoryCard from "@/components/category-card";
import PageHeader from "@/components/shared/page-header";
import { type Category } from "@/lib/data";
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/lib/firestore';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

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
  
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategorySelect = (slug: string) => {
    if (slug) {
        router.push(`/categories/${slug}`);
    }
  }

  return (
    <div>
      <PageHeader title="All Categories" />
      <div className="flex gap-2 p-4 sm:p-6 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for categories..."
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select onValueChange={handleCategorySelect}>
            <SelectTrigger className="w-[180px] h-12">
                <SelectValue placeholder="Quick Select" />
            </SelectTrigger>
            <SelectContent>
                {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

       {loading ? (
        <div className="grid grid-cols-4 gap-3 p-4 pt-0 sm:p-6 md:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-4 gap-3 p-4 pt-0 sm:p-6 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="flex h-[50vh] flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground">No categories found.</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search.</p>
        </div>
      )}
    </div>
  )
}
