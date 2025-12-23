-- Add tags system to products
-- Migration: 002_add_product_tags.sql

-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280', -- Default gray color
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_tags junction table
CREATE TABLE product_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, tag_id)
);

-- Create indexes
CREATE INDEX idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag_id ON product_tags(tag_id);
CREATE INDEX idx_tags_name ON tags(name);

-- Insert default tags
INSERT INTO tags (name, slug, description, color) VALUES
  ('Organic', 'organic', 'Made with organic ingredients', '#10B981'),
  ('Hypoallergenic', 'hypoallergenic', 'Suitable for dogs with allergies', '#3B82F6'),
  ('High Meat Content', 'high-meat-content', 'Contains high percentage of meat', '#EF4444');

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users" ON tags FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON product_tags FOR SELECT USING (true);

-- Add random tags to existing products (for demo purposes)
-- This will assign 0-3 random tags to each product
INSERT INTO product_tags (product_id, tag_id)
SELECT
  p.id as product_id,
  t.id as tag_id
FROM products p
CROSS JOIN tags t
WHERE random() < 0.3; -- 30% chance for each tag-product combination