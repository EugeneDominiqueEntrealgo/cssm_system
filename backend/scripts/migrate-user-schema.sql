-- Migration: Add user_id and created_by columns to users table
-- Run this in Supabase SQL Editor

-- Add user_id column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id VARCHAR(10) UNIQUE;

-- Add created_by column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Create sequence for user IDs
CREATE SEQUENCE IF NOT EXISTS user_id_seq START 100000;

-- Update existing users with user_id if null
UPDATE users SET user_id = 'U' || lpad((100000 + id)::text, 5, '0') WHERE user_id IS NULL;

-- Create function to generate user_id
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = 'U' || lpad(nextval('user_id_seq')::text, 5, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS generate_user_id_trigger ON users;
CREATE TRIGGER generate_user_id_trigger BEFORE INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION generate_user_id();

-- Verify the changes
SELECT id, user_id, name, email, role, status, created_by FROM users ORDER BY id;