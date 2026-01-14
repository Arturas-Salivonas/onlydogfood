-- Migration: Add v2.1 Algorithm Fields
-- Created: 2026-01-06
-- Description: Add fields for confidence score, red flag overrides, and food category

-- Add confidence_score to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS confidence_score INTEGER,
ADD COLUMN IF NOT EXISTS confidence_level TEXT CHECK (confidence_level IN ('High', 'Medium', 'Low')),
ADD COLUMN IF NOT EXISTS red_flag_override JSONB,
ADD COLUMN IF NOT EXISTS star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5);

-- Add food_category field (separate from category for more granular categorization)
-- Keeping original 'category' for backward compatibility
ALTER TABLE products
ADD COLUMN IF NOT EXISTS food_category TEXT CHECK (food_category IN ('dry', 'wet', 'cold-pressed', 'fresh', 'raw', 'snack'));

-- Set default food_category based on existing category
UPDATE products
SET food_category = category
WHERE food_category IS NULL;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_products_confidence_score ON products(confidence_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_products_star_rating ON products(star_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_products_food_category ON products(food_category);

-- Add comment explaining the new fields
COMMENT ON COLUMN products.confidence_score IS 'Data transparency score (0-100), displayed separately from overall score';
COMMENT ON COLUMN products.confidence_level IS 'Confidence level: High (≥80), Medium (50-79), Low (<50)';
COMMENT ON COLUMN products.red_flag_override IS 'JSON object containing maxRating and reason if red flags cap the rating';
COMMENT ON COLUMN products.star_rating IS 'Final star rating (1-5) after applying red flag overrides';
COMMENT ON COLUMN products.food_category IS 'Granular food category for price anchoring (dry, wet, cold-pressed, fresh, raw, snack)';

-- Update algorithm version metadata (you can store this in a separate config table if needed)
-- For now, this is tracked in the code (ALGORITHM_VERSION = '2.1.0')
