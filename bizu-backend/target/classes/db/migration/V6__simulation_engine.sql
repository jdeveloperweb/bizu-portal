-- Simulation Tables
CREATE TABLE student.simulation_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  title               VARCHAR(255) NOT NULL,
  start_time          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time            TIMESTAMPTZ,
  time_limit_minutes  INT,
  status              VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
  total_questions     INT,
  correct_answers     INT DEFAULT 0,
  score_percent       DECIMAL(5,2) DEFAULT 0.0
);

-- Link between simulation and attempts (optional for detailed review)
ALTER TABLE student.attempts ADD COLUMN simulation_id UUID REFERENCES student.simulation_sessions(id) ON DELETE CASCADE;

CREATE INDEX idx_simulations_user_id ON student.simulation_sessions(user_id);
