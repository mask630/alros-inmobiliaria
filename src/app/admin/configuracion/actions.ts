'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Obtiene la configuración de la agencia
 */
export async function getAgencySettings() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('agency_settings')
        .select('*')
        .single();
    
    if (error) {
        console.error("Error fetching agency settings:", error);
        return { error: error.message };
    }
    return { data };
}

/**
 * Actualiza la configuración de la agencia
 */
export async function updateAgencySettings(payload: any) {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (profile?.role !== 'admin') {
        return { error: "No tienes permisos para cambiar la configuración global" };
    }

    const { error } = await supabase
        .from('agency_settings')
        .update({
            company_name: payload.company_name,
            company_email: payload.company_email,
            company_phone: payload.company_phone,
            company_website: payload.company_website,
            company_address: payload.company_address,
            legal_representative: payload.legal_representative,
            default_commission_percentage: payload.default_commission_percentage,
            default_deposit_months: payload.default_deposit_months,
            updated_at: new Date().toISOString()
        })
        .match({ id: payload.id });

    if (error) return { error: error.message };
    
    revalidatePath('/admin/configuracion');
    return { success: true };
}

/**
 * Actualiza el perfil del usuario actual
 */
export async function updateProfile(payload: { first_name: string; last_name: string; phone?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { error } = await supabase
        .from('profiles')
        .update({
            first_name: payload.first_name,
            last_name: payload.last_name,
            phone: payload.phone
        })
        .eq('id', user.id);

    if (error) return { error: error.message };
    
    revalidatePath('/admin/configuracion');
    return { success: true };
}

/**
 * Cambia la contraseña
 */
export async function changePassword(password: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return { success: true };
}
