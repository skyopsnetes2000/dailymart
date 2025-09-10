import ProductCard from '@/components/product-card';
import PageHeader from '@/components/shared/page-header';
import { products } from '@/lib/data';

export default function AllProductsPage() {
  return (
    <div>
      <PageHeader title="All Products" />
      <div className="grid grid-cols-2 gap-4 p-4 sm:p-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
