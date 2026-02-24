-- Update student.badges for full gamification

ALTER TABLE student.badges 
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_progress INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS requirement VARCHAR(255),
ADD COLUMN IF NOT EXISTS color VARCHAR(100);

UPDATE student.badges SET 
  category = 'consistencia', xp = 50, color = 'from-amber-400 to-orange-500', target_progress = 1, requirement = '1/1'
WHERE code = 'EARLY_BIRD';

UPDATE student.badges SET 
  category = 'consistencia', xp = 100, color = 'from-red-400 to-rose-500', target_progress = 7, requirement = '7/7 dias'
WHERE code = 'STREAK_7';

UPDATE student.badges SET 
  category = 'performance', xp = 200, color = 'from-emerald-400 to-teal-500', target_progress = 100, requirement = '100/100'
WHERE code = 'MASTER_100';

UPDATE student.badges SET 
  category = 'performance', xp = 75, color = 'from-blue-400 to-indigo-500', target_progress = 1, requirement = '1/1'
WHERE code = 'FIRST_SIMULADO';

-- Add more badges to match frontend
INSERT INTO student.badges (code, name, description, icon_url, category, xp, target_progress, requirement, color) VALUES
('MARATHON_4H', 'Maratonista', 'Estudou por mais de 4 horas seguidas.', 'clock', 'consistencia', 150, 240, '240/240 minutos', 'from-indigo-400 to-violet-500'),
('SNIPER_10', 'Sniper', 'Acertou 10 questões seguidas de nível difícil.', 'target', 'performance', 300, 10, '10/10 consecutivas', 'from-red-500 to-pink-600'),
('GLADIATOR_10', 'Gladiador', 'Venceu 10 duelos na Arena PVP.', 'swords', 'social', 150, 10, '10/10 duelos', 'from-violet-500 to-purple-600'),
('TOP_10_RANK', 'Top 10%', 'Alcançou o Top 10% do ranking geral.', 'crown', 'social', 500, 1, 'Ranking #142 / Top 100', 'from-amber-500 to-yellow-500'),
('STUDIOUS_50', 'Estudioso', 'Criou 50 flashcards.', 'layers', 'especial', 100, 50, '50/50 flashcards', 'from-teal-400 to-cyan-500'),
('MASTER_3_SUBJ', 'Mestre', 'Acertou 90%+ em 3 matérias diferentes.', 'brain', 'especial', 400, 3, '3/3 matérias', 'from-indigo-600 to-violet-700'),
('TOTAL_DEDICATION', 'Dedicação Total', 'Manteve ofensiva de 30 dias.', 'flame', 'consistencia', 500, 30, '30/30 dias', 'from-orange-500 to-red-600'),
('QUESTIONS_1000', '1000 Questões', 'Resolveu 1000 questões na plataforma.', 'checkCircle2', 'performance', 250, 1000, '1000/1000', 'from-emerald-500 to-green-600')
ON CONFLICT (code) DO NOTHING;
