CREATE TABLE student.guild_messages (
    id UUID PRIMARY KEY,
    guild_id UUID NOT NULL REFERENCES student.guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_guild_messages_guild ON student.guild_messages(guild_id);
CREATE INDEX idx_guild_messages_created ON student.guild_messages(created_at);
