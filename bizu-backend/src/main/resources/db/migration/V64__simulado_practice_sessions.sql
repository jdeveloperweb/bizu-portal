-- Practice sessions: allow students to redo simulados without ranking impact.
-- Intentionally NO unique constraint (multiple retries are allowed).

CREATE TABLE student.simulado_practice_sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    simulado_id     UUID        NOT NULL REFERENCES content.simulados(id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    submitted_at    TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    answers         JSONB       NOT NULL DEFAULT '{}',
    score           INT,
    total_questions INT
);

CREATE INDEX idx_practice_sessions_user     ON student.simulado_practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_simulado ON student.simulado_practice_sessions(simulado_id);
CREATE INDEX idx_practice_sessions_status   ON student.simulado_practice_sessions(status);
