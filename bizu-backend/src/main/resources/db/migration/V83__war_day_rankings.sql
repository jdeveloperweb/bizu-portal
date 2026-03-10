-- War Day Feature: Final Rankings
-- V83__war_day_rankings.sql

CREATE TABLE student.war_day_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    war_day_event_id UUID NOT NULL REFERENCES student.war_day_events(id) ON DELETE CASCADE,
    guild_id UUID NOT NULL REFERENCES student.guilds(id),
    guild_name VARCHAR(100) NOT NULL,
    guild_badge VARCHAR(50),
    final_score BIGINT NOT NULL DEFAULT 0,
    zones_conquered INTEGER NOT NULL DEFAULT 0,
    correct_answers_total INTEGER NOT NULL DEFAULT 0,
    final_position INTEGER NOT NULL DEFAULT 0,
    xp_distributed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(war_day_event_id, guild_id)
);

CREATE INDEX idx_war_day_rankings_event ON student.war_day_rankings(war_day_event_id);
CREATE INDEX idx_war_day_rankings_position ON student.war_day_rankings(war_day_event_id, final_position);
