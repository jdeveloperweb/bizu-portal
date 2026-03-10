-- War Day Feature: Core Tables
-- V81__war_day_core.sql

CREATE TABLE student.war_map_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE student.war_zone_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_template_id UUID NOT NULL REFERENCES student.war_map_templates(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    zone_type VARCHAR(20) NOT NULL DEFAULT 'CAMP',
    difficulty_level INTEGER NOT NULL DEFAULT 1,
    position_x FLOAT NOT NULL DEFAULT 0.5,
    position_y FLOAT NOT NULL DEFAULT 0.5,
    question_count INTEGER NOT NULL DEFAULT 10,
    points_per_correct INTEGER NOT NULL DEFAULT 10,
    terrain_type VARCHAR(30) DEFAULT 'PLAINS',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE student.war_zone_prerequisites (
    zone_id UUID NOT NULL REFERENCES student.war_zone_templates(id) ON DELETE CASCADE,
    prerequisite_zone_id UUID NOT NULL REFERENCES student.war_zone_templates(id) ON DELETE CASCADE,
    PRIMARY KEY (zone_id, prerequisite_zone_id)
);

CREATE TABLE student.war_day_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    map_template_id UUID REFERENCES student.war_map_templates(id),
    xp_reward_per_correct INTEGER NOT NULL DEFAULT 10,
    course_id UUID,
    min_guild_size INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_war_day_events_status ON student.war_day_events(status);
CREATE INDEX idx_war_day_events_start ON student.war_day_events(start_at);
CREATE INDEX idx_war_zone_templates_map ON student.war_zone_templates(map_template_id);
