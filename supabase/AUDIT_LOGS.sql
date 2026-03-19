-- Tabla para el registro de actividad (Audit Log)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'created', 'updated', 'deleted'
    entity_type TEXT NOT NULL, -- 'property', 'owner', 'lead', 'document', 'settings'
    entity_id TEXT, -- ID de la entidad afectada
    entity_name TEXT, -- Nombre o referencia legible (ej: Ref P0123)
    details TEXT, -- Descripción opcional: "Cambió el precio de 100k a 120k"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas: Solo administradores pueden ver los logs
CREATE POLICY "Admins can view all logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Los agentes pueden ver sus propios logs (opcional)
CREATE POLICY "Agents can view their own logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Insertar logs es solo para operaciones del sistema (authenticated)
CREATE POLICY "System can insert logs" 
ON public.audit_logs FOR INSERT 
TO authenticated 
WITH CHECK (true);
