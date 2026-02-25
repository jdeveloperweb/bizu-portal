-- ============================================================
-- V32: Activity Engine + Course Entitlements + Snapshot System
-- Bizu Portal Structural Refactor
-- ============================================================

-- ============================================================
-- 1. COURSE ENTITLEMENTS
-- Replaces role-based access with course-level entitlements.
-- "User has access to Course until date."
-- ============================================================
CREATE TABLE commerce.course_entitlements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    course_id       UUID NOT NULL REFERENCES content.courses(id) ON DELETE CASCADE,
    source          VARCHAR(50) NOT NULL, -- SUBSCRIPTION, GROUP_SEAT, MANUAL, TRIAL
    source_id       UUID, -- subscription_id or group_id
    granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_entitlements_user_active ON commerce.course_entitlements(user_id, active)
    WHERE active = TRUE AND revoked_at IS NULL;
CREATE INDEX idx_entitlements_user_course ON commerce.course_entitlements(user_id, course_id);
CREATE INDEX idx_entitlements_expires ON commerce.course_entitlements(expires_at)
    WHERE active = TRUE AND expires_at IS NOT NULL;
CREATE INDEX idx_entitlements_source ON commerce.course_entitlements(source_id, source);

-- ============================================================
-- 2. ACTIVITY ATTEMPTS (Unified Activity Engine)
-- Tracks all student activity attempts: OfficialExam and ModuleQuiz.
-- ============================================================
CREATE TABLE student.activity_attempts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    course_id           UUID NOT NULL REFERENCES content.courses(id) ON DELETE CASCADE,
    activity_type       VARCHAR(50) NOT NULL, -- OFFICIAL_EXAM, MODULE_QUIZ
    simulado_id         UUID REFERENCES content.simulados(id) ON DELETE SET NULL,
    module_id           UUID REFERENCES content.modules(id) ON DELETE SET NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'STARTED', -- STARTED, IN_PROGRESS, COMPLETED, EXPIRED, ABANDONED
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at         TIMESTAMPTZ,
    time_limit_seconds  INT,
    total_questions     INT NOT NULL DEFAULT 0,
    correct_answers     INT NOT NULL DEFAULT 0,
    score_percent       DOUBLE PRECISION DEFAULT 0.0,
    score_points        INT DEFAULT 0,
    xp_earned           INT DEFAULT 0,
    weekly_cycle_key    VARCHAR(100), -- e.g., "examId:W09" for ranking
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_user_course ON student.activity_attempts(user_id, course_id);
CREATE INDEX idx_activity_user_type ON student.activity_attempts(user_id, activity_type);
CREATE INDEX idx_activity_simulado ON student.activity_attempts(simulado_id)
    WHERE simulado_id IS NOT NULL;
CREATE INDEX idx_activity_weekly ON student.activity_attempts(weekly_cycle_key)
    WHERE weekly_cycle_key IS NOT NULL;
CREATE INDEX idx_activity_status ON student.activity_attempts(user_id, status)
    WHERE status IN ('STARTED', 'IN_PROGRESS');

-- ============================================================
-- 3. ACTIVITY ATTEMPT ITEM SNAPSHOTS
-- Immutable snapshot of each question at attempt start.
-- NEVER recalculate historical scores based on current question versions.
-- ============================================================
CREATE TABLE student.activity_attempt_item_snapshots (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id              UUID NOT NULL REFERENCES student.activity_attempts(id) ON DELETE CASCADE,
    original_question_id    UUID NOT NULL,
    question_order          INT NOT NULL,

    -- Frozen question state
    snapshot_statement      TEXT NOT NULL,
    snapshot_options         JSONB NOT NULL,
    snapshot_correct_option VARCHAR(20) NOT NULL,
    snapshot_resolution     TEXT,
    snapshot_difficulty     VARCHAR(20),
    snapshot_subject        VARCHAR(100),
    snapshot_weight         DOUBLE PRECISION DEFAULT 1.0,

    -- Student response
    student_selected_option VARCHAR(20),
    student_correct         BOOLEAN,
    time_spent_seconds      INT,
    answered_at             TIMESTAMPTZ
);

CREATE INDEX idx_snapshot_attempt ON student.activity_attempt_item_snapshots(attempt_id);
CREATE INDEX idx_snapshot_question ON student.activity_attempt_item_snapshots(original_question_id);

-- ============================================================
-- 4. RANKING ARCHIVE TABLE
-- Persists weekly ranking history from Redis to Postgres.
-- Read: Redis (hot) | History: Postgres (cold)
-- ============================================================
CREATE TABLE student.ranking_archive (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    exam_id         UUID REFERENCES content.simulados(id) ON DELETE SET NULL,
    weekly_key      VARCHAR(100) NOT NULL,
    score           INT NOT NULL,
    rank_position   INT,
    archived_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ranking_archive_weekly ON student.ranking_archive(weekly_key);
CREATE INDEX idx_ranking_archive_user ON student.ranking_archive(user_id);
