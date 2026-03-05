-- V67 Store Items Management
CREATE TABLE student.store_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(20) NOT NULL, -- consumable, permanent, status, aura, border
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed current items
INSERT INTO student.store_items (code, name, description, price, category) VALUES
('STREAK_FREEZE', 'Escudo de Ofensiva', 'Protege sua sequência de dias caso você esqueça de estudar por um dia.', 150, 'consumable'),
('DOUBLE_XP_2H', 'Dobra de XP (2h)', 'Todo XP ganho em questões e simulados é dobrado por 2 horas.', 500, 'consumable'),
('RADAR_MATERIA_24H', 'Radar de Matéria', 'Aumenta o XP ganho em uma matéria específica durante 24 horas.', 300, 'consumable'),
('STATUS_ELITE', 'Título: Elite', 'Desbloqueia o título ''Elite'' para aparecer no seu perfil e ranking.', 2000, 'status'),
('STATUS_MASTER', 'Título: Mestre', 'Um título digno para quem já domina os fundamentos.', 5000, 'status'),
('STATUS_LEGEND', 'Título: Lenda', 'O título máximo para os estudantes mais dedicados do portal.', 15000, 'status'),
('AURA_GOLD', 'Aura Ancestral', 'Envolve seu avatar com uma aura dourada de sabedoria.', 8000, 'aura'),
('AURA_BLUE', 'Aura Dimensional', 'Uma emanação azul futurista que destaca sua presença.', 4000, 'aura'),
('BORDER_RAINBOW', 'Moldura Prismática', 'Uma moldura animada com as cores do arco-íris para seu perfil.', 12000, 'border');
