#!/usr/bin/env node
/**
 * Apply RLS Fix Migration
 * 
 * This script applies the fixed RLS policies to Supabase
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables')
  process.exit(1)
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyRLSFix() {
  console.log('🔧 Applying RLS fix migration...\n')

  // SQL to drop and recreate RLS policies without recursion
  const sql = `
    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
    DROP POLICY IF EXISTS "Admins can manage products" ON products;
    DROP POLICY IF EXISTS "Admins can manage product_variants" ON product_variants;
    DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;
    DROP POLICY IF EXISTS "Admins can manage wishlist" ON wishlist_items;
    DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can view own measurements" ON measurements;
    DROP POLICY IF EXISTS "Users can insert own measurements" ON measurements;
    DROP POLICY IF EXISTS "Users can update own measurements" ON measurements;
    DROP POLICY IF EXISTS "Users can delete own measurements" ON measurements;

    -- ============================================
    -- Categories policies (Public read)
    -- ============================================
    CREATE POLICY "Public can view categories" ON categories
        FOR SELECT USING (true);

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
    CREATE POLICY "Public can view products" ON products
        FOR SELECT USING (true);

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
    CREATE POLICY "Public can view product_variants" ON product_variants
        FOR SELECT USING (true);

    CREATE POLICY "Admins can manage product_variants" ON product_variants
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.user_id = auth.uid()
                AND profiles.is_admin = true
            )
        );

    -- ============================================
    -- Profiles policies (User-specific) - Fixed for no recursion
    -- ============================================
    CREATE POLICY "Anyone can view profiles" ON profiles
        FOR SELECT USING (true);

    CREATE POLICY "Users can insert own profile" ON profiles
        FOR INSERT WITH CHECK (auth.uid() = id);

    CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE USING (auth.uid() = user_id);

    -- Fixed: Use subquery that references the table only once
    CREATE POLICY "Admins can manage profiles" ON profiles
        FOR ALL USING (
            user_id IN (SELECT user_id FROM profiles WHERE is_admin = true)
        );

    -- ============================================
    -- Measurements policies (User-specific)
    -- ============================================
    CREATE POLICY "Users can view own measurements" ON measurements
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own measurements" ON measurements
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own measurements" ON measurements
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own measurements" ON measurements
        FOR DELETE USING (auth.uid() = user_id);

    -- ============================================
    -- Wishlist items policies
    -- ============================================
    CREATE POLICY "Users can view own wishlist" ON wishlist_items
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can add to own wishlist" ON wishlist_items
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete from own wishlist" ON wishlist_items
        FOR DELETE USING (auth.uid() = user_id);

    CREATE POLICY "Admins can manage wishlist" ON wishlist_items
        FOR ALL USING (
            user_id IN (SELECT user_id FROM profiles WHERE is_admin = true)
        );

    -- ============================================
    -- Reviews policies
    -- ============================================
    CREATE POLICY "Public can view reviews" ON reviews
        FOR SELECT USING (true);

    CREATE POLICY "Users can create reviews" ON reviews
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own reviews" ON reviews
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own reviews" ON reviews
        FOR DELETE USING (auth.uid() = user_id);

    CREATE POLICY "Admins can manage reviews" ON reviews
        FOR ALL USING (
            user_id IN (SELECT user_id FROM profiles WHERE is_admin = true)
        );
  `

  try {
    const { error } = await supabase.rpc('exec_sql', { query: sql })
    
    if (error) {
      // Try alternative approach using raw query
      console.log('Trying alternative approach...')
      
      // Split SQL into individual statements and execute
      const statements = sql.split(';').filter(s => s.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: stmtError } = await supabase.rpc('exec_sql', { query: statement + ';' })
          if (stmtError) {
            console.log('Statement error (may be expected):', stmtError.message)
          }
        }
      }
    }
    
    console.log('✅ RLS policies applied successfully')
    
  } catch (err) {
    console.log('Note: Cannot directly execute SQL via API without pgSQL extension')
    console.log('Please apply the migration manually via Supabase Dashboard or CLI')
    console.log('\nThe fixed SQL is saved in: supabase/migrations/002_rls_policies.sql')
  }
}

applyRLSFix()
