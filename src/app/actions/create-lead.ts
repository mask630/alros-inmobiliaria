'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLead(data: any) {
    try {
        const supabase = await createClient();
        
        // Auditoría
        const { data: { user } } = await supabase.auth.getUser();
        
        let newCodigo = 'I1000';

        // Find the last reference
        const { data: lastLead } = await supabase
            .from('interesados')
            .select('codigo')
            .like('codigo', 'I%')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastLead && lastLead.codigo) {
            const numPart = parseInt(lastLead.codigo.replace('I', ''), 10);
            if (!isNaN(numPart)) {
                const nextNum = Math.max(1000, numPart + 1);
                newCodigo = `I${nextNum}`;
            }
        }

        const leadData = { 
            ...data, 
            codigo: newCodigo,
            created_by: user?.id || null,
            updated_by: user?.id || null
        };

        const { data: result, error } = await supabase
            .from('interesados')
            .insert([leadData])
            .select()
            .single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            return {
                success: false,
                error: {
                    message: error.message || "Error al insertar en base de datos",
                    code: error.code
                }
            };
        }

        if (result) {
            const { logActivity } = await import("@/utils/audit");
            await logActivity({
                action: 'created',
                entity_type: 'lead',
                entity_id: result.id,
                entity_name: result.nombre_completo,
                details: `Interesado (Lead) creado con código ${result.codigo}`
            });
        }

        revalidatePath('/admin');
        revalidatePath('/admin/interesados');
        return { success: true, data: result };
    } catch (e: any) {
        console.error("createLead Exception:", e);
        return {
            success: false,
            error: {
                message: e?.message || "Excepción interna del servidor",
                code: "SERVER_EXCEPTION"
            }
        };
    }
}
