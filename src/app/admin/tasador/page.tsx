'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
    ClipboardList, Search, Eye, Edit, Clock, 
    CheckCircle2, PhoneCall, XCircle, ArrowUpDown, 
    Mail, Phone, MapPin, Home, TrendingUp, Filter,
    Building2, Ruler, Calendar
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Stat Card Component
function StatCard({ title, value, icon, color, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-500">{title}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
}

export default function AdminTasadorPage() {
    const [valuations, setValuations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchValuations();
    }, []);

    const fetchValuations = async () => {
        setLoading(true);
        // We fetch from 'interesados' where origin is 'web_tasacion'
        const { data, error } = await supabase
            .from('interesados')
            .select('*')
            .eq('origen', 'web_tasacion')
            .order('created_at', { ascending: false });
        
        if (error) console.error('Error:', error);
        else setValuations(data || []);
        setLoading(false);
    };

    const filtered = valuations.filter(v => {
        const matchesSearch = 
            v.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.propiedad_interes?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || v.estado === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: valuations.length,
        new: valuations.filter(v => v.estado === 'Nuevo' || !v.estado).length,
        contacted: valuations.filter(v => v.estado === 'Contactado').length,
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shadow-inner">
                        <ClipboardList size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">SOLICITUDES DE TASACIÓN</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Panel de Valoraciones</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/tasacion" target="_blank" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border border-slate-200">
                        <Eye size={16} />
                        VER FORMULARIO PÚBLICO
                    </Link>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Solicitudes" 
                    value={stats.total} 
                    icon={<ClipboardList size={20} />} 
                    color="text-slate-700" 
                    bg="bg-slate-100" 
                />
                <StatCard 
                    title="Pendientes (Nuevas)" 
                    value={stats.new} 
                    icon={<Clock size={20} />} 
                    color="text-red-700" 
                    bg="bg-red-50" 
                />
                <StatCard 
                    title="En Gestión" 
                    value={stats.contacted} 
                    icon={<PhoneCall size={20} />} 
                    color="text-blue-700" 
                    bg="bg-blue-50" 
                />
            </div>

            {/* Filters & Content */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                {/* Control Bar */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar por cliente o ubicación..." 
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter size={16} className="text-slate-400 mr-1" />
                        <select 
                            className="flex-1 md:min-w-[180px] px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm text-slate-600 appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            <option value="Nuevo">🔴 Nuevos</option>
                            <option value="Contactado">🔵 Contactados</option>
                            <option value="Cerrado">🟢 Cerrados</option>
                        </select>
                    </div>
                </div>

                {/* Grid View */}
                <div className="p-6">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="h-12 w-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="font-bold text-sm uppercase tracking-tighter">Cargando tasaciones...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="h-20 w-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto">
                                <Search size={32} className="text-slate-200" />
                            </div>
                            <div>
                                <h3 className="text-slate-900 font-black text-lg">No se encontraron solicitudes</h3>
                                <p className="text-slate-500 text-sm">Parece que aún no tienes solicitudes de tasación registradas.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {filtered.map((item) => (
                                <div key={item.id} className="group bg-white border border-slate-200 hover:border-blue-500/30 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-blue-500/5 relative overflow-hidden">
                                    {/* Urgency Highlight */}
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent pointer-events-none"></div>

                                    <div className="flex flex-col gap-5">
                                        {/* Status & Date */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                    item.estado === 'Cerrado' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    item.estado === 'Contactado' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-red-50 text-red-700 border-red-200 animate-pulse'
                                                }`}>
                                                    {item.estado || 'Nuevo'}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-300 uppercase leading-none">ID: {item.codigo}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Calendar size={12} />
                                                <span className="text-[10px] font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.nombre_completo}</h4>
                                            <div className="flex items-center gap-4 mt-2">
                                                <a href={`mailto:${item.email}`} className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1.5 font-medium">
                                                    <Mail size={14} className="text-slate-300" /> {item.email}
                                                </a>
                                                <a href={`tel:${item.telefono}`} className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1.5 font-medium">
                                                    <Phone size={14} className="text-slate-300" /> {item.telefono}
                                                </a>
                                            </div>
                                        </div>

                                        {/* Property Info Highlight */}
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
                                            <div className="flex items-start gap-3">
                                                <MapPin size={18} className="text-blue-500 mt-0.5 shrink-0" />
                                                <p className="text-sm text-slate-700 font-bold leading-tight">{item.propiedad_interes}</p>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                                    <Building2 size={12} /> {item.tipo_interes || 'Indefinido'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                                    <Ruler size={12} /> {item.habitaciones || '-'} HAB
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                                    <TrendingUp size={12} /> {item.estado_inmueble || 'Ver'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                            <Link href={`/admin/interesados/${item.id}`} className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase text-center hover:bg-slate-800 transition-all tracking-widest shadow-lg shadow-slate-200">
                                                VER DETALLES COMPLETOS
                                            </Link>
                                            <Link href={`/admin/interesados/editar/${item.id}`} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-blue-600 hover:border-blue-200 transition-all">
                                                <Edit size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

