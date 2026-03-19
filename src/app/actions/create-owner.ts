'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOwner(data: any) {
    try {
        const supabase = await createClient();
        
        // Auditoría
        const { data: { user } } = await supabase.auth.getUser();

        // Backend Validation
        if (!data.nombre_completo || !data.documento_identidad || !data.direccion || !data.email || !data.tipo) {
            return {
                success: false,
                error: { message: "Faltan campos obligatorios por completar." }
            };
        }

        if (!data.telefonos || data.telefonos.length === 0) {
            return {
                success: false,
                error: { message: "Debe proporcionar al menos un teléfono de contacto." }
            };
        }

        let newCodigo = 'A1000';

        // Find last reference
        const { data: lastOwner } = await supabase
            .from('propietarios')
            .select('codigo')
            .like('codigo', 'A%')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastOwner && lastOwner.codigo) {
            const numPart = parseInt(lastOwner.codigo.replace('A', ''), 10);
            if (!isNaN(numPart)) {
                const nextNum = Math.max(1000, numPart + 1);
                newCodigo = `A${nextNum}`;
            }
        }

        const ownerData = { 
            ...data, 
            codigo: newCodigo,
            created_by: user?.id || null,
            updated_by: user?.id || null
        };

        const { data: result, error } = await supabase
            .from('propietarios')
            .insert([ownerData])
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
                entity_type: 'owner',
                entity_id: result.id,
                entity_name: result.nombre_completo,
                details: `Propietario creado con código ${result.codigo}`
            });
        }

        revalidatePath('/admin/propietarios');
        return { success: true, data: result };
    } catch (e: any) {
        console.error("createOwner Exception:", e);
        return {
            success: false,
            error: {
                message: e?.message || "Excepción interna del servidor",
                code: "SERVER_EXCEPTION"
            }
        };
    }
}
