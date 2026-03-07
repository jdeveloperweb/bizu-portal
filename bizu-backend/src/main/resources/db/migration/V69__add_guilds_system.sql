CREATE TABLE student.guilds (
    id UUID PRIMARY KEY,
    name VARCHAR(40) NOT NULL UNIQUE,
    description VARCHAR(200) NOT NULL,
    badge VARCHAR(50) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    max_members INTEGER NOT NULL DEFAULT 20,
    total_xp BIGINT NOT NULL DEFAULT 0,
    weekly_xp BIGINT NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    weekly_goal BIGINT NOT NULL DEFAULT 10000,
    league VARCHAR(20) NOT NULL DEFAULT 'BRONZE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE student.guild_members (
    id UUID PRIMARY KEY,
    guild_id UUID NOT NULL REFERENCES student.guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    xp_contribution BIGINT NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(guild_id, user_id)
);

CREATE TABLE student.guild_invites (
    id UUID PRIMARY KEY,
    guild_id UUID NOT NULL REFERENCES student.guilds(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE student.guild_requests (
    id UUID PRIMARY KEY,
    guild_id UUID NOT NULL REFERENCES student.guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    message VARCHAR(200),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE student.guild_materials (
    id UUID PRIMARY KEY,
    guild_id UUID NOT NULL REFERENCES student.guilds(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    url TEXT NOT NULL,
    file_size VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE student.guild_missions (
    id UUID PRIMARY KEY,
    guild_id UUID NOT NULL REFERENCES student.guilds(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    target INTEGER NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    xp_reward INTEGER NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE student.guild_activities (
    id UUID PRIMARY KEY,
    guild_id UUID NOT NULL REFERENCES student.guilds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES identity.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    xp_gained INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_guild_members_user ON student.guild_members(user_id);
CREATE INDEX idx_guild_members_guild ON student.guild_members(guild_id);
CREATE INDEX idx_guild_invites_invitee ON student.guild_invites(invitee_id);
CREATE INDEX idx_guild_requests_guild ON student.guild_requests(guild_id);
