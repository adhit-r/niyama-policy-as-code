-- Niyama Database Initialization Script
-- This script sets up the initial database schema and data

-- Create database if it doesn't exist (handled by Docker)
-- CREATE DATABASE IF NOT EXISTS niyama;

-- Set timezone
SET timezone = 'UTC';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'compliance', 'developer', 'auditor', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE org_role AS ENUM ('owner', 'admin', 'editor', 'viewer', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE policy_status AS ENUM ('draft', 'active', 'inactive', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE access_level AS ENUM ('private', 'org', 'public');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('generating', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
-- These will be created by GORM migrations, but we can add custom ones here

-- Full-text search indexes
-- CREATE INDEX IF NOT EXISTS idx_policies_content_gin ON policies USING gin(to_tsvector('english', content));
-- CREATE INDEX IF NOT EXISTS idx_policies_name_gin ON policies USING gin(to_tsvector('english', name));
-- CREATE INDEX IF NOT EXISTS idx_policies_description_gin ON policies USING gin(to_tsvector('english', description));

-- Composite indexes for common queries
-- CREATE INDEX IF NOT EXISTS idx_policies_org_status ON policies(organization_id, status);
-- CREATE INDEX IF NOT EXISTS idx_policies_author_org ON policies(author_id, organization_id);
-- CREATE INDEX IF NOT EXISTS idx_policies_access_level ON policies(access_level, organization_id);

-- Partial indexes for active records
-- CREATE INDEX IF NOT EXISTS idx_policies_active ON policies(organization_id) WHERE status = 'active';
-- CREATE INDEX IF NOT EXISTS idx_users_active ON users(email) WHERE is_active = true;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Niyama database initialization completed successfully';
END $$;
