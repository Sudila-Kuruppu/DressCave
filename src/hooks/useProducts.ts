// Products hook
// Placeholder - to be implemented in future stories

import { useState, useEffect } from 'react';
import { getProducts, getProductBySlug, getProductsByCategory, type Product } from '@/lib/supabase/products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    reload: loadProducts,
  };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  return { product, loading };
}

export function useProductsByCategory(categorySlug: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await getProductsByCategory(categorySlug);
        setProducts(result.products);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categorySlug]);

  return { products, loading };
}
