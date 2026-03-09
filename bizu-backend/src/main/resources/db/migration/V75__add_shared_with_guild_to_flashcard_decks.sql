ALTER TABLE content.flashcard_decks ADD COLUMN shared_with_guild_id UUID REFERENCES student.guilds(id) ON DELETE SET NULL;
