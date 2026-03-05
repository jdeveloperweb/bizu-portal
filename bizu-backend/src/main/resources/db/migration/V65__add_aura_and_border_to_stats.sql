-- Migration to add customization fields to gamification stats
ALTER TABLE student.gamification_stats ADD COLUMN active_aura VARCHAR(50);
ALTER TABLE student.gamification_stats ADD COLUMN active_border VARCHAR(50);
