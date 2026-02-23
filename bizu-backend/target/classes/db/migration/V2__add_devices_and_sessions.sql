CREATE TABLE identity.devices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  device_fingerprint  VARCHAR(255) NOT NULL,
  os_info             VARCHAR(100),
  browser_info        VARCHAR(100),
  last_ip             VARCHAR(45),
  is_trusted          BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devices_user_id ON identity.devices(user_id);
CREATE INDEX idx_devices_fingerprint ON identity.devices(device_fingerprint);

CREATE TABLE identity.sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  device_id    UUID REFERENCES identity.devices(id),
  token_hash   VARCHAR(64) NOT NULL,
  ip_address   INET,
  user_agent   TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE
);
