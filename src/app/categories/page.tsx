import CategoryCard from "@/components/category-card";
import PageHeader from "@/components/shared/page-header";
import { categories } from "@/lib/data";

export default function CategoriesPage() {
  return (
    <div>
      <PageHeader title="All Categories" />
      <div className="grid grid-cols-2 gap-4 p-4 sm:p-6 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
