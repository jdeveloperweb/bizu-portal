-- Flashcards and Audit Logs
CREATE TABLE content.flashcards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    UUID REFERENCES content.modules(id) ON DELETE CASCADE,
  front        TEXT NOT NULL,
  back         TEXT NOT NULL,
  subject      VARCHAR(100),
  topic        VARCHAR(100),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin.admin_action_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID NOT NULL REFERENCES identity.users(id),
  action        VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id   VARCHAR(100),
  details       TEXT,
  ip_address    VARCHAR(45),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for auditing
CREATE INDEX idx_admin_logs_admin_id ON admin.admin_action_logs(admin_id);
CREATE INDEX idx_flashcards_module_id ON content.flashcards(module_id);
