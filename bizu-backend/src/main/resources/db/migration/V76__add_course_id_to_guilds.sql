-- Add course_id to guilds
ALTER TABLE student.guilds ADD COLUMN course_id UUID REFERENCES content.courses(id);
CREATE INDEX idx_guilds_course_id ON student.guilds(course_id);
