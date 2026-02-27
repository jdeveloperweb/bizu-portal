-- Add last_seen_at to users to track online status
ALTER TABLE identity.users ADD COLUMN last_seen_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX idx_users_last_seen_at ON identity.users(last_seen_at);
