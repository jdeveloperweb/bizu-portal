-- V73 Add guild creation cost to settings
ALTER TABLE admin.system_settings ADD COLUMN guild_creation_cost INTEGER DEFAULT 5000;
