import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Edit, FileText, Calendar, Building, Euro, BedDouble, Info, Clock, ExternalLink, MessageSquare, Globe, User, Home, ClipboardList, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MatchingProperties from "@/components/leads/MatchingProperties";
import DeleteLeadButton from "@/components/admin/DeleteLeadButton";

export const dynamic = 'force-dynamic';

export default async function DetalleInteresadoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: lead, error: leadError } = await supabase
        .from('interesados')
        .select('*')
        .eq('id', id)
        .single();

    if (leadError || !lead) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold text-slate-800">Interesado no encontrado</h2>
                <Link href="/admin/interesados" className="text-emerald-600 hover:underline mt-4 inline-block">
                    Volver a la base de interesados
                </Link>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const originConfig: Record<string, any> = {
        chatbot: { icon: <MessageSquare size={14} />, label: 'Chatbot IA', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        web_propiedad: { icon: <Home size={14} />, label: 'Propiedad', color: 'bg-purple-100 text-purple-700 border-purple-200' },
        web_tasacion: { icon: <ClipboardList size={14} />, label: 'Tasación', color: 'bg-amber-100 text-amber-700 border-amber-200' },
        web_contacto: { icon: <MessageCircle size={14} />, label: 'Contacto', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        manual: { icon: <User size={14} />, label: 'Manual', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    };

    const statusConfig: Record<string, any> = {
        'Nuevo': 'bg-red-500 text-white border-red-600 shadow-red-200',
        'Contactado': 'bg-blue-500 text-white border-blue-600 shadow-blue-200',
        'En seguimiento': 'bg-amber-500 text-white border-amber-600 shadow-amber-200',
        'Cerrado': 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200',
        'Baja': 'bg-slate-500 text-white border-slate-600 shadow-slate-200',
    };

    const origin = originConfig[lead.origen] || originConfig.manual;
    const statusClass = statusConfig[lead.estado] || statusConfig.Nuevo;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Link href="/admin/interesados" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
                    <ArrowLeft size={18} />
                    Volver al listado
                </Link>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/interesados/editar/${lead.id}`}
                        className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 border border-slate-200 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Edit size={16} />
                        Editar Ficha
                    </Link>
                    <DeleteLeadButton id={lead.id} name={lead.nombre_completo} />
                </div>
            </div>

            {/* Main Header Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl font-black text-[#831832] shadow-inner shrink-0">
                            {lead.nombre_completo.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{lead.nombre_completo}</h1>
                                <span className={`px-3 py-0.5 text-xs font-black rounded-full border shadow-sm ${statusClass}`}>
                                    {lead.estado.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                                <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> Registrado: {formatDate(lead.created_at)}</span>
                                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border leading-tight ${origin.color}`}>
                                    {origin.icon} {origin.label}
                                </span>
                                {lead.urgencia && (
                                    <span className={`px-2 py-0.5 rounded-lg border font-bold text-[10px] uppercase ${lead.urgencia === 'Alta' ? 'bg-red-50 text-red-600 border-red-100' : lead.urgencia === 'Media' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                        {lead.urgencia === 'Alta' ? '🔥' : lead.urgencia === 'Media' ? '⚡' : '💤'} {lead.urgencia}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Contact Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Información de Contacto</h3>
                        <div className="space-y-6">
                            <div className="group">
                                <p className="text-[11px] font-black text-[#831832] uppercase mb-1">Teléfonos</p>
                                <div className="space-y-2">
                                    {lead.telefonos && lead.telefonos.length > 0 ? (
                                        lead.telefonos.map((t: string, i: number) => (
                                            <a key={i} href={`tel:${t}`} className="flex items-center justify-between font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                                {t} <Phone size={14} className="text-slate-300" />
                                            </a>
                                        ))
                                    ) : (
                                        <p className="font-bold text-slate-400 italic">No registrado</p>
                                    )}
                                </div>
                            </div>
                            <div className="group">
                                <p className="text-[11px] font-black text-[#831832] uppercase mb-1">Emails</p>
                                <div className="space-y-2">
                                    {lead.emails && lead.emails.length > 0 ? (
                                        lead.emails.map((e: string, i: number) => (
                                            <a key={i} href={`mailto:${e}`} className="flex items-center justify-between font-bold text-slate-800 hover:text-blue-600 transition-colors break-all">
                                                {e} <Mail size={14} className="text-slate-300" />
                                            </a>
                                        ))
                                    ) : (
                                        <p className="font-bold text-slate-400 italic">No registrado</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes - Only visible here */}
                    <div className="bg-slate-900 text-white rounded-3xl shadow-xl p-8 border border-white/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileText size={80} />
                        </div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Notas Internas</h3>
                        <div className="relative z-10">
                            {lead.notas_internas ? (
                                <p className="text-slate-300 text-sm italic leading-relaxed whitespace-pre-wrap">
                                    "{lead.notas_internas}"
                                </p>
                            ) : (
                                <p className="text-slate-500 text-sm italic">Sin notas del equipo aún.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Requirements & Matching */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <Building className="text-indigo-600" size={18} />
                                CRITERIOS DE BÚSQUEDA
                            </h2>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Presupuesto Máx.</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-slate-900">
                                            {lead.presupuesto_maximo ? Number(lead.presupuesto_maximo).toLocaleString('de-DE') : '—'}
                                        </span>
                                        <span className="text-sm font-bold text-slate-500">€</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Habitaciones Min.</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-slate-900">
                                            {lead.dormitorios_minimo || '—'}
                                        </span>
                                        <BedDouble size={16} className="text-slate-400" />
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Tipo de Operación</p>
                                    <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                                        {lead.tipo_operacion === 'venta' ? 'Compra' : lead.tipo_operacion}
                                    </span>
                                </div>
                            </div>

                            {/* Zonas */}
                            <div className="mt-8">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                                    <MapPin size={14} /> Localizaciones de Interés
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {lead.preferencias_zonas && lead.preferencias_zonas.length > 0 ? (
                                        lead.preferencias_zonas.map((zona: string, i: number) => (
                                            <span key={i} className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-xl border border-indigo-100">
                                                {zona.toUpperCase()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 italic text-sm">Cualquier zona</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Observations */}
                    {lead.observaciones && (
                        <div className="bg-amber-50 rounded-3xl border border-amber-200 p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <MessageSquare size={60} className="text-amber-800" />
                            </div>
                            <h3 className="flex items-center gap-2 font-black text-amber-800 text-xs uppercase tracking-widest mb-4">
                                MENSAJE / OBSERVACIONES DEL CLIENTE
                            </h3>
                            <p className="text-amber-900 text-sm leading-relaxed relative z-10 italic">
                                "{lead.observaciones}"
                            </p>
                        </div>
                    )}

                    {/* Matching Properties Component */}
                    <MatchingProperties lead={lead} />
                </div>
            </div>
        </div>
    );
}
