-- Commerce Tables
CREATE TABLE commerce.plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  price            DECIMAL(10,2) NOT NULL,
  currency         VARCHAR(10) DEFAULT 'BRL',
  billing_interval VARCHAR(20) NOT NULL, -- MONTHLY, YEARLY, ONE_TIME
  active           BOOLEAN DEFAULT TRUE,
  stripe_price_id  VARCHAR(255)
);

CREATE TABLE commerce.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES identity.users(id),
  plan_id                UUID NOT NULL REFERENCES commerce.plans(id),
  status                 VARCHAR(50) NOT NULL, -- ACTIVE, CANCELED, PAST_DUE
  stripe_subscription_id VARCHAR(255),
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE commerce.payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES identity.users(id),
  amount           DECIMAL(10,2) NOT NULL,
  status           VARCHAR(50) NOT NULL, -- SUCCEEDED, FAILED, PENDING
  stripe_intent_id VARCHAR(255),
  payment_method   VARCHAR(50),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Initial Plans
INSERT INTO commerce.plans (name, description, price, billing_interval, active) VALUES 
('Plano Mensal', 'Acesso completo a todas as questões e cursos.', 49.90, 'MONTHLY', true),
('Plano Anual', 'Economize 20% no plano anual com acesso total.', 479.00, 'YEARLY', true);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON commerce.subscriptions(user_id);
CREATE INDEX idx_payments_user_id ON commerce.payments(user_id);
