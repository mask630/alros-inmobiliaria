'use server';

import { supabase } from "@/lib/supabase";

type LeadOrigin = 'web_contacto' | 'web_propiedad' | 'web_tasacion' | 'chatbot' | 'manual';
type LeadUrgency = 'Alta' | 'Media' | 'Baja';

interface PublicLeadData {
    nombre_completo: string;
    email?: string;
    telefono?: string;
    origen: LeadOrigin;
    tipo_operacion?: string;
    propiedad_interes?: string;
    notas_internas?: string;
    urgencia?: LeadUrgency;
    observaciones?: string;
}

/**
 * Creates a lead from a public form (no authentication required).
 * Uses the supabase anon client since the user is not logged in.
 * This is the unified entry point for all public contact forms.
 */
export async function createPublicLead(data: PublicLeadData) {
    try {
        // Generate the next reference code
        let newCodigo = 'I1000';

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
            nombre_completo: data.nombre_completo,
            email: data.email || null,
            telefono: data.telefono || null,
            tipo_operacion: data.tipo_operacion || 'consulta',
            origen: data.origen,
            propiedad_interes: data.propiedad_interes || null,
            notas_internas: data.notas_internas || null,
            observaciones: data.observaciones || null,
            urgencia: data.urgencia || 'Media',
            estado: 'Nuevo',
            codigo: newCodigo,
        };

        const { data: result, error } = await supabase
            .from('interesados')
            .insert([leadData])
            .select()
            .single();

        if (error) {
            console.error("Public Lead Insert Error:", error);
            // Don't block the user experience - return success anyway
            // The email was already sent via Web3Forms
            return {
                success: false,
                error: error.message,
                savedToDb: false
            };
        }

        // Log the activity (best-effort, don't block)
        try {
            await supabase
                .from('audit_logs')
                .insert({
                    user_id: null,
                    action: 'created',
                    entity_type: 'lead',
                    entity_id: result?.id,
                    entity_name: data.nombre_completo,
                    details: `Lead automático desde ${getOriginLabel(data.origen)}${data.propiedad_interes ? ` (Ref: ${data.propiedad_interes})` : ''}`
                });
        } catch {
            // Silently ignore audit errors
        }

        return { success: true, savedToDb: true, codigo: newCodigo };
    } catch (e: any) {
        console.error("createPublicLead Exception:", e);
        return {
            success: false,
            error: e?.message || "Error interno",
            savedToDb: false
        };
    }
}

function getOriginLabel(origen: LeadOrigin): string {
    const labels: Record<LeadOrigin, string> = {
        'web_contacto': 'Formulario de Contacto',
        'web_propiedad': 'Ficha de Propiedad',
        'web_tasacion': 'Solicitud de Tasación',
        'chatbot': 'Chatbot IA',
        'manual': 'Registro Manual',
    };
    return labels[origen] || origen;
}
