-- Migration: Rename 'user' role to 'client'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'staff', 'client'));
UPDATE users SET role = 'client' WHERE role = 'user';
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;