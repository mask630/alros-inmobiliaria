'use client';

import Link from "next/link";
import { Search, Mail, Phone, Eye, Edit, Bot, Home, ClipboardList, MessageCircle, UserPlus, Clock, CheckCircle2, PhoneCall, XCircle, ArrowUpDown, ChevronDown, FileText, Download, Trash2, Filter, Calendar, BarChart3, ChevronLeft, ChevronRight, CheckSquare, Square } from "lucide-react";
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
    const [dateFilter, setDateFilter] = useState('todos'); // 'todos', 'hoy', 'semana', 'mes'
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    // New state for pagination and bulk actions
    const [pageSize] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchLeads();
    }, [currentPage, statusFilter, originFilter, dateFilter, sortConfig]);

    // Independent effect for counts to keep them updated
    useEffect(() => {
        fetchSummaryStats();
    }, []);

    const fetchSummaryStats = async () => {
        const { data, error } = await supabase.from('interesados').select('estado');
        if (!error && data) {
            const counts = data.reduce((acc: Record<string, number>, lead) => {
                const estado = lead.estado || 'Nuevo';
                acc[estado] = (acc[estado] || 0) + 1;
                return acc;
            }, {});
            setStatusCounts(counts);
        }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('interesados')
                .select('*, updated_by_profile:profiles!interesados_updated_by_fkey(first_name, last_name)', { count: 'exact' });

            // Apply Filters
            if (statusFilter) query = query.eq('estado', statusFilter);
            if (originFilter) query = query.eq('origen', originFilter);

            if (dateFilter !== 'todos') {
                const now = new Date();
                let startDate = new Date();
                if (dateFilter === 'hoy') startDate.setHours(0, 0, 0, 0);
                else if (dateFilter === 'semana') startDate.setDate(now.getDate() - 7);
                else if (dateFilter === 'mes') startDate.setMonth(now.getMonth() - 1);
                query = query.gte('created_at', startDate.toISOString());
            }

            if (searchTerm) {
                // Supabase doesn't easily support multi-column OR search in a simple way with pagination efficiently
                // So we'll use a text search if available or filter on name/email/phone
                query = query.or(`nombre_completo.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telefono.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);
            }

            // Apply Sort
            query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

            // Apply Pagination
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;
            setLeads(data || []);
            setTotalCount(count || 0);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateLeadStatus = async (leadId: string, newStatus: string) => {
        setUpdatingStatus(leadId);
        const { error } = await supabase
            .from('interesados')
            .update({ estado: newStatus })
            .eq('id', leadId);
        
        if (!error) {
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado: newStatus } : l));
            fetchSummaryStats(); // Update totals
        }
        setUpdatingStatus(null);
    };

    const handleBulkStatusUpdate = async (newStatus: string) => {
        if (selectedIds.length === 0) return;
        setLoading(true);
        const { error } = await supabase
            .from('interesados')
            .update({ estado: newStatus })
            .in('id', selectedIds);
        
        if (!error) {
            fetchLeads();
            fetchSummaryStats();
            setSelectedIds([]);
        }
        setLoading(false);
    };

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            // Fetch ALL filtered leads for export
            let query = supabase.from('interesados').select('nombre_completo, email, telefono, origen, estado, created_at, urgencia, propiedad_interes');
            if (statusFilter) query = query.eq('estado', statusFilter);
            if (originFilter) query = query.eq('origen', originFilter);
            if (dateFilter !== 'todos') {
                const startDate = new Date();
                if (dateFilter === 'hoy') startDate.setHours(0, 0, 0, 0);
                else if (dateFilter === 'semana') startDate.setDate(new Date().getDate() - 7);
                else if (dateFilter === 'mes') startDate.setMonth(new Date().getMonth() - 1);
                query = query.gte('created_at', startDate.toISOString());
            }
            
            const { data, error } = await query;
            if (error) throw error;

            const headers = ['Nombre;Email;Telefono;Origen;Estado;Fecha;Urgencia;Propiedad'];
            const csvRows = data.map(l => [
                l.nombre_completo, l.email, l.telefono, l.origen, l.estado, 
                new Date(l.created_at).toLocaleDateString(), l.urgencia, l.propiedad_interes
            ].map(v => v ? `"${v.toString().replace(/"/g, '""')}"` : '""').join(';'));

            const csvContent = "\uFEFF" + headers.concat(csvRows).join('\n'); // Add BOM for Excel
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `leads_alros_${new Date().toISOString().split('T')[0]}.csv`);
            link.click();
        } catch (error) {
            console.error('Error exporting CSV:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === leads.length) setSelectedIds([]);
        else setSelectedIds(leads.map(l => l.id));
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const newLeadsCount = statusCounts['Nuevo'] || 0;

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig.key !== column) return <span className="text-slate-300 ml-1 font-normal opacity-30">↕</span>;
        return <span className="text-blue-600 ml-1 font-bold">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    const stats = [
        { label: 'Totales', value: totalCount, icon: <UserPlus className="text-blue-600" />, bg: 'bg-blue-50' },
        { label: 'Nuevos', value: statusCounts['Nuevo'] || 0, icon: <Clock className="text-red-500" />, bg: 'bg-red-50' },
        { label: 'En seguimiento', value: statusCounts['En seguimiento'] || 0, icon: <ArrowUpDown className="text-amber-500" />, bg: 'bg-amber-50' },
        { label: 'Cerrados', value: statusCounts['Cerrado'] || 0, icon: <CheckCircle2 className="text-emerald-500" />, bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leads & Demandas</h1>
                    <p className="text-slate-500 text-sm font-medium">Gestión integral de interesados y prospectos</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                        {isExporting ? <Clock size={18} className="animate-spin" /> : <Download size={18} />}
                        <span>Exportar</span>
                    </button>
                    <Link href="/admin/interesados/nuevo" className="flex-1 md:flex-none bg-[#831832] hover:bg-slate-900 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#831832]/20">
                        <UserPlus size={18} />
                        <span>Nuevo Lead</span>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className={`p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 bg-white`}>
                        <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 leading-none mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
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

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="sticky top-20 z-[45] bg-slate-900 text-white p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3 ml-2">
                        <div className="bg-white/20 h-8 w-8 rounded-lg flex items-center justify-center text-white">
                            <CheckSquare size={16} />
                        </div>
                        <span className="font-bold">{selectedIds.length} seleccionados</span>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex gap-1 flex-1 md:flex-initial">
                            <button 
                                onClick={() => handleBulkStatusUpdate('Contactado')}
                                className="flex-1 md:flex-none px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all border border-white/10"
                            >
                                Contactado
                            </button>
                            <button 
                                onClick={() => handleBulkStatusUpdate('En seguimiento')}
                                className="flex-1 md:flex-none px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all border border-white/10"
                            >
                                Seguimiento
                            </button>
                            <button 
                                onClick={() => handleBulkStatusUpdate('Baja')}
                                className="flex-1 md:flex-none px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-xs font-bold transition-all"
                            >
                                Dar de Baja
                            </button>
                        </div>
                        <button 
                            onClick={() => setSelectedIds([])}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-white/60"
                        >
                            <XCircle size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400 group-focus-within:text-[#831832] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, teléfono o código..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#831832]/10 focus:border-[#831832] transition-all"
                    />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:flex gap-2">
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-3.5 text-slate-400" />
                        <select
                            value={originFilter}
                            onChange={(e) => {
                                setOriginFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#831832]/10 appearance-none font-bold text-slate-700 text-sm cursor-pointer"
                        >
                            <option value="">Todos los Orígenes</option>
                            <option value="chatbot">Chatbot IA</option>
                            <option value="web_propiedad">Propiedad</option>
                            <option value="web_tasacion">Tasación</option>
                            <option value="web_contacto">Contacto Web</option>
                            <option value="manual">Manual</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-3.5 text-slate-400" />
                        <select
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#831832]/10 appearance-none font-bold text-slate-700 text-sm cursor-pointer"
                        >
                            <option value="todos">Toda la historia</option>
                            <option value="hoy">Hoy</option>
                            <option value="semana">Últimos 7 días</option>
                            <option value="mes">Último mes</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center text-slate-400"><UserPlus size={40} className="animate-pulse opacity-30" /></div>
                ) : leads.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-400">
                        <UserPlus size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No hay interesados que coincidan.</p>
                        <p className="text-sm mt-1">Prueba cambiando los filtros o la pestaña.</p>
                    </div>
                ) : (
                    <>
                    {/* ═══ MOBILE: Card View ═══ */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {leads.map((lead) => {
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
                                    <th className="px-5 py-4 w-10">
                                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-[#831832]">
                                            {selectedIds.length === leads.length && leads.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </th>
                                    <th className="px-5 py-4 font-bold text-slate-800 tracking-tight text-xs uppercase cursor-pointer hover:bg-slate-100" onClick={() => handleSort('nombre_completo')}>
                                        Nombre <SortIcon column="nombre_completo" />
                                    </th>
                                    <th className="px-5 py-4 font-bold text-slate-800 tracking-tight text-xs uppercase cursor-pointer hover:bg-slate-100" onClick={() => handleSort('origen')}>
                                        Origen <SortIcon column="origen" />
                                    </th>
                                    <th className="px-5 py-4 font-bold text-slate-800 tracking-tight text-xs uppercase">Contacto</th>
                                    <th className="px-5 py-4 font-bold text-slate-800 tracking-tight text-xs uppercase cursor-pointer hover:bg-slate-100" onClick={() => handleSort('estado')}>
                                        Estado <SortIcon column="estado" />
                                    </th>
                                    <th className="px-5 py-4 font-bold text-slate-800 tracking-tight text-xs uppercase cursor-pointer hover:bg-slate-100" onClick={() => handleSort('created_at')}>
                                        Fecha <SortIcon column="created_at" />
                                    </th>
                                    <th className="px-5 py-4 font-bold text-slate-800 tracking-tight text-xs uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leads.map((lead) => {
                                    const origin = ORIGIN_CONFIG[lead.origen] || ORIGIN_CONFIG.manual;
                                    const status = STATUS_CONFIG[lead.estado] || STATUS_CONFIG.Nuevo;
                                    const urgencyColors: Record<string, string> = {
                                        'Alta': 'text-red-600 bg-red-50 border-red-200',
                                        'Media': 'text-amber-600 bg-amber-50 border-amber-200',
                                        'Baja': 'text-slate-500 bg-slate-50 border-slate-200',
                                    };

                                    return (
                                        <tr key={lead.id} className={`hover:bg-slate-50 transition-colors ${lead.estado === 'Baja' ? 'opacity-50' : ''} ${lead.estado === 'Nuevo' ? 'bg-red-50/20' : ''}`}>
                                            <td className="px-5 py-4">
                                                <button onClick={() => toggleSelectOne(lead.id)} className={`${selectedIds.includes(lead.id) ? 'text-[#831832]' : 'text-slate-300'} hover:text-[#831832]`}>
                                                    {selectedIds.includes(lead.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                                </button>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${origin.bg} ${origin.color} border ${origin.border}`}>
                                                        {origin.icon}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-bold text-slate-900 block truncate leading-tight">{lead.nombre_completo}</span>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{lead.codigo || 'S/N'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${origin.bg} ${origin.color} ${origin.border}`}>
                                                    {origin.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-0.5 text-xs text-slate-500 font-medium">
                                                    {(lead.email || lead.emails?.[0]) && (
                                                        <div className="flex items-center gap-1.5 leading-none mb-1"><Mail size={12} className="text-slate-300" /> <span className="truncate max-w-[140px]">{lead.emails?.[0] || lead.email}</span></div>
                                                    )}
                                                    {(lead.telefono || lead.telefonos?.[0]) && (
                                                        <div className="flex items-center gap-1.5 leading-none"><Phone size={12} className="text-slate-300" /> {lead.telefonos?.[0] || lead.telefono}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="relative">
                                                    <select
                                                        value={lead.estado || 'Nuevo'}
                                                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                        disabled={updatingStatus === lead.id}
                                                        className={`appearance-none cursor-pointer px-3 py-1.5 pr-7 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all focus:outline-none focus:ring-4 focus:ring-slate-100 ${status.bg} ${status.color} ${status.border} ${updatingStatus === lead.id ? 'opacity-50' : ''}`}
                                                    >
                                                        <option value="Nuevo">Nuevo</option>
                                                        <option value="Contactado">Contactado</option>
                                                        <option value="En seguimiento">Seguimiento</option>
                                                        <option value="Cerrado">Cerrado</option>
                                                        <option value="Baja">Baja</option>
                                                    </select>
                                                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-900 leading-none">
                                                        {new Date(lead.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5 uppercase font-medium">
                                                        {new Date(lead.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/admin/interesados/${lead.id}`} className="p-2 text-slate-400 hover:text-[#831832] hover:bg-slate-100 rounded-lg transition-all" title="Ver Detalle">
                                                        <Eye size={18} />
                                                    </Link>
                                                    <Link href={`/admin/interesados/editar/${lead.id}`} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-all" title="Editar">
                                                        <Edit size={18} />
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

            {/* Pagination */}
            {totalCount > pageSize && (
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                        Mostrando <span className="text-slate-900">{((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)}</span> de <span className="text-slate-900">{totalCount}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${
                                            currentPage === pageNum
                                                ? 'bg-[#831832] text-white shadow-lg shadow-[#831832]/20'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:border-[#831832]/30'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / pageSize), prev + 1))}
                            disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
