ALTER TABLE content.courses ADD COLUMN category VARCHAR(255);
ALTER TABLE content.courses ADD COLUMN level VARCHAR(255);
ALTER TABLE content.courses ADD COLUMN is_mandatory BOOLEAN DEFAULT FALSE;

ALTER TABLE content.materials ADD COLUMN content TEXT;
