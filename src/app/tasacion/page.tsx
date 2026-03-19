'use client';

import { useState } from 'react';
import { createPublicLead } from '@/app/actions/create-public-lead';
import { Home, ArrowRight, MapPin, Bed, Bath, Hash, Star, User, Phone, Mail, Building, Map, Loader2, CheckCircle } from "lucide-react";

// Clave de Web3Forms de entorno o placeholder
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "TU_CLAVE_AQUI";

export default function TasacionPage() {
    const [formData, setFormData] = useState({
        tipo: 'Apartamento',
        direccion: '',
        dormitorios: '',
        banos: '',
        referenciaCatastral: '',
        caracteristicas: '',
        nombre: '',
        telefono: '',
        email: '',
        marketing: false
    });

    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_KEY,
                    subject: `[VALORACIÓN] ${formData.tipo} en ${formData.direccion || 'Nueva Solicitud'}`,
                    from_name: "Alros Inmobiliaria",
                    autoresponse: `Hola ${formData.nombre},\n\nHemos recibido correctamente tu solicitud de valoración para tu ${formData.tipo} en ${formData.direccion}.\n\nPara nosotros es muy importante tu solicitud. Nuestro equipo de tasación de Alros Inmobiliaria revisará los detalles y nos pondremos en contacto contigo lo antes posible para ayudarte a obtener el mejor precio de mercado.\n\nGracias por confiar en nosotros.\n\nUn cordial saludo,\nEl equipo de Alros Inmobiliaria`,
                    ...formData
                }),
            });

            const result = await res.json();
            if (result.success) {
                // Also save to database (best-effort)
                const detallesInmueble = `Tipo: ${formData.tipo}\nDirección: ${formData.direccion}\nDormitorios: ${formData.dormitorios}\nBaños: ${formData.banos}${formData.referenciaCatastral ? `\nRef. Catastral: ${formData.referenciaCatastral}` : ''}${formData.caracteristicas ? `\nCaracterísticas: ${formData.caracteristicas}` : ''}`;
                createPublicLead({
                    nombre_completo: formData.nombre,
                    email: formData.email,
                    telefono: formData.telefono,
                    origen: 'web_tasacion',
                    tipo_operacion: 'valoracion',
                    urgencia: 'Baja',
                    notas_internas: detallesInmueble,
                }).catch(() => {});

                setStatus('sent');
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    const verifyMap = () => {
        if (!formData.direccion) {
            alert("Por favor, introduce una dirección primero para verificarla en el mapa.");
            return;
        }
        window.open(`https://maps.google.com/?q=${encodeURIComponent(formData.direccion + ', España')}`, '_blank');
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-16">
            <div className="bg-slate-900 text-white py-16 mb-12 px-4 shadow-inner">
                <div className="container mx-auto max-w-4xl text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-semibold tracking-wide text-sm mb-6 border border-orange-500/30">
                        <Star className="h-4 w-4" /> Valoración Gratuita
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Descubre el valor real de tu inmueble</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                        Completa este sencillo formulario y nos pondremos en contacto contigo para ofrecerte una valoración profesional, sin compromiso, para vender al mejor precio de mercado.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100">

                    {status === 'sent' ? (
                        <div className="text-center py-16">
                            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">¡Solicitud Enviada!</h2>
                            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                                Gracias por contactar con nosotros. Hemos recibido tus datos y nos pondremos en contacto contigo de inmediato.
                            </p>
                            <button
                                onClick={() => {
                                    setFormData({ tipo: 'Apartamento', direccion: '', dormitorios: '', banos: '', referenciaCatastral: '', caracteristicas: '', nombre: '', telefono: '', email: '', marketing: false });
                                    setStatus('idle');
                                }}
                                className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors"
                            >
                                Enviar otra solicitud
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-10">

                            {/* SECCIÓN 1: Ubicación y Tipo */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin className="h-5 w-5" /></div>
                                    <h3 className="text-xl font-bold text-slate-800">Ubicación y Tipo</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                                            <Building className="h-4 w-4 text-slate-400" /> Tipo de Propiedad <span className="text-red-500">*</span>
                                        </label>
                                        <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-700">
                                            <option>Apartamento</option>
                                            <option>Piso</option>
                                            <option>Casa / Chalet</option>
                                            <option>Ático</option>
                                            <option>Dúplex</option>
                                            <option>Local Comercial</option>
                                            <option>Terreno / Parcela</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                                            <Map className="h-4 w-4 text-slate-400" /> Dirección Exacta <span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Calle, número, piso, ciudad..." required />
                                        <button type="button" onClick={verifyMap} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
                                            <MapPin className="h-3.5 w-3.5" /> Verificar dirección en Google Maps
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 2: Detalles del Inmueble */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><Home className="h-5 w-5" /></div>
                                    <h3 className="text-xl font-bold text-slate-800">Detalles del Inmueble</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2"><Bed className="h-4 w-4 text-slate-400" /> Nº Dormitorios <span className="text-red-500">*</span></label>
                                        <input type="number" min="0" name="dormitorios" value={formData.dormitorios} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Ej: 3" required />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2"><Bath className="h-4 w-4 text-slate-400" /> Nº Baños <span className="text-red-500">*</span></label>
                                        <input type="number" min="0" name="banos" value={formData.banos} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Ej: 2" required />
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-1">
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2"><Hash className="h-4 w-4 text-slate-400" /> Ref. Catastral <span className="text-slate-400 font-normal text-xs">(Opcional)</span></label>
                                        <input type="text" name="referenciaCatastral" value={formData.referenciaCatastral} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Si la conoce..." />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <span className="flex items-center gap-2 mb-1"><Star className="h-4 w-4 text-amber-500" /> ¿Qué es lo que más le gusta de su inmueble o qué cree que lo hace especial?</span>
                                        <span className="text-slate-400 font-normal text-xs">(Opcional) Esta información nos ayuda a destacar su venta.</span>
                                    </label>
                                    <textarea name="caracteristicas" value={formData.caracteristicas} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Tiene mucha luz natural por las mañanas..." />
                                </div>
                            </div>

                            {/* SECCIÓN 3: Datos de Contacto */}
                            <div className="space-y-6 bg-slate-50 -mx-6 md:-mx-10 -mb-6 md:-mb-10 p-6 md:p-10 rounded-b-3xl border-t border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-white text-slate-600 rounded-lg shadow-sm border border-slate-200"><User className="h-5 w-5" /></div>
                                    <h3 className="text-xl font-bold text-slate-800">Tus Datos de Contacto</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">Nombre y Apellidos <span className="text-red-500">*</span></label>
                                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: María García" className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2"><Phone className="h-4 w-4 text-slate-400" /> Teléfono <span className="text-red-500">*</span></label>
                                        <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej: 600..." className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2"><Mail className="h-4 w-4 text-slate-400" /> Email <span className="text-red-500">*</span></label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                                    </div>
                                </div>

                                {status === 'error' && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mt-4 text-center font-medium">
                                        Hubo un error al enviar el mensaje. Por favor, asegúrate de haber configurado la clave de Web3Forms.
                                    </div>
                                )}

                                <div className="pt-4 pb-2 space-y-3">
                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <input type="checkbox" required className="mt-1 rounded text-orange-600 focus:ring-orange-500 border-slate-300" />
                                        <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                                            He leído y acepto la <a href="/privacidad" target="_blank" className="text-orange-600 hover:underline">Política de Privacidad</a> *
                                        </span>
                                    </label>
                                    
                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <input type="checkbox" name="marketing" checked={formData.marketing || false} onChange={handleChange} className="mt-1 rounded text-orange-600 focus:ring-orange-500 border-slate-300" />
                                        <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                                            Deseo recibir información sobre propiedades y novedades inmobiliarias.
                                        </span>
                                    </label>

                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-500 text-center leading-tight">
                                        <strong>Responsable:</strong> Alros Investments S.L. | <strong>Finalidad:</strong> Gestionar su solicitud de valoración y contactar con usted. | <strong>Legitimación:</strong> Consentimiento. | <a href="/privacidad" target="_blank" className="underline">Más información</a>.
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="group w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
                                    >
                                        {status === 'sending' ? (
                                            <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</>
                                        ) : (
                                            <><ArrowRight className="h-5 w-5" /> Enviar Solicitud Segura</>
                                        )}
                                    </button>
                                    <p className="text-xs text-center text-slate-500 mt-4 px-4 leading-relaxed">
                                        Tus datos se enviarán de forma segura sin salir de la página. Prometemos no enviarte spam.
                                    </p>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
