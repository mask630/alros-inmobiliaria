'use client';

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DeleteLeadButton({ id, name }: { id: string, name: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm(`¿Estás seguro de que quieres eliminar a "${name}" de la base de datos?`)) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('interesados').delete().eq('id', id);
            if (error) throw error;
            router.push('/admin/interesados');
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Error al eliminar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all disabled:opacity-50"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Eliminar
        </button>
    );
}
