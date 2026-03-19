-- Run this in your Supabase SQL Editor to add the missing columns for advanced filtering
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS size_m2 integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS year_built integer;
