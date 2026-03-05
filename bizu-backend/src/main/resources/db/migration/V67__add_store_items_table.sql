-- V67 Store Items Management with Dynamic Metadata
CREATE TABLE student.store_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(20) NOT NULL, -- consumable, permanent, status, aura, border
    metadata JSONB DEFAULT '{}', -- Stores visual effects and advantages
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed current items with initial metadata
INSERT INTO student.store_items (code, name, description, price, category, metadata) VALUES
('STREAK_FREEZE', 'Escudo de Ofensiva', 'Protege sua sequência de dias caso você esqueça de estudar por um dia.', 150, 'consumable', '{"advantage": "streak_protection"}'),
('DOUBLE_XP_2H', 'Dobra de XP (2h)', 'Todo XP ganho em questões e simulados é dobrado por 2 horas.', 500, 'consumable', '{"advantage": "xp_multiplier", "value": 2.0}'),
('STATUS_ELITE', 'Título: Elite', 'Desbloqueia o título ''Elite'' para aparecer no seu perfil e ranking.', 2000, 'status', '{"visual": {"nameColor": "#6366f1", "nameBold": true}}'),
('AURA_GOLD', 'Aura Ancestral', 'Envolve seu avatar com uma aura dourada de sabedoria.', 8000, 'aura', '{"visual": {"auraColor": "#fbbf24", "auraStyle": "pulse", "glowSize": 10}}'),
('AURA_BLUE', 'Aura Dimensional', 'Uma emanação azul futurista que destaca sua presença.', 4000, 'aura', '{"visual": {"auraColor": "#22d3ee", "auraStyle": "steady", "particles": "sparks"}}'),
('BORDER_RAINBOW', 'Moldura Prismática', 'Uma moldura animada com as cores do arco-íris para seu perfil.', 12000, 'border', '{"visual": {"borderStyle": "rainbow", "animation": "spin"}}');
