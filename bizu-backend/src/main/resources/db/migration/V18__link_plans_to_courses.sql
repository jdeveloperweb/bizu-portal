-- Link plans to courses
ALTER TABLE commerce.plans ADD COLUMN course_id UUID REFERENCES content.courses(id);
ALTER TABLE commerce.plans ADD COLUMN features TEXT; -- JSON array of feature strings
ALTER TABLE commerce.plans ADD COLUMN highlight BOOLEAN DEFAULT FALSE;
ALTER TABLE commerce.plans ADD COLUMN badge VARCHAR(100);
ALTER TABLE commerce.plans ADD COLUMN sort_order INTEGER DEFAULT 0;

CREATE INDEX idx_plans_course_id ON commerce.plans(course_id);
