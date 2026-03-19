'use client';

import { useState } from 'react';
import { login } from './actions';
import { Lock, Mail, Loader2, Home, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setError(false);
        const formData = new FormData(e.currentTarget);
        
        // El login hace un redirect por lo que si hay error capturamos el fallo via query param
        // Pero intentamos ejecutarlo directamente aquí si fuera posible o simplemente dejamos que el server action maneje el flujo
        try {
            await login(formData);
        } catch (err) {
            setError(true);
            setIsPending(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#831832]/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo Area */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="bg-[#831832] p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-[#831832]/20">
                            <Home className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tighter uppercase italic">
                            Alros<span className="text-[#831832]">Admin</span>
                        </span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Bienvenido de nuevo</h1>
                    <p className="text-slate-400 mt-2">Acceso exclusivo para agentes de Alros Inmobiliaria</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 mb-6"
                        >
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">Credenciales incorrectas. Revisa tus datos.</p>
                        </motion.div>
                    )}

                    <form action={login} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    name="email"
                                    type="email" 
                                    required
                                    placeholder="agente@alros.eu"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#831832] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-slate-300">Contraseña</label>
                                <button type="button" className="text-xs text-slate-500 hover:text-[#831832] transition-colors">¿Olvidaste tu contraseña?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    name="password"
                                    type="password" 
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#831832] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <button 
                            disabled={isPending}
                            type="submit"
                            className="w-full bg-[#831832] hover:bg-[#a11d3e] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#831832]/25 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Entrar al Panel
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8 space-y-4">
                    <p className="text-slate-500 text-sm">
                        ¿No tienes acceso? <span className="text-slate-300 font-medium">Contacta con administración</span>
                    </p>
                    <div className="flex justify-center gap-6">
                         <Link href="/" className="text-slate-600 hover:text-slate-400 text-xs flex items-center gap-1 transition-colors">
                            <Home size={14} /> Inicio
                         </Link>
                         <p className="text-slate-700 text-xs">|</p>
                         <p className="text-slate-700 text-xs">© 2026 Alros Investments S.L.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
