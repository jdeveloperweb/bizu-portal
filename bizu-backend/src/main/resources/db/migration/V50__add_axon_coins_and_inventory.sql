-- Add AxonCoins and Inventory for the Axon Store system
ALTER TABLE student.gamification_stats 
ADD COLUMN axon_coins INT DEFAULT 0;

CREATE TABLE student.inventory (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    item_code   VARCHAR(50) NOT NULL,
    quantity    INT DEFAULT 1,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_code)
);

CREATE INDEX idx_inventory_user_id ON student.inventory(user_id);
