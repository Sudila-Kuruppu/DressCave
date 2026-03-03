import { use } from 'react';
import { notFound } from 'next/navigation';
import { getProductsByCategoryPaginated } from '@/lib/supabase/products';
import { CategoryProductsClient } from '@/components/products';

type Props = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = use(params);
  
  // Get initial products (first page)
  const { products, category, hasMore, totalCount } = await getProductsByCategoryPaginated({
    categorySlug,
    page: 1,
    limit: 12,
  });

  // If category not found, show 404
  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          {category.name}
        </h1>
        <CategoryProductsClient
          initialProducts={products}
          initialCategory={category}
          categoryId={category.id}
          hasMore={hasMore}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}
