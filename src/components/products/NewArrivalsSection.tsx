import { getNewArrivals } from '@/lib/supabase/products';
import ProductGrid from './ProductGrid';

export default async function NewArrivalsSection() {
  const products = await getNewArrivals();

  // Don't render section if no new arrivals available
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="new-arrivals-section py-16 px-4 md:px-8">
      <div className="new-arrivals-header text-center mb-8">
        <h2 className="section-title text-3xl font-bold text-[#FF6F61] mb-2">
          New Arrivals
        </h2>
        <p className="section-subtitle text-gray-600">
          Discover the latest additions to our collection
        </p>
      </div>

      <ProductGrid products={products} />
    </section>
  );
}
