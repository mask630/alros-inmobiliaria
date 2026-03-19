'use client';

import Link from "next/link";
import { Search, Mail, Phone, Eye, Edit, Bot, Home, ClipboardList, MessageCircle, UserPlus, Clock, CheckCircle2, PhoneCall, XCircle, ArrowUpDown, ChevronDown, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

// Origin configuration
const ORIGIN_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string; border: string }> = {
    chatbot: { icon: <Bot size={14} />, label: 'Chatbot IA', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    web_propiedad: { icon: <Home size={14} />, label: 'Propiedad', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    web_tasacion: { icon: <ClipboardList size={14} />, label: 'Tasación', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    web_contacto: { icon: <MessageCircle size={14} />, label: 'Contacto', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    manual: { icon: <UserPlus size={14} />, label: 'Manual', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
};

// Status configuration
const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string; border: string; dotColor: string }> = {
    'Nuevo': { icon: <Clock size={14} />, label: 'Nuevo', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dotColor: 'bg-red-500' },
    'Contactado': { icon: <PhoneCall size={14} />, label: 'Contactado', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dotColor: 'bg-blue-500' },
    'En seguimiento': { icon: <ArrowUpDown size={14} />, label: 'Seguimiento', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dotColor: 'bg-amber-500' },
    'Cerrado': { icon: <CheckCircle2 size={14} />, label: 'Cerrado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
    'Baja': { icon: <XCircle size={14} />, label: 'Baja', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', dotColor: 'bg-slate-400' },
};

// Tab definitions
const STATUS_TABS = [
    { key: '', label: 'Todos', icon: null },
    { key: 'Nuevo', label: 'Nuevos', icon: <Clock size={16} /> },
    { key: 'Contactado', label: 'Contactados', icon: <PhoneCall size={16} /> },
    { key: 'En seguimiento', label: 'Seguimiento', icon: <ArrowUpDown size={16} /> },
    { key: 'Cerrado', label: 'Cerrados', icon: <CheckCircle2 size={16} /> },
    { key: 'Baja', label: 'Baja', icon: <XCircle size={16} /> },
];

export default function InteresadosPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [originFilter, setOriginFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('interesados')
            .select('*, updated_by_profile:profiles!interesados_updated_by_fkey(first_name, last_name)')
            .order('created_at', { ascending: false });
        if (error) console.error('Error fetching leads:', error);
        else setLeads(data || []);
        setLoading(false);
    };

    const updateLeadStatus = async (leadId: string, newStatus: string) => {
        setUpdatingStatus(leadId);
        const { error } = await supabase
            .from('interesados')
            .update({ estado: newStatus })
            .eq('id', leadId);
        
        if (!error) {
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado: newStatus } : l));
        }
        setUpdatingStatus(null);
    };

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    // Count by status
    const statusCounts = leads.reduce((acc: Record<string, number>, lead) => {
        const estado = lead.estado || 'Nuevo';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
    }, {});

    const filteredLeads = leads
        .filter(lead => {
            const matchesSearch =
                (lead.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.emails?.some((e: string) => e.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.telefonos?.some((t: string) => t.includes(searchTerm))) ||
                (lead.telefono || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.propiedad_interes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.codigo || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === '' || lead.estado === statusFilter;
            const matchesOrigin = originFilter === '' || lead.origen === originFilter;

            return matchesSearch && matchesStatus && matchesOrigin;
        })
        .sort((a, b) => {
            const aVal = a[sortConfig.key] || '';
            const bVal = b[sortConfig.key] || '';
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

    const newLeadsCount = statusCounts['Nuevo'] || 0;

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig.key !== column) return <span className="text-slate-300 ml-1 font-normal">↕</span>;
        return <span className="text-emerald-600 ml-1 font-bold">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Base de Interesados</h1>
                    <p className="text-slate-500">
                        {leads.length} contactos en total
                        {newLeadsCount > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200 animate-pulse">
                                <Clock size={12} /> {newLeadsCount} sin atender
                            </span>
                        )}
                    </p>
                </div>
                <Link href="/admin/interesados/nuevo" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <span className="font-bold text-lg leading-none">+</span>
                    <span>Nuevo Interesado</span>
                </Link>
            </div>

            {/* Status Tabs - Improved responsiveness */}
            <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide -mx-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {STATUS_TABS.map(tab => {
                        const count = tab.key === '' ? leads.length : (statusCounts[tab.key] || 0);
                        const isActive = statusFilter === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border shrink-0 ${
                                    isActive
                                        ? 'bg-[#831832] text-white border-[#831832] shadow-lg shadow-[#831832]/20 scale-[1.02]'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-black ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {/* Visual fade for overflow */}
                <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none md:hidden" />
            </div>

            {/* Search & Origin Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, teléfono o referencia..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <select
                    value={originFilter}
                    onChange={(e) => setOriginFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[180px]"
                >
                    <option value="">Todos los Orígenes</option>
                    <option value="chatbot">🤖 Chatbot IA</option>
                    <option value="web_propiedad">🏠 Ficha de Propiedad</option>
                    <option value="web_tasacion">📊 Tasación</option>
                    <option value="web_contacto">📧 Contacto Web</option>
                    <option value="manual">✏️ Manual</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center text-slate-400"><UserPlus size={40} className="animate-pulse opacity-30" /></div>
                ) : filteredLeads.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-400">
                        <UserPlus size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No hay interesados que coincidan.</p>
                        <p className="text-sm mt-1">Prueba cambiando los filtros o la pestaña.</p>
                    </div>
                ) : (
                    <>
                    {/* ═══ MOBILE: Card View ═══ */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {filteredLeads.map((lead) => {
                            const origin = ORIGIN_CONFIG[lead.origen] || ORIGIN_CONFIG.manual;
                            const status = STATUS_CONFIG[lead.estado] || STATUS_CONFIG.Nuevo;
                            const urgencyColors: Record<string, string> = {
                                'Alta': 'text-red-600 bg-red-50 border-red-200',
                                'Media': 'text-amber-600 bg-amber-50 border-amber-200',
                                'Baja': 'text-slate-500 bg-slate-50 border-slate-200',
                            };
                            return (
                                <div key={lead.id} className={`p-4 space-y-2.5 ${lead.estado === 'Baja' ? 'opacity-50' : ''} ${lead.estado === 'Nuevo' ? 'bg-red-50/30' : ''}`}>
                                    {/* Row 1: Origin + Name + Date */}
                                    <div className="flex items-start gap-3">
                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${origin.bg} ${origin.color} border ${origin.border}`}>
                                            {origin.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 text-sm truncate">{lead.nombre_completo}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${origin.bg} ${origin.color} ${origin.border}`}>
                                                    {origin.label}
                                                </span>
                                                {lead.urgencia && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${urgencyColors[lead.urgencia] || ''}`}>
                                                        {lead.urgencia === 'Alta' ? '🔥' : lead.urgencia === 'Media' ? '⚡' : '💤'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                                            {new Date(lead.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                                        </span>
                                    </div>
                                    {/* Row 2: Contact */}
                                    <div className="flex items-center gap-3 text-xs text-slate-500 pl-12">
                                        {(lead.email || (lead.emails && lead.emails.length > 0)) && (
                                            <span className="flex items-center gap-1 truncate"><Mail size={12} /> {lead.emails?.[0] || lead.email}</span>
                                        )}
                                        {(lead.telefono || (lead.telefonos && lead.telefonos.length > 0)) && (
                                            <span className="flex items-center gap-1"><Phone size={12} /> {lead.telefonos?.[0] || lead.telefono}</span>
                                        )}
                                    </div>
                                    {/* Row 3: Status + Actions */}
                                    <div className="flex items-center justify-between pl-12">
                                        <div className="relative">
                                            <select
                                                value={lead.estado || 'Nuevo'}
                                                onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                disabled={updatingStatus === lead.id}
                                                className={`appearance-none cursor-pointer px-2.5 py-1 pr-6 rounded-lg text-[11px] font-bold border transition-all focus:outline-none ${status.bg} ${status.color} ${status.border} ${updatingStatus === lead.id ? 'opacity-50' : ''}`}
                                            >
                                                <option value="Nuevo">🔴 Nuevo</option>
                                                <option value="Contactado">🔵 Contactado</option>
                                                <option value="En seguimiento">🟡 Seguimiento</option>
                                                <option value="Cerrado">🟢 Cerrado</option>
                                                <option value="Baja">⚪ Baja</option>
                                            </select>
                                            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Link href={`/admin/interesados/${lead.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg">
                                                <Eye size={16} />
                                            </Link>
                                            <Link href={`/admin/interesados/editar/${lead.id}`} className="p-1.5 text-emerald-500 rounded-lg">
                                                <Edit size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ═══ DESKTOP: Table View ═══ */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('nombre_completo')}>
                                        Nombre <SortIcon column="nombre_completo" />
                                    </th>
                                    <th className="px-5 py-4 font-semibold text-slate-700">Origen</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700">Contacto</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700">Info</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('estado')}>
                                        Estado <SortIcon column="estado" />
                                    </th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('created_at')}>
                                        Fecha <SortIcon column="created_at" />
                                    </th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeads.map((lead) => {
                                    const origin = ORIGIN_CONFIG[lead.origen] || ORIGIN_CONFIG.manual;
                                    const status = STATUS_CONFIG[lead.estado] || STATUS_CONFIG.Nuevo;
                                    const urgencyColors: Record<string, string> = {
                                        'Alta': 'text-red-600 bg-red-50 border-red-200',
                                        'Media': 'text-amber-600 bg-amber-50 border-amber-200',
                                        'Baja': 'text-slate-500 bg-slate-50 border-slate-200',
                                    };

                                    return (
                                        <tr key={lead.id} className={`hover:bg-slate-50 transition-colors ${lead.estado === 'Baja' ? 'opacity-50' : ''} ${lead.estado === 'Nuevo' ? 'bg-red-50/30' : ''}`}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${origin.bg} ${origin.color} border ${origin.border}`}>
                                                        {origin.icon}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-semibold text-slate-900 block truncate">{lead.nombre_completo}</span>
                                                        <span className="text-xs text-slate-400 font-mono">{lead.codigo}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${origin.bg} ${origin.color} ${origin.border}`}>
                                                    {origin.icon}
                                                    {origin.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1 text-sm text-slate-500">
                                                    {lead.emails && lead.emails.length > 0 ? (
                                                        <div className="flex items-center gap-1"><Mail size={13} /> <span className="truncate max-w-[150px]">{lead.emails[0]}</span></div>
                                                    ) : lead.email && (
                                                        <div className="flex items-center gap-1"><Mail size={13} /> <span className="truncate max-w-[150px]">{lead.email}</span></div>
                                                    )}
                                                    {lead.telefonos && lead.telefonos.length > 0 ? (
                                                        <div className="flex items-center gap-1"><Phone size={13} /> {lead.telefonos[0]}</div>
                                                    ) : lead.telefono && (
                                                        <div className="flex items-center gap-1"><Phone size={13} /> {lead.telefono}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {lead.propiedad_interes && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-mono text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded w-fit">
                                                            <Home size={11} /> {lead.propiedad_interes}
                                                        </span>
                                                    )}
                                                    {lead.urgencia && (
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border w-fit ${urgencyColors[lead.urgencia] || ''}`}>
                                                            {lead.urgencia === 'Alta' ? '🔥' : lead.urgencia === 'Media' ? '⚡' : '💤'} {lead.urgencia}
                                                        </span>
                                                    )}
                                                    {lead.tipo_operacion && lead.tipo_operacion !== 'consulta' && (
                                                        <span className="text-[10px] text-slate-500">{lead.tipo_operacion === 'alquiler' ? 'Busca Alquilar' : lead.tipo_operacion === 'venta' ? 'Busca Comprar' : lead.tipo_operacion === 'valoracion' ? 'Quiere Vender' : lead.tipo_operacion}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="relative group">
                                                    <select
                                                        value={lead.estado || 'Nuevo'}
                                                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                        disabled={updatingStatus === lead.id}
                                                        className={`appearance-none cursor-pointer px-3 py-1.5 pr-7 rounded-lg text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 ${status.bg} ${status.color} ${status.border} ${updatingStatus === lead.id ? 'opacity-50' : ''}`}
                                                    >
                                                        <option value="Nuevo">🔴 Nuevo</option>
                                                        <option value="Contactado">🔵 Contactado</option>
                                                        <option value="En seguimiento">🟡 Seguimiento</option>
                                                        <option value="Cerrado">🟢 Cerrado</option>
                                                        <option value="Baja">⚪ Baja</option>
                                                    </select>
                                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {new Date(lead.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(lead.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/interesados/${lead.id}`} className="whitespace-nowrap px-3 py-1.5 flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-lg text-slate-600 text-sm font-medium transition-colors" title="Ver Ficha Completa">
                                                        <Eye size={16} /> Ver
                                                    </Link>
                                                    <Link href={`/admin/interesados/editar/${lead.id}`} className="p-1.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 rounded-lg text-emerald-600 transition-colors" title="Modificar Datos">
                                                        <Edit size={16} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
}
