
import ProductCard from '@/components/product-card';
import { type Product, type Category } from '@/lib/data';
import { getCategories, getProducts } from '@/lib/firestore';
import PageHeader from '@/components/shared/page-header';
import FilterableProductList from './filterable-product-list';

export default async function AllProductsPage() {
  const [allProducts, categories]: [Product[], Category[]] = await Promise.all([
      getProducts(),
      getCategories()
  ]);

  return (
    <div>
      <PageHeader title="All Products" />
      <FilterableProductList allProducts={allProducts} categories={categories} />
    </div>
  );
}
