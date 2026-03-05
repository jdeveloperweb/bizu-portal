-- Quests system
CREATE TABLE student.quests (
    id UUID PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reward_xp INTEGER NOT NULL,
    reward_axons INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- DAILY, WEEKLY
    goal_type VARCHAR(50) NOT NULL, -- QUESTIONS, STREAK, WIN, ACCURACY
    goal_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student.user_quest_claims (
    user_id UUID NOT NULL REFERENCES identity.users(id),
    quest_code VARCHAR(100) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    period_id VARCHAR(50) NOT NULL, -- YYYY-MM-DD for daily, YYYY-WW for weekly
    PRIMARY KEY (user_id, quest_code, period_id)
);

-- Seed some initial quests
INSERT INTO student.quests (id, code, title, description, reward_xp, reward_axons, type, goal_type, goal_value)
VALUES 
    (gen_random_uuid(), 'DAILY_QUESTIONS_10', 'Dever de Casa', 'Resolva 10 questões hoje.', 100, 50, 'DAILY', 'QUESTIONS', 10),
    (gen_random_uuid(), 'DAILY_WIN_1', 'Primeira Sangue', 'Vença 1 duelo na Arena hoje.', 150, 75, 'DAILY', 'WIN', 1),
    (gen_random_uuid(), 'DAILY_STREAK_5', 'Foco Total', 'Acerte 5 questões seguidas hoje.', 200, 100, 'DAILY', 'STREAK', 5),
    (gen_random_uuid(), 'WEEKLY_QUESTIONS_100', 'Maratona Semanal', 'Resolva 100 questões nesta semana.', 1000, 500, 'WEEKLY', 'QUESTIONS', 100),
    (gen_random_uuid(), 'WEEKLY_SIMULADO_1', 'Teste de Fogo', 'Conclua 1 simulado completo nesta semana.', 500, 250, 'WEEKLY', 'WIN', 1);
