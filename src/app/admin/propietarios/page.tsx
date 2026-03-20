"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Mail, Phone, Eye, Edit, ChevronUp, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Owner } from "@/types/database.types";

export default function PropietariosPage() {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Owner; direction: 'asc' | 'desc' } | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    useEffect(() => {
        fetchOwners();

        // Fetch User Role
        const fetchRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (profile) setCurrentUserRole(profile.role);
            }
        };
        fetchRole();
    }, []);

    const fetchOwners = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('propietarios')
            .select(`
                *, 
                updated_by_profile:profiles!propietarios_updated_by_fkey(first_name, last_name),
                properties_count:properties(count)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching owners:', error);
        } else {
            setOwners((data || []) as Owner[]);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, name: string, propCount: number = 0) => {
        let msg = `¿Estás seguro de que quieres eliminar al propietario "${name}"?`;
        
        if (propCount > 0) {
            msg = `⚠️ CUIDADO: El propietario "${name}" tiene ${propCount} propiedades asignadas.\n\n` +
                  `Si lo borras, estas propiedades se quedarán "huérfanas" (sin dueño asignado).\n\n` +
                  `¿Estás seguro de que quieres continuar?`;
        } else {
            msg += ` Esta acción no se puede deshacer.`;
        }

        if (!confirm(msg)) return;

        try {
            const { error } = await supabase
                .from('propietarios')
                .delete()
                .eq('id', id);

            if (error) throw error;
            
            // Re-fetch owners or remove from state locally
            setOwners(prev => prev.filter(o => o.id !== id));
        } catch (error) {
            console.error('Error deleting owner:', error);
            alert('Error al eliminar el propietario. Es posible que tenga registros relacionados importantes.');
        }
    };

    const handleSort = (key: keyof Owner) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOwners = [...owners].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let valA = a[key];
        let valB = b[key];

        // Handle nulls
        if (valA === null) return 1;
        if (valB === null) return -1;

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredOwners = sortedOwners.filter(owner => {
        const search = searchTerm.toLowerCase();
        return (
            owner.nombre_completo.toLowerCase().includes(search) ||
            (owner.email?.toLowerCase().includes(search)) ||
            (owner.documento_identidad?.toLowerCase().includes(search)) ||
            (owner.telefonos?.some(t => t.includes(search))) ||
            (owner.codigo?.toLowerCase().includes(search))
        );
    });

    const SortIcon = ({ column }: { column: keyof Owner }) => {
        if (sortConfig?.key !== column) return <div className="w-4 h-4 opacity-20"><ChevronUp size={14} /></div>;
        return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} className="text-blue-600" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Cartera de Propietarios</h1>
                    <p className="text-slate-500">Gestiona los dueños de los inmuebles.</p>
                </div>
                <Link href="/admin/propietarios/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <span className="font-bold text-lg leading-none">+</span>
                    <span>Nuevo Propietario</span>
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, teléfono o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('nombre_completo')}>
                                <div className="flex items-center gap-2">Nombre <SortIcon column="nombre_completo" /></div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('documento_identidad')}>
                                <div className="flex items-center gap-2">Identificación <SortIcon column="documento_identidad" /></div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Contacto</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Inmuebles</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('tipo')}>
                                <div className="flex items-center gap-2">Tipo <SortIcon column="tipo" /></div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('created_at')}>
                                <div className="flex items-center gap-2">Fecha Alta <SortIcon column="created_at" /></div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="animate-spin text-blue-500" />
                                        <span>Cargando propietarios...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredOwners.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    {searchTerm ? "No se encontraron propietarios que coincidan con la búsqueda." : "No hay propietarios registrados todavía."}
                                </td>
                            </tr>
                        ) : (
                            filteredOwners.map((owner) => (
                                <tr key={owner.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm bg-blue-100 text-blue-700">
                                                {owner.nombre_completo.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-900 block">{owner.nombre_completo}</span>
                                                <span className="text-xs text-slate-500 font-mono">{owner.codigo}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {owner.documento_identidad || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-sm text-slate-500">
                                            {owner.email && <div className="flex items-center gap-1"><Mail size={14} /> {owner.email}</div>}
                                            {owner.telefonos && owner.telefonos.length > 0 && <div className="flex items-center gap-1"><Phone size={14} /> {owner.telefonos[0]}</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full font-bold text-xs ${((owner as any).properties_count?.[0]?.count || 0) > 0 ? 'bg-[#831832] text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                                            {(owner as any).properties_count?.[0]?.count || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600 capitalize">{owner.tipo || 'No definido'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex flex-col">
                                            <span>
                                                {new Date(owner.created_at).toLocaleDateString("es-ES", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric"
                                                })}
                                            </span>
                                            {(owner as any).updated_by_profile && (
                                                <span className="text-[10px] text-[#831832]/60 font-medium">
                                                    Mod. por {(owner as any).updated_by_profile.first_name}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/propietarios/${owner.id}`}
                                                className="px-3 py-1.5 flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded text-slate-600 text-sm font-medium transition-colors whitespace-nowrap"
                                                title="Ver Ficha Completa"
                                            >
                                                <Eye size={16} /> Ver Ficha
                                            </Link>
                                            <Link
                                                href={`/admin/propietarios/editar/${owner.id}`}
                                                className="p-1.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 rounded text-blue-600 transition-colors"
                                                title="Modificar Datos"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            {currentUserRole === 'admin' && (
                                                <button
                                                    onClick={() => {
                                                        const pCount = (owner as any).properties_count?.[0]?.count || 0;
                                                        handleDelete(owner.id, owner.nombre_completo, pCount);
                                                    }}
                                                    className="p-1.5 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 rounded text-red-600 transition-colors"
                                                    title="Eliminar Propietario"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
