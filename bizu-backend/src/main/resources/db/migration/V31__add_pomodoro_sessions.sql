CREATE TABLE IF NOT EXISTS student.pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES identity.users(id),
    course_id UUID REFERENCES content.courses(id),
    subject VARCHAR(255) NOT NULL,
    focus_minutes INTEGER NOT NULL,
    cycles INTEGER NOT NULL DEFAULT 1,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON student.pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_course_id ON student.pomodoro_sessions(course_id);
