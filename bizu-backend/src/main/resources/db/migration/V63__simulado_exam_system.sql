-- Add duration_minutes to simulados (configurable time limit per exam)
ALTER TABLE content.simulados ADD COLUMN IF NOT EXISTS duration_minutes INT;

-- Create simulado_sessions table to track each user's exam attempt
-- One session per user per simulado (UNIQUE constraint enforces single attempt rule)
CREATE TABLE IF NOT EXISTS student.simulado_sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    simulado_id     UUID        NOT NULL REFERENCES content.simulados(id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    submitted_at    TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    answers         JSONB       NOT NULL DEFAULT '{}',
    score           INT,
    total_questions INT,
    CONSTRAINT uq_simulado_session_user UNIQUE (user_id, simulado_id)
);

CREATE INDEX IF NOT EXISTS idx_simulado_sessions_user     ON student.simulado_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_simulado_sessions_simulado ON student.simulado_sessions(simulado_id);
CREATE INDEX IF NOT EXISTS idx_simulado_sessions_status   ON student.simulado_sessions(status);
