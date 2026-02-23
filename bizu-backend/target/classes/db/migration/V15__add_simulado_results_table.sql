-- Create simulados table in content schema
CREATE TABLE content.simulados (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    start_date    TIMESTAMPTZ,
    end_date      TIMESTAMPTZ,
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_cycle  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Join table for questions in a simulado
CREATE TABLE content.simulado_questions (
    simulado_id   UUID NOT NULL REFERENCES content.simulados(id) ON DELETE CASCADE,
    question_id   UUID NOT NULL REFERENCES content.questions(id) ON DELETE CASCADE,
    PRIMARY KEY (simulado_id, question_id)
);

-- Create simulado_results table for final scoring
CREATE TABLE student.simulado_results (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    simulado_id      UUID NOT NULL REFERENCES content.simulados(id) ON DELETE CASCADE,
    score            INT NOT NULL,
    total_questions   INT NOT NULL,
    position_in_ranking INT,
    weekly_cycle_date TIMESTAMPTZ,
    completed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_simulado_results_user ON student.simulado_results(user_id);
CREATE INDEX idx_simulado_results_simulado ON student.simulado_results(simulado_id);
CREATE INDEX idx_simulados_active ON content.simulados(active);
