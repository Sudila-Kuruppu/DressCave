// Supabase products client

import { createClient } from './server-client';
import type { Product, Category } from '@/types/product';
import type { Database } from './database.types';

// Re-export Product type for convenience
export type { Product, Category };

type CategoriesRow = Database['public']['Tables']['categories']['Row'];
type ProductsRow = Database['public']['Tables']['products']['Row'];

// Legacy function using direct Supabase client - for backward compatibility
export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data as Product;
}

export async function getProductsByCategory(categorySlug: string) {
  const supabase = await createClient();
  
  // First get the category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single() as { data: CategoriesRow | null; error: Error | null };

  if (categoryError || !category) {
    console.error('Error fetching category:', categoryError);
    return { products: [] as Product[], category: null as Category | null };
  }

  // Then get products for that category
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false }) as { data: ProductsRow[] | null; error: Error | null };

  if (productsError) {
    console.error('Error fetching products:', productsError);
    const mappedCategory: Category = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent_id: category.parent_id,
      image_url: null,
      display_order: 0,
    };
    return { products: [] as Product[], category: mappedCategory };
  }

  // Map database row to Product type
  const mappedProducts: Product[] = (products || []).map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: p.price,
    category_id: p.category_id || '',
    image_url: null,
    images: [],
    is_featured: p.is_featured,
    is_new_arrival: p.is_new_arrival,
    stock_quantity: 0,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));

  const mappedCategory: Category = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parent_id: category.parent_id,
    image_url: null,
    display_order: 0,
  };

  return { 
    products: mappedProducts, 
    category: mappedCategory
  };
}

// Pagination options
export interface ProductsPaginationOptions {
  categorySlug: string;
  page?: number;
  limit?: number;
}

export interface ProductsResult {
  products: Product[];
  category: Category | null;
  hasMore: boolean;
  totalCount: number;
}

export async function getProductsByCategoryPaginated({
  categorySlug,
  page = 1,
  limit = 12,
}: ProductsPaginationOptions): Promise<ProductsResult> {
  const supabase = await createClient();
  
  // First get the category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single() as { data: CategoriesRow | null; error: Error | null };

  if (categoryError || !category) {
    console.error('Error fetching category:', categoryError);
    return { products: [], category: null, hasMore: false, totalCount: 0 };
  }

  const offset = (page - 1) * limit;

  // Get total count
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('is_active', true);

  // Get products with pagination
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1) as { data: ProductsRow[] | null; error: Error | null };

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return { 
      products: [], 
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parent_id: category.parent_id,
        image_url: null,
        display_order: 0,
      }, 
      hasMore: false, 
      totalCount: count || 0 
    };
  }

  // Map database row to Product type
  const mappedProducts: Product[] = (products || []).map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: p.price,
    category_id: p.category_id || '',
    image_url: null,
    images: [],
    is_featured: p.is_featured,
    is_new_arrival: p.is_new_arrival,
    stock_quantity: 0,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));

  const totalCount = count || 0;
  const hasMore = offset + (products?.length || 0) < totalCount;

  const mappedCategory: Category = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parent_id: category.parent_id,
    image_url: null,
    display_order: 0,
  };

  return {
    products: mappedProducts,
    category: mappedCategory,
    hasMore,
    totalCount
  };
}

// Filter options
export interface ProductsFilterOptions {
  categorySlug: string;
  subcategoryIds?: string[];
  page?: number;
  limit?: number;
}

export async function getProductsByCategoryFiltered({
  categorySlug,
  subcategoryIds = [],
  page = 1,
  limit = 12,
}: ProductsFilterOptions): Promise<ProductsResult> {
  const supabase = await createClient();

  // First get the category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single() as { data: CategoriesRow | null; error: Error | null };

  if (categoryError || !category) {
    console.error('Error fetching category:', categoryError);
    return { products: [], category: null, hasMore: false, totalCount: 0 };
  }

  const offset = (page - 1) * limit;

  // Build base query
  let query = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('is_active', true);

  // Apply subcategory filter if provided
  if (subcategoryIds.length > 0) {
    query = query.in('subcategory_id', subcategoryIds);
  }

  // Get total count
  const { count } = await query;

  // Build data query
  query = supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true);

  if (subcategoryIds.length > 0) {
    query = query.in('subcategory_id', subcategoryIds);
  }

  // Get products with pagination
  const { data: products, error: productsError } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1) as { data: ProductsRow[] | null; error: Error | null };

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return {
      products: [],
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parent_id: category.parent_id,
        image_url: null,
        display_order: 0,
      },
      hasMore: false,
      totalCount: count || 0
    };
  }

  // Map database row to Product type
  const mappedProducts: Product[] = (products || []).map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: p.price,
    category_id: p.category_id || '',
    image_url: null,
    images: [],
    is_featured: p.is_featured,
    is_new_arrival: p.is_new_arrival,
    stock_quantity: 0,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));

  const totalCount = count || 0;
  const hasMore = offset + (products?.length || 0) < totalCount;

  const mappedCategory: Category = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parent_id: category.parent_id,
    image_url: null,
    display_order: 0,
  };

  return {
    products: mappedProducts,
    category: mappedCategory,
    hasMore,
    totalCount
  };
}
