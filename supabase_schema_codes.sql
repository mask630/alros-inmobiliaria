ALTER TABLE public.propietarios ADD COLUMN IF NOT EXISTS codigo TEXT UNIQUE;
ALTER TABLE public.interesados ADD COLUMN IF NOT EXISTS codigo TEXT UNIQUE;
-- La tabla properties ya tiene la columna 'referencia' TEXT UNIQUE;
