-- Create flashcard decks table
CREATE TABLE content.flashcard_decks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    icon        VARCHAR(100),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add deck_id to flashcards
ALTER TABLE content.flashcards ADD COLUMN deck_id UUID REFERENCES content.flashcard_decks(id) ON DELETE CASCADE;

-- Index for performance
CREATE INDEX idx_flashcards_deck_id ON content.flashcards(deck_id);
