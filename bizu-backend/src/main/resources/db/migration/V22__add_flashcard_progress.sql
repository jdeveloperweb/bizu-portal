-- Spaced Repetition Progress for Flashcards
CREATE TABLE student.flashcard_progress (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    flashcard_id      UUID NOT NULL REFERENCES content.flashcards(id) ON DELETE CASCADE,
    interval_days     INT DEFAULT 0,
    ease_factor       DECIMAL(5,2) DEFAULT 2.50,
    repetitions       INT DEFAULT 0,
    next_review_at    TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed_at  TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, flashcard_id)
);

CREATE INDEX idx_flashcard_progress_user_id ON student.flashcard_progress(user_id);
CREATE INDEX idx_flashcard_progress_next_review ON student.flashcard_progress(next_review_at);
