-- 1. Propiedades
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Propietarios
ALTER TABLE public.propietarios ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.propietarios ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Interesados (Leads)
ALTER TABLE public.interesados ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.interesados ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Documentos (si aplica)
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Comentario informativo
COMMENT ON COLUMN public.properties.created_by IS 'ID del usuario (auth.users) que creó la propiedad';
COMMENT ON COLUMN public.properties.updated_by IS 'ID del usuario (auth.users) que realizó la última modificación';
