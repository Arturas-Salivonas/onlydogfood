-- Remove has_artificial_additives and has_fillers columns from products table
ALTER TABLE products DROP COLUMN IF EXISTS has_artificial_additives;
ALTER TABLE products DROP COLUMN IF EXISTS has_fillers;
