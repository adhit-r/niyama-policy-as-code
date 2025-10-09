-- Niyama Database Initialization Script
-- This script sets up the basic database structure for development

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if it doesn't exist (for development)
-- Note: This won't work in docker-entrypoint-initdb.d, but useful for manual setup
-- CREATE DATABASE niyama_dev;
-- CREATE DATABASE niyama_test;

-- Set timezone
SET timezone = 'UTC';

-- Create basic indexes for performance
-- These will be created by GORM migrations, but having them here for reference

-- Performance optimization settings for development
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Log slow queries (anything over 1 second)
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_statement = 'all';

-- Connection settings
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Write-ahead logging settings
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;

-- Reload configuration
SELECT pg_reload_conf();

-- Create a simple health check function
CREATE OR REPLACE FUNCTION health_check()
RETURNS TABLE(status text, timestamp timestamptz) AS $$
BEGIN
    RETURN QUERY SELECT 'healthy'::text, now();
END;
$$ LANGUAGE plpgsql;

-- Insert initial system data (will be replaced by proper seeding)
-- This is just to ensure the database is working

COMMENT ON DATABASE niyama IS 'Niyama Policy as Code Platform Database';

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Niyama database initialization completed successfully at %', now();
END $$;