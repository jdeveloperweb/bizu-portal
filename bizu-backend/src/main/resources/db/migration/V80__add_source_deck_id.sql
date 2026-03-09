ALTER TABLE content.flashcard_decks ADD COLUMN source_deck_id UUID;
ALTER TABLE content.flashcard_decks ADD CONSTRAINT fk_flashcard_decks_source FOREIGN KEY (source_deck_id) REFERENCES content.flashcard_decks(id);
