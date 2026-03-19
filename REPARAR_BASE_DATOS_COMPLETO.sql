-- ==========================================
-- SCRIPT DE REPARACIÓN DE BASE DE DATOS
-- PROYECTO: ALROS INMOBILIARIA
-- ==========================================
-- Ejecuta este código en el SQL Editor de Supabase (https://app.supabase.com)
-- para corregir todos los errores de columnas faltantes.

-- 1. Asegurar que existe la tabla de agentes
CREATE TABLE IF NOT EXISTS public.agentes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para agentes
ALTER TABLE public.agentes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura publica agentes" ON public.agentes;
CREATE POLICY "Permitir lectura publica agentes" ON public.agentes FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Permitir insertar agentes" ON public.agentes;
CREATE POLICY "Permitir insertar agentes" ON public.agentes FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir update agentes" ON public.agentes;
CREATE POLICY "Permitir update agentes" ON public.agentes FOR UPDATE TO public USING (true);
DROP POLICY IF EXISTS "Permitir borrar agentes" ON public.agentes;
CREATE POLICY "Permitir borrar agentes" ON public.agentes FOR DELETE TO public USING (true);

-- 2. Asegurar que la tabla propietarios tiene todas las columnas necesarias
ALTER TABLE public.propietarios ADD COLUMN IF NOT EXISTS documento_identidad TEXT;
ALTER TABLE public.propietarios ADD COLUMN IF NOT EXISTS codigo_postal TEXT;
ALTER TABLE public.propietarios ADD COLUMN IF NOT EXISTS poblacion TEXT;
ALTER TABLE public.propietarios ADD COLUMN IF NOT EXISTS provincia TEXT;
ALTER TABLE public.propietarios ADD COLUMN IF NOT EXISTS pais TEXT;

-- 3. REPARAR TABLA PROPERTIES (Añadir todas las columnas del formulario)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS address_street TEXT,
ADD COLUMN IF NOT EXISTS address_number TEXT,
ADD COLUMN IF NOT EXISTS address_floor TEXT,
ADD COLUMN IF NOT EXISTS address_block TEXT,
ADD COLUMN IF NOT EXISTS address_door TEXT,
ADD COLUMN IF NOT EXISTS urbanization TEXT,
ADD COLUMN IF NOT EXISTS zip TEXT,
ADD COLUMN IF NOT EXISTS useful_m2 INTEGER,
ADD COLUMN IF NOT EXISTS year_built INTEGER,
ADD COLUMN IF NOT EXISTS elevator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS orientation TEXT[], 
ADD COLUMN IF NOT EXISTS energy_consumption TEXT,
ADD COLUMN IF NOT EXISTS energy_consumption_kwh NUMERIC,
ADD COLUMN IF NOT EXISTS energy_emissions TEXT,
ADD COLUMN IF NOT EXISTS energy_emissions_kg NUMERIC,
ADD COLUMN IF NOT EXISTS heating_type TEXT,
ADD COLUMN IF NOT EXISTS acceso_exterior_adaptado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS uso_silla_ruedas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS video TEXT,
ADD COLUMN IF NOT EXISTS matterport TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS public_latitude NUMERIC,
ADD COLUMN IF NOT EXISTS public_longitude NUMERIC,
ADD COLUMN IF NOT EXISTS propietario_id UUID REFERENCES public.propietarios(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS agente_id UUID REFERENCES public.agentes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS certificado_energetico TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS garage_num INTEGER,
ADD COLUMN IF NOT EXISTS views_type TEXT,
ADD COLUMN IF NOT EXISTS referencia TEXT,
ADD COLUMN IF NOT EXISTS reference_id TEXT;

-- Añadir restricciones UNIQUE si no existen
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'properties_referencia_key') THEN
        ALTER TABLE public.properties ADD CONSTRAINT properties_referencia_key UNIQUE (referencia);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'properties_reference_id_key') THEN
        ALTER TABLE public.properties ADD CONSTRAINT properties_reference_id_key UNIQUE (reference_id);
    END IF;
END $$;

-- 4. Asegurar RLS en properties para el panel de administración
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo en properties" ON public.properties;
CREATE POLICY "Permitir todo en properties" ON public.properties FOR ALL TO public USING (true) WITH CHECK (true);

-- NOTA: Una vez ejecutado este script, el error "Could not find the 'acceso_exterior_adaptado' column" desaparecerá.
