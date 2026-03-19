-- Tabla para la base de conocimiento del Chatbot
CREATE TABLE IF NOT EXISTS public.agency_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- 'legal', 'procedimientos', 'servicios', 'faq'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.agency_knowledge ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Public knowledge is viewable by everyone" 
ON public.agency_knowledge FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage knowledge" 
ON public.agency_knowledge FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
