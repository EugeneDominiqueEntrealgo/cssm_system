-- =============================================================
-- Add Expiry Date Tracker support
-- SAFE & IDEMPOTENT: adds expiry_date column to products table.
-- Does NOT delete or alter any existing columns/rows.
-- Run this once in the Supabase SQL Editor (or via psql).
-- =============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Optional: index for faster filtering of expiring products.
CREATE INDEX IF NOT EXISTS idx_products_expiry_date
  ON products (expiry_date);