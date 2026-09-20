-- Run this entire file once in Supabase SQL Editor.
-- Safe for existing data: it only updates constraints and adds nullable payment fields.

-- Allow clients to cancel a walk-in request while it is still pending.
ALTER TABLE pending_submissions
  DROP CONSTRAINT IF EXISTS pending_submissions_status_check;

ALTER TABLE pending_submissions
  ADD CONSTRAINT pending_submissions_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS tendered_amount DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS change_amount DECIMAL(10, 2);

-- Verify the resulting columns and allowed statuses.
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'transactions'
  AND column_name IN ('tendered_amount', 'change_amount')
ORDER BY column_name;

SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'pending_submissions_status_check';