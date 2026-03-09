-- Fix WEEKLY_SIMULADO_1: goal_type was incorrectly set to 'WIN' (duel wins)
-- but the quest description is "Conclua 1 simulado completo nesta semana"
-- Correct goal_type to 'SIMULADO' which tracks completed simulado sessions.
UPDATE student.quests
SET goal_type = 'SIMULADO'
WHERE code = 'WEEKLY_SIMULADO_1';
