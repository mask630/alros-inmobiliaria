'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, FileText, Settings, LogOut, UserCircle, Menu, X, BarChart3, MessageSquare, Bell, HeartHandshake, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import { signout } from "@/app/login/actions";

export function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [newLeadsCount, setNewLeadsCount] = useState(0);

    // Fetch new leads count
    useEffect(() => {
        const fetchNewLeads = async () => {
            const { count } = await supabase
                .from('interesados')
                .select('*', { count: 'exact', head: true })
                .eq('estado', 'Nuevo');
            setNewLeadsCount(count || 0);
        };

        fetchNewLeads();

        // Poll every 30 seconds for new leads
        const interval = setInterval(fetchNewLeads, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Mobile Header Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-slate-950 text-white flex items-center justify-between px-6 z-40 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-[#831832] rounded-lg flex items-center justify-center font-black text-white text-lg italic shadow-lg shadow-[#831832]/20">A</div>
                    <span className="font-black text-xl text-white tracking-tighter uppercase italic">
                        Alros<span className="text-[#831832]">Admin</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {newLeadsCount > 0 && (
                        <Link href="/admin/interesados" className="relative p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                            <Bell size={22} className="text-red-400" />
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-red-500/50">
                                {newLeadsCount}
                            </span>
                        </Link>
                    )}
                    <button onClick={() => setIsOpen(true)} className="p-2.5 bg-slate-900 rounded-xl border border-white/10 hover:bg-slate-800 transition-colors">
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-950/80 z-[60] backdrop-blur-md transition-all animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static top-0 left-0 h-full w-80 lg:w-72 bg-[#020617] text-white min-h-screen p-6 flex flex-col z-[70] lg:z-30 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) border-r border-white/5 ${isOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full lg:translate-x-0'}`}>
                
                {/* Logo Section */}
                <div className="mb-10 px-2 flex justify-between items-center mt-2 lg:mt-0">
                    <div className="group cursor-default">
                        <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 bg-gradient-to-br from-[#831832] to-[#a21c3e] rounded-xl flex items-center justify-center font-black text-white text-xl italic shadow-2xl shadow-[#831832]/40 group-hover:scale-110 transition-transform duration-500">A</div>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
                                    Alros<span className="text-[#831832]">Admin</span>
                                </h1>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1.5 flex items-center gap-1.5 leading-none">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    PRO PLATFORM v2
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-900/50 rounded-xl border border-white/5">
                        <X size={22} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-grow overflow-y-auto pr-1 pb-4 space-y-8 custom-scrollbar">
                    
                    {/* Insights Group */}
                    <div className="space-y-1">
                        <h4 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3">Principal</h4>
                        <NavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Vista General" onClick={() => setIsOpen(false)} />
                        <NavLink href="/admin/estadisticas" icon={<BarChart3 size={20} />} label="Centro de Análisis" onClick={() => setIsOpen(false)} />
                    </div>

                    {/* Inventory & Network */}
                    <div className="space-y-1">
                        <h4 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3">Operaciones</h4>
                        <NavLink href="/admin/propiedades" icon={<Building2 size={20} />} label="Catálogo Inmuebles" onClick={() => setIsOpen(false)} />
                        <NavLink href="/admin/propietarios" icon={<Users size={20} />} label="Propietarios" onClick={() => setIsOpen(false)} />
                        <NavLink 
                            href="/admin/interesados" 
                            icon={<HeartHandshake size={20} />} 
                            label="Leads & Demandas" 
                            onClick={() => setIsOpen(false)} 
                            badge={newLeadsCount > 0 ? newLeadsCount : undefined}
                            badgeLabel="Nuevos"
                        />
                    </div>

                    {/* Team & Tools */}
                    <div className="space-y-1">
                        <h4 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3">Equipo & IA</h4>
                        <NavLink href="/admin/agentes" icon={<UserCircle size={20} />} label="Gestión de Agentes" onClick={() => setIsOpen(false)} />
                        <NavLink href="/admin/chatbot" icon={<MessageSquare size={20} />} label="Asistente IA" onClick={() => setIsOpen(false)} />
                    </div>

                    {/* System Setup */}
                    <div className="space-y-1">
                        <h4 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3">Sistema</h4>
                        <NavLink href="/admin/configuracion" icon={<Settings size={20} />} label="Ajustes de Plataforma" onClick={() => setIsOpen(false)} />
                    </div>
                </nav>

                {/* Bottom Footer Section */}
                <div className="pt-6 border-t border-white/5 mt-auto">
                    <form action={signout}>
                        <button type="submit" className="group flex items-center justify-between px-5 py-4 w-full bg-slate-950/40 hover:bg-red-500/10 border border-white/5 rounded-2xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors">
                                    <LogOut size={18} />
                                </div>
                                <span className="text-sm font-bold text-slate-400 group-hover:text-red-400 transition-colors">Salir de Admin</span>
                            </div>
                            <X size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}

function NavLink({ href, icon, label, onClick, badge, badgeLabel }: { href: string; icon: React.ReactNode; label: string, onClick?: () => void, badge?: number, badgeLabel?: string }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`group flex items-center gap-3.5 px-5 py-3.5 rounded-2xl transition-all duration-300 font-bold relative border ${isActive
                    ? 'bg-gradient-to-r from-[#831832]/20 to-transparent text-white border-[#831832]/30 shadow-lg shadow-[#831832]/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/5'
                }`}
        >
            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#831832] rounded-r-full shadow-[0_0_15px_rgba(131,24,50,0.8)]" />}
            <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[#831832]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {icon}
            </div>
            <span className="text-sm tracking-tight">{label}</span>
            {badge !== undefined && badge > 0 && (
                <div className="ml-auto flex flex-col items-end">
                    <span className="flex items-center justify-center h-5 px-2 bg-red-600 text-white text-[9px] font-black rounded-lg shadow-lg shadow-red-600/40 animate-pulse">
                        {badge}
                    </span>
                    {badgeLabel && <span className="text-[8px] text-red-500 uppercase font-black mt-0.5 tracking-tighter">{badgeLabel}</span>}
                </div>
            )}
        </Link>
    );
}
