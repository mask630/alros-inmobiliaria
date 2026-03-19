-- Script SQL para actualizar la base de datos de Alros Inmobiliaria 
-- Ejecutar en el panel "SQL Editor" de Supabase

-- 1. Crear la tabla de 'propietarios'
CREATE TABLE IF NOT EXISTS public.propietarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    documento_identidad TEXT, -- DNI, NIE, Pasaporte o CIF
    direccion TEXT,
    telefonos TEXT[], -- Array de strings para múltiples teléfonos
    email TEXT,
    observaciones TEXT,
    tipo TEXT, -- 'venta', 'alquiler', 'ambos'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar RLS (Row Level Security) para propietarios
ALTER TABLE public.propietarios ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad basicas (Ajustar según necesidad de autenticación. Ej: solo usuarios logueados)
CREATE POLICY "Permitir lectura a usuarios logueados" ON public.propietarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir inserción a usuarios logueados" ON public.propietarios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir actualización a usuarios logueados" ON public.propietarios FOR UPDATE TO authenticated USING (true);

-- 2. Modificar la tabla 'properties' actual para añadir nuevos campos
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS propietario_id UUID REFERENCES public.propietarios(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referencia TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS certificado_energetico TEXT;

-- Añadir un trigger o función si se requiere generar la referencia automáticamente en SQL
-- Sin embargo, es más controlable generarla desde la aplicación Node/Next.js (ej: ALR-001)

-- 3. Crear la tabla 'interesados' (Leads)
CREATE TABLE IF NOT EXISTS public.interesados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    tipo_operacion TEXT, -- 'venta', 'alquiler'
    presupuesto_maximo NUMERIC,
    dormitorios_minimo INTEGER,
    preferencias_zonas TEXT[], -- Array de zonas
    observaciones TEXT,
    estado TEXT DEFAULT 'Alta', -- 'Alta', 'Baja', 'Contacto_Realizado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar RLS para interesados
ALTER TABLE public.interesados ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad basicas
CREATE POLICY "Permitir lectura a usuarios logueados interesados" ON public.interesados FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir inserción a usuarios logueados interesados" ON public.interesados FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir actualización a usuarios logueados interesados" ON public.interesados FOR UPDATE TO authenticated USING (true);

-- Indices para mejorar busquedas comunes
CREATE INDEX IF NOT EXISTS idx_properties_propietario_id ON public.properties(propietario_id);
CREATE INDEX IF NOT EXISTS idx_interesados_estado ON public.interesados(estado);
CREATE INDEX IF NOT EXISTS idx_interesados_operacion ON public.interesados(tipo_operacion);
