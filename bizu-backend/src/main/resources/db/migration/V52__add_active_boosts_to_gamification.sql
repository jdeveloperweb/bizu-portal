-- Add active boosts and status fields to gamification_stats
ALTER TABLE student.gamification_stats 
ADD COLUMN xp_boost_until TIMESTAMPTZ,
ADD COLUMN radar_materia_until TIMESTAMPTZ,
ADD COLUMN radar_materia_code VARCHAR(50),
ADD COLUMN active_title VARCHAR(100);
