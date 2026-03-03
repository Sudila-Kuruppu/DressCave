import { NextRequest, NextResponse } from 'next/server';
import { getProductsByCategoryPaginated } from '@/lib/supabase/products';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categorySlug = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);

  if (!categorySlug) {
    return NextResponse.json(
      { error: 'Category slug is required' },
      { status: 400 }
    );
  }

  try {
    const result = await getProductsByCategoryPaginated({
      categorySlug,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
