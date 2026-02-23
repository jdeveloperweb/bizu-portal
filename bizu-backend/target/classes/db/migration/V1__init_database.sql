-- Create schemas
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS student;
CREATE SCHEMA IF NOT EXISTS commerce;
CREATE SCHEMA IF NOT EXISTS admin;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Identity Tables
CREATE TABLE identity.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  cpf_hash    VARCHAR(64),
  phone       VARCHAR(20),
  avatar_url  VARCHAR(500),
  status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  email_verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,
  metadata    JSONB DEFAULT '{}'
);

CREATE TABLE identity.roles (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE identity.user_roles (
  user_id UUID REFERENCES identity.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES identity.roles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Seed Roles
INSERT INTO identity.roles (name) VALUES ('STUDENT'), ('ADMIN'), ('EDITOR'), ('FINANCIAL'), ('SUPPORT');
