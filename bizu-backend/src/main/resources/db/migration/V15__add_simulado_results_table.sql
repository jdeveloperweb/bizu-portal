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
