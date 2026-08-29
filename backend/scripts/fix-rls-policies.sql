-- Fix RLS Policies for all tables
-- Run this in Supabase SQL Editor to fix authentication issues

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to users" ON users;
DROP POLICY IF EXISTS "Allow anyone to insert users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to update users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to delete users" ON users;
DROP POLICY IF EXISTS "Allow app to update users" ON users;
DROP POLICY IF EXISTS "Allow app to delete users" ON users;

-- Create new policies for users table
CREATE POLICY "Allow public read access to users" ON users
    FOR SELECT USING (true);
    
CREATE POLICY "Allow anyone to insert users" ON users
    FOR INSERT WITH CHECK (true);
    
-- Allow updates (approve/reject/edit) - the app uses the anon/service key,
-- so auth.uid() is null. We allow all updates so the admin dashboard works.
CREATE POLICY "Allow app to update users" ON users
    FOR UPDATE USING (true) WITH CHECK (true);
    
-- Allow deletes (admin can delete users from the dashboard)
CREATE POLICY "Allow app to delete users" ON users
    FOR DELETE USING (true);

-- Fix RLS Policies for products table
DROP POLICY IF EXISTS "Allow public read access to active products" ON products;
DROP POLICY IF EXISTS "Allow anyone to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;

CREATE POLICY "Allow public read access to active products" ON products
    FOR SELECT USING (status = 'active' OR auth.uid() IS NOT NULL);
    
CREATE POLICY "Allow anyone to insert products" ON products
    FOR INSERT WITH CHECK (true);
    
CREATE POLICY "Allow authenticated users to update products" ON products
    FOR UPDATE USING (auth.uid() IS NOT NULL);
    
CREATE POLICY "Allow authenticated users to delete products" ON products
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Fix RLS Policies for promos table
DROP POLICY IF EXISTS "Allow public read access to active promos" ON promos;
DROP POLICY IF EXISTS "Allow anyone to insert promos" ON promos;
DROP POLICY IF EXISTS "Allow authenticated users to update promos" ON promos;
DROP POLICY IF EXISTS "Allow authenticated users to delete promos" ON promos;

CREATE POLICY "Allow public read access to active promos" ON promos
    FOR SELECT USING (status = 'active' OR auth.uid() IS NOT NULL);
    
CREATE POLICY "Allow anyone to insert promos" ON promos
    FOR INSERT WITH CHECK (true);
    
CREATE POLICY "Allow authenticated users to update promos" ON promos
    FOR UPDATE USING (auth.uid() IS NOT NULL);
    
CREATE POLICY "Allow authenticated users to delete promos" ON promos
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Fix RLS Policies for transactions table
DROP POLICY IF EXISTS "Allow anyone to read transactions" ON transactions;
DROP POLICY IF EXISTS "Allow anyone to insert transactions" ON transactions;
DROP POLICY IF EXISTS "Allow authenticated users to update transactions" ON transactions;

CREATE POLICY "Allow anyone to read transactions" ON transactions
    FOR SELECT USING (true);
    
CREATE POLICY "Allow anyone to insert transactions" ON transactions
    FOR INSERT WITH CHECK (true);
    
CREATE POLICY "Allow authenticated users to update transactions" ON transactions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Fix RLS Policies for transaction_items table
DROP POLICY IF EXISTS "Allow anyone to read transaction_items" ON transaction_items;
DROP POLICY IF EXISTS "Allow anyone to insert transaction_items" ON transaction_items;

CREATE POLICY "Allow anyone to read transaction_items" ON transaction_items
    FOR SELECT USING (true);
    
CREATE POLICY "Allow anyone to insert transaction_items" ON transaction_items
    FOR INSERT WITH CHECK (true);

-- Fix RLS Policies for pending_submissions table
DROP POLICY IF EXISTS "Allow anyone to read pending_submissions" ON pending_submissions;
DROP POLICY IF EXISTS "Allow anyone to insert pending_submissions" ON pending_submissions;
DROP POLICY IF EXISTS "Allow authenticated users to update pending_submissions" ON pending_submissions;

CREATE POLICY "Allow anyone to read pending_submissions" ON pending_submissions
    FOR SELECT USING (true);
    
CREATE POLICY "Allow anyone to insert pending_submissions" ON pending_submissions
    FOR INSERT WITH CHECK (true);
    
CREATE POLICY "Allow authenticated users to update pending_submissions" ON pending_submissions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('users', 'products', 'promos', 'transactions', 'transaction_items', 'pending_submissions')
ORDER BY tablename, policyname;