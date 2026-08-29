-- ============================================================
-- Fix: Restore Admin role (was accidentally changed to 'staff')
-- Run this in Supabase SQL Editor
-- ============================================================

-- Set the admin account back to role 'admin'
-- (The default admin email is admin@store.com)
UPDATE users
SET role = 'admin'
WHERE email IN ('admin@store.com')
   OR name ILIKE '%admin%';

-- Ensure the admin's status is 'active' so they can log in
UPDATE users
SET status = 'active'
WHERE role = 'admin';

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Show all users with their roles to confirm the fix
SELECT id, user_id, name, email, role, status
FROM users
ORDER BY id;
</content>
