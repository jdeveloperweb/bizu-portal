-- Add image support to questions
ALTER TABLE content.questions ADD COLUMN IF NOT EXISTS image_base64 TEXT;

-- Create question import logs table
CREATE TABLE IF NOT EXISTS content.question_import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID,
    course_title VARCHAR(255),
    module_id UUID,
    module_title VARCHAR(255),
    category VARCHAR(20) NOT NULL,
    question_count INTEGER NOT NULL DEFAULT 0,
    file_name VARCHAR(500),
    original_json TEXT,
    imported_by VARCHAR(255),
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
