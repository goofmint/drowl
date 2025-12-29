-- drowl PostgreSQL Initialization Script
-- This script runs once when the PostgreSQL container is first created
-- Actual schema migrations are managed by node-pg-migrate in packages/db

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search performance

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE drowl TO drowl;

-- Display initialization completion message
DO $$
BEGIN
  RAISE NOTICE 'drowl database initialized successfully';
  RAISE NOTICE 'Run migrations from packages/db to set up the schema';
END $$;
