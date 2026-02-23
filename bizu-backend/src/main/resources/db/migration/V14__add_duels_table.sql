-- Create duels table for student challenges
CREATE TABLE student.duels (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id    UUID NOT NULL REFERENCES identity.users(id),
    opponent_id      UUID NOT NULL REFERENCES identity.users(id),
    status           VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    challenger_score INT DEFAULT 0,
    opponent_score   INT DEFAULT 0,
    winner_id        UUID REFERENCES identity.users(id),
    subject          VARCHAR(255),
    question_count   INT DEFAULT 10,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMPTZ
);

CREATE INDEX idx_duels_challenger ON student.duels(challenger_id);
CREATE INDEX idx_duels_opponent ON student.duels(opponent_id);
CREATE INDEX idx_duels_status ON student.duels(status);
