-- Add duration to materials and objectives to modules
ALTER TABLE content.materials ADD COLUMN duration_minutes INTEGER DEFAULT 0;
ALTER TABLE content.modules ADD COLUMN objectives TEXT;
