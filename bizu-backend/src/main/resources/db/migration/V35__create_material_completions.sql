CREATE TABLE student.material_completions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES identity.users(id),
    material_id UUID NOT NULL REFERENCES content.materials(id),
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(user_id, material_id)
);
