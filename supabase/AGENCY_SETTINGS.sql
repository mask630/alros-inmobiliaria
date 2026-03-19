-- Tabla para la configuración global de la agencia
CREATE TABLE IF NOT EXISTS public.agency_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'Alros Investments S.L.',
    company_email TEXT,
    company_phone TEXT,
    company_website TEXT DEFAULT 'https://alros-inmobiliaria.com',
    company_address TEXT,
    company_logo_url TEXT,
    legal_representative TEXT,
    default_commission_percentage DECIMAL DEFAULT 5,
    default_deposit_months INTEGER DEFAULT 1,
    social_links JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insertar una fila inicial si no existe
INSERT INTO public.agency_settings (company_name)
SELECT 'Alros Investments S.L.'
WHERE NOT EXISTS (SELECT 1 FROM public.agency_settings);

-- Habilitar RLS
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

-- Políticas: Solo administradores pueden ver y editar si existe el perfil 'admin'
-- O permitimos lectura a todos los autenticados y edición solo a admins
CREATE POLICY "Cualquiera autenticado puede leer la configuración" 
ON public.agency_settings FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Solo administradores pueden editar la configuración" 
ON public.agency_settings FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
