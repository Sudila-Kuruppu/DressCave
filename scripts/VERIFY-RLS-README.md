# Supabase RLS Verification Script Usage Guide

## Overview

The `verify-rlp-policies.mjs` script automates the verification of Supabase Row Level Security (RLS) policies to ensure:
- Public tables allow guest access
- Protected tables require authentication
- Guest browsing functionality works as expected

## Prerequisites

- ✅ Supabase project configured (`.env.local` has credentials)
- ✅ Database tables created
- ✅ RLS policies applied to tables

## Quick Start

```bash
cd dresscave
node scripts/verify-rlp-policies.mjs
```

## Script Behavior

### What It Does

1. **Connects to Supabase** - Uses anon key from `.env.local` (respects RLS)
2. **Checks Public Tables** - Verifies `products` and `categories` allow guest access
3. **Tests Public Access** - Attempts to query public tables without auth
4. **Checks Protected Tables** - Verifies `cart_items` and `wishlist_items` require auth
5. **Tests Protected Access** - Attempts to query protected tables without auth (should return empty)

### Expected Output

**Success (All Pass):**
```
✅ Public Policies Check: PASS
✅ Public Access Test: PASS
✅ Protected Policies Check: PASS
✅ Protected Access Test: PASS

✅ All RLS policy checks passed!
```

**Failure (Issues Found):**
```
❌ Some RLS policy checks failed

Possible issues:
  1. RLS policies not configured correctly
  2. Database tables may not exist yet
  3. Supabase connection or permission issues
```

## Verification Steps

### Step 1: Public Tables Check
- Verifies RLS policy exists for `products` table
- Verifies RLS policy exists for `categories` table
- Provides SQL query for manual policy inspection

### Step 2: Public Access Test
- Queries `products` table with anon key
- Queries `categories` table with anon key
- **Expected:** Returns data (guest access allowed)

### Step 3: Protected Tables Check
- Verifies RLS policy exists for `cart_items` table
- Verifies RLS policy exists for `wishlist_items` table
- Provides SQL query for manual policy inspection

### Step 4: Protected Access Test
- Queries `cart_items` table with anon key
- Queries `wishlist_items` table with anon key
- **Expected:** Returns empty array (auth required)

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Integration with Story 2.7

This script was created for **Story 2.7: Guest Browsing**, Task 4 to verify that:
- Guest users can browse products and categories
- Guest users cannot access cart/wishlist data
- RLS policies properly separate public vs private data

## Troubleshooting

### "Missing Supabase credentials"
**Error:** `❌ Error: Missing Supabase credentials in .env.local`

**Solution:** Check that `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "Cannot read products"
**Error:** `❌ Cannot read products: [ Supabase error ]`

**Solution:**
1. Check Supabase connection
2. Verify `products` table exists
3. Check RLS policies allow anon key
4. Run: `SELECT * FROM products LIMIT 1;` in Supabase SQL Editor

### "Returned data without auth"
**Warning:** `⚠️ WARNING: cart_items returned data without auth`

**Solution:** RLS policy may need updating. Run in Supabase SQL Editor:
```sql
-- Check current policy
SELECT * FROM pg_policies WHERE tablename = 'cart_items';

-- Expected: Policy with auth.uid() check
-- Example: USING (auth.uid() = user_id)
```

## Manual Verification

For additional verification, use the Supabase Dashboard:

1. Open: https://supabase.com/dashboard/project/wxxzhhfbwmajoodsiasq
2. Go to **SQL Editor**
3. Run:
```sql
-- View all policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('products', 'categories', 'cart_items', 'wishlist_items');
```

## Future Maintenance

When RLS policies are added or modified:
1. Re-run verification script
2. Check results
3. Update documentation if behavior changes

## Script Location

`dresscave/scripts/verify-rlp-policies.mjs`

## Related Documentation

- **Story 2.7:** `_bmad-output/implementation-artifacts/2-7-guest-browsing.md`
- **RLS Notes:** `_bmad-output/implementation-artifacts/2-7-rlp-verification-notes.md`
- **Verification Report:** `_bmad-output/implementation-artifacts/2-7-rls-verification-report.md`

---

**Last Updated:** 2026-03-04
**Story ID:** 2.7
**Status:** Task 4 - COMPLETED ✓
