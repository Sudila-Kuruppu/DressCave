-- Migration: 003_sample_data.sql
-- Description: Sample data for testing the DressCave schema
-- Created: 2026-03-01
-- Story: 1-2-set-up-supabase-project-database-schema

-- ============================================
-- Insert sample categories
-- ============================================

INSERT INTO categories (id, name, slug, description) VALUES
-- Main categories
('11111111-1111-1111-1111-000000000001', 'Women', 'women', 'Women clothing and accessories'),
('11111111-1111-1111-1111-000000000002', 'Kids', 'kids', 'Kids clothing and accessories'),
('11111111-1111-1111-1111-000000000003', 'Men', 'men', 'Men clothing and accessories');

-- Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('11111111-1111-1111-1111-000000000011', 'Dresses', 'women-dresses', '11111111-1111-1111-1111-000000000001', 'Women dresses'),
('11111111-1111-1111-1111-000000000012', 'Tops', 'women-tops', '11111111-1111-1111-1111-000000000001', 'Women tops and blouses'),
('11111111-1111-1111-1111-000000000013', 'Bottoms', 'women-bottoms', '11111111-1111-1111-1111-000000000001', 'Women pants and skirts'),
('11111111-1111-1111-1111-000000000021', 'Boys', 'kids-boys', '11111111-1111-1111-1111-000000000002', 'Boys clothing'),
('11111111-1111-1111-1111-000000000022', 'Girls', 'kids-girls', '11111111-1111-1111-1111-000000000002', 'Girls clothing');

-- ============================================
-- Insert sample products
-- ============================================

INSERT INTO products (id, name, slug, description, category_id, price, base_sizes, is_featured, is_new_arrival) VALUES
-- Women products
('22222222-2222-2222-2222-000000000001', 'Floral Summer Dress', 'floral-summer-dress', 'Beautiful floral print summer dress perfect for casual outings', '11111111-1111-1111-1111-000000000011', 4999, ARRAY['XS', 'S', 'M', 'L', 'XL'], true, true),
('22222222-2222-2222-2222-000000000002', 'Classic White Blouse', 'classic-white-blouse', 'Elegant white blouse suitable for office and casual wear', '11111111-1111-1111-1111-000000000012', 2999, ARRAY['XS', 'S', 'M', 'L', 'XL'], false, true),
('22222222-2222-2222-2222-000000000003', 'High-Waisted Jeans', 'high-waisted-jeans', 'Comfortable high-waisted jeans with stretch', '11111111-1111-1111-1111-000000000013', 5999, ARRAY['24', '26', '28', '30', '32'], true, false),

-- Kids products
('22222222-2222-2222-2222-000000000011', 'Disney Cartoon T-Shirt', 'disney-cartoon-tshirt', 'Fun Disney cartoon t-shirt for kids', '11111111-1111-1111-1111-000000000021', 1499, ARRAY['2-3Y', '4-5Y', '6-7Y', '8-9Y'], false, true),
('22222222-2222-2222-2222-000000000012', 'Princess Pink Dress', 'princess-pink-dress', 'Adorable pink dress for little princesses', '11111111-1111-1111-1111-000000000022', 3499, ARRAY['2-3Y', '4-5Y', '6-7Y', '8-9Y'], true, true),

-- Men products
('22222222-2222-2222-2222-000000000021', 'Cotton Polo Shirt', 'cotton-polo-shirt', 'Premium cotton polo shirt for men', '11111111-1111-1111-1111-000000000003', 2499, ARRAY['S', 'M', 'L', 'XL', 'XXL'], false, false),
('22222222-2222-2222-2222-000000000022', 'Slim Fit Chinos', 'slim-fit-chinos', 'Modern slim fit chinos for men', '11111111-1111-1111-1111-000000000003', 3999, ARRAY['28', '30', '32', '34', '36'], true, false);

-- ============================================
-- Insert sample product variants
-- ============================================

-- Variants for Floral Summer Dress
INSERT INTO product_variants (id, product_id, color, size, stock_quantity, price_modifier) VALUES
('33333333-3333-3333-3333-000000000001', '22222222-2222-2222-2222-000000000001', 'Blue', 'XS', 10, 0),
('33333333-3333-3333-3333-000000000002', '22222222-2222-2222-2222-000000000001', 'Blue', 'S', 15, 0),
('33333333-3333-3333-3333-000000000003', '22222222-2222-2222-2222-000000000001', 'Blue', 'M', 20, 0),
('33333333-3333-3333-3333-000000000004', '22222222-2222-2222-2222-000000000001', 'Pink', 'S', 12, 0),
('33333333-3333-3333-3333-000000000005', '22222222-2222-2222-2222-000000000001', 'Pink', 'M', 18, 0);

-- Variants for Classic White Blouse
INSERT INTO product_variants (id, product_id, color, size, stock_quantity, price_modifier) VALUES
('33333333-3333-3333-3333-000000000011', '22222222-2222-2222-2222-000000000002', 'White', 'XS', 8, 0),
('33333333-3333-3333-3333-000000000012', '22222222-2222-2222-2222-000000000002', 'White', 'S', 25, 0),
('33333333-3333-3333-3333-000000000013', '22222222-2222-2222-2222-000000000002', 'White', 'M', 30, 0),
('33333333-3333-3333-3333-000000000014', '22222222-2222-2222-2222-000000000002', 'White', 'L', 20, 0);

-- ============================================
-- Verify data was inserted
-- ============================================

-- This should return counts
-- SELECT 'categories' as table_name, COUNT(*) as count FROM categories
-- UNION ALL
-- SELECT 'products', COUNT(*) FROM products
-- UNION ALL
-- SELECT 'product_variants', COUNT(*) FROM product_variants;
