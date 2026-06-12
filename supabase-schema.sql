-- ============================================================
-- Bolivia News CMS - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ARTICLES TABLE
-- ============================================================

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT, -- HTML content
  
  -- Source
  source TEXT NOT NULL,
  source_url TEXT,
  author TEXT,
  
  -- Media
  image_url TEXT,
  
  -- Classification (AI-generated, human-editable)
  category TEXT NOT NULL DEFAULT 'mundo',
  region TEXT DEFAULT 'mundial',
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Editorial flags
  is_reviewed BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- AI metadata
  ai_summary TEXT,
  ai_category_confidence REAL
);

-- Indexes
CREATE INDEX articles_category_idx ON articles(category);
CREATE INDEX articles_region_idx ON articles(region);
CREATE INDEX articles_is_published_idx ON articles(is_published);
CREATE INDEX articles_is_reviewed_idx ON articles(is_reviewed);
CREATE INDEX articles_published_at_idx ON articles(published_at DESC);
CREATE INDEX articles_created_at_idx ON articles(created_at DESC);
CREATE INDEX articles_source_idx ON articles(source);

-- Full-text search
CREATE INDEX articles_fts_idx ON articles USING GIN (
  to_ts_vector('spanish', coalesce(title, '') || ' ' || coalesce(summary, ''))
);

-- ============================================================
-- SCRAPE LOGS TABLE
-- ============================================================

CREATE TABLE scrape_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  articles_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success', -- success, error, partial
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT, -- hex color for UI
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO categories (name, slug, color, sort_order) VALUES
  ('Mundo', 'mundo', '#8B0000', 1),
  ('Economía', 'economia', '#C9A227', 2),
  ('Política', 'politica', '#1E3A5F', 3),
  ('Cultura', 'cultura', '#6B3FA0', 4),
  ('Deportes', 'deportes', '#2E7D32', 5),
  ('Tecnología', 'tecnologia', '#00838F', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================

-- Articles: Public read for published articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Public read published articles"
  ON articles FOR SELECT
  USING (is_published = TRUE);

-- Service role can do everything
CREATE POLICY "Service role full access"
  ON articles FOR ALL
  USING (auth.role() = 'service_role');

-- Scrape logs: Service role only
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role scrape logs"
  ON scrape_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Categories: Public read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories"
  ON categories FOR SELECT
  USING (true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-set published_at on first publish
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = TRUE AND OLD.is_published = FALSE AND OLD.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_published_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION set_published_at();
