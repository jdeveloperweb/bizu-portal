-- Add is_free column to plans
ALTER TABLE commerce.plans ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
