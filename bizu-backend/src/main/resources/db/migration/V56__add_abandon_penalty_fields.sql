ALTER TABLE student.gamification_stats
ADD COLUMN daily_abandon_count INTEGER DEFAULT 0,
ADD COLUMN last_abandon_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN abandon_blocked_until TIMESTAMP WITH TIME ZONE;

ALTER TABLE student.duels
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
