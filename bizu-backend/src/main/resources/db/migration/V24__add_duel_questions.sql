-- Add shootout support to duels
ALTER TABLE student.duels ADD COLUMN current_round INT DEFAULT 0;
ALTER TABLE student.duels ADD COLUMN sudden_death BOOLEAN DEFAULT FALSE;

CREATE TABLE student.duel_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duel_id UUID NOT NULL REFERENCES student.duels(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES content.questions(id),
    round_number INT NOT NULL,
    challenger_answer_index INT,
    opponent_answer_index INT,
    challenger_correct BOOLEAN,
    opponent_correct BOOLEAN,
    difficulty VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_duel_questions_duel_id ON student.duel_questions(duel_id);
