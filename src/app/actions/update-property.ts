'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProperty(id: string, data: any) {
    try {
        const supabase = await createClient();
        
        // Auditoría
        const { data: { user } } = await supabase.auth.getUser();

        const updateData = { 
            ...data,
            updated_by: user?.id || null
        };

        const { data: result, error } = await supabase
            .from('properties')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Supabase Update Error:", error);
            return {
                success: false,
                error: {
                    message: error.message || "Error al actualizar en base de datos",
                    code: error.code || "DB_ERROR"
                }
            };
        }

        if (result) {
            const { logActivity } = await import("@/utils/audit");
            await logActivity({
                action: 'updated',
                entity_type: 'property',
                entity_id: result.id,
                entity_name: result.referencia || result.title,
                details: `Propiedad actualizada (Estado: ${result.status}, Precio: ${result.price}€)`
            });
        }

        revalidatePath('/admin/propiedades');
        revalidatePath(`/admin/propiedades/editar/${id}`);
        
        return { success: true, data: result };
    } catch (e: any) {
        console.error("updateProperty Exception:", e);
        return {
            success: false,
            error: {
                message: e?.message || "Excepción interna del servidor",
                code: "SERVER_EXCEPTION"
            }
        };
    }
}
