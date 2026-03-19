'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getKnowledge() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('agency_knowledge')
        .select('*')
        .order('created_at', { ascending: false });
    
    return { data, error };
}

export async function saveKnowledge(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;

    const payload = { title, content, category, updated_at: new Date().toISOString() };

    let error;
    if (id) {
        const { error: err } = await supabase
            .from('agency_knowledge')
            .update(payload)
            .eq('id', id);
        error = err;
    } else {
        const { error: err } = await supabase
            .from('agency_knowledge')
            .insert([payload]);
        error = err;
    }

    if (error) return { success: false, error: error.message };
    
    revalidatePath('/admin/chatbot');
    return { success: true };
}

export async function deleteKnowledge(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('agency_knowledge')
        .delete()
        .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    
    revalidatePath('/admin/chatbot');
    return { success: true };
}
