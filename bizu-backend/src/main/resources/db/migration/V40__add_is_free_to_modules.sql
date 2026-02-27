-- Add is_free column to modules
ALTER TABLE content.modules ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
