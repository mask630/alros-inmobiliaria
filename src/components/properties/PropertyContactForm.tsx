'use client';

import { useState } from 'react';
import { Send, MessageCircle, Loader2, CheckCircle } from 'lucide-react';
import { createPublicLead } from '@/app/actions/create-public-lead';

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "TU_CLAVE_AQUI";
const WHATSAPP_NUMBER = "34691687316";

export function PropertyContactForm({ propertyTitle, propertyRef, locale = 'es' }: { propertyTitle: string, propertyRef: string, locale?: string }) {
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        mensaje: locale === 'en' 
            ? `Hello, I'm interested in the property "${propertyTitle}" (Ref: ${propertyRef}). I would like to know...` 
            : `Hola, me interesa la propiedad "${propertyTitle}" (Ref: ${propertyRef}). Me gustaría saber...`,
        marketing: false
    });

    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEmail = async (e: React.FormEvent) => {
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
                    subject: locale === 'en' ? `[PROPERTY] Interest in: ${propertyTitle} (Ref: ${propertyRef})` : `[PROPIEDAD] Interés en: ${propertyTitle} (Ref: ${propertyRef})`,
                    from_name: "Alros Inmobiliaria Web",
                    autoresponse: locale === 'en' 
                        ? `Hello ${formData.nombre},\n\nWe have successfully received your message regarding the property "${propertyTitle}" (Ref: ${propertyRef}).\n\nYour message:\n"${formData.mensaje}"\n\nOur advisors will review your message and contact you shortly at your phone number ${formData.telefono} or via email.\n\nBest regards,\nThe Alros Inmobiliaria Team`
                        : `Hola ${formData.nombre},\n\nHemos recibido correctamente tu mensaje consultando por la propiedad "${propertyTitle}" (Ref: ${propertyRef}).\n\nTu mensaje enviado:\n"${formData.mensaje}"\n\nNuestros asesores revisarán tu mensaje y contactarán contigo muy pronto en tu teléfono ${formData.telefono} o a este mismo correo.\n\nAtentamente,\nEl equipo de Alros Inmobiliaria`,
                    ...formData
                }),
            });

            const result = await res.json();
            if (result.success) {
                // Also save to database (best-effort)
                createPublicLead({
                    nombre_completo: formData.nombre,
                    email: formData.email,
                    telefono: formData.telefono,
                    origen: 'web_propiedad',
                    propiedad_interes: propertyRef,
                    urgencia: 'Alta',
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

    const handleWhatsapp = () => {
        const isEn = locale === 'en';
        const whatsappMessage = encodeURIComponent(
            isEn 
                ? `📩 New property interest:\n\n🏠 Property: ${propertyTitle}\n📎 Reference: ${propertyRef}\n👤 Name: ${formData.nombre}\n📧 Email: ${formData.email}\n📱 Phone: ${formData.telefono}\n\n💬 Message:\n${formData.mensaje}`
                : `📩 Nuevo interés en propiedad:\n\n🏠 Propiedad: ${propertyTitle}\n📎 Referencia: ${propertyRef}\n👤 Nombre: ${formData.nombre}\n📧 Email: ${formData.email}\n📱 Teléfono: ${formData.telefono}\n\n💬 Mensaje:\n${formData.mensaje}`
        );
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`, '_blank');
    };

    if (status === 'sent') {
        return (
            <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{locale === 'en' ? 'Message Sent!' : '¡Mensaje Enviado!'}</h3>
                <p className="text-sm text-slate-600 mb-4">{locale === 'en' ? 'We will get back to you soon.' : 'Te responderemos muy pronto.'}</p>
                <button
                    onClick={() => {
                        setStatus('idle');
                        setFormData({
                            nombre: '', telefono: '', email: '',
                            mensaje: locale === 'en' 
                                ? `Hello, I'm interested in the property "${propertyTitle}" (Ref: ${propertyRef}). I would like to know...` 
                                : `Hola, me interesa la propiedad "${propertyTitle}" (Ref: ${propertyRef}). Me gustaría saber...`,
                            marketing: false
                        });
                    }}
                    className="text-blue-600 font-medium hover:underline text-sm"
                >
                    {locale === 'en' ? 'Send another message' : 'Enviar otro mensaje'}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleEmail} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{locale === 'en' ? 'Name' : 'Nombre'}</label>
                <input
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={locale === 'en' ? 'Your name' : 'Tu nombre'}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{locale === 'en' ? 'Phone' : 'Teléfono'}</label>
                <input
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="600 000 000"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={locale === 'en' ? 'you@email.com' : 'tu@email.com'}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{locale === 'en' ? 'Message' : 'Mensaje'}</label>
                <textarea
                    name="mensaje"
                    rows={4}
                    value={formData.mensaje}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            {status === 'error' && (
                <p className="text-red-500 text-xs text-center">{locale === 'en' ? 'Connection error. Have you configured your API key?' : 'Error de conexión. ¿Has configurado tu clave API?'}</p>
            )}

            <div className="pt-2 pb-2 space-y-3 border-t border-slate-100">
                <label className="flex items-start gap-2 cursor-pointer group">
                    <input type="checkbox" required className="mt-1 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                    <span className="text-xs text-slate-700 group-hover:text-slate-900 transition-colors">
                        {locale === 'en' ? 'I have read and accept the ' : 'He leído y acepto la '}<a href="/privacidad" target="_blank" className="text-blue-600 hover:underline">{locale === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}</a> *
                    </span>
                </label>
                
                <label className="flex items-start gap-2 cursor-pointer group">
                    <input type="checkbox" name="marketing" checked={formData.marketing || false} onChange={handleChange} className="mt-1 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                    <span className="text-xs text-slate-700 group-hover:text-slate-900 transition-colors">
                        {locale === 'en' ? 'I wish to receive information about properties and real estate news.' : 'Deseo recibir información sobre propiedades y novedades inmobiliarias.'}
                    </span>
                </label>

                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[9px] text-slate-500 leading-tight">
                    {locale === 'en' ? (
                        <><strong>Controller:</strong> Alros Investments S.L. | <strong>Purpose:</strong> Manage your request for information and contact you. | <strong>Legitimation:</strong> Consent. | <a href="/privacidad" target="_blank" className="underline">More information</a>.</>
                    ) : (
                        <><strong>Responsable:</strong> Alros Investments S.L. | <strong>Finalidad:</strong> Gestionar su solicitud de información y contactar con usted. | <strong>Legitimación:</strong> Consentimiento. | <a href="/privacidad" target="_blank" className="underline">Más información</a>.</>
                    )}
                </div>
            </div>

            <button type="submit" disabled={status === 'sending'} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                {status === 'sending' ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> {locale === 'en' ? 'Sending...' : 'Enviando...'}</>
                ) : (
                    <><Send className="h-5 w-5" /> {locale === 'en' ? 'Send Email (Automatic)' : 'Enviar Correo (Automático)'}</>
                )}
            </button>

            <button
                type="button"
                onClick={handleWhatsapp}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
            >
                <MessageCircle className="h-5 w-5" />
                {locale === 'en' ? 'Contact via WhatsApp' : 'Contactar por WhatsApp'}
            </button>
        </form>
    );
}
