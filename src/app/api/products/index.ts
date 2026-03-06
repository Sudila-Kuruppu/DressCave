import { NextRequest, NextResponse } from 'next/server';
import { getProductsByCategoryPaginated, getProductsByCategoryFiltered } from '@/lib/supabase/products';
import { createClient } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categorySlug = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const subcategoryIdsParam = searchParams.get('subcategories');

  if (!categorySlug) {
    return NextResponse.json(
      { error: 'Category slug is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // First get category to validate
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', categorySlug)
      .single() as { data: { id: string; name: string } | null; error: any };

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Parse subcategory IDs if provided
    const subcategoryIds = subcategoryIdsParam
      ? subcategoryIdsParam.split(',').filter(Boolean)
      : [];

    // Validate subcategory IDs if provided
    if (subcategoryIds.length > 0) {
      // Verify all subcategory IDs exist and belong to this category
      const { data: subcategories, error: subcategoryError } = await supabase
        .from('categories')
        .select('id, name')
        .in('id', subcategoryIds)
        .eq('parent_id', category.id) as { data: Array<{ id: string; name: string }> | null; error: any };

      if (subcategoryError) {
        return NextResponse.json(
          { error: 'Failed to validate subcategories' },
          { status: 400 }
        );
      }

      // If some subcategories are invalid, filter them out and use valid ones
      if (subcategories && subcategories.length > 0) {
        const validIds = subcategories.map(s => s.id);
        if (validIds.length !== subcategoryIds.length) {
          console.warn(`Some subcategory IDs were invalid. Using ${validIds.length} of ${subcategoryIds.length}.`);
        }
        // Use only valid IDs
        subcategoryIds.splice(0, subcategoryIds.length, ...validIds);
      } else {
        // No valid subcategories found, return empty results
        return NextResponse.json({
          products: [],
          category,
          hasMore: false,
          totalCount: 0
        });
      }
    }

    // Use filtered query if subcategories are provided, otherwise use regular query
    const result = subcategoryIds.length > 0
      ? await getProductsByCategoryFiltered({
          categorySlug,
          subcategoryIds,
          page,
          limit,
        })
      : await getProductsByCategoryPaginated({
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
