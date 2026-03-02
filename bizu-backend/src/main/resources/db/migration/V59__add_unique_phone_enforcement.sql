ALTER TABLE admin.system_settings
    ADD COLUMN IF NOT EXISTS unique_phone_enforced BOOLEAN NOT NULL DEFAULT FALSE;
