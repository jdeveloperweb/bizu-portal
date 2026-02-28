-- Seeding Axon Packs as One-Time Plans
ALTER TABLE commerce.plans ADD COLUMN IF NOT EXISTS code VARCHAR(50);

UPDATE commerce.plans SET code = 'PLAN_MENSAL' WHERE name = 'Plano Mensal';
UPDATE commerce.plans SET code = 'PLAN_ANUAL' WHERE name = 'Plano Anual';

INSERT INTO commerce.plans (name, code, description, price, billing_interval, active) VALUES 
('Pacote 1000 Axons', 'AXON_PACK_1000', 'Crédito imediato de 1.000 Axons para usar na loja.', 9.90, 'ONE_TIME', true),
('Pacote 3000 Axons', 'AXON_PACK_3000', 'Crédito imediato de 3.000 Axons (Melhor Custo-Benefício).', 24.90, 'ONE_TIME', true),
('Pacote 10000 Axons', 'AXON_PACK_10000', 'Crédito imediato de 10.000 Axons (Pack Ostentação).', 69.90, 'ONE_TIME', true);
