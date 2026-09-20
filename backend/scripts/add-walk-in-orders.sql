-- Run this migration for existing databases before enabling client walk-in requests.
ALTER TABLE pending_submissions
  DROP CONSTRAINT IF EXISTS pending_submissions_type_check;

ALTER TABLE pending_submissions
  ADD CONSTRAINT pending_submissions_type_check
  CHECK (type IN ('product', 'promo', 'stock_update', 'walk_in_order'));

ALTER TABLE pending_submissions
  DROP CONSTRAINT IF EXISTS pending_submissions_status_check;

ALTER TABLE pending_submissions
  ADD CONSTRAINT pending_submissions_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));