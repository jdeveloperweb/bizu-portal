-- Student Tables
CREATE TABLE student.attempts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  question_id      UUID NOT NULL REFERENCES content.questions(id) ON DELETE CASCADE,
  selected_option  VARCHAR(20),
  correct          BOOLEAN NOT NULL,
  time_spent_seconds INT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student.user_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  course_id        UUID NOT NULL REFERENCES content.courses(id) ON DELETE CASCADE,
  percent_completed DECIMAL(5,2) DEFAULT 0.0,
  last_content_id  UUID,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE student.gamification_stats (
  user_id          UUID PRIMARY KEY REFERENCES identity.users(id) ON DELETE CASCADE,
  total_xp         INT DEFAULT 0,
  current_streak   INT DEFAULT 0,
  max_streak       INT DEFAULT 0,
  last_activity_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_attempts_user_id ON student.attempts(user_id);
CREATE INDEX idx_attempts_question_id ON student.attempts(question_id);
CREATE INDEX idx_progress_user_id ON student.user_progress(user_id);
