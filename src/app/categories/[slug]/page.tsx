
import ProductCard from '@/components/product-card';
import PageHeader from '@/components/shared/page-header';
import { type Category, type Product } from '@/lib/data';
import { notFound } from 'next/navigation';
import { getCategories, getProducts } from '@/lib/firestore';
import SearchableProductList from './searchable-product-list';

async function getCategory(slug: string): Promise<Category | undefined> {
    const allCategories = await getCategories();
    return allCategories.find((c) => c.slug === slug);
}

async function getCategoryProducts(slug: string): Promise<Product[]> {
    return getProducts(slug);
}

type Props = {
    params: { slug: string };
};

export default async function CategoryProductsPage({ params }: Props) {
  const slug = decodeURIComponent(params.slug);
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const products = await getCategoryProducts(slug);

  return (
    <div>
      <PageHeader title={category.name} />
      <SearchableProductList products={products} />
    </div>
  );
}
