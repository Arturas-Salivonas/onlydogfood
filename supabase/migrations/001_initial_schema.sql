-- OnlyDogFood.com Database Schema
-- Run this migration in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Brands Table
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  country_of_origin TEXT,
  description TEXT,
  scrape_source_url TEXT,
  overall_score DECIMAL(4,2),
  total_products INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_sponsored BOOLEAN DEFAULT false,
  sponsored_priority INTEGER,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_score ON brands(overall_score DESC NULLS LAST);
CREATE INDEX idx_brands_sponsored ON brands(is_sponsored, sponsored_priority DESC NULLS LAST);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,

  -- Product details
  category TEXT NOT NULL CHECK (category IN ('dry', 'wet', 'snack')),
  sub_category TEXT,
  image_url TEXT,
  package_size_g INTEGER,
  price_gbp DECIMAL(10,2),
  price_per_kg_gbp DECIMAL(10,2),

  -- Nutritional data
  protein_percent DECIMAL(5,2),
  fat_percent DECIMAL(5,2),
  fiber_percent DECIMAL(5,2),
  ash_percent DECIMAL(5,2),
  moisture_percent DECIMAL(5,2),
  carbs_percent DECIMAL(5,2),
  calories_per_100g INTEGER,

  -- Ingredients
  ingredients_raw TEXT,
  ingredients_list JSONB,
  meat_content_percent DECIMAL(5,2),
  has_artificial_additives BOOLEAN DEFAULT false,
  has_fillers BOOLEAN DEFAULT false,

  -- Scoring
  overall_score DECIMAL(4,2),
  ingredient_score DECIMAL(4,2),
  nutrition_score DECIMAL(4,2),
  value_score DECIMAL(4,2),
  scoring_breakdown JSONB,

  -- Metadata
  scrape_source_url TEXT,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  is_available BOOLEAN DEFAULT true,
  is_sponsored BOOLEAN DEFAULT false,
  sponsored_priority INTEGER,
  affiliate_url TEXT,
  discount_code TEXT,
  discount_description TEXT,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_score ON products(overall_score DESC NULLS LAST);
CREATE INDEX idx_products_price ON products(price_per_kg_gbp);
CREATE INDEX idx_products_sponsored ON products(is_sponsored, sponsored_priority DESC NULLS LAST);
CREATE INDEX idx_products_fts ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(ingredients_raw, '')));

-- Articles Table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image_url TEXT,
  category TEXT CHECK (category IN ('methodology', 'guide', 'news')),
  author TEXT DEFAULT 'OnlyDogFood Team',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(is_published, published_at DESC NULLS LAST);

-- Comparisons Table
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  product_ids UUID[] NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exchange Rates Table
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  currency_code TEXT UNIQUE NOT NULL,
  rate_to_gbp DECIMAL(10,6) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default exchange rates
INSERT INTO exchange_rates (currency_code, rate_to_gbp) VALUES
  ('GBP', 1.000000),
  ('USD', 0.785000),
  ('EUR', 0.865000),
  ('AUD', 0.515000);

-- Scrape Logs Table
CREATE TABLE scrape_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrape_type TEXT NOT NULL CHECK (scrape_type IN ('products', 'brands', 'content')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  items_scraped INTEGER DEFAULT 0,
  errors JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Admin Users Table (simple auth for MVP)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update brand overall score and product count
CREATE OR REPLACE FUNCTION update_brand_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE brands
  SET
    overall_score = (
      SELECT AVG(overall_score)
      FROM products
      WHERE brand_id = COALESCE(NEW.brand_id, OLD.brand_id)
      AND overall_score IS NOT NULL
    ),
    total_products = (
      SELECT COUNT(*)
      FROM products
      WHERE brand_id = COALESCE(NEW.brand_id, OLD.brand_id)
    )
  WHERE id = COALESCE(NEW.brand_id, OLD.brand_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update brand stats when products change
CREATE TRIGGER update_brand_stats_on_product_change
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_brand_stats();

-- Enable Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read access
CREATE POLICY "Enable read access for all users" ON brands FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable read access for published articles" ON articles FOR SELECT USING (is_published = true);
CREATE POLICY "Enable read access for all users" ON exchange_rates FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON comparisons FOR SELECT USING (true);

-- Note: Write policies will be added when implementing authentication
-- For now, use service role key for admin operations
