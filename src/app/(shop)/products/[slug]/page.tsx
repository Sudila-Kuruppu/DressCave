import { getProductBySlug } from '@/lib/supabase/products';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Fetch product by slug
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }
  
  // Parse images array if stored as string
  const images = product.images 
    ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images)
    : [];
  
  // Parse sizes/colors if stored as string
  const sizes = product.sizes 
    ? (typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes)
    : [];
  const colors = product.colors 
    ? (typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors)
    : [];
  
  return (
    <main className="product-detail-page">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Gallery */}
          <div className="gallery-section">
            <ProductGallery images={images} productName={product.name} />
          </div>
          
          {/* Right: Info */}
          <div className="info-section">
            <ProductInfo 
              product={{
                ...product,
                images,
                sizes,
                colors
              }} 
            />
          </div>
        </div>
      </div>
    </main>
  );
}
