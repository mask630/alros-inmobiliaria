import { createClient } from "@/utils/supabase/server";

export async function logActivity(params: {
    action: 'created' | 'updated' | 'deleted' | 'login' | 'logout' | 'contract_generated';
    entity_type: 'property' | 'owner' | 'lead' | 'document' | 'settings' | 'user';
    entity_id?: string;
    entity_name?: string;
    details?: string;
}) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        // Allow anonymous logging for chatbot or public actions

        const { error } = await supabase
            .from('audit_logs')
            .insert({
                user_id: user?.id || null,
                action: params.action,
                entity_type: params.entity_type,
                entity_id: params.entity_id,
                entity_name: params.entity_name,
                details: params.details
            });

        if (error) {
            console.error("Error logging activity:", error);
        }
    } catch (err) {
        console.error("Critical error in logActivity:", err);
    }
}
