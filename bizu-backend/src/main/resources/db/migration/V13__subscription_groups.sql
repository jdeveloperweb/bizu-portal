-- Create subscription groups for group plans
CREATE TABLE commerce.subscription_groups (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id   UUID NOT NULL REFERENCES identity.users(id),
    plan_id    UUID NOT NULL REFERENCES commerce.plans(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    active     BOOLEAN NOT NULL DEFAULT TRUE
);

-- Join table for group members
CREATE TABLE commerce.subscription_group_members (
    group_id   UUID NOT NULL REFERENCES commerce.subscription_groups(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_subscription_groups_owner ON commerce.subscription_groups(owner_id);
CREATE INDEX idx_subscription_group_members_user ON commerce.subscription_group_members(user_id);
