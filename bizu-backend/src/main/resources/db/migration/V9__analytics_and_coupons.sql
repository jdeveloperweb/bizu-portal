-- Analytics and Coupons Schema
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS commerce;

-- Daily Activity tracking
CREATE TABLE analytics.daily_activity (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES identity.users(id),
    activity_date DATE NOT NULL,
    action_type   VARCHAR(50),
    UNIQUE(user_id, activity_date)
);

-- Coupons management
CREATE TABLE commerce.coupons (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code          VARCHAR(50) NOT NULL UNIQUE,
    type          VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED_AMOUNT
    value         DECIMAL(10,2) NOT NULL,
    max_uses      INTEGER,
    used_count    INTEGER NOT NULL DEFAULT 0,
    valid_from    TIMESTAMPTZ,
    valid_until   TIMESTAMPTZ,
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_date ON analytics.daily_activity(activity_date);
CREATE INDEX idx_coupons_code ON commerce.coupons(code);
