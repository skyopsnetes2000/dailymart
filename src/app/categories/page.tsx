import CategoryCard from "@/components/category-card";
import PageHeader from "@/components/shared/page-header";
import { categories } from "@/lib/data";

export default function CategoriesPage() {
  return (
    <div>
      <PageHeader title="All Categories" />
      <div className="grid grid-cols-3 gap-3 p-4 sm:p-6 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
