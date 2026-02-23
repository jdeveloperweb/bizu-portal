-- Add missing columns to plans for group and device control
ALTER TABLE commerce.plans ADD COLUMN is_group BOOLEAN DEFAULT FALSE;
ALTER TABLE commerce.plans ADD COLUMN max_members INTEGER DEFAULT 1;
ALTER TABLE commerce.plans ADD COLUMN devices_per_user INTEGER DEFAULT 3;
