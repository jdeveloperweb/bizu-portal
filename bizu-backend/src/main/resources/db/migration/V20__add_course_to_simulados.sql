ALTER TABLE content.simulados ADD COLUMN course_id UUID REFERENCES content.courses(id) ON DELETE SET NULL;
