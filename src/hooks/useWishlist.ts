// Wishlist hook
// Placeholder - to be implemented in future stories

import { useState, useEffect } from 'react';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export function useWishlist(userId: string | null) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadWishlist();
    }
  }, [userId]);

  async function loadWishlist() {
    if (!userId) return;
    setLoading(true);
    try {
      // TODO: Implement with Supabase
      const wishlistItems: WishlistItem[] = [];
      setItems(wishlistItems);
    } finally {
      setLoading(false);
    }
  }

  async function addToWishlist(productId: string) {
    if (!userId) return;
    // TODO: Implement with Supabase
    await loadWishlist();
  }

  async function removeFromWishlist(productId: string) {
    if (!userId) return;
    // TODO: Implement with Supabase
    await loadWishlist();
  }

  async function isInWishlist(productId: string): Promise<boolean> {
    return items.some(item => item.product_id === productId);
  }

  return {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
}
