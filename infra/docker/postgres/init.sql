-- drowl PostgreSQL Initialization Script
-- This script runs once when the PostgreSQL container is first created
-- Actual schema migrations are managed by node-pg-migrate in packages/db

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search performance

-- Grant minimal privileges (least-privilege principle)
GRANT CONNECT ON DATABASE drowl TO drowl;

\c drowl

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO drowl;

-- Grant table privileges (will apply to future tables via ALTER DEFAULT PRIVILEGES)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO drowl;

-- Grant sequence privileges (for auto-increment columns)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO drowl;

-- Grant execute on functions (if needed)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO drowl;

-- Display initialization completion message
DO $$
BEGIN
  RAISE NOTICE 'drowl database initialized successfully';
  RAISE NOTICE 'Run migrations from packages/db to set up the schema';
END $$;
