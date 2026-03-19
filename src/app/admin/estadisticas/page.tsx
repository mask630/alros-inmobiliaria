"use client";

import { useEffect, useState } from "react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
    TrendingUp, Users, Building2, MousePointer2, 
    Calendar, Filter, Download, Info, Loader2,
    PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon
} from "lucide-react";
import { getAdvancedStats } from "./actions";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function StatisticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const res = await getAdvancedStats();
            if (res && !('error' in res)) {
                setData(res);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    const handleExportCSV = () => {
        if (!data) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Informe,Valor\n";
        csvContent += `Propiedades Totales,${data.counts.props}\n`;
        csvContent += `Interesados Totales,${data.counts.leads}\n`;
        csvContent += `Operaciones Cerradas,${data.trends.totalSold}\n`;
        csvContent += `Tasa Conversion,${((data.trends.totalSold / (data.counts.leads || 1)) * 100).toFixed(1)}%\n`;
        
        // Add Evolution
        csvContent += "\nMes,Propiedades,Interesados\n";
        data.evolution.forEach((row: any) => {
            csvContent += `${row.month},${row.propiedades},${row.interesados}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `informe_alros_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-slate-500 font-medium">Generando informes estadísticos...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-10 text-center bg-red-50 border border-red-100 rounded-2xl text-red-600">
                <Info className="mx-auto mb-2" />
                <p>Error al cargar las estadísticas. Por favor, reinténtelo.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase italic">
                        <div className="p-2 bg-blue-600 rounded-2xl text-white shadow-xl">
                            <BarChart3 size={28} />
                        </div>
                        ANÁLISIS DE <span className="text-[#831832]">RENDIMIENTO</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Monitoreo de KPI's, conversión y evolución de activos.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest">
                        <Calendar size={18} className="text-blue-600" />
                        Semestre Actual
                    </button>
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
                    >
                        <Download size={18} className="text-blue-400" />
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Top Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard 
                    title="Propiedades Totales" 
                    value={data.counts.props} 
                    trend={`${data.trends.props} vs mes ant.`} 
                    icon={<Building2 className="text-blue-600" />} 
                />
                <SummaryCard 
                    title="Interesados Totales" 
                    value={data.counts.leads} 
                    trend={`${data.trends.leads} vs mes ant.`} 
                    icon={<Users className="text-emerald-600" />} 
                />
                <SummaryCard 
                    title="Op. Cerradas" 
                    value={data.trends.totalSold} 
                    trend="Cartera histórica" 
                    icon={<TrendingUp className="text-purple-600" />} 
                    color="purple"
                />
                <SummaryCard 
                    title="Tasa Conversión" 
                    value={`${((data.trends.totalSold / (data.counts.leads || 1)) * 100).toFixed(1)}%`} 
                    trend="Leads que compran" 
                    icon={<MousePointer2 className="text-orange-600" />} 
                    color="orange"
                />
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Evolution Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <LineChartIcon size={20} className="text-blue-500" />
                            Evolución Mensual
                        </h3>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.evolution}>
                                <defs>
                                    <linearGradient id="colorProp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                />
                                <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                                <Area type="monotone" dataKey="propiedades" name="Propiedades" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProp)" />
                                <Area type="monotone" dataKey="interesados" name="Interesados" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
                    {/* Leads by Origin */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-8">
                            <PieChartIcon size={20} className="text-pink-500" />
                            Canales de Leads
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.origins}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.origins.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Type Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-8">
                            <PieChartIcon size={20} className="text-orange-500" />
                            Tipo de Inmuebles
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.types}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.types.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Agent Performance */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-8">
                        <Users size={20} className="text-emerald-500" />
                        Rendimiento por Agente
                    </h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.agents} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 600}} width={120} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="propiedades" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={20} name="Propiedades" />
                                <Bar dataKey="leads" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="Leads" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Operations & Status */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-8">
                        <TrendingUp size={20} className="text-purple-500" />
                        Estado de Cartera y Operaciones
                    </h3>
                    
                    <div className="space-y-6 mt-10">
                        <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Disponibles</p>
                                    <p className="text-2xl font-black text-slate-900">{data.status.disponible || 0}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-slate-500">Oportunidades activas</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-200">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Cerradas (Venta/Alq)</p>
                                    <p className="text-2xl font-black text-slate-900">{(data.status.vendido || 0) + (data.status.alquilado || 0)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-slate-500">Operaciones con éxito</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Venta</p>
                                <p className="text-xl font-black text-slate-800">{data.operations?.find((o: any) => o.name === 'Venta')?.value || 0}</p>
                            </div>
                            <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Alquiler</p>
                                <p className="text-xl font-black text-slate-800">{data.operations?.find((o: any) => o.name === 'Alquiler')?.value || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, trend, icon, color = 'blue' }: any) {
    const colorClasses: any = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-tight">{title}</p>
                    <h4 className="text-2xl font-black text-slate-900">{value}</h4>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded-full text-slate-500 uppercase">{trend}</span>
            </div>
        </div>
    );
}
