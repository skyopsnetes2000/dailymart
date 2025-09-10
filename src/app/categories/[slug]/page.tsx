import ProductCard from '@/components/product-card';
import PageHeader from '@/components/shared/page-header';
import { categories, products } from '@/lib/data';
import { notFound } from 'next/navigation';

export default function CategoryProductsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const category = categories.find((c) => c.slug === slug);
  const categoryProducts = products.filter((p) => p.categorySlug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <PageHeader title={category.name} />
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 p-4 sm:p-6 md:grid-cols-3 lg:grid-cols-4">
          {categoryProducts.map((product) => (
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
