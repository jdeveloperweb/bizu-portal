-- War Day Feature: Guild Sessions, Zone Progress and Attempts
-- V82__guild_war_sessions.sql

CREATE TABLE student.guild_war_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    war_day_event_id UUID NOT NULL REFERENCES student.war_day_events(id) ON DELETE CASCADE,
    guild_id UUID NOT NULL REFERENCES student.guilds(id) ON DELETE CASCADE,
    total_score BIGINT NOT NULL DEFAULT 0,
    zones_conquered INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(war_day_event_id, guild_id)
);

CREATE TABLE student.war_zone_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_war_session_id UUID NOT NULL REFERENCES student.guild_war_sessions(id) ON DELETE CASCADE,
    zone_template_id UUID NOT NULL REFERENCES student.war_zone_templates(id),
    status VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
    questions_answered INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    total_points BIGINT NOT NULL DEFAULT 0,
    conquered_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(guild_war_session_id, zone_template_id)
);

CREATE TABLE student.war_zone_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_progress_id UUID NOT NULL REFERENCES student.war_zone_progress(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id),
    question_id UUID NOT NULL,
    selected_answer VARCHAR(10) NOT NULL,
    correct BOOLEAN NOT NULL DEFAULT false,
    points_earned INTEGER NOT NULL DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guild_war_sessions_event ON student.guild_war_sessions(war_day_event_id);
CREATE INDEX idx_guild_war_sessions_guild ON student.guild_war_sessions(guild_id);
CREATE INDEX idx_war_zone_progress_session ON student.war_zone_progress(guild_war_session_id);
CREATE INDEX idx_war_zone_attempts_progress ON student.war_zone_attempts(zone_progress_id);
CREATE INDEX idx_war_zone_attempts_user ON student.war_zone_attempts(user_id);
