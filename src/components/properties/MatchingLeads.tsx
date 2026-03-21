'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Property, Lead } from '@/types/database.types';
import Link from 'next/link';
import { Users, Phone, Mail, ExternalLink, Sparkles, Check, MessageCircle, MapPin, Search } from 'lucide-react';

interface MatchResult {
    lead: Lead;
    score: number;
    badge: { label: string; color: string };
}

export default function MatchingLeads({ property }: { property: Property }) {
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateMatches();
    }, [property]);

    const calculateMatches = async () => {
        setLoading(true);
        // Fetch active leads (not closed or lowered)
        const { data: leads, error } = await supabase
            .from('interesados')
            .select('*')
            .in('estado', ['Nuevo', 'Contactado', 'En seguimiento'])
            .eq('tipo_operacion', property.operation_type);

        if (error || !leads) {
            console.error('Error fetching leads:', error);
            setLoading(false);
            return;
        }

        const scoredLeads: MatchResult[] = [];
        const price = property.price || 0;
        const beds = property.bedrooms || property.features?.bedrooms || 0;
        const city = (property.city || '').toLowerCase();

        leads.forEach(lead => {
            let score = 100;
            let badgeLabel = "Encaje Perfecto";
            let badgeColor = "bg-emerald-100 text-emerald-700 border-emerald-200";

            // Price evaluation: Lead budget vs Property price
            if (lead.presupuesto_maximo && lead.presupuesto_maximo > 0) {
                // Property price is higher than lead's max budget
                if (price > lead.presupuesto_maximo) {
                    const overRatio = price / lead.presupuesto_maximo;
                    const overPercent = (overRatio - 1) * 100;
                    
                    if (overPercent > 20) {
                        score = 0; // Way out of budget
                    } else {
                        score -= (overPercent * 3); // Penalty for being over budget
                        badgeLabel = "Requiere Negociación";
                        badgeColor = "bg-orange-100 text-orange-700 border-orange-200";
                    }
                } else if (price < lead.presupuesto_maximo * 0.7) {
                    // Property is much cheaper than max budget
                     badgeLabel = "Gran Oportunidad";
                     badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
                }
            }

            // Bedrooms evaluation: Property bedrooms vs Lead min bedrooms
            if (score > 0 && lead.dormitorios_minimo !== null && lead.dormitorios_minimo > 0) {
                if (beds < lead.dormitorios_minimo) {
                    // Property has fewer bedrooms than lead wants
                    const diff = lead.dormitorios_minimo - beds;
                    score -= (diff * 35);
                    if (badgeLabel === "Encaje Perfecto") {
                        badgeLabel = "Faltan Dormitorios";
                        badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                    }
                }
            }

            // Zones evaluation
            if (score > 0 && lead.preferencias_zonas && lead.preferencias_zonas.length > 0) {
                const wantsZone = lead.preferencias_zonas.some((z: string) => city.includes(z.toLowerCase().trim()));
                if (!wantsZone && city) {
                    score -= 20; // Needs to be convinced about area
                    if (badgeLabel === "Encaje Perfecto") {
                        badgeLabel = "Zona Alternativa";
                        badgeColor = "bg-blue-100 text-blue-700 border-blue-200";
                    }
                }
            }

            // Cap score
            score = Math.max(0, Math.min(100, Math.round(score)));

            if (score >= 50) {
                scoredLeads.push({
                    lead: lead as Lead,
                    score,
                    badge: { label: badgeLabel, color: badgeColor }
                });
            }
        });

        // Sort descending
        scoredLeads.sort((a, b) => b.score - a.score);
        setMatches(scoredLeads);
        setLoading(false);
    };

    const getWhatsappMessage = (lead: Lead) => {
        const text = `Hola ${lead.nombre_completo.split(' ')[0]}, soy tu agente de Alros Inmobiliaria.\n\n` +
            `Acabamos de captar una nueva propiedad en ${property.city} por ${property.price?.toLocaleString()}€ que coincide enormemente con lo que me comentaste que estabas buscando.\n\n` +
            `Tiene ${property.bedrooms || property.features?.bedrooms || 0} habitaciones y características muy interesantes.\n\n` +
            `Aquí tienes el enlace con fotos y detalles:\n` +
            `https://www.alros.eu/propiedades/${property.id}\n\n` +
            `¿Te interesaría que organicemos una visita en los próximos días?`;
        return encodeURIComponent(text);
    };

    const getEmailContent = (lead: Lead, email: string) => {
        const subject = encodeURIComponent(`Nueva Propiedad para ti en ${property.city} - Alros Inmobiliaria`);
        const body = encodeURIComponent(`Hola ${lead.nombre_completo.split(' ')[0]},\n\n` +
            `Espero que estés muy bien. Me pongo en contacto contigo porque acaba de entrar en nuestra cartera una propiedad que encaja muy bien con los criterios de búsqueda que nos indicaste.\n\n` +
            `Detalles Principales:\n` +
            `- Ubicación: ${property.city}\n` +
            `- Precio: ${property.price?.toLocaleString()} €\n` +
            `- Habitaciones: ${property.bedrooms || property.features?.bedrooms || 0}\n\n` +
            `Puedes ver toda la galería de fotos y características completas aquí:\n` +
            `https://www.alros.eu/propiedades/${property.id}\n\n` +
            `Avísame si te gustaría programar una visita, estas propiedades suelen reservarse rápido.\n\n` +
            `Un saludo cordial,\n` +
            `Tu equipo de Alros Inmobiliaria`);
        return `mailto:${email}?subject=${subject}&body=${body}`;
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500 animate-pulse bg-slate-50 rounded-2xl">Analizando base de datos de interesados...</div>;
    }

    if (matches.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mt-8">
                <Search className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Cruce Inteligente (Matching)</h3>
                <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">Actualmente no hay clientes en la base de datos de "Leads" activos que busquen algo con estas características específicas. Sigue captando.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden mt-8">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-3 text-lg tracking-tight">
                        <div className="bg-indigo-100 p-2 text-indigo-700 rounded-lg">
                            <Users size={18} />
                        </div>
                        Clientes Compatibles (Matching)
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 font-medium ml-11">
                        El sistema ha encontrado {matches.length} clientes buscando algo similar.
                    </p>
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                {matches.map((match) => {
                    const leadPhones = match.lead.telefonos || (match.lead.telefono ? [match.lead.telefono] : []);
                    const leadEmails = match.lead.emails || (match.lead.email ? [match.lead.email] : []);

                    return (
                        <div key={match.lead.id} className="p-5 hover:bg-slate-50/80 transition-all group flex flex-col md:flex-row gap-6 items-center">
                            {/* Score Box */}
                            <div className="shrink-0 flex flex-col items-center">
                                <div className={`relative h-16 w-16 flex items-center justify-center rounded-2xl -rotate-2 group-hover:rotate-0 transition-transform duration-300 shadow-md ${
                                    match.score >= 90 ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-200' :
                                    match.score >= 70 ? 'bg-gradient-to-br from-indigo-400 to-indigo-500 text-white shadow-indigo-100' :
                                    'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-slate-200'
                                }`}>
                                    <div className="text-center font-black">
                                        <span className="text-2xl leading-none block">{match.score}</span>
                                        <span className="text-[10px] uppercase opacity-80 tracking-tighter">% MATCH</span>
                                    </div>
                                    {match.score >= 95 && (
                                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-white">
                                            <Sparkles size={12} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lead Info */}
                            <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
                                <Link
                                    href={`/admin/interesados/${match.lead.id}`}
                                    className="font-black text-slate-900 hover:text-indigo-700 text-lg leading-tight transition-colors line-clamp-1 block"
                                >
                                    {match.lead.nombre_completo}
                                </Link>
                                
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider border ${match.badge.color}`}>
                                        {match.badge.label}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                        💰 MAX: {match.lead.presupuesto_maximo?.toLocaleString('de-DE') || '?'} €
                                    </span>
                                    {match.lead.preferencias_zonas && match.lead.preferencias_zonas.length > 0 && (
                                         <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md truncate max-w-[150px]">
                                             <MapPin size={10} /> {match.lead.preferencias_zonas.join(', ')}
                                         </span>
                                    )}
                                </div>
                            </div>

                            {/* Easy Actions */}
                            <div className="w-full md:w-auto shrink-0 flex gap-2">
                                {leadPhones.length > 0 && (
                                    <a
                                        href={`https://wa.me/${leadPhones[0].replace(/\+/g, '').replace(/ /g, '')}?text=${getWhatsappMessage(match.lead)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 md:w-12 h-12 flex items-center justify-center bg-[#25D366] text-white rounded-xl hover:bg-[#128C7E] transition-all shadow-md shadow-green-100 hover:shadow-green-200 active:scale-95"
                                        title={`WhatsApp a ${match.lead.nombre_completo}`}
                                    >
                                        <MessageCircle size={20} />
                                        <span className="ml-2 font-bold md:hidden">WhatsApp</span>
                                    </a>
                                )}

                                {leadEmails.length > 0 && (
                                    <a
                                        href={getEmailContent(match.lead, leadEmails[0])}
                                        className="flex-1 md:w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 hover:shadow-blue-200 active:scale-95"
                                        title={`Email a ${match.lead.nombre_completo}`}
                                    >
                                        <Mail size={20} />
                                        <span className="ml-2 font-bold md:hidden">Email</span>
                                    </a>
                                )}
                                
                                <Link
                                    href={`/admin/interesados/${match.lead.id}`}
                                    className="flex-1 md:w-12 h-12 flex items-center justify-center bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                                    title="Ver Ficha Cliente"
                                >
                                    <ExternalLink size={20} />
                                    <span className="ml-2 font-bold md:hidden">Ver Cliente</span>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
