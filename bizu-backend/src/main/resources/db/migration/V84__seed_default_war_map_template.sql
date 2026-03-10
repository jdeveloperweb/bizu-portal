-- V84__seed_default_war_map_template.sql

INSERT INTO student.war_map_templates (id, name, description)
VALUES ('00000000-0000-0000-0000-000000000001', 'Mapa Padrão - Vale do Desafio', 'Um mapa balanceado para iniciantes com acampamentos, torres e um castelo final.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO student.war_zone_templates (id, map_template_id, name, zone_type, difficulty_level, position_x, position_y, question_count, points_per_correct, display_order)
VALUES 
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Acampamento Leste', 'CAMP', 1, 0.20, 0.30, 10, 10, 1),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Acampamento Oeste', 'CAMP', 1, 0.20, 0.70, 10, 10, 2),
    ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Torre de Vigia', 'WATCHTOWER', 2, 0.45, 0.50, 15, 15, 3),
    ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Forte da Montanha', 'FORTRESS', 3, 0.70, 0.30, 20, 20, 4),
    ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Ruínas Antigas', 'FORTRESS', 3, 0.70, 0.70, 20, 20, 5),
    ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'Castelo do Chefe', 'BOSS', 4, 0.90, 0.50, 30, 30, 6)
ON CONFLICT (id) DO NOTHING;

-- Criar dependências (prerequisites) para tornar o mapa linear e progressivo
INSERT INTO student.war_zone_prerequisites (zone_id, prerequisite_zone_id)
VALUES 
    -- Torre de vigia precisa de pelo menos 1 acampamento, vamos exigir o Acampamento Leste
    ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000011'),
    -- Fortes precisam da torre de vigia
    ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000013'),
    ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000013'),
    -- Castelo Boss precisa do forte da montanha
    ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000014')
ON CONFLICT DO NOTHING;
