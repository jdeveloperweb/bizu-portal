-- Add category column to questions table to distinguish between SIMULADO and QUIZ
ALTER TABLE content.questions ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'SIMULADO';

-- Create an index for faster filtering by category
CREATE INDEX idx_questions_category ON content.questions(category);
