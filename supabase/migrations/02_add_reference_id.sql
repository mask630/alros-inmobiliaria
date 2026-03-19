-- Add reference_id column to properties
ALTER TABLE properties ADD COLUMN reference_id text UNIQUE;
