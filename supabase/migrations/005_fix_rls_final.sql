-- Migration: 005_fix_rls_final.sql
-- Description: Fix RLS policies infinite recursion - use function approach
-- Created: 2026-03-02
-- Story: 1-3-configure-supabase-client-auth

-- ============================================
-- Create helper function to check admin status
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.is_admin = true
    );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- Categories policies
-- ============================================
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (public.is_admin());

-- ============================================
-- Products policies
-- ============================================
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (public.is_admin());

-- ============================================
-- Product variants policies
-- ============================================
DROP POLICY IF EXISTS "Public can view product_variants" ON product_variants;
DROP POLICY IF EXISTS "Admins can manage product_variants" ON product_variants;

CREATE POLICY "Public can view product_variants" ON product_variants
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage product_variants" ON product_variants
    FOR ALL USING (public.is_admin());

-- ============================================
-- Profiles policies - FIXED with function
-- ============================================
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;

CREATE POLICY "Anyone can view profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Use function to avoid recursion
CREATE POLICY "Admins can manage profiles" ON profiles
    FOR ALL USING (public.is_admin());

-- ============================================
-- Measurements policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own measurements" ON measurements;
DROP POLICY IF EXISTS "Users can insert own measurements" ON measurements;
DROP POLICY IF EXISTS "Users can update own measurements" ON measurements;
DROP POLICY IF EXISTS "Users can delete own measurements" ON measurements;

CREATE POLICY "Users can view own measurements" ON measurements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements" ON measurements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements" ON measurements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements" ON measurements
    FOR DELETE USING (auth.uid() = user_id);

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

-- ============================================
-- Reviews policies
-- ============================================
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;

CREATE POLICY "Public can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reviews" ON reviews
    FOR ALL USING (public.is_admin());
