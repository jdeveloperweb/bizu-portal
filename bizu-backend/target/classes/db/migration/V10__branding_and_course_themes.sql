-- Branding and Course Theme Customization
CREATE TABLE admin.branding (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name      VARCHAR(100),
    logo_url       TEXT,
    primary_color  VARCHAR(7), -- Hex code
    secondary_color VARCHAR(7), -- Hex code
    favicon_url    TEXT,
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add theme color to courses
ALTER TABLE content.courses ADD COLUMN theme_color VARCHAR(7);

-- Initial default branding
INSERT INTO admin.branding (site_name, primary_color, secondary_color, active)
VALUES ('Bizu! Portal', '#3b82f6', '#1e40af', TRUE);
