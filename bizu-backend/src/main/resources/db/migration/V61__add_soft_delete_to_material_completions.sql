-- Soft delete para material_completions: garante que XP só é concedido uma vez por material
-- Ao invés de deletar o registro ao desmarcar, apenas alterna o flag 'completed'
-- 'xp_awarded' garante que XP não seja reconcedido ao re-marcar

ALTER TABLE student.material_completions
    ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS xp_awarded BOOLEAN NOT NULL DEFAULT TRUE;
