ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

NOTIFY pgrst, 'reload schema';
