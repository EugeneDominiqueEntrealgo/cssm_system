-- Migration: must_change_password flag for forced first-login password change
-- Safe: additive only, idempotent (IF NOT EXISTS)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
