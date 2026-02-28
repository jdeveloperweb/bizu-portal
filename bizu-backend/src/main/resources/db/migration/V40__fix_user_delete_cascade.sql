-- ============================================================
-- V40: Fix User Deletion Cascade
-- Ensures that deleting a user also removes all related data
-- that was missing the ON DELETE CASCADE constraint.
-- ============================================================

-- 1. ANALYTICS
ALTER TABLE analytics.daily_activity DROP CONSTRAINT IF EXISTS daily_activity_user_id_fkey;
ALTER TABLE analytics.daily_activity ADD CONSTRAINT daily_activity_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE;

-- 2. STUDENT (Duels)
ALTER TABLE student.duels DROP CONSTRAINT IF EXISTS duels_challenger_id_fkey;
ALTER TABLE student.duels ADD CONSTRAINT duels_challenger_id_fkey 
    FOREIGN KEY (challenger_id) REFERENCES identity.users(id) ON DELETE CASCADE;

ALTER TABLE student.duels DROP CONSTRAINT IF EXISTS duels_opponent_id_fkey;
ALTER TABLE student.duels ADD CONSTRAINT duels_opponent_id_fkey 
    FOREIGN KEY (opponent_id) REFERENCES identity.users(id) ON DELETE CASCADE;

ALTER TABLE student.duels DROP CONSTRAINT IF EXISTS duels_winner_id_fkey;
ALTER TABLE student.duels ADD CONSTRAINT duels_winner_id_fkey 
    FOREIGN KEY (winner_id) REFERENCES identity.users(id) ON DELETE CASCADE;

-- 3. COMMERCE (Subscriptions & Payments)
ALTER TABLE commerce.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE commerce.subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE;

ALTER TABLE commerce.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE commerce.payments ADD CONSTRAINT payments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE;

ALTER TABLE commerce.subscription_groups DROP CONSTRAINT IF EXISTS subscription_groups_owner_id_fkey;
ALTER TABLE commerce.subscription_groups ADD CONSTRAINT subscription_groups_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES identity.users(id) ON DELETE CASCADE;

-- 4. IDENTITY (Friendships)
ALTER TABLE identity.friendships DROP CONSTRAINT IF EXISTS friendships_requester_id_fkey;
ALTER TABLE identity.friendships ADD CONSTRAINT friendships_requester_id_fkey 
    FOREIGN KEY (requester_id) REFERENCES identity.users(id) ON DELETE CASCADE;

ALTER TABLE identity.friendships DROP CONSTRAINT IF EXISTS friendships_addressee_id_fkey;
ALTER TABLE identity.friendships ADD CONSTRAINT friendships_addressee_id_fkey 
    FOREIGN KEY (addressee_id) REFERENCES identity.users(id) ON DELETE CASCADE;

-- 5. STUDENT (Tasks, Pomodoro, Materials)
ALTER TABLE student.student_tasks DROP CONSTRAINT IF EXISTS student_tasks_student_id_fkey;
ALTER TABLE student.student_tasks ADD CONSTRAINT student_tasks_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES identity.users(id) ON DELETE CASCADE;

ALTER TABLE student.pomodoro_sessions DROP CONSTRAINT IF EXISTS pomodoro_sessions_user_id_fkey;
ALTER TABLE student.pomodoro_sessions ADD CONSTRAINT pomodoro_sessions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE;

ALTER TABLE student.material_completions DROP CONSTRAINT IF EXISTS material_completions_user_id_fkey;
ALTER TABLE student.material_completions ADD CONSTRAINT material_completions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE;

-- 6. ADMIN (Logs)
ALTER TABLE admin.admin_action_logs DROP CONSTRAINT IF EXISTS admin_action_logs_admin_id_fkey;
ALTER TABLE admin.admin_action_logs ADD CONSTRAINT admin_action_logs_admin_id_fkey 
    FOREIGN KEY (admin_id) REFERENCES identity.users(id) ON DELETE CASCADE;

-- 7. ESSAY (Essays)
ALTER TABLE essay.essays DROP CONSTRAINT IF EXISTS essays_student_id_fkey;
ALTER TABLE essay.essays ADD CONSTRAINT essays_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES identity.users(id) ON DELETE CASCADE;
