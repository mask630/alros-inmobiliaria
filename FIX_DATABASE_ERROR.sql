-- RUN THIS IN SUPABASE SQL EDITOR TO FIX THE ERROR
-- This adds the missing column for the folder-based photo system

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS reference_id text UNIQUE;

COMMENT ON COLUMN properties.reference_id IS 'Internal Reference ID (e.g. REF-001) for local folder mapping';
