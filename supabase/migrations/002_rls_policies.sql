-- Migration: 002_rls_policies.sql
-- Description: Row Level Security policies for DressCave
-- Created: 2026-03-01
-- Story: 1-2-set-up-supabase-project-database-schema

-- ============================================
-- Enable RLS on all tables
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Categories policies (Public read)
-- ============================================

-- Anyone can view categories
CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete categories (admin only in practice)
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- ============================================
-- Products policies (Public read)
-- ============================================

-- Anyone can view products
CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete products (admin only)
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- ============================================
-- Product variants policies (Public read)
-- ============================================

-- Anyone can view product variants
CREATE POLICY "Public can view product variants" ON product_variants
    FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete product variants (admin only)
CREATE POLICY "Admins can manage product variants" ON product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- ============================================
-- Profiles policies (User-specific)
-- ============================================

-- Users can view any profile (for display purposes)
CREATE POLICY "Anyone can view profiles" ON profiles
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all profiles
CREATE POLICY "Admins can manage profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.is_admin = true
        )
    );

-- Function to handle new user signup - creates profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, user_id, full_name, email)
    VALUES (NEW.id, NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Measurements policies (User-specific)
-- ============================================

-- Users can view measurements (their own or all for admin)
CREATE POLICY "Users can view own measurements" ON measurements
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Users can insert their own measurements
CREATE POLICY "Users can insert own measurements" ON measurements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own measurements
CREATE POLICY "Users can update own measurements" ON measurements
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own measurements
CREATE POLICY "Users can delete own measurements" ON measurements
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Cart items policies (User-specific)
-- ============================================

-- Users can view their own cart
CREATE POLICY "Users can view own cart" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add to their own cart
CREATE POLICY "Users can add to own cart" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update own cart" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can remove from their own cart
CREATE POLICY "Users can delete from own cart" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Wishlist items policies (User-specific)
-- ============================================

-- Users can view their own wishlist
CREATE POLICY "Users can view own wishlist" ON wishlist_items
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add to their own wishlist
CREATE POLICY "Users can add to own wishlist" ON wishlist_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove from their own wishlist
CREATE POLICY "Users can delete from own wishlist" ON wishlist_items
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all wishlist items
CREATE POLICY "Admins can manage wishlist" ON wishlist_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- ============================================
-- Reviews policies
-- ============================================

-- Anyone can view reviews
CREATE POLICY "Public can view reviews" ON reviews
    FOR SELECT USING (true);

-- Authenticated users can insert reviews for products
CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );
