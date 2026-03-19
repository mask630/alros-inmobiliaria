'use client';

import { useState } from 'react';
import { Home, ArrowRight, MapPin, Bed, Bath, Hash, Star, User, Phone, Mail, Building, Map, Loader2, CheckCircle } from "lucide-react";

// Clave de Web3Forms de entorno o placeholder
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "TU_CLAVE_AQUI";

export default function TasacionPage() {
    const [formData, setFormData] = useState({
        tipo: 'Apartment',
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
                    subject: `[VALUATION] ${formData.tipo} in ${formData.direccion || 'New Request'}`,
                    from_name: "Alros Inmobiliaria",
                    autoresponse: `Hello ${formData.nombre},\n\nWe have successfully received your valuation request for your ${formData.tipo} at ${formData.direccion}.\n\nYour request is very important to us. Our valuation team at Alros Inmobiliaria will review the details and contact you as soon as possible to help you get the best market price.\n\nThank you for trusting us.\n\nBest regards,\nThe Alros Inmobiliaria Team`,
                    ...formData
                }),
            });

            const result = await res.json();
            if (result.success) {
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
            alert("Please enter an address first to verify it on the map.");
            return;
        }
        window.open(`https://maps.google.com/?q=${encodeURIComponent(formData.direccion + ', Spain')}`, '_blank');
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-16">
            <div className="bg-slate-900 text-white py-16 mb-12 px-4 shadow-inner">
                <div className="container mx-auto max-w-4xl text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-semibold tracking-wide text-sm mb-6 border border-orange-500/30">
                        <Star className="h-4 w-4" /> Free Valuation
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Discover the real value of your property</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                        Complete this simple form and we will contact you to offer a professional valuation, without obligation, to sell at the best market price.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100">

                    {status === 'sent' ? (
                        <div className="text-center py-16">
                            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Request Sent!</h2>
                            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                                Thank you for contacting us. We have received your details and will get back to you immediately.
                            </p>
                            <button
                                onClick={() => {
                                    setFormData({ tipo: 'Apartment', direccion: '', dormitorios: '', banos: '', referenciaCatastral: '', caracteristicas: '', nombre: '', telefono: '', email: '', marketing: false });
                                    setStatus('idle');
                                }}
                                className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors"
                            >
                                Send another request
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-10">

                            {/* SECCIÓN 1: Ubicación y Tipo */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin className="h-5 w-5" /></div>
                                    <h3 className="text-xl font-bold text-slate-800">Location and Type</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                                            <Building className="h-4 w-4 text-slate-400" /> Property Type <span className="text-red-500">*</span>
                                        </label>
                                        <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-700">
                                            <option>Apartment</option>
                                            <option>Flat</option>
                                            <option>House / Villa</option>
                                            <option>Penthouse</option>
                                            <option>Duplex</option>
                                            <option>Commercial Property</option>
                                            <option>Land / Plot</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                                            <Map className="h-4 w-4 text-slate-400" /> Exact Address <span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Street, number, floor, city..." required />
                                        <button type="button" onClick={verifyMap} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
                                            <MapPin className="h-3.5 w-3.5" /> Verify address on Google Maps
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 2: Detalles del Inmueble */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><Home className="h-5 w-5" /></div>
                                    <h3 className="text-xl font-bold text-slate-800">Property Details</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2"><Bed className="h-4 w-4 text-slate-400" /> Bedrooms <span className="text-red-500">*</span></label>
                                        <input type="number" min="0" name="dormitorios" value={formData.dormitorios} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="E.g.: 3" required />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2"><Bath className="h-4 w-4 text-slate-400" /> Bathrooms <span className="text-red-500">*</span></label>
                                        <input type="number" min="0" name="banos" value={formData.banos} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="E.g.: 2" required />
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-1">
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2"><Hash className="h-4 w-4 text-slate-400" /> Cadastral Ref. <span className="text-slate-400 font-normal text-xs">(Optional)</span></label>
                                        <input type="text" name="referenciaCatastral" value={formData.referenciaCatastral} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="If known..." />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <span className="flex items-center gap-2 mb-1"><Star className="h-4 w-4 text-amber-500" /> What do you like most about your property or what makes it special?</span>
                                        <span className="text-slate-400 font-normal text-xs">(Optional) This information helps us highlight your sale.</span>
                                    </label>
                                    <textarea name="caracteristicas" value={formData.caracteristicas} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="It has a lot of natural light in the mornings..." />
                                </div>
                            </div>

                            {/* SECCIÓN 3: Datos de Contacto */}
                            <div className="space-y-6 bg-slate-50 -mx-6 md:-mx-10 -mb-6 md:-mb-10 p-6 md:p-10 rounded-b-3xl border-t border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-white text-slate-600 rounded-lg shadow-sm border border-slate-200"><User className="h-5 w-5" /></div>
                                    <h3 className="text-xl font-bold text-slate-800">Your Contact Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="E.g.: Mary Smith" className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2"><Phone className="h-4 w-4 text-slate-400" /> Phone <span className="text-red-500">*</span></label>
                                        <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="E.g.: 600..." className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2"><Mail className="h-4 w-4 text-slate-400" /> Email <span className="text-red-500">*</span></label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                                    </div>
                                </div>

                                {status === 'error' && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mt-4 text-center font-medium">
                                        There was an error sending the message. Please ensure you have configured the Web3Forms key.
                                    </div>
                                )}

                                <div className="pt-4 pb-2 space-y-3">
                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <input type="checkbox" required className="mt-1 rounded text-orange-600 focus:ring-orange-500 border-slate-300" />
                                        <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                                            I have read and accept the <a href="/privacidad" target="_blank" className="text-orange-600 hover:underline">Privacy Policy</a> *
                                        </span>
                                    </label>
                                    
                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <input type="checkbox" name="marketing" checked={formData.marketing || false} onChange={handleChange} className="mt-1 rounded text-orange-600 focus:ring-orange-500 border-slate-300" />
                                        <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                                            I wish to receive information about properties and real estate news.
                                        </span>
                                    </label>

                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-500 text-center leading-tight">
                                        <strong>Controller:</strong> Alros Investments S.L. | <strong>Purpose:</strong> Manage your valuation request and contact you. | <strong>Legitimation:</strong> Consent. | <a href="/privacidad" target="_blank" className="underline">More information</a>.
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="group w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
                                    >
                                        {status === 'sending' ? (
                                            <><Loader2 className="h-5 w-5 animate-spin" /> Sending...</>
                                        ) : (
                                            <><ArrowRight className="h-5 w-5" /> Send Secure Request</>
                                        )}
                                    </button>
                                    <p className="text-xs text-center text-slate-500 mt-4 px-4 leading-relaxed">
                                        Your data will be sent securely without leaving the page. We promise not to spam you.
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
