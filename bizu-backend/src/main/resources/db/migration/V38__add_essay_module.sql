ALTER TABLE content.courses ADD COLUMN has_essay BOOLEAN DEFAULT FALSE;

CREATE SCHEMA IF NOT EXISTS essay;

CREATE TABLE essay.essays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES identity.users(id),
    course_id UUID NOT NULL REFERENCES content.courses(id),
    title VARCHAR(255),
    content TEXT,
    attachment_url TEXT,
    type VARCHAR(50), -- 'TEXT', 'IMAGE', 'PDF'
    grade DECIMAL(5,2),
    feedback TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'CORRECTED', 'FAILED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_essays_student_id ON essay.essays(student_id);
CREATE INDEX idx_essays_course_id ON essay.essays(course_id);
