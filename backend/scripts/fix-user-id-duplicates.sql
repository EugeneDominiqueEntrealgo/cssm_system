-- Fix: Duplicate user_id values
-- Run this in Supabase SQL Editor

-- First, check current state
SELECT id, user_id, name, email, role FROM users ORDER BY id;

-- Drop the unique constraint temporarily to fix duplicates
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_id_key;

-- Fix existing rows: keep existing user_id, generate new ones for NULL/empty
-- Use a CTE to assign new user_ids based on row_number
WITH numbered AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (ORDER BY id) - 1 AS rn
  FROM users
)
UPDATE users u
SET user_id = CASE 
  WHEN u.user_id IS NULL OR u.user_id = '' THEN 'U' || lpad((100000 + numbered.rn)::text, 5, '0')
  ELSE u.user_id
END
FROM numbered
WHERE u.id = numbered.id;

-- Re-add the unique constraint
ALTER TABLE users ADD CONSTRAINT users_user_id_key UNIQUE (user_id);

-- Set the sequence to continue from the max value
SELECT setval('user_id_seq', (SELECT COALESCE(MAX(CAST(SUBSTRING(user_id FROM 2) AS INTEGER)), 100000) FROM users));

-- Verify the fix
SELECT id, user_id, name, email, role FROM users ORDER BY id;