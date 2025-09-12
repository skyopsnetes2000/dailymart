
import CategoryCard from "@/components/category-card";
import PageHeader from "@/components/shared/page-header";
import { type Category } from "@/lib/data";
import { getCategories } from '@/lib/firestore';
import SearchableCategoryList from './searchable-category-list';

export default async function CategoriesPage() {
  const categories: Category[] = await getCategories();

  return (
    <div>
      <PageHeader title="All Categories" />
      <SearchableCategoryList categories={categories} />
    </div>
  )
}
