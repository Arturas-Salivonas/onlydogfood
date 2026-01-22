-- Migration: Add Structured Ingredient System (Algorithm v3.0)
-- Created: 2026-01-15
-- Description: Enables granular ingredient tracking with percentages, categories, and split detection

-- ============================================
-- TABLE: product_ingredients
-- Purpose: Track each ingredient individually with percentages and classifications
-- ============================================
CREATE TABLE product_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Position & Identification
  position INTEGER NOT NULL CHECK (position >= 1),
  ingredient_name TEXT NOT NULL,
  ingredient_normalized TEXT NOT NULL,

  -- Percentage Data (NEW!)
  percentage_declared DECIMAL(5,2) CHECK (percentage_declared >= 0 AND percentage_declared <= 100),
  percentage_estimated DECIMAL(5,2) CHECK (percentage_estimated >= 0 AND percentage_estimated <= 100),
  percentage_confidence TEXT CHECK (percentage_confidence IN ('declared', 'estimated-high', 'estimated-medium', 'estimated-low', 'unknown')),

  -- Classification (NEW!)
  category TEXT CHECK (category IN ('meat', 'meal', 'grain', 'vegetable', 'fruit', 'fat', 'additive', 'supplement', 'other')),
  subcategory TEXT,
  quality_tier TEXT CHECK (quality_tier IN ('premium', 'standard', 'low-quality', 'filler', 'unknown')),

  -- Flags for quick filtering
  is_meat_source BOOLEAN DEFAULT false,
  is_protein_source BOOLEAN DEFAULT false,
  is_filler BOOLEAN DEFAULT false,
  is_artificial BOOLEAN DEFAULT false,
  is_controversial BOOLEAN DEFAULT false,

  -- Additional metadata
  notes TEXT,
  manually_verified BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_product_ingredient UNIQUE(product_id, position),
  CONSTRAINT check_percentage_logic CHECK (
    percentage_declared IS NULL OR percentage_estimated IS NULL OR percentage_declared = percentage_estimated
  )
);

-- Indexes for product_ingredients
CREATE INDEX idx_product_ingredients_product ON product_ingredients(product_id);
CREATE INDEX idx_product_ingredients_position ON product_ingredients(product_id, position);
CREATE INDEX idx_product_ingredients_category ON product_ingredients(category);
CREATE INDEX idx_product_ingredients_meat ON product_ingredients(is_meat_source) WHERE is_meat_source = true;
CREATE INDEX idx_product_ingredients_filler ON product_ingredients(is_filler) WHERE is_filler = true;

-- Comments
COMMENT ON TABLE product_ingredients IS 'Individual ingredient tracking with percentages and classifications (v3.0)';
COMMENT ON COLUMN product_ingredients.percentage_declared IS 'Percentage if declared by manufacturer on label';
COMMENT ON COLUMN product_ingredients.percentage_estimated IS 'Estimated percentage based on position and analysis';
COMMENT ON COLUMN product_ingredients.percentage_confidence IS 'Confidence level in the percentage value';
COMMENT ON COLUMN product_ingredients.manually_verified IS 'True if admin manually verified this ingredient data';

-- ============================================
-- TABLE: product_ingredient_groups
-- Purpose: Aggregate related ingredients to detect splitting
-- ============================================
CREATE TABLE product_ingredient_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Group identification
  group_type TEXT NOT NULL,
  group_category TEXT NOT NULL,

  -- Aggregated data
  total_percentage DECIMAL(5,2) CHECK (total_percentage >= 0 AND total_percentage <= 100),
  ingredient_count INTEGER NOT NULL CHECK (ingredient_count > 0),
  highest_position INTEGER NOT NULL CHECK (highest_position >= 1),
  average_position DECIMAL(5,2),

  -- Individual members (JSON array)
  member_ingredients JSONB NOT NULL,

  -- Split detection flags
  is_split_suspected BOOLEAN DEFAULT false,
  split_severity TEXT CHECK (split_severity IN ('none', 'mild', 'moderate', 'severe')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_product_group UNIQUE(product_id, group_type)
);

-- Indexes for product_ingredient_groups
CREATE INDEX idx_product_ingredient_groups_product ON product_ingredient_groups(product_id);
CREATE INDEX idx_product_ingredient_groups_split ON product_ingredient_groups(is_split_suspected) WHERE is_split_suspected = true;
CREATE INDEX idx_product_ingredient_groups_category ON product_ingredient_groups(group_category);

-- Comments
COMMENT ON TABLE product_ingredient_groups IS 'Groups related ingredients for split detection (e.g., chicken + chicken meal + dried chicken)';
COMMENT ON COLUMN product_ingredient_groups.group_type IS 'e.g., "chicken-sources", "corn-derivatives", "rice-types"';
COMMENT ON COLUMN product_ingredient_groups.member_ingredients IS 'JSON array: [{name, percentage, position, id}, ...]';
COMMENT ON COLUMN product_ingredient_groups.is_split_suspected IS 'True if ingredient appears to be split across multiple entries';

-- ============================================
-- ALTER products table
-- Add fields for structured ingredient tracking
-- ============================================
ALTER TABLE products
ADD COLUMN IF NOT EXISTS total_ingredients_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ingredients_analyzed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS declared_percentages_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_ingredient_splitting BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_filler_stuffing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS effective_meat_percent DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS total_filler_percent DECIMAL(5,2);

-- Add indexes for new product fields
CREATE INDEX IF NOT EXISTS idx_products_ingredients_analyzed ON products(ingredients_analyzed);
CREATE INDEX IF NOT EXISTS idx_products_splitting ON products(has_ingredient_splitting) WHERE has_ingredient_splitting = true;
CREATE INDEX IF NOT EXISTS idx_products_stuffing ON products(has_filler_stuffing) WHERE has_filler_stuffing = true;
CREATE INDEX IF NOT EXISTS idx_products_effective_meat ON products(effective_meat_percent DESC NULLS LAST);

-- Comments on new product fields
COMMENT ON COLUMN products.total_ingredients_count IS 'Total number of ingredients in the product';
COMMENT ON COLUMN products.ingredients_analyzed IS 'True if ingredients have been parsed into structured format';
COMMENT ON COLUMN products.declared_percentages_count IS 'Number of ingredients with manufacturer-declared percentages';
COMMENT ON COLUMN products.has_ingredient_splitting IS 'True if split ingredient pattern detected (e.g., chicken appears 3+ times)';
COMMENT ON COLUMN products.has_filler_stuffing IS 'True if filler stuffing detected (20+ ingredients at <1%)';
COMMENT ON COLUMN products.effective_meat_percent IS 'Moisture-adjusted effective meat content (v3.0 calculation)';
COMMENT ON COLUMN products.total_filler_percent IS 'Total percentage of all filler ingredients combined';

-- ============================================
-- FUNCTION: Update product ingredient counts
-- ============================================
CREATE OR REPLACE FUNCTION update_product_ingredient_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the product's ingredient count
  UPDATE products
  SET
    total_ingredients_count = (
      SELECT COUNT(*)
      FROM product_ingredients
      WHERE product_id = NEW.product_id
    ),
    updated_at = NOW()
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update counts
CREATE TRIGGER trigger_update_ingredient_counts
AFTER INSERT OR DELETE ON product_ingredients
FOR EACH ROW
EXECUTE FUNCTION update_product_ingredient_counts();

-- ============================================
-- FUNCTION: Auto-update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_ingredient_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamp updates
CREATE TRIGGER trigger_update_product_ingredients_timestamp
BEFORE UPDATE ON product_ingredients
FOR EACH ROW
EXECUTE FUNCTION update_ingredient_timestamp();

CREATE TRIGGER trigger_update_product_ingredient_groups_timestamp
BEFORE UPDATE ON product_ingredient_groups
FOR EACH ROW
EXECUTE FUNCTION update_ingredient_timestamp();

-- ============================================
-- Default data for testing (optional)
-- ============================================
-- You can remove this section if you don't want test data

-- Add a note about migration
INSERT INTO scrape_logs (scrape_type, status, items_scraped, started_at, completed_at)
VALUES ('products', 'completed', 0, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 004 completed successfully!';
  RAISE NOTICE 'New tables created: product_ingredients, product_ingredient_groups';
  RAISE NOTICE 'Next step: Run ingredient parsing script to populate structured data';
END $$;
