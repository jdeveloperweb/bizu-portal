-- Fix missing column in simulados
ALTER TABLE content.simulados ADD COLUMN IF NOT EXISTS weekly_cycle BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure duration_minutes exists (redundancy for safety)
ALTER TABLE content.simulados ADD COLUMN IF NOT EXISTS duration_minutes INT;

-- Fix student_id versus user_id in simulado_sessions
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'student' 
               AND table_name = 'simulado_sessions' 
               AND column_name = 'student_id') THEN
        ALTER TABLE student.simulado_sessions RENAME COLUMN student_id TO user_id;
    END IF;
END $$;

-- Update constraints for consistency
ALTER TABLE student.simulado_sessions DROP CONSTRAINT IF EXISTS uq_simulado_session_student;
ALTER TABLE student.simulado_sessions DROP CONSTRAINT IF EXISTS uq_simulado_session_user;
ALTER TABLE student.simulado_sessions ADD CONSTRAINT uq_simulado_session_user UNIQUE (user_id, simulado_id);
