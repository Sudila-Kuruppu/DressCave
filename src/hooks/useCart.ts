// Cart hook
// Placeholder - to be implemented in future stories

import { useState, useEffect } from 'react';
import { getCart, addToCart as addToCartApi, updateCartItem as updateCartItemApi, removeFromCart as removeFromCartApi, type CartItem } from '@/lib/supabase/cart';

export function useCart(userId: string | null) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadCart();
    }
  }, [userId]);

  async function loadCart() {
    if (!userId) return;
    setLoading(true);
    try {
      const cartItems = await getCart(userId);
      setItems(cartItems);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(productId: string, quantity: number = 1) {
    if (!userId) return;
    await addToCartApi(userId, productId, quantity);
    await loadCart();
  }

  async function updateQuantity(itemId: string, quantity: number) {
    await updateCartItemApi(itemId, quantity);
    await loadCart();
  }

  async function removeItem(itemId: string) {
    await removeFromCartApi(itemId);
    await loadCart();
  }

  const total = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    total,
  };
}
