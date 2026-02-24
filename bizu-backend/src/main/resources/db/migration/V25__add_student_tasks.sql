CREATE TABLE student.student_tasks (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES identity.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(255),
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    due_date VARCHAR(255),
    linked_action_type VARCHAR(50),
    linked_action_label VARCHAR(255),
    linked_action_href VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_tasks_student_id ON student.student_tasks(student_id);
