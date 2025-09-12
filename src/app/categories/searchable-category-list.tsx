
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoryCard from "@/components/category-card";
import { type Category } from "@/lib/data";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


export default function SearchableCategoryList({ categories }: { categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategorySelect = (slug: string) => {
    if (slug) {
        router.push(`/categories/${slug}`);
    }
  }

  return (
    <>
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

       {filteredCategories.length > 0 ? (
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
    </>
  );
}
