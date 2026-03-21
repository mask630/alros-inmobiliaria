'use client';

import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DeleteOwnerButton({ id, name, propCount }: { id: string, name: string, propCount: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (propCount > 0) {
            const choice = confirm(
                `⚠️ ELIMINACIÓN DE PROPIETARIO: "${name}"\n\n` +
                `Este propietario tiene ${propCount} propiedades asignadas. ¿Cómo quieres gestionarlas?\n\n` +
                `- ACEPTAR: Borrar propietario y reasociar sus propiedades a "OFICINA/STOCK" (Recomendado).\n` +
                `- CANCELAR: Abortar operación.`
            );
            
            if (!choice) return;

            setLoading(true);
            try {
                // 1. Reassign properties to null
                const { error: updateError } = await supabase
                    .from('properties')
                    .update({ owner_id: null })
                    .eq('owner_id', id);

                if (updateError) throw updateError;

                // 2. Delete the owner
                const { error: deleteError } = await supabase
                    .from('propietarios')
                    .delete()
                    .eq('id', id);

                if (deleteError) throw deleteError;
                
                router.push('/admin/propietarios');
                router.refresh();
                alert('Propietario eliminado. Sus propiedades ahora figuran como "Sin propietario asignado" (Stock de Oficina).');
            } catch (err) {
                console.error('Error during deletion:', err);
                alert('Error al procesar la baja.');
            } finally {
                setLoading(false);
            }
        } else {
            if (!confirm(`¿Estás seguro de que quieres eliminar al propietario "${name}"? Esta acción no se puede deshacer.`)) return;
            
            setLoading(true);
            try {
                const { error } = await supabase.from('propietarios').delete().eq('id', id);
                if (error) throw error;
                router.push('/admin/propietarios');
                router.refresh();
            } catch (err) {
                console.error('Error deleting owner:', err);
                alert('Error al eliminar.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            Dar de Baja
        </button>
    );
}
