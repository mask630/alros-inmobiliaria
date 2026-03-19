'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProperty(data: any) {
    try {
        const supabase = await createClient();
        
        // Obtener el usuario actual para la auditoría
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return {
                success: false,
                error: { message: "Debes estar autenticado para crear una propiedad" }
            };
        }

        const propertyData = { ...data };
        
        // Inyectar auditoría
        propertyData.created_by = user.id;
        propertyData.updated_by = user.id;

        // Validation: Price must be a valid number
        if (isNaN(propertyData.price) || propertyData.price === null || propertyData.price === '') {
            return {
                success: false,
                error: {
                    message: "El precio no es válido. Asegúrate de introducir un número.",
                    code: "INVALID_PRICE"
                }
            };
        }

        // Generación de Referencia automática (P1000+)
        let newReference = 'P1000';
        const { data: lastProp } = await supabase
            .from('properties')
            .select('referencia')
            .like('referencia', 'P%')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastProp && lastProp.referencia) {
            const numPart = parseInt(lastProp.referencia.replace('P', ''), 10);
            if (!isNaN(numPart)) {
                const nextNum = Math.max(1000, numPart + 1);
                newReference = `P${nextNum}`;
            }
        }

        propertyData.reference_id = newReference;
        propertyData.referencia = newReference;

        // Creación de carpetas (solo en entorno local/servidor con FS)
        try {
            const fs = require('fs');
            const path = require('path');
            const opTypeFolder = propertyData.operation === 'alquiler' ? 'Alquiler' : 'Venta';
            const dirPath = path.join(process.cwd(), 'public', 'propiedades', opTypeFolder, newReference);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        } catch (dirError) {
            console.error("Error creating directory:", dirError);
        }

        const { data: result, error } = await supabase
            .from('properties')
            .insert([propertyData])
            .select()
            .single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            return {
                success: false,
                error: {
                    message: error.message || "Error al insertar en base de datos",
                    code: error.code || "DB_ERROR"
                }
            };
        }

        if (result) {
            const { logActivity } = await import("@/utils/audit");
            await logActivity({
                action: 'created',
                entity_type: 'property',
                entity_id: result.id,
                entity_name: result.referencia || result.title,
                details: `Propiedad creada con precio ${result.price}€`
            });
        }

        revalidatePath('/admin/propiedades');
        return { success: true, data: result };
    } catch (e: any) {
        console.error("createProperty Exception:", e);
        return {
            success: false,
            error: {
                message: e?.message || "Excepción interna del servidor",
                code: "SERVER_EXCEPTION"
            }
        };
    }
}
