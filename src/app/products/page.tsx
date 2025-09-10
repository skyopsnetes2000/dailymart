import ProductCard from '@/components/product-card';
import PageHeader from '@/components/shared/page-header';
import { products } from '@/lib/data';

export default function AllProductsPage() {
  return (
    <div>
      <PageHeader title="All Products" />
      <div className="grid grid-cols-3 gap-3 p-4 sm:p-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
