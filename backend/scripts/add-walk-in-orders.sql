-- Run this migration for existing databases before enabling client walk-in requests.
ALTER TABLE pending_submissions
  DROP CONSTRAINT IF EXISTS pending_submissions_type_check;

ALTER TABLE pending_submissions
  ADD CONSTRAINT pending_submissions_type_check
  CHECK (type IN ('product', 'promo', 'stock_update', 'walk_in_order'));