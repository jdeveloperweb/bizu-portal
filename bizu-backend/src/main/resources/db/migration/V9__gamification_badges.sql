-- Gamification: Badges
CREATE TABLE student.badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(50) NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url    VARCHAR(255),
  required_xp INT DEFAULT 0
);

CREATE TABLE student.user_badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  badge_id  UUID NOT NULL REFERENCES student.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Seed Badges
INSERT INTO student.badges (code, name, description, icon_url) VALUES 
('EARLY_BIRD', 'Madrugador', 'Resolveu questões antes das 6h da manhã.', 'sunrise'),
('STREAK_7', 'Fogo Amigo', 'Manteve uma ofensiva de 7 dias.', 'flame'),
('MASTER_100', 'Centenário', 'Resolveu 100 questões com aproveitamento > 80%.', 'target'),
('FIRST_SIMULADO', 'Primeiro Passo', 'Concluiu seu primeiro simulado completo.', 'play');

CREATE INDEX idx_user_badges_user_id ON student.user_badges(user_id);
