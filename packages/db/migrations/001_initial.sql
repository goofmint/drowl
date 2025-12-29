-- Migration: 001_initial
-- Description: Initial schema for drowl platform
-- Created: 2025-12-29

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search performance

-- ============================================================================
-- Events Table
-- Stores raw events from external platforms (immutable)
-- ============================================================================
CREATE TABLE events (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    event_type TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw_payload JSONB NOT NULL,
    storage_key TEXT NOT NULL,
    plugin_id TEXT NOT NULL,
    plugin_version TEXT NOT NULL,
    correlation_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX idx_events_source ON events(source);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_occurred_at ON events(occurred_at DESC);
CREATE INDEX idx_events_ingested_at ON events(ingested_at DESC);
CREATE INDEX idx_events_plugin_id ON events(plugin_id);
CREATE INDEX idx_events_correlation_id ON events(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_events_raw_payload_gin ON events USING gin(raw_payload);

-- ============================================================================
-- Identities Table
-- Stores platform-specific identities (accounts)
-- ============================================================================
CREATE TABLE identities (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    platform_user_id TEXT NOT NULL,
    platform_username TEXT NOT NULL,
    display_name TEXT,
    profile_url TEXT,
    avatar_url TEXT,
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(platform, platform_user_id)
);

-- Indexes for identities
CREATE INDEX idx_identities_platform ON identities(platform);
CREATE INDEX idx_identities_platform_user_id ON identities(platform_user_id);
CREATE INDEX idx_identities_platform_username ON identities(platform_username);
CREATE INDEX idx_identities_is_active ON identities(is_active) WHERE is_active = true;
CREATE INDEX idx_identities_username_trgm ON identities USING gin(platform_username gin_trgm_ops);

-- ============================================================================
-- Identity Links Table
-- Links identities that belong to the same person
-- ============================================================================
CREATE TABLE identity_links (
    id TEXT PRIMARY KEY,
    identity_id_1 TEXT NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
    identity_id_2 TEXT NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
    confidence TEXT NOT NULL CHECK (confidence IN ('manual', 'high', 'medium', 'low', 'suggested')),
    link_source TEXT NOT NULL CHECK (link_source IN ('user_manual', 'email_verified', 'oauth_verified', 'plugin_heuristic', 'ml_inference')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    plugin_id TEXT,
    reason TEXT,
    confidence_score NUMERIC(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    CHECK (identity_id_1 < identity_id_2) -- Ensure consistent ordering
);

-- Indexes for identity_links
CREATE INDEX idx_identity_links_identity_1 ON identity_links(identity_id_1);
CREATE INDEX idx_identity_links_identity_2 ON identity_links(identity_id_2);
CREATE INDEX idx_identity_links_confidence ON identity_links(confidence);
CREATE INDEX idx_identity_links_is_active ON identity_links(is_active) WHERE is_active = true;
CREATE UNIQUE INDEX idx_identity_links_unique_pair ON identity_links(identity_id_1, identity_id_2) WHERE is_active = true;

-- ============================================================================
-- Keywords Table
-- Stores tracked keywords for DevRel impact analysis
-- ============================================================================
CREATE TABLE keywords (
    id TEXT PRIMARY KEY,
    term TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('product', 'technology', 'topic', 'competitor', 'event', 'person', 'custom')),
    match_strategy TEXT NOT NULL DEFAULT 'word_boundary' CHECK (match_strategy IN ('exact', 'word_boundary', 'substring', 'regex')),
    regex_pattern TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 0 AND priority <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT NOT NULL,
    synonyms TEXT[] DEFAULT '{}',
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    reference_url TEXT
);

-- Indexes for keywords
CREATE INDEX idx_keywords_term ON keywords(term);
CREATE INDEX idx_keywords_category ON keywords(category);
CREATE INDEX idx_keywords_is_active ON keywords(is_active) WHERE is_active = true;
CREATE INDEX idx_keywords_priority ON keywords(priority DESC);
CREATE INDEX idx_keywords_term_trgm ON keywords USING gin(term gin_trgm_ops);

-- ============================================================================
-- Jobs Table
-- Stores background jobs for async processing
-- ============================================================================
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('event_ingestion', 'identity_resolution', 'keyword_extraction', 'analytics', 'report_generation', 'data_export', 'cleanup', 'custom')),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'timeout')),
    priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 0 AND priority <= 10),
    input JSONB NOT NULL,
    output JSONB,
    error_message TEXT,
    error_stack TEXT,
    error_code TEXT,
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    timeout_ms INTEGER NOT NULL DEFAULT 300000,
    retry_attempt INTEGER NOT NULL DEFAULT 0,
    retry_max_attempts INTEGER NOT NULL DEFAULT 3,
    retry_backoff_strategy TEXT NOT NULL DEFAULT 'exponential' CHECK (retry_backoff_strategy IN ('linear', 'exponential')),
    retry_last_at TIMESTAMPTZ,
    plugin_id TEXT,
    user_id TEXT,
    correlation_id TEXT,
    parent_job_id TEXT REFERENCES jobs(id),
    tags TEXT[] DEFAULT '{}'
);

-- Indexes for jobs
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_priority ON jobs(priority DESC);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_status_priority ON jobs(status, priority DESC) WHERE status IN ('pending', 'running');
CREATE INDEX idx_jobs_plugin_id ON jobs(plugin_id) WHERE plugin_id IS NOT NULL;
CREATE INDEX idx_jobs_correlation_id ON jobs(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_jobs_parent_job_id ON jobs(parent_job_id) WHERE parent_job_id IS NOT NULL;

-- ============================================================================
-- Plugins Table
-- Stores registered plugins and their configuration
-- ============================================================================
CREATE TABLE plugins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    author_url TEXT,
    manifest JSONB NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    is_installed BOOLEAN NOT NULL DEFAULT false,
    installed_at TIMESTAMPTZ,
    enabled_at TIMESTAMPTZ,
    disabled_at TIMESTAMPTZ,
    last_error TEXT,
    last_error_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for plugins
CREATE INDEX idx_plugins_is_enabled ON plugins(is_enabled) WHERE is_enabled = true;
CREATE INDEX idx_plugins_is_installed ON plugins(is_installed) WHERE is_installed = true;

-- ============================================================================
-- Triggers for updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_identities_updated_at
    BEFORE UPDATE ON identities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at
    BEFORE UPDATE ON keywords
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugins_updated_at
    BEFORE UPDATE ON plugins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE events IS 'Immutable raw events from external platforms (Principle III)';
COMMENT ON TABLE identities IS 'Platform-specific user identities';
COMMENT ON TABLE identity_links IS 'Links between identities belonging to the same person (Principle V)';
COMMENT ON TABLE keywords IS 'Tracked keywords for DevRel impact analysis';
COMMENT ON TABLE jobs IS 'Background jobs for async processing (Principle IV)';
COMMENT ON TABLE plugins IS 'Registered plugins and their configuration (Principle II)';
