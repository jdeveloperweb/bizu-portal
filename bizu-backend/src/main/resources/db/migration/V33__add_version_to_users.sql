ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
UPDATE identity.users SET version = 0 WHERE version IS NULL;
ALTER TABLE identity.users ALTER COLUMN version SET NOT NULL;
