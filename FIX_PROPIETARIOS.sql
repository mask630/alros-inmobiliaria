-- Ejecuta este código en el SQL Editor de tu panel de Supabase
-- para solucionar el error al guardar un "Nuevo Propietario"

-- 1. Añadimos las columnas que faltaban
ALTER TABLE propietarios ADD COLUMN IF NOT EXISTS codigo_postal text;
ALTER TABLE propietarios ADD COLUMN IF NOT EXISTS poblacion text;
ALTER TABLE propietarios ADD COLUMN IF NOT EXISTS provincia text;
ALTER TABLE propietarios ADD COLUMN IF NOT EXISTS pais text;

-- 2. Nos aseguramos de que Supabase deje a la web insertar los datos
-- Habilitamos la seguridad RLS
ALTER TABLE propietarios ENABLE ROW LEVEL SECURITY;

-- Permitimos que la web lea datos de los propietarios
DROP POLICY IF EXISTS "Permitir leer todos" ON propietarios;
CREATE POLICY "Permitir leer todos" 
ON propietarios FOR SELECT 
TO public
USING (true);

-- Permitimos que la web guarde nuevos propietarios
DROP POLICY IF EXISTS "Permitir insertar todos" ON propietarios;
CREATE POLICY "Permitir insertar todos" 
ON propietarios FOR INSERT 
TO public
WITH CHECK (true);

-- (Opcional) Si en un futuro quieres editar/borrar desde la web los propietarios:
DROP POLICY IF EXISTS "Permitir actualizar todos" ON propietarios;
CREATE POLICY "Permitir actualizar todos" 
ON propietarios FOR UPDATE 
TO public
USING (true);

DROP POLICY IF EXISTS "Permitir borrar todos" ON propietarios;
CREATE POLICY "Permitir borrar todos" 
ON propietarios FOR DELETE 
TO public
USING (true);
