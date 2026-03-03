-- Migration: 006_add_cart_wishlist_policies.sql
-- Description: Add missing RLS policies for cart_items and wishlist_items
-- Created: 2026-03-02

-- ============================================
-- Cart items policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can add to own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete from own cart" ON cart_items;

CREATE POLICY "Users can view own cart" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own cart" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Wishlist items policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlist_items;
DROP POLICY IF EXISTS "Users can add to own wishlist" ON wishlist_items;
DROP POLICY IF EXISTS "Users can delete from own wishlist" ON wishlist_items;
DROP POLICY IF EXISTS "Admins can manage wishlist" ON wishlist_items;

CREATE POLICY "Users can view own wishlist" ON wishlist_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist" ON wishlist_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own wishlist" ON wishlist_items
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage wishlist" ON wishlist_items
    FOR ALL USING (public.is_admin());
