-- =========================================================
-- MIGRACIÓN: Organización de Contactos / Leads v2
-- Ejecutar en el panel "SQL Editor" de Supabase
-- =========================================================

-- 1. Añadir nuevas columnas a la tabla 'interesados'
ALTER TABLE public.interesados
ADD COLUMN IF NOT EXISTS origen TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS propiedad_interes TEXT,
ADD COLUMN IF NOT EXISTS notas_internas TEXT,
ADD COLUMN IF NOT EXISTS urgencia TEXT DEFAULT 'Media';

-- 2. Actualizar el campo 'estado' para soportar nuevos valores
-- Los valores ahora serán: 'Nuevo', 'Contactado', 'En seguimiento', 'Cerrado', 'Baja'
-- Migramos los 'Alta' existentes a 'Nuevo'
UPDATE public.interesados SET estado = 'Nuevo' WHERE estado = 'Alta';

-- 3. Añadir índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_interesados_origen ON public.interesados(origen);
CREATE INDEX IF NOT EXISTS idx_interesados_urgencia ON public.interesados(urgencia);

-- 4. Permitir inserciones anónimas (para formularios públicos sin autenticación)
-- Esto es SEGURO porque solo permite INSERT, no SELECT ni UPDATE
CREATE POLICY "Permitir inserción anónima interesados" 
ON public.interesados FOR INSERT TO anon 
WITH CHECK (true);

-- También permitir inserciones anónimas en audit_logs para el chatbot
CREATE POLICY "Permitir inserción anónima audit_logs" 
ON public.audit_logs FOR INSERT TO anon 
WITH CHECK (true);

-- 5. Verificar que todo está OK
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'interesados' 
ORDER BY ordinal_position;
