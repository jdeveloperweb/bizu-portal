-- Unificar recursos de guilda com a arquitetura existente
ALTER TABLE content.flashcard_decks ADD COLUMN guild_id UUID REFERENCES student.guilds(id) ON DELETE SET NULL;
ALTER TABLE student.notes ADD COLUMN guild_id UUID REFERENCES student.guilds(id) ON DELETE SET NULL;
ALTER TABLE student.student_tasks ADD COLUMN guild_id UUID REFERENCES student.guilds(id) ON DELETE SET NULL;

-- Remover tabelas duplicadas que foram criadas para a guilda
DROP TABLE IF EXISTS student.guild_flashcards;
DROP TABLE IF EXISTS student.guild_flashcard_decks;
DROP TABLE IF EXISTS student.guild_notes;
DROP TABLE IF EXISTS student.guild_tasks;
