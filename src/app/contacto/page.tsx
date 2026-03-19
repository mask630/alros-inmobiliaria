'use client';

import { useState } from 'react';
import { createPublicLead } from '@/app/actions/create-public-lead';
import { Phone, Mail, MapPin, Send, MessageCircle, Loader2, CheckCircle } from "lucide-react";

// Web3Forms Key
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "TU_CLAVE_AQUI";
const WHATSAPP_NUMBER = "34691687316";
const EMAIL_ADDRESS = "Isaac.alros@gmail.com";
const OFFICE_ADDRESS = "Avenida Juan Luis Peralta 22, 29639 Benalmádena, Málaga";
const GOOGLE_MAPS_URL = "https://maps.google.com/?q=Avenida+Juan+Luis+Peralta+22,+29639+Benalmádena,+Málaga";

export default function ContactoPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        mensaje: '',
        marketing: false
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                    subject: `[CONTACTO WEB] Nuevo mensaje de ${formData.nombre} ${formData.apellidos}`,
                    from_name: "Alros Inmobiliaria Web",
                    autoresponse: `Hola ${formData.nombre},\n\nHemos recibido correctamente tu mensaje a través de nuestra página web.\n\nContenido de tu mensaje:\n"${formData.mensaje}"\n\nNuestro equipo leerá tu consulta y te daremos respuesta lo antes posible. Gracias por confiar en Alros Inmobiliaria.\n\nUn cordial saludo.`,
                    ...formData
                }),
            });

            const result = await res.json();
            if (result.success) {
                // Also save to database (best-effort)
                createPublicLead({
                    nombre_completo: `${formData.nombre} ${formData.apellidos}`.trim(),
                    email: formData.email,
                    telefono: formData.telefono,
                    origen: 'web_contacto',
                    urgencia: 'Media',
                    notas_internas: formData.mensaje,
                }).catch(() => {});

                setStatus('sent');
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-12 text-center">Contacta con Nosotros</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div className="space-y-8">
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Información de Contacto</h2>
                        <div className="space-y-6">
                            <a href="tel:+34691687316" className="flex items-start gap-4 p-4 rounded-xl hover:bg-white transition-colors group">
                                <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                    <Phone className="h-6 w-6 text-[hsl(323,84%,29%)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Teléfono</h3>
                                    <p className="text-[hsl(323,84%,29%)] font-medium text-lg group-hover:underline">691 687 316</p>
                                    <p className="text-slate-500 text-sm">Pulsa para llamar</p>
                                </div>
                            </a>
                            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 rounded-xl hover:bg-white transition-colors group">
                                <div className="bg-green-500 p-3 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                    <MessageCircle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">WhatsApp</h3>
                                    <p className="text-green-600 font-medium text-lg group-hover:underline">691 687 316</p>
                                    <p className="text-slate-500 text-sm">Pulsa para abrir chat (Pestaña Nueva)</p>
                                </div>
                            </a>
                            <a href={`mailto:${EMAIL_ADDRESS}`} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white transition-colors group">
                                <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                    <Mail className="h-6 w-6 text-[hsl(323,84%,29%)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Email</h3>
                                    <p className="text-[hsl(323,84%,29%)] font-medium text-lg group-hover:underline">{EMAIL_ADDRESS}</p>
                                    <p className="text-slate-500 text-sm">Pulsa para abrir (Pestaña Nueva)</p>
                                </div>
                            </a>
                            <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 rounded-xl hover:bg-white transition-colors group">
                                <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                    <MapPin className="h-6 w-6 text-[hsl(323,84%,29%)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Oficina</h3>
                                    <p className="text-slate-700 group-hover:text-[hsl(323,84%,29%)] transition-colors">{OFFICE_ADDRESS}</p>
                                    <p className="text-slate-500 text-sm">Pulsa para ver en Google Maps</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 h-64">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1601.0!2d-4.571!3d36.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72fb!2sAv.+Juan+Luis+Peralta%2C+22%2C+29639+Benalm%C3%A1dena%2C+M%C3%A1laga!5e0!3m2!1ses!2ses!4v1234567890" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Ubicación de la oficina" />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Envíanos un mensaje</h2>
                    <p className="text-slate-500 mb-6">Tu mensaje nos llegará directamente y contactaremos contigo enseguida.</p>

                    {status === 'sent' ? (
                        <div className="text-center py-12">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">¡Mensaje Enviado Correctamente!</h3>
                            <p className="text-slate-600 mb-6">Hemos recibido tus datos y te daremos respuesta lo antes posible.</p>
                            <button onClick={() => { setStatus('idle'); setFormData({ nombre: '', apellidos: '', email: '', telefono: '', mensaje: '', marketing: false }); }} className="text-[hsl(323,84%,29%)] font-medium hover:underline">
                                Enviar otro mensaje
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[hsl(323,84%,29%)] focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
                                    <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[hsl(323,84%,29%)] focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[hsl(323,84%,29%)] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[hsl(323,84%,29%)] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje *</label>
                                <textarea name="mensaje" value={formData.mensaje} onChange={handleChange} required rows={4} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[hsl(323,84%,29%)] focus:outline-none" />
                            </div>

                            {status === 'error' && (
                                <p className="text-red-500 text-sm text-center">Hubo un error al enviar el email. Comprueba tu conexión o la clave de API.</p>
                            )}

                            <div className="pt-4 pb-2 space-y-3">
                                <label className="flex items-start gap-2 cursor-pointer group">
                                    <input type="checkbox" required className="mt-1 rounded text-[hsl(323,84%,29%)] focus:ring-[hsl(323,84%,29%)] border-slate-300" />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                                        He leído y acepto la <a href="/privacidad" target="_blank" className="text-[hsl(323,84%,29%)] hover:underline">Política de Privacidad</a> *
                                    </span>
                                </label>
                                
                                <label className="flex items-start gap-2 cursor-pointer group">
                                    <input type="checkbox" name="marketing" checked={formData.marketing || false} onChange={handleChange} className="mt-1 rounded text-[hsl(323,84%,29%)] focus:ring-[hsl(323,84%,29%)] border-slate-300" />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                                        Deseo recibir información sobre propiedades y novedades inmobiliarias.
                                    </span>
                                </label>

                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-500 text-center leading-tight">
                                    <strong>Responsable:</strong> Alros Investments S.L. | <strong>Finalidad:</strong> Gestionar su solicitud de información y contactar con usted. | <strong>Legitimación:</strong> Consentimiento. | Más información en nuestra Política de Privacidad.
                                </div>
                            </div>

                            <button type="submit" disabled={status === 'sending'} className="w-full bg-[hsl(323,84%,29%)] hover:bg-[hsl(323,84%,24%)] disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                                {status === 'sending' ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Enviando de forma segura...</>
                                ) : (
                                    <><Send className="h-5 w-5" /> Enviar Mensaje Seguramente</>
                                )}
                            </button>
                            <p className="text-xs text-slate-500 text-center">Sin redirecciones, sin abrir apps extrañas, todo desde aquí.</p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
