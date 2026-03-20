'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ChevronRight, Settings } from 'lucide-react';

export function CookieBanner() {
    const pathname = usePathname();
    const isEn = pathname?.startsWith('/en');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check for existing consent
        const consent = localStorage.getItem('alros-cookie-consent');
        if (!consent) {
            // Delay slightly to not annoy immediately
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem('alros-cookie-consent', 'all');
        setIsVisible(false);
    };

    const handleRejectAll = () => {
        localStorage.setItem('alros-cookie-consent', 'essential');
        setIsVisible(false);
    };

    if (!isVisible || pathname?.startsWith('/admin')) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border border-slate-200 pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-full duration-700 ease-out">
                <div className="flex flex-col md:flex-row gap-6 p-6 md:p-10 items-center md:items-start text-center md:text-left">
                    <div className="h-16 w-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner rotate-3 hover:rotate-0 transition-transform duration-500">
                        <ShieldCheck size={36} />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                            {isEn ? "Privacy & Cookies" : "Privacidad y Cookies"}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            {isEn 
                                ? "To improve your experience, we use our own and third-party cookies for internal analysis. You can accept all, reject non-essential ones, or customize."
                                : "Para mejorar su experiencia, utilizamos cookies propias y de terceros para análisis interno. Puede aceptarlas todas, rechazarlas o personalizarlas."}
                            {" "}<Link href={isEn ? "/en/cookies" : "/cookies"} className="text-[#831832] font-black hover:underline underline-offset-4">{isEn ? "View Policy" : "Ver Política"}</Link>.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 md:pt-6">
                        <button 
                            onClick={handleRejectAll}
                            className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 font-black text-xs hover:bg-slate-50 transition-all uppercase tracking-widest"
                        >
                            {isEn ? "Reject Non-Essential" : "Rechazar No Esenciales"}
                        </button>
                        <button 
                            onClick={handleAcceptAll}
                            className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-[#831832] transition-all shadow-xl shadow-slate-900/20 uppercase tracking-[0.2em] flex items-center justify-center gap-3 transform active:scale-95"
                        >
                            {isEn ? "Accept Everything" : "Aceptar Todo"}
                            <ChevronRight size={16} className="text-white/40" />
                        </button>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="px-8 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-center md:justify-end gap-8">
                    <button className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-2 transition-colors">
                        <Settings size={12} />
                        {isEn ? "Customize" : "Configurar"}
                    </button>
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <Link href={isEn ? "/en/aviso-legal" : "/aviso-legal"} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                        {isEn ? "Legal Notice" : "Aviso Legal"}
                    </Link>
                </div>
            </div>
        </div>
    );
}
