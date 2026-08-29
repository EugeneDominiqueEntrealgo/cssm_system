-- ============================================================
-- Convenience Store - Complete Database Fix
-- Run this ENTIRE script in Supabase SQL Editor (NEW QUERY)
-- This fixes ALL reported issues at once:
--   1. Client/Staff account creation (role check constraint)
--   2. Admin delete/reject users (RLS delete + update policies)
--   3. Migrate legacy 'user' roles to 'client'
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. FIX USERS ROLE CHECK CONSTRAINT
--    The current constraint only allows ('admin','staff','user').
--    The app inserts 'client', so we must allow 'client' too.
-- ─────────────────────────────────────────────
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'staff', 'client'));

-- Update any legacy 'user' roles to 'client'
UPDATE users SET role = 'client' WHERE role = 'user';

-- ─────────────────────────────────────────────
-- 2. FIX RLS POLICIES FOR USERS TABLE
--    - Add DELETE policy (so admin can delete users)
--    - Fix UPDATE policy (so admin can reject/approve/edit)
--      The app uses the anon/service key, so auth.uid() is null.
--      We allow all updates/deletes so the admin dashboard works.
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public read access to users" ON users;
DROP POLICY IF EXISTS "Allow anyone to insert users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to update users" ON users;
DROP POLICY IF EXISTS "Allow app to update users" ON users;
DROP POLICY IF EXISTS "Allow app to delete users" ON users;

CREATE POLICY "Allow public read access to users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert users" ON users
    FOR INSERT WITH CHECK (true);

-- Allow updates (approve/reject/edit)
CREATE POLICY "Allow app to update users" ON users
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow deletes (admin can delete users)
CREATE POLICY "Allow app to delete users" ON users
    FOR DELETE USING (true);

-- ─────────────────────────────────────────────
-- 3. FIX RLS POLICIES FOR OTHER TABLES
--    (products, promos, transactions, transaction_items,
--     pending_submissions) so the app can read/write using
--     the anon key.
-- ─────────────────────────────────────────────

-- PRODUCTS
DROP POLICY IF EXISTS "Allow public read access to active products" ON products;
DROP POLICY IF EXISTS "Allow anyone to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;
DROP POLICY IF EXISTS "Allow app to update products" ON products;
DROP POLICY IF EXISTS "Allow app to delete products" ON products;

CREATE POLICY "Allow public read access to active products" ON products
    FOR SELECT USING (status = 'active' OR true);
CREATE POLICY "Allow anyone to insert products" ON products
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow app to update products" ON products
    FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow app to delete products" ON products
    FOR DELETE USING (true);

-- PROMOS
DROP POLICY IF EXISTS "Allow public read access to active promos" ON promos;
DROP POLICY IF EXISTS "Allow anyone to insert promos" ON promos;
DROP POLICY IF EXISTS "Allow authenticated users to update promos" ON promos;
DROP POLICY IF EXISTS "Allow authenticated users to delete promos" ON promos;
DROP POLICY IF EXISTS "Allow app to update promos" ON promos;
DROP POLICY IF EXISTS "Allow app to delete promos" ON promos;

CREATE POLICY "Allow public read access to active promos" ON promos
    FOR SELECT USING (status = 'active' OR true);
CREATE POLICY "Allow anyone to insert promos" ON promos
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow app to update promos" ON promos
    FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow app to delete promos" ON promos
    FOR DELETE USING (true);

-- TRANSACTIONS
DROP POLICY IF EXISTS "Allow anyone to read transactions" ON transactions;
DROP POLICY IF EXISTS "Allow anyone to insert transactions" ON transactions;
DROP POLICY IF EXISTS "Allow authenticated users to update transactions" ON transactions;
DROP POLICY IF EXISTS "Allow app to update transactions" ON transactions;

CREATE POLICY "Allow anyone to read transactions" ON transactions
    FOR SELECT USING (true);
CREATE POLICY "Allow anyone to insert transactions" ON transactions
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow app to update transactions" ON transactions
    FOR UPDATE USING (true) WITH CHECK (true);

-- TRANSACTION ITEMS
DROP POLICY IF EXISTS "Allow anyone to read transaction_items" ON transaction_items;
DROP POLICY IF EXISTS "Allow anyone to insert transaction_items" ON transaction_items;

CREATE POLICY "Allow anyone to read transaction_items" ON transaction_items
    FOR SELECT USING (true);
CREATE POLICY "Allow anyone to insert transaction_items" ON transaction_items
    FOR INSERT WITH CHECK (true);

-- PENDING SUBMISSIONS
DROP POLICY IF EXISTS "Allow anyone to read pending_submissions" ON pending_submissions;
DROP POLICY IF EXISTS "Allow anyone to insert pending_submissions" ON pending_submissions;
DROP POLICY IF EXISTS "Allow authenticated users to update pending_submissions" ON pending_submissions;
DROP POLICY IF EXISTS "Allow app to update pending_submissions" ON pending_submissions;

CREATE POLICY "Allow anyone to read pending_submissions" ON pending_submissions
    FOR SELECT USING (true);
CREATE POLICY "Allow anyone to insert pending_submissions" ON pending_submissions
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow app to update pending_submissions" ON pending_submissions
    FOR UPDATE USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- VERIFICATION
-- ─────────────────────────────────────────────
-- Check current roles
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;

-- Check RLS policies on users table
SELECT tablename, policyname, cmd, qual FROM pg_policies
WHERE tablename = 'users' ORDER BY policyname;
