-- Update Axon Pack names and badges to match UI labels
UPDATE commerce.plans SET name = 'Iniciante',       badge = null           WHERE code = 'AXON_PACK_1000';
UPDATE commerce.plans SET name = 'Custo-Benefício', badge = 'Mais Popular' WHERE code = 'AXON_PACK_3000';
UPDATE commerce.plans SET name = 'Ostentação',      badge = 'Melhor Valor' WHERE code = 'AXON_PACK_10000';
