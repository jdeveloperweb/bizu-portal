-- Content Tables
CREATE TABLE content.courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  thumbnail_url VARCHAR(500),
  status       VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE content.modules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES content.courses(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  order_index  INT NOT NULL DEFAULT 0
);

CREATE TABLE content.questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    UUID REFERENCES content.modules(id) ON DELETE SET NULL,
  statement    TEXT NOT NULL,
  options      JSONB NOT NULL DEFAULT '{}',
  correct_option VARCHAR(20),
  resolution   TEXT,
  banca        VARCHAR(100),
  year         INT,
  subject      VARCHAR(100),
  topic        VARCHAR(100),
  difficulty   VARCHAR(20),
  question_type VARCHAR(50),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_courses_status ON content.courses(status);
CREATE INDEX idx_modules_course_id ON content.modules(course_id);
CREATE INDEX idx_questions_module_id ON content.questions(module_id);
CREATE INDEX idx_questions_banca_year ON content.questions(banca, year);
