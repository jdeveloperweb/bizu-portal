-- Content - Materials Table
CREATE TABLE content.materials (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    UUID REFERENCES content.modules(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  file_url     VARCHAR(500) NOT NULL,
  file_type    VARCHAR(50), -- PDF, VIDEO, DOC
  is_free      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_materials_module_id ON content.materials(module_id);
