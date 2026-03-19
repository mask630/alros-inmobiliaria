'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAgentAction(formData: FormData) {
    const supabase = await createClient();
    
    // 1. Check if current user is admin
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return { error: "No autenticado" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();
    
    if (profile?.role !== 'admin') {
        return { error: "No tienes permisos de administrador" };
    }

    // 2. Extract data
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const role = formData.get('role') as string;

    if (!email || !password || !firstName) {
        return { error: "Faltan datos obligatorios (Email, Password, Nombre)" };
    }

    // 3. Create user in Supabase Auth
    // IMPORTANT: We use a separate client WITHOUT cookie persistence to avoid 
    // logging out the admin and logging in as the new user.
    const { createClient: createBareClient } = await import("@supabase/supabase-js");
    const supabaseBare = createBareClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    );
    
    const { data: authData, error: authError } = await supabaseBare.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName
            }
        }
    });

    if (authError) return { error: "Error de registro: " + authError.message };
    if (!authData.user) return { error: "No se pudo crear el usuario" };

    // 4. Update the role (the trigger defaults to 'agente')
    // We use the ADMIN'S authenticated client to perform this update
    if (role === 'admin') {
        const { error: roleError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', authData.user.id);
        
        if (roleError) console.error("Error updating role to admin:", roleError);
    }

    revalidatePath('/admin/agentes');
    return { success: true };
}
