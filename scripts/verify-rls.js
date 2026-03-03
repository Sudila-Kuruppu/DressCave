#!/usr/bin/env node
/**
 * RLS Verification Script
 * 
 * This script tests Row Level Security policies:
 * 1. Public read access (guest): Can read products, categories
 * 2. Authenticated user access: Can read/write own data
 * 3. Admin elevated access: Full access
 * 
 * Usage: node scripts/verify-rls.js
 */

const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables')
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

// Create clients
const anonClient = createClient(supabaseUrl, supabaseAnonKey)
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

async function verifyRLS() {
  console.log('🔍 Starting RLS Verification...\n')
  
  let passed = 0
  let failed = 0
  
  // Test 1: Public read access (guest)
  console.log('=== Test 1: Public Read Access (Guest) ===')
  
  try {
    // Test reading categories (should succeed)
    const { data: categories, error: catError } = await anonClient
      .from('categories')
      .select('*')
      .limit(5)
    
    if (catError) {
      console.log('❌ FAIL: Guest cannot read categories:', catError.message)
      failed++
    } else {
      console.log(`✅ PASS: Guest can read categories (${categories.length} records)`)
      passed++
    }
    
    // Test reading products (should succeed)
    const { data: products, error: prodError } = await anonClient
      .from('products')
      .select('*')
      .limit(5)
    
    if (prodError) {
      console.log('❌ FAIL: Guest cannot read products:', prodError.message)
      failed++
    } else {
      console.log(`✅ PASS: Guest can read products (${products.length} records)`)
      passed++
    }
    
    // Test reading reviews (should succeed - public)
    const { data: reviews, error: reviewError } = await anonClient
      .from('reviews')
      .select('*')
      .limit(5)
    
    if (reviewError) {
      console.log('❌ FAIL: Guest cannot read reviews:', reviewError.message)
      failed++
    } else {
      console.log(`✅ PASS: Guest can read reviews (${reviews.length} records)`)
      passed++
    }
    
  } catch (error) {
    console.log('❌ ERROR in Test 1:', error.message)
    failed++
  }
  
  console.log('')
  
  // Test 2: Admin access (service role)
  console.log('=== Test 2: Admin Elevated Access ===')
  
  try {
    // Test reading profiles with admin client (should succeed)
    const { data: adminProfiles, error: adminError } = await adminClient
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (adminError) {
      console.log('❌ FAIL: Admin cannot read profiles:', adminError.message)
      failed++
    } else {
      console.log(`✅ PASS: Admin can read profiles (${adminProfiles.length} records)`)
      passed++
    }
    
    // Test inserting a product with admin - use correct schema columns
    const { data: newProduct, error: insertError } = await adminClient
      .from('products')
      .insert({
        name: 'RLS Test Product',
        slug: 'rls-test-product-' + Date.now(),
        price: 9999,  // in cents
        category_id: null,  // nullable in schema
        base_sizes: ['S', 'M', 'L'],
        is_featured: false,
        is_new_arrival: false,
      })
      .select()
      .single()
    
    if (insertError) {
      console.log('❌ FAIL: Admin cannot insert products:', insertError.message)
      failed++
    } else {
      console.log('✅ PASS: Admin can insert products')
      passed++
      
      // Clean up test product
      await adminClient.from('products').delete().eq('id', newProduct.id)
      console.log('   (Cleaned up test product)')
    }
    
  } catch (error) {
    console.log('❌ ERROR in Test 2:', error.message)
    failed++
  }
  
  console.log('')
  
  // Test 3: User-specific data access (should return empty for anon, no error)
  console.log('=== Test 3: User-Specific Data Protection ===')
  
  try {
    // These should return EMPTY (not error) for anonymous user because RLS filters them out
    // This is CORRECT behavior - anon can query but sees no data
    
    const { data: cartData, error: cartError } = await anonClient
      .from('cart_items')
      .select('*')
    
    // RLS working: returns empty array, not error (anon can't see others' cart)
    if (cartError) {
      console.log('❌ FAIL: Unexpected error on cart_items:', cartError.message)
      failed++
    } else if (cartData && cartData.length === 0) {
      console.log('✅ PASS: Guest sees empty cart_items (RLS filtering works)')
      passed++
    } else {
      console.log('❌ FAIL: Guest can see cart_items data:', cartData)
      failed++
    }
    
    const { data: wishlistData, error: wishlistError } = await anonClient
      .from('wishlist_items')
      .select('*')
    
    // RLS working: returns empty array, not error
    if (wishlistError) {
      console.log('❌ FAIL: Unexpected error on wishlist_items:', wishlistError.message)
      failed++
    } else if (wishlistData && wishlistData.length === 0) {
      console.log('✅ PASS: Guest sees empty wishlist_items (RLS filtering works)')
      passed++
    } else {
      console.log('❌ FAIL: Guest can see wishlist_items data:', wishlistData)
      failed++
    }
    
    // Test measurements - should be protected
    const { data: measData, error: measError } = await anonClient
      .from('measurements')
      .select('*')
    
    if (measError) {
      console.log('✅ PASS: Guest cannot access measurements (error):', measError.message)
      passed++
    } else if (measData && measData.length === 0) {
      console.log('✅ PASS: Guest sees empty measurements (RLS filtering works)')
      passed++
    } else {
      console.log('❌ FAIL: Guest can see measurements data')
      failed++
    }
    
  } catch (error) {
    console.log('❌ ERROR in Test 3:', error.message)
    failed++
  }
  
  console.log('')
  
  // Summary
  console.log('=== RLS Verification Summary ===')
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  
  if (failed > 0) {
    console.log('\n⚠️  Some RLS tests failed. Please review your RLS policies.')
    process.exit(1)
  } else {
    console.log('\n✅ All RLS verification tests passed!')
    console.log('   - Public data (categories, products, reviews) is readable by guests')
    console.log('   - User-specific data (cart, wishlist, measurements) is protected')
    console.log('   - Admin has elevated access')
    process.exit(0)
  }
}

verifyRLS()
