'use client';

import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, Search, Filter, X, Loader2, Star, CalendarClock, AlertTriangle, CheckCircle2, BedDouble, Bath, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";

export default function AdminPropertiesPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const pageSize = 15;

    // Filter and Sort states
    const [activeFilters, setActiveFilters] = useState({
        search: '',
        operation: '',
        type: '',
        status: ''
    });

    // Default sort by created_at desc (which makes Propiedad/Ref start as 'hora')
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({
        key: 'created_at',
        direction: 'desc'
    });

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('properties')
                .select('*, updated_by_profile:profiles!properties_updated_by_fkey(first_name, last_name)', { count: 'exact' });

            // Apply filters
            if (activeFilters.operation) {
                query = query.eq('operation_type', activeFilters.operation);
            }
            if (activeFilters.type) {
                query = query.eq('property_type', activeFilters.type);
            }
            if (activeFilters.status) {
                query = query.eq('status', activeFilters.status);
            }
            if (activeFilters.search) {
                // Search in title, address, city and reference_id.
                query = query.or(`title.ilike.%${activeFilters.search}%,address.ilike.%${activeFilters.search}%,city.ilike.%${activeFilters.search}%,reference_id.ilike.%${activeFilters.search}%`);
            }

            // Apply sort
            if (sortConfig.key === 'is_featured') {
                query = query.order('is_featured', { ascending: sortConfig.direction === 'asc' });
                // fallback order
                query = query.order('created_at', { ascending: false });
            } else {
                query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
            }

            const { data, count, error } = await query
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error) throw error;

            setProperties(data || []);
            setTotal(count || 0);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, activeFilters, sortConfig]);

    useEffect(() => {
        fetchProperties();
        
        // Fetch User Role - Better check
        const fetchRole = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const user = session?.user;
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                    if (profile) {
                        setCurrentUserRole(profile.role);
                        return;
                    }
                }
                setCurrentUserRole('agente');
            } catch (err) {
                console.error("Error fetching role:", err);
                setCurrentUserRole('error');
            }
        };
        fetchRole();
    }, [fetchProperties]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setActiveFilters(prev => ({ ...prev, [name]: value }));
        setPage(0); // Reset to first page when filtering
    };

    const clearFilters = () => {
        setActiveFilters({
            search: '',
            operation: '',
            type: '',
            status: ''
        });
        setPage(0);
    };

    const handleSort = (column: string) => {
        setSortConfig(prev => {
            if (column === 'propiedad') {
                // Secuencia: Hora(created_at desc) -> Hora(asc) -> Ref(desc) -> Ref(asc)
                if (prev.key === 'created_at' && prev.direction === 'desc') return { key: 'created_at', direction: 'asc' };
                if (prev.key === 'created_at' && prev.direction === 'asc') return { key: 'reference_id', direction: 'desc' };
                if (prev.key === 'reference_id' && prev.direction === 'desc') return { key: 'reference_id', direction: 'asc' };
                return { key: 'created_at', direction: 'desc' };
            }
            if (column === 'detalles') {
                if (prev.key === 'created_at' && prev.direction === 'desc') return { key: 'created_at', direction: 'asc' };
                return { key: 'created_at', direction: 'desc' };
            }
            if (prev.key === column) {
                return { key: column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            // default direction
            return { key: column, direction: column === 'price' ? 'asc' : 'desc' };
        });
        setPage(0);
    };

    const SortIcon = ({ column }: { column: string }) => {
        return null;
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) return;

        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (error) throw error;
            fetchProperties();
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Error al eliminar la propiedad");
        }
    };

    const toggleFeatured = async (property: any) => {
        try {
            const currentFeatures = property.features || {};
            const isCurrentlyFeatured = currentFeatures.is_featured === true || property.is_featured === true;

            const updatedFeatures = {
                ...currentFeatures,
                is_featured: !isCurrentlyFeatured
            };

            const { error } = await supabase
                .from('properties')
                .update({
                    features: updatedFeatures,
                    is_featured: !isCurrentlyFeatured
                })
                .eq('id', property.id);

            if (error) throw error;

            // Render locally optimistically
            setProperties(prev => prev.map(p =>
                p.id === property.id ? { ...p, features: updatedFeatures, is_featured: !isCurrentlyFeatured } : p
            ));

        } catch (error) {
            console.error("Error toggling featured:", error);
            alert("Error al cambiar el estado de destacada");
        }
    };

    const getContractStatus = (property: any) => {
        if (!property.contract_signature_date) {
            return { color: 'bg-red-100 text-red-700', label: 'SIN CONTRATO', icon: <AlertTriangle size={14} /> };
        }

        const isManual = property.is_manual_contract || !property.owner_signature;

        const signedAt = new Date(property.contract_signature_date);
        const durationMonths = property.contract_duration_months || 6;
        const expiryDate = new Date(signedAt);
        expiryDate.setMonth(signedAt.getMonth() + durationMonths);

        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return { color: 'bg-red-100 text-red-700', label: 'CADUCADO', icon: <AlertTriangle size={14} /> };
        } else if (diffDays <= 30) {
            return { color: 'bg-orange-100 text-orange-700 font-bold animate-pulse', label: `EXPIRA EN ${diffDays}D`, icon: <CalendarClock size={14} /> };
        } else {
            return { color: 'bg-green-100 text-green-700', label: 'AL DÍA', icon: <CheckCircle2 size={14} /> };
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Gestión de Propiedades</h1>
                <Link
                    href="/admin/propiedades/nueva"
                    className="bg-[hsl(323,84%,29%)] hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                >
                    <Plus size={20} />
                    Nueva Propiedad
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Buscar por título, dirección o referencia..."
                            value={activeFilters.search}
                            onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(323,84%,29%)]"
                        />
                    </div>

                    <select
                        name="operation"
                        value={activeFilters.operation}
                        onChange={handleFilterChange}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(323,84%,29%)]"
                    >
                        <option value="">Cualquier Operación</option>
                        <option value="venta">Venta</option>
                        <option value="alquiler">Alquiler</option>
                    </select>

                    <select
                        name="type"
                        value={activeFilters.type}
                        onChange={handleFilterChange}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(323,84%,29%)]"
                    >
                        <option value="">Cualquier Tipo</option>
                        <optgroup label="Apartamentos">
                            <option value="apartamento">Apartamento</option>
                            <option value="atico">Ático</option>
                            <option value="duplex">Dúplex</option>
                            <option value="estudio">Estudio</option>
                            <option value="loft">Loft</option>
                        </optgroup>
                        <optgroup label="Casas">
                            <option value="casa">Casa / Villa</option>
                            <option value="adosado">Adosado</option>
                            <option value="pareado">Pareado</option>
                            <option value="chalet">Chalet</option>
                            <option value="casa_rural">Casa Rural</option>
                        </optgroup>
                        <optgroup label="Otros">
                            <option value="local">Local Comercial</option>
                            <option value="oficina">Oficina</option>
                            <option value="terreno">Terreno</option>
                            <option value="edificio">Edificio</option>
                            <option value="garaje">Garaje</option>
                            <option value="trastero">Trastero</option>
                        </optgroup>
                    </select>

                    <select
                        name="status"
                        value={activeFilters.status}
                        onChange={handleFilterChange}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(323,84%,29%)]"
                    >
                        <option value="">Cualquier Estado</option>
                        <option value="disponible">Disponible</option>
                        <option value="reservado">Reservado</option>
                        <option value="vendido">Vendido</option>
                        <option value="alquilado">Alquilado</option>
                    </select>

                    {(activeFilters.search || activeFilters.operation || activeFilters.type || activeFilters.status) && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-slate-500 hover:text-red-500 text-sm font-medium px-2"
                        >
                            <X className="h-4 w-4" /> Limpiar
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center items-center text-slate-400">
                        <Loader2 className="animate-spin h-8 w-8" />
                    </div>
                ) : properties.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        {Object.values(activeFilters).some(Boolean)
                            ? "No hay propiedades que coincidan con los filtros."
                            : "No hay propiedades registradas aún."
                        }
                    </div>
                ) : (
                    <>
                    {/* ═══ MOBILE/TABLET: Card View ═══ */}
                    <div className="lg:hidden bg-slate-50 p-4 space-y-4">
                        {properties.map((property) => {
                            const contractStatus = getContractStatus(property);
                            const isFeatured = property.features?.is_featured || property.is_featured;
                            
                            return (
                                <div key={property.id} className={`group bg-white rounded-3xl border ${isFeatured ? 'border-amber-200' : 'border-slate-200'} shadow-sm overflow-hidden transition-all active:scale-[0.98]`}>
                                    <div className="flex">
                                        {/* Left Side: Thumbnail with overlays */}
                                        <div className="w-1/3 aspect-[4/5] sm:aspect-square relative overflow-hidden bg-slate-100">
                                            {property.image || property.features?.image ? (
                                                <img src={property.image || property.features?.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase text-center p-2 leading-tight">Sin Foto</div>
                                            )}
                                            
                                            {/* Status Badge */}
                                            <div className="absolute top-2 left-2 z-10">
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase shadow-sm ${
                                                    property.status === 'disponible' ? 'bg-green-500 text-white' : 
                                                    property.status === 'reservado' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                                                }`}>
                                                    {property.status}
                                                </span>
                                            </div>

                                            {/* Operation Overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                                <span className={`text-[9px] font-black uppercase text-white tracking-widest px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-sm border border-white/30`}>
                                                    {property.operation_type}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Side: Info */}
                                        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                                            <div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-black text-slate-900 leading-tight truncate mb-1" title={property.title}>
                                                        {property.title}
                                                    </p>
                                                    <button 
                                                        onClick={(e) => { e.preventDefault(); toggleFeatured(property); }}
                                                        className={`p-1 -mt-1 ${isFeatured ? 'text-amber-500' : 'text-slate-300'}`}
                                                    >
                                                        <Star size={18} fill={isFeatured ? "currentColor" : "none"} />
                                                    </button>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 mb-2 font-mono text-[10px] font-bold">
                                                    <span className="text-slate-400">REF: {property.reference_id || property.id.split('-')[0]}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className={`${property.is_published !== false ? 'text-green-600' : 'text-slate-400'}`}>
                                                        {property.is_published !== false ? 'PÚBLICO' : 'OCULTO'}
                                                    </span>
                                                </div>

                                                <p className="text-2xl font-black text-[#831832] tracking-tighter">
                                                    {Number(property.price || 0).toLocaleString('de-DE')} €
                                                </p>
                                            </div>

                                            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2.5 text-slate-500 font-bold text-[11px]">
                                                    <span className="flex items-center gap-1"><BedDouble size={14} className="text-slate-400" /> {property.bedrooms || 0}</span>
                                                    <span className="flex items-center gap-1"><Bath size={14} className="text-slate-400" /> {property.bathrooms || 0}</span>
                                                </div>
                                                <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black flex items-center gap-1 border border-current/20 ${contractStatus.color}`}>
                                                    {contractStatus.icon} {contractStatus.label}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex border-t border-slate-100 bg-slate-50/50">
                                        <Link href={`/propiedades/${property.id}`} target="_blank" className="flex-1 py-1 px-4 border-r border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold hover:bg-slate-100 transition-colors uppercase py-3">
                                            <Eye size={15} /> Ver
                                        </Link>
                                        <Link href={`/admin/propiedades/redes/${property.id}`} className="flex-1 py-1 px-4 border-r border-slate-100 flex items-center justify-center gap-2 text-indigo-600 text-xs font-black hover:bg-slate-100 transition-colors uppercase py-3">
                                            <Share2 size={15} /> Redes
                                        </Link>
                                        <Link href={`/admin/propiedades/editar/${property.id}`} className="flex-1 py-1 px-4 border-r border-slate-100 flex items-center justify-center gap-2 text-[#831832] text-xs font-black hover:bg-slate-100 transition-colors uppercase py-3">
                                            <Pencil size={15} /> Editar
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(property.id)}
                                            disabled={currentUserRole === 'anon' || currentUserRole === null}
                                            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-xs font-bold transition-colors uppercase
                                                ${(currentUserRole !== 'anon' && currentUserRole !== null) ? 'text-red-500 hover:bg-red-50' : 'text-slate-300 opacity-50 cursor-not-allowed'}
                                            `}
                                            title={(currentUserRole !== 'anon' && currentUserRole !== null) ? "Eliminar" : "Solo usuarios registrados pueden eliminar"}
                                        >
                                            <Trash2 size={15} /> Borrar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ═══ DESKTOP: Table View ═══ */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 select-none">
                                <tr>
                                    <th className="px-3 py-4 font-semibold text-slate-700 w-[20%] max-w-[200px] cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('propiedad')}>
                                        Propiedad / Ref. <SortIcon column="propiedad" />
                                    </th>
                                    <th className="px-3 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('operation_type')}>
                                        Operación <SortIcon column="operation_type" />
                                    </th>
                                    <th className="px-3 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('price')}>
                                        Precio <SortIcon column="price" />
                                    </th>
                                    <th className="px-3 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('detalles')}>
                                        Detalles <SortIcon column="detalles" />
                                    </th>
                                    <th className="px-3 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('status')}>
                                        Estado <SortIcon column="status" />
                                    </th>
                                    <th className="px-3 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('contract_signature_date')}>
                                        Contrato 🚦 <SortIcon column="contract_signature_date" />
                                    </th>
                                    <th className="px-3 py-4 font-semibold text-slate-700 text-right cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('is_featured')}>
                                        Acciones <SortIcon column="is_featured" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {properties.map((property) => (
                                    <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-100">
                                                    {property.image || property.features?.image ? (
                                                        <img src={property.image || property.features?.image} alt="Thumbnail" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-[9px] text-center p-1">Sin Foto</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-900 truncate max-w-[120px] md:max-w-[180px] text-sm" title={property.title}>{property.title}</p>
                                                        <span className="text-[9px] text-slate-400 bg-slate-50 border border-slate-100 px-1 rounded uppercase font-medium shrink-0">
                                                            {property.property_type?.replace('_', ' ') || 'OTRO'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono uppercase">
                                                            REF: {property.reference_id || property.id.split('-')[0]}
                                                        </span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${property.is_published !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                            {property.is_published !== false ? 'PÚBLICO' : 'OCULTO'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <span className={`text-[10px] font-bold uppercase transition-colors px-2 py-1 rounded ${property.operation_type === 'venta' ? 'text-blue-700 bg-blue-50' : 'text-purple-700 bg-purple-50'}`}>
                                                {property.operation_type}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 font-bold text-slate-700 text-sm whitespace-nowrap">
                                            {Number(property.price || 0).toLocaleString('de-DE')} €
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-slate-700 font-medium text-xs">
                                                    <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded" title="Dormitorios">
                                                        <BedDouble size={14} className="text-slate-500" />
                                                        {property.bedrooms || property.features?.bedrooms || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded" title="Baños">
                                                        <Bath size={14} className="text-slate-500" />
                                                        {property.bathrooms || property.features?.bathrooms || 0}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    {new Date(property.created_at).toLocaleDateString("es-ES")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${property.status === 'disponible' ? 'bg-green-100 text-green-700' : property.status === 'reservado' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4">
                                            {(() => {
                                                const status = getContractStatus(property);
                                                return (
                                                    <div className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 w-fit border border-current/20 ${status.color}`}>
                                                        {status.icon}
                                                        <span className="whitespace-nowrap">{status.label}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-3 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => toggleFeatured(property)}
                                                    className={`p-2 rounded-lg transition-colors ${property.features?.is_featured || property.is_featured ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50'}`}
                                                    title={property.features?.is_featured || property.is_featured ? "Quitar de Destacadas (Portada)" : "Añadir de Destacadas (Portada)"}
                                                >
                                                    <Star size={18} fill={property.features?.is_featured || property.is_featured ? "currentColor" : "none"} />
                                                </button>
                                                <Link href={`/propiedades/${property.id}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Pública">
                                                    <Eye size={18} />
                                                </Link>
                                                <Link href={`/admin/propiedades/redes/${property.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Post Redes Sociales">
                                                    <Share2 size={18} />
                                                </Link>
                                                <Link href={`/admin/propiedades/editar/${property.id}`} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar">
                                                    <Pencil size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(property.id)}
                                                    disabled={currentUserRole === 'anon' || currentUserRole === null}
                                                    className={`p-2 rounded-lg transition-colors
                                                        ${(currentUserRole !== 'anon' && currentUserRole !== null) ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-200 opacity-50 cursor-not-allowed'}
                                                    `}
                                                    title={(currentUserRole !== 'anon' && currentUserRole !== null) ? "Eliminar" : "Solo usuarios registrados pueden eliminar"}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <span>
                        Mostrando <span className="font-semibold text-slate-900">{Math.min((page + 1) * pageSize, total)}</span> de <span className="font-semibold text-slate-900">{total}</span> propiedades
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => {
                                setPage(p => p - 1);
                                window.scrollTo(0, 0);
                            }}
                            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() => {
                                setPage(p => p + 1);
                                window.scrollTo(0, 0);
                            }}
                            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
