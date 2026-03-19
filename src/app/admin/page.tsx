import { 
    Building2, Users, FileText, TrendingUp, 
    ArrowRight, Loader2, History, Clock, 
    PlusCircle, Edit, Trash2, Key, LayoutDashboard,
    HeartHandshake, UserCircle, MessageSquare, Bell
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Force dynamic to get fresh counts
export const dynamic = 'force-dynamic';

async function getDashboardData() {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    // 1. Get properties counts
    const { count: activeCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'disponible');

    const { count: saleCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('operation_type', 'venta');

    const { count: rentCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('operation_type', 'alquiler');

    // 1.1 Get properties growth (vs last month)
    const { count: propsThisMonth } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayThisMonth);

    const { count: propsLastMonth } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayLastMonth)
        .lt('created_at', firstDayThisMonth);

    // 2. Get Owners count
    const { count: ownersCount } = await supabase
        .from('propietarios')
        .select('*', { count: 'exact', head: true });

    // 2.5 Get Interesados count
    const { count: leadsCount } = await supabase
        .from('interesados')
        .select('*', { count: 'exact', head: true });

    // 2.6 Get NEW leads count (unattended)
    const { count: newLeadsCount } = await supabase
        .from('interesados')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'Nuevo');

    // 2.7 Get leads growth
    const { count: leadsThisMonth } = await supabase
        .from('interesados')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayThisMonth);

    const { count: leadsLastMonth } = await supabase
        .from('interesados')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayLastMonth)
        .lt('created_at', firstDayThisMonth);

    // 2.8 Get recent leads
    const { data: recentLeads } = await supabase
        .from('interesados')
        .select('id, nombre_completo, email, telefono, origen, estado, urgencia, propiedad_interes, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    // 3. Get Recent Properties
    const { data: recentProperties } = await supabase
        .from('properties')
        .select('id, title, price, operation_type, status, reference_id')
        .order('created_at', { ascending: false })
        .limit(4);

    // 4. Get Activity Logs
    const { data: activityLogs } = await supabase
        .from('audit_logs')
        .select(`
            *,
            profiles:user_id (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(8);

    const calculateTrend = (current: number, last: number) => {
        if (!last || last === 0) return current > 0 ? `+${current} este mes` : "Sin cambios";
        const diff = current - last;
        return `${diff >= 0 ? '+' : ''}${diff} vs mes ant.`;
    };

    return {
        activeCount: activeCount || 0,
        saleCount: saleCount || 0,
        rentCount: rentCount || 0,
        ownersCount: ownersCount || 0,
        leadsCount: leadsCount || 0,
        newLeadsCount: newLeadsCount || 0,
        recentLeads: recentLeads || [],
        recentProperties: recentProperties || [],
        activityLogs: activityLogs || [],
        trends: {
            properties: calculateTrend(propsThisMonth || 0, propsLastMonth || 0),
            leads: calculateTrend(leadsThisMonth || 0, leadsLastMonth || 0)
        }
    };
}

export default async function AdminDashboard() {
    const data = await getDashboardData();
    
    // Calculate percentages for a mini-chart
    const totalOps = data.saleCount + data.rentCount || 1;
    const salePercent = Math.round((data.saleCount / totalOps) * 100);
    const rentPercent = Math.round((data.rentCount / totalOps) * 100);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 italic uppercase italic tracking-tighter">
                        <div className="p-2 bg-slate-900 rounded-2xl text-white shadow-2xl"><LayoutDashboard size={28} /></div>
                        RESUMEN <span className="text-[#831832]">OPERATIVO</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Gestión global de cartera y red de contactos Alros.</p>
                </div>
                <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2 shadow-sm">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    Vista en tiempo real
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                <StatCard
                    title="Propiedades Activas"
                    value={data.activeCount.toString()}
                    icon={<Building2 className="text-white" />}
                    trend={data.trends.properties}
                    color="blue"
                />
                <StatCard
                    title="En Venta"
                    value={data.saleCount.toString()}
                    icon={<TrendingUp className="text-white" />}
                    trend={`${salePercent}% del catálogo`}
                    color="emerald"
                />
                <StatCard
                    title="En Alquiler"
                    value={data.rentCount.toString()}
                    icon={<FileText className="text-white" />}
                    trend={`${rentPercent}% del catálogo`}
                    color="purple"
                />
                <StatCard
                    title="Propietarios"
                    value={data.ownersCount.toString()}
                    icon={<Users className="text-white" />}
                    trend="Base de contactos"
                    color="orange"
                />
                <StatCard
                    title="Interesados"
                    value={data.leadsCount.toString()}
                    icon={<HeartHandshake className="text-white" />}
                    trend={data.newLeadsCount > 0 ? `🔴 ${data.newLeadsCount} hoy` : data.trends.leads}
                    color="pink"
                />
            </div>

            {/* Quick Actions - Premium Style */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <LayoutDashboard size={200} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Acciones De Negocio</h2>
                        <p className="text-slate-400 text-sm mt-1 font-medium">Operaciones recomendadas para hoy.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 w-full lg:w-auto">
                        <Link href="/admin/propiedades/nueva" className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-blue-600 rounded-3xl transition-all border border-white/5 hover:border-blue-400 group">
                            <PlusCircle size={24} className="text-blue-400 group-hover:text-white" />
                            <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-white text-center">Nuevo Inmueble</span>
                        </Link>
                        <Link href="/admin/interesados/nuevo" className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-pink-600 rounded-3xl transition-all border border-white/5 hover:border-pink-400 group">
                            <Users size={24} className="text-pink-400 group-hover:text-white" />
                            <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-white text-center">Nuevo Lead</span>
                        </Link>
                        <Link href="/admin/propietarios/nuevo" className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-orange-600 rounded-3xl transition-all border border-white/5 hover:border-orange-400 group">
                            <UserCircle size={24} className="text-orange-400 group-hover:text-white" />
                            <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-white text-center">Propietario</span>
                        </Link>
                        <Link href="/admin/configuracion?tab=tasaciones" className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-emerald-600 rounded-3xl transition-all border border-white/5 hover:border-emerald-400 group">
                            <TrendingUp size={24} className="text-emerald-400 group-hover:text-white" />
                            <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-white text-center">Revisiones</span>
                        </Link>
                        <Link href="/admin/chatbot" className="hidden lg:flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-slate-700 rounded-3xl transition-all border border-white/5 hover:border-white/20 group">
                            <MessageSquare size={24} className="text-slate-400 group-hover:text-white" />
                            <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-white text-center">Entrenar IA</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Main Column: Activity & Recent */}
                <div className="md:col-span-2 lg:col-span-2 space-y-8">
                    
                    {/* Activity Feed */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-black flex items-center gap-3 text-slate-900 uppercase italic tracking-tight">
                                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200"><History size={20} /></div>
                                Registro de Actividad
                            </h3>
                            <Link href="/admin/configuracion?tab=actividad" className="text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-50">Auditoría Total</Link>
                        </div>
                        <div className="p-3">
                            {data.activityLogs.length > 0 ? (
                                <div className="space-y-1">
                                    {data.activityLogs.map((log: any) => (
                                        <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                                            <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110 shadow-sm ${
                                                log.action === 'created' ? 'bg-green-500 text-white shadow-green-100' :
                                                log.action === 'updated' ? 'bg-blue-500 text-white shadow-blue-100' :
                                                log.action === 'deleted' ? 'bg-red-500 text-white shadow-red-100' :
                                                'bg-slate-400 text-white'
                                            }`}>
                                                {log.action === 'created' ? <PlusCircle size={18} /> : 
                                                 log.action === 'updated' ? <Edit size={18} /> : 
                                                 log.action === 'deleted' ? <Trash2 size={18} /> : 
                                                 <Clock size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-slate-900 leading-tight">
                                                    <span className="font-black">
                                                        {(log.profiles as any)?.first_name || 'Alguien'} {(log.profiles as any)?.last_name || ''}
                                                    </span>
                                                    {' '}<span className="text-slate-500">{log.action === 'created' ? 'añadió' : log.action === 'updated' ? 'modificó' : 'eliminó'}</span>{' '}
                                                    <span className="text-[#831832] font-black uppercase text-[11px]">{log.entity_type === 'property' ? 'el inmueble' : log.entity_type === 'owner' ? 'el propietario' : 'el interesado'}</span>
                                                    <p className="font-bold text-slate-700 mt-0.5 truncate italic">"{log.entity_name}"</p>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                                                        <Clock size={12} className="text-slate-300" /> {new Date(log.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {log.details && (
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black border border-slate-200 uppercase">{log.details}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center text-slate-400">
                                    <History size={40} className="mx-auto mb-3 opacity-20" />
                                    <p className="font-bold text-sm">No hay actividad registrada aún.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Properties & Leads Grid on tablet */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {/* Recent Properties (Simplified) */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Últimos Inmuebles</h3>
                                <Link href="/admin/propiedades" className="text-blue-600 text-xs font-black hover:underline uppercase tracking-widest">
                                    Todo
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {data.recentProperties.map((prop: any) => (
                                    <div key={prop.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="font-black text-slate-900 truncate text-sm">{prop.title}</p>
                                            <p className="text-[11px] text-[#831832] font-black mt-0.5">
                                                {prop.reference_id} • {Number(prop.price).toLocaleString('es-ES')} €
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase border ${
                                                prop.status === 'disponible' ? 'bg-green-50 text-green-700 border-green-100' :
                                                prop.status === 'reservado' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {prop.status}
                                            </span>
                                            <Link href={`/admin/propiedades/editar/${prop.id}`} className="p-2 text-slate-400 hover:text-[#831832] transition-colors">
                                                <Edit size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Leads */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-2">
                                    Recientes
                                    {data.newLeadsCount > 0 && (
                                        <span className="flex items-center justify-center h-6 min-w-[24px] px-2 bg-red-600 text-white text-[10px] font-black rounded-lg animate-pulse shadow-lg shadow-red-200">
                                            {data.newLeadsCount}
                                        </span>
                                    )}
                                </h3>
                                <Link href="/admin/interesados" className="text-pink-600 text-xs font-black hover:underline uppercase tracking-widest">
                                    CRM
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {data.recentLeads.length > 0 ? data.recentLeads.map((lead: any) => {
                                    const originEmojis: Record<string, string> = {
                                        chatbot: '🤖',
                                        web_propiedad: '🏠',
                                        web_tasacion: '📊',
                                        web_contacto: '📧',
                                        manual: '✏️'
                                    };
                                    const statusColors: Record<string, string> = {
                                        'Nuevo': 'bg-red-500 text-white shadow-red-100 border-transparent',
                                        'Contactado': 'bg-blue-100 text-blue-700 border-blue-200',
                                        'En seguimiento': 'bg-amber-100 text-amber-700 border-amber-200',
                                        'Cerrado': 'bg-green-100 text-green-700 border-green-200',
                                        'Baja': 'bg-slate-100 text-slate-500 border-slate-200',
                                    };
                                    return (
                                        <Link key={lead.id} href={`/admin/interesados/editar/${lead.id}`} className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors ${lead.estado === 'Nuevo' ? 'bg-red-50/50' : ''}`}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="text-lg shrink-0 scale-110">{originEmojis[lead.origen] || '📋'}</span>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-900 truncate text-sm leading-tight">{lead.nombre_completo}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                                                        {new Date(lead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                        {lead.propiedad_interes && <span className="ml-2 text-[#831832]">• Ref: {lead.propiedad_interes}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase border shrink-0 shadow-sm ${statusColors[lead.estado] || statusColors.Nuevo}`}>
                                                {lead.estado || 'Nuevo'}
                                            </span>
                                        </Link>
                                    );
                                }) : (
                                    <div className="p-8 text-center text-slate-400 font-bold text-sm">No hay contactos aún.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column: Extra Insights */}
                <div className="space-y-8">
                    
                    {/* Market Insight (Visual Chart) */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                            <TrendingUp size={120} />
                        </div>
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">Cartera Alros</h3>
                                <p className="text-xl font-black text-slate-900 italic uppercase">Balance Activos</p>
                            </div>
                            <Link href="/admin/estadisticas" className="p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200">
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    
                        <div className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">En Venta</span>
                                    <span className="text-lg font-black font-mono leading-none tracking-tighter">{data.saleCount} <small className="text-[10px] opacity-40 ml-1">UID</small></span>
                                </div>
                                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)" style={{ width: `${salePercent}%` }} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black text-purple-600 uppercase tracking-widest">En Alquiler</span>
                                    <span className="text-lg font-black font-mono leading-none tracking-tighter">{data.rentCount} <small className="text-[10px] opacity-40 ml-1">UID</small></span>
                                </div>
                                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                                    <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-full rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)" style={{ width: `${rentPercent}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>Ratio de Mercado</span>
                                <span className="text-slate-900">{salePercent > rentPercent ? 'VENTA' : 'ALQUILER'} DOMINANTE</span>
                            </div>
                        </div>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="bg-gradient-to-br from-[#831832] to-[#4c0d1d] p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none italic font-black text-8xl leading-none -rotate-12 translate-x-4">ALROS</div>
                        
                        <div className="relative z-10">
                            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                                <Bell size={20} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase leading-tight mb-4 tracking-tight">Potencia tus ventas con la IA</h3>
                            <p className="text-white/70 text-sm font-medium leading-relaxed mb-8">
                                Nuestra IA ahora detecta leads urgentes basados en su comportamiento. Revisa los contactos con el tag <span className="text-white font-black underline">URGENTE</span> prioritariamente.
                            </p>
                            <Link href="/admin/chatbot" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#831832] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 hover:scale-105 transition-transform active:scale-95">
                                Configurar IA <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend: string;
    color: 'blue' | 'emerald' | 'purple' | 'orange' | 'pink';
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
    const colorClasses = {
        blue: 'from-blue-600 to-blue-500 shadow-blue-200 ring-blue-100',
        emerald: 'from-emerald-600 to-emerald-500 shadow-emerald-200 ring-emerald-100',
        purple: 'from-purple-600 to-purple-500 shadow-purple-200 ring-purple-100',
        orange: 'from-orange-600 to-orange-500 shadow-orange-200 ring-orange-100',
        pink: 'from-pink-600 to-pink-500 shadow-pink-200 ring-pink-100',
    };

    return (
        <div className="bg-white p-5 sm:p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-1 duration-500 group">
            <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1.5">{title}</p>
                    <h3 className="text-2xl font-black text-slate-900 leading-none tracking-tighter">{value}</h3>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    {trend}
                </p>
            </div>
        </div>
    );
}
