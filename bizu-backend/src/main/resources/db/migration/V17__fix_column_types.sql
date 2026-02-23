-- Fix column type mismatches between Java (Double) and PostgreSQL (DECIMAL)
-- Hibernate expects float8 (DOUBLE PRECISION) for Java Double in PostgreSQL

ALTER TABLE student.simulation_sessions 
    ALTER COLUMN score_percent TYPE DOUBLE PRECISION;

ALTER TABLE student.user_progress 
    ALTER COLUMN percent_completed TYPE DOUBLE PRECISION;
