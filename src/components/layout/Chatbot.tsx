'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, User, ChevronRight, Loader2, Sparkles, UserPlus, CheckCircle } from 'lucide-react';
import { processChatMessage } from '@/app/actions/chatbot-ai';
import { createPublicLead } from '@/app/actions/create-public-lead';

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "TU_CLAVE_AQUI";

export function Chatbot() {
    const pathname = usePathname();
    const isEn = pathname?.startsWith('/en');
    const [isOpen, setIsOpen] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [messages, setMessages] = useState([
        { 
            role: 'agent', 
            text: isEn 
                ? 'Hello! 👋 I am the Alros AI assistant. How can I help you today?\n\nI can provide information about our properties, sales processes, and general inquiries.'
                : '¡Hola! 👋 Soy el asistente IA de Alros. ¿En qué puedo ayudarte hoy?\n\nPuedo informarte sobre nuestras propiedades, procesos de venta o dudas generales.' 
        }
    ]);
    const [input, setInput] = useState('');
    const [leadData, setLeadData] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
    const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isThinking, isOpen]);

    if (pathname?.startsWith('/admin')) return null;

    const handleSend = async (customMsg?: string) => {
        const userMsg = customMsg || input.trim();
        if (!userMsg || isThinking) return;

        if (!customMsg) setInput('');
        setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
        setIsThinking(true);
        setShowLeadForm(false);

        try {
            const res = await processChatMessage(userMsg, isEn ? 'en' : 'es');
            if (res && res.success) {
                const agentMsg: any = { 
                    role: 'agent', 
                    text: res.reply, 
                    suggestions: res.suggestions 
                };
                
                if ('navigateTo' in res && res.navigateTo) {
                    agentMsg.link = res.navigateTo;
                }
                
                setMessages((prev) => [...prev, agentMsg]);
                
                if ('needsLead' in res && res.needsLead) {
                    setTimeout(() => setShowLeadForm(true), 1500);
                }
            }
        } catch (error) {
            setMessages((prev) => [...prev, { 
                role: 'agent', 
                text: isEn 
                    ? "Sorry, there was a technical error. Please try again later."
                    : "Lo siento, ha habido un error técnico. Por favor, reinténtalo más tarde." 
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLeadStatus('sending');

        // Build the chat transcript for the email
        const chatTranscript = messages
            .map(m => `[${m.role === 'user' ? '👤 Cliente' : '🤖 IA'}]: ${m.text}`)
            .join('\n');
        
        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_KEY,
                    subject: `[CHATBOT IA] Nuevo lead: ${leadData.nombre}`,
                    from_name: "Alros Inmobiliaria - Chatbot IA",
                    nombre: leadData.nombre,
                    email: leadData.email,
                    telefono: leadData.telefono,
                    origen: "Chatbot IA (Widget)",
                    conversacion_previa: chatTranscript,
                    autoresponse: `Hola ${leadData.nombre},\n\nGracias por ponerte en contacto con Alros Inmobiliaria a través de nuestro asistente virtual.\n\nHemos recibido tus datos correctamente y un compañero de nuestro equipo se pondrá en contacto contigo muy pronto para ayudarte con lo que necesites.\n\nMientras tanto, puedes seguir explorando nuestras propiedades en nuestra web.\n\n¡Un abrazo del equipo de Alros!`,
                }),
            });

            const result = await res.json();

            if (result.success) {
                // Also save to database (best-effort, don't block UX)
                const chatTranscriptForDb = messages
                    .map(m => `[${m.role === 'user' ? 'Cliente' : 'IA'}]: ${m.text}`)
                    .join('\n');

                createPublicLead({
                    nombre_completo: leadData.nombre,
                    email: leadData.email,
                    telefono: leadData.telefono,
                    origen: 'chatbot',
                    urgencia: 'Alta',
                    notas_internas: chatTranscriptForDb,
                }).catch(() => {}); // Fire-and-forget

                setLeadStatus('success');
                
                // Show thanks in chat and close form
                setTimeout(() => {
                    setLeadStatus('idle');
                    setShowLeadForm(false);
                    setLeadData({ nombre: '', email: '', telefono: '', mensaje: '' });
                    
                    setMessages(prev => [...prev, { 
                        role: 'agent', 
                        text: isEn
                            ? "Great! 🎉 We have received your details. An Alros expert will contact you as soon as possible. Can I help you with anything else in the meantime?"
                            : "¡Genial! 🎉 Tus datos ya están con nosotros. Un compañero experto de Alros se pondrá en contacto contigo lo antes posible. ¿Puedo ayudarte con algo más mientras tanto?" 
                    }]);
                }, 2500);
            } else {
                setLeadStatus('error');
                setMessages(prev => [...prev, { 
                    role: 'agent', 
                    text: isEn
                        ? "Oops, there was a technical issue. Could you please try again or contact us directly at +34 691 687 316?"
                        : "Vaya, ha habido un problemilla técnico. ¿Podrías intentarlo de nuevo o contactarnos directamente al 691 687 316?" 
                }]);
            }
        } catch (error) {
            setLeadStatus('error');
            setMessages(prev => [...prev, { 
                role: 'agent', 
                text: isEn
                    ? "It seems there is a connection problem. Could you please try again or call us at +34 691 687 316?"
                    : "Parece que hay un problema de conexión. ¿Podrías intentarlo de nuevo o contactarnos al 691 687 316?" 
            }]);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
            >
                {isOpen ? <X size={24} /> : (
                    <>
                        <div className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
                        </div>
                        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
                    </>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[350px] md:w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[600px] animate-in slide-in-from-bottom-8 fade-in-0 zoom-in-95 duration-300 origin-bottom-right">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 text-white">
                                    <Sparkles size={20} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-blue-700"></div>
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm tracking-tight uppercase">
                                    {isEn ? 'Alros AI Assistant' : 'Asistente IA Alros'}
                                </h3>
                                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest bg-blue-800/40 px-2 py-0.5 rounded-full mt-0.5 w-fit">
                                    {isEn ? 'Online now' : 'Online ahora'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50 min-h-[350px] scroll-smooth">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`max-w-[85%] p-4 rounded-2xl text-[13px] shadow-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none font-medium'
                                    }`}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                >
                                    {msg.role === 'agent' && i > 0 && <span className="block text-[10px] opacity-40 mb-1 font-black uppercase tracking-tighter">Asistente IA</span>}
                                    {msg.text}

                                    {/* Action Link in Message */}
                                    {(msg as any).link && (
                                        <Link 
                                            href={(msg as any).link} 
                                            className="mt-3 flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors border border-blue-200"
                                        >
                                            VER RESULTADOS
                                            <ChevronRight size={14} />
                                        </Link>
                                    )}
                                </div>
                                
                                {/* Suggestions chips below agent message */}
                                {msg.role === 'agent' && (msg as any).suggestions && (
                                    <div className="flex flex-wrap gap-2 mt-2 ml-1">
                                        {(msg as any).suggestions.map((s: string, idx: number) => (
                                            <button 
                                                key={idx}
                                                onClick={() => handleSend(s)}
                                                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="h-1.5 w-1.5 bg-blue-300 rounded-full animate-bounce"></div>
                                        <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                                        {isEn ? 'Thinking...' : 'Pensando...'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Special Lead Form Inline */}
                        {showLeadForm && (
                            <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-500/20 p-5 rounded-2xl shadow-xl animate-in fade-in zoom-in duration-500">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                                        <UserPlus className="text-blue-600" size={18} />
                                        {isEn ? 'Do you want us to contact you?' : '¿Deseas que te contactemos?'}
                                    </h4>
                                    <button 
                                        onClick={() => setShowLeadForm(false)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                
                                {leadStatus === 'success' ? (
                                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center animate-out fade-out zoom-out duration-1000 delay-[1500ms]">
                                        <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                            <CheckCircle className="h-6 w-6" />
                                        </div>
                                        <p className="font-bold text-green-700">
                                            {isEn ? 'Data Received!' : '¡Datos Recibidos!'}
                                        </p>
                                        <p className="text-xs text-green-600 font-medium">
                                            {isEn ? 'An agent will contact you as soon as possible.' : 'Un agente se pondrá en contacto contigo muy pronto.'}
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleLeadSubmit} className="space-y-3">
                                        <input 
                                            placeholder={isEn ? "Your full name" : "Tu nombre completo"}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                            value={leadData.nombre}
                                            onChange={e => setLeadData({...leadData, nombre: e.target.value})}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input 
                                                placeholder={isEn ? "Email" : "Email"}
                                                type="email"
                                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                                value={leadData.email}
                                                onChange={e => setLeadData({...leadData, email: e.target.value})}
                                            />
                                            <input 
                                                placeholder={isEn ? "Phone" : "Teléfono"}
                                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                                value={leadData.telefono}
                                                onChange={e => setLeadData({...leadData, telefono: e.target.value})}
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={leadStatus === 'sending'}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            {leadStatus === 'sending' ? <Loader2 className="animate-spin" size={16} /> : (isEn ? 'SUBMIT REQUEST' : 'ENVIAR SOLICITUD')}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowLeadForm(false)}
                                            className="w-full text-[10px] text-slate-400 font-bold hover:text-slate-600 transition-colors py-1"
                                        >
                                            {isEn ? 'CONTINUE CHAT WITHOUT SUBMITTING' : 'CONTINUAR CHAT SIN ENVIAR'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    {!showLeadForm && (
                        <div className="p-4 bg-white border-t border-slate-100">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                                className="flex gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isEn ? "Write your question here..." : "Escribe tu duda aquí..."}
                                    className="flex-1 px-3 py-2 bg-transparent rounded-lg text-sm focus:outline-none font-medium"
                                    disabled={isThinking}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isThinking}
                                    className="h-10 w-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                            <div className="mt-3 flex items-center justify-between px-2">
                                <p className="text-[10px] text-slate-400 font-medium">Alros Virtual Hub</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setInput("Quiero vender mi casa")} className="text-[9px] bg-white border border-slate-200 px-2 py-1 rounded-full text-slate-500 hover:bg-blue-50 hover:border-blue-200 transition-all">Vender</button>
                                    <button onClick={() => setInput("Busco piso de alquiler")} className="text-[9px] bg-white border border-slate-200 px-2 py-1 rounded-full text-slate-500 hover:bg-blue-50 hover:border-blue-200 transition-all">Alquiler</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
