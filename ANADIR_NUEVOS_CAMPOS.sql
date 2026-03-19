-- ==========================================
-- SCRIPT PARA AÑADIR NUEVOS CAMPOS A PROPERTIES
-- ==========================================
-- Ejecuta este código en el SQL Editor de Supabase (https://app.supabase.com)
-- para añadir los nuevos campos solicitados.

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS has_keys BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS community_fees NUMERIC,
ADD COLUMN IF NOT EXISTS garbage_tax NUMERIC,
ADD COLUMN IF NOT EXISTS ibi NUMERIC,
ADD COLUMN IF NOT EXISTS kitchen_type TEXT,
ADD COLUMN IF NOT EXISTS terrace_meters NUMERIC,
ADD COLUMN IF NOT EXISTS plot_m2 NUMERIC,
ADD COLUMN IF NOT EXISTS furnished TEXT,
ADD COLUMN IF NOT EXISTS sports_areas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS green_areas BOOLEAN DEFAULT false;

-- Nota: Las "Zonas deportivas" y "Zonas verdes" se guardarán en el array de "features".
-- Las "Zonas verdes" utilizarán la etiqueta "Zonas verdes" en features en la inserción/actualización.
-- Las "Zonas deportivas" utilizarán la etiqueta "Zonas deportivas".
