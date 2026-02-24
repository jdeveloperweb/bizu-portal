CREATE TABLE IF NOT EXISTS admin.system_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'SINGLETON',
    stripe_pub_key VARCHAR(255),
    stripe_secret_key VARCHAR(255),
    stripe_webhook_secret VARCHAR(255),
    mp_access_token VARCHAR(255),
    mp_public_key VARCHAR(255),
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_encryption VARCHAR(20) DEFAULT 'tls',
    smtp_user VARCHAR(255),
    smtp_pass VARCHAR(255),
    vimeo_client_id VARCHAR(255),
    vimeo_secret VARCHAR(255),
    vimeo_token VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    session_timeout INTEGER DEFAULT 120,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(255)
);

INSERT INTO admin.system_settings (id) VALUES ('SINGLETON')
ON CONFLICT (id) DO NOTHING;
