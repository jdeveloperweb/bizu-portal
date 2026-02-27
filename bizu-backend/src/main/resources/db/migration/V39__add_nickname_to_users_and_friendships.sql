ALTER TABLE identity.users ADD COLUMN nickname VARCHAR(255) UNIQUE;

-- Create an extension if not exists for random uuid, though typically exists in pg
UPDATE identity.users SET nickname = CONCAT(
    REGEXP_REPLACE(LOWER(SPLIT_PART(email, '@', 1)), '[^a-z0-9]', '', 'g'),
    '_',
    SUBSTR(REPLACE(id::text, '-', ''), 1, 4)
);

ALTER TABLE identity.users ALTER COLUMN nickname SET NOT NULL;

CREATE TABLE identity.friendships (
    id UUID PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES identity.users(id),
    addressee_id UUID NOT NULL REFERENCES identity.users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

CREATE INDEX idx_friendships_requester ON identity.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON identity.friendships(addressee_id);
