-- Add course_id to flashcard_decks
ALTER TABLE content.flashcard_decks ADD COLUMN course_id UUID REFERENCES content.courses(id);
CREATE INDEX idx_flashcard_decks_course_id ON content.flashcard_decks(course_id);
