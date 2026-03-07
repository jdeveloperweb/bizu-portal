CREATE TABLE student.guild_notes (
    id UUID PRIMARY KEY,
    guild_id UUID NOT NULL REFERENCES student.guilds(id) ON DELETE CASCADE,
    author_id UUID REFERENCES identity.users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE student.guild_tasks (
    id UUID PRIMARY KEY,
    guild_id UUID NOT NULL REFERENCES student.guilds(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES identity.users(id) ON DELETE SET NULL,
    assignee_id UUID REFERENCES identity.users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE student.guild_flashcard_decks (
    id UUID PRIMARY KEY,
    guild_id UUID NOT NULL REFERENCES student.guilds(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES identity.users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Linking guild flashcards to the decks
CREATE TABLE student.guild_flashcards (
    id UUID PRIMARY KEY,
    deck_id UUID NOT NULL REFERENCES student.guild_flashcard_decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_guild_notes_guild ON student.guild_notes(guild_id);
CREATE INDEX idx_guild_tasks_guild ON student.guild_tasks(guild_id);
CREATE INDEX idx_guild_flashcard_decks_guild ON student.guild_flashcard_decks(guild_id);
