'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Property, Lead } from '@/types/database.types';
import Link from 'next/link';
import { Building2, BedDouble, Bath, Euro, MessageCircle, MapPin, Mail, ExternalLink, Sparkles, Check, Maximize, Edit } from 'lucide-react';

interface MatchResult {
    property: Property;
    score: number;
    badge: { label: string; color: string };
}

export default function MatchingProperties({ lead }: { lead: Lead }) {
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateMatches();
    }, [lead]);

    const calculateMatches = async () => {
        setLoading(true);
        // Fetch available properties
        const { data: properties, error } = await supabase
            .from('properties')
            .select('*')
            .eq('status', 'disponible')
            .eq('operation_type', lead.tipo_operacion);

        if (error || !properties) {
            console.error(error);
            setLoading(false);
            return;
        }

        const scoredProperties: MatchResult[] = [];

        properties.forEach(prop => {
            const price = prop.price || 0;
            const beds = prop.features?.bedrooms || 0;
            const city = (prop.city || '').toLowerCase();

            let score = 100;
            let badgeLabel = "Encaje Perfecto";
            let badgeColor = "bg-emerald-100 text-emerald-700 border-emerald-200";

            // Price evaluation
            let priceRatio = 1;
            if (lead.presupuesto_maximo && lead.presupuesto_maximo > 0) {
                priceRatio = price / lead.presupuesto_maximo;

                if (priceRatio > 1) {
                    // Over budget
                    const overPercent = (priceRatio - 1) * 100;
                    if (overPercent > 15) {
                        score = 0; // Too expensive
                    } else {
                        score -= (overPercent * 3); // Penalty for being over, up to 45 points off
                        badgeLabel = "Por encima de presupuesto";
                        badgeColor = "bg-orange-100 text-orange-700 border-orange-200";
                    }
                }
            }

            // Bedrooms evaluation
            if (score > 0 && lead.dormitorios_minimo !== null && lead.dormitorios_minimo > 0) {
                if (beds < lead.dormitorios_minimo) {
                    const diff = lead.dormitorios_minimo - beds;

                    if (priceRatio <= 0.7) {
                        // Very cheap! Opportunity
                        score -= (diff * 10);
                        if (score >= 70) {
                            badgeLabel = "Oportunidad de Precio";
                            badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
                        }
                    } else {
                        // Normal penalty
                        score -= (diff * 35);
                    }
                }
            }

            // Zones evaluation
            if (score > 0 && lead.preferencias_zonas && lead.preferencias_zonas.length > 0) {
                const wantsZone = lead.preferencias_zonas.some((z: string) => city.includes(z.toLowerCase().trim()));
                if (!wantsZone && prop.city) {
                    score -= 20; // Not in preferred zone but might still be viable
                    if (badgeLabel === "Encaje Perfecto") {
                        badgeLabel = "Otra Zona";
                        badgeColor = "bg-blue-100 text-blue-700 border-blue-200";
                    }
                }
            }

            // Cap score
            score = Math.max(0, Math.min(100, Math.round(score)));

            if (score >= 50) {
                scoredProperties.push({
                    property: prop as Property,
                    score,
                    badge: { label: badgeLabel, color: badgeColor }
                });
            }
        });

        // Sort descending
        scoredProperties.sort((a, b) => b.score - a.score);
        setMatches(scoredProperties);
        setLoading(false);
    };

    const getWhatsappMessage = (prop: Property) => {
        const text = `Hola ${lead.nombre_completo.split(' ')[0]}, soy tu agente de Alros Inmobiliaria. 
He encontrado una propiedad en ${prop.city} por ${prop.price?.toLocaleString()}€ que podría encajarte muy bien. 
Tiene ${prop.bedrooms || prop.features?.bedrooms || 0} habitaciones. 
¿Te gustaría ver fotos o organizar una visita? ¡Dime qué te parece!`;
        return encodeURIComponent(text);
    };

    const getEmailContent = (prop: Property, email: string) => {
        const subject = encodeURIComponent(`Oportunidad Inmobiliaria: ${prop.title}`);
        const body = encodeURIComponent(`Hola ${lead.nombre_completo.split(' ')[0]},

Espero que estés bien. Soy tu agente de Alros Inmobiliaria.

He revisado nuestras propiedades disponibles y he encontrado una que encaja muy bien con lo que estás buscando:

- Propiedad: ${prop.title}
- Ubicación: ${prop.city}
- Precio: ${prop.price?.toLocaleString()}€
- Habitaciones: ${prop.bedrooms || prop.features?.bedrooms || 0}

Puedes ver más detalles aquí: ${window.location.origin}/propiedades/${prop.id}

¿Te gustaría que agendáramos una visita?

Saludos,
Alros Inmobiliaria`);
        return `mailto:${email}?subject=${subject}&body=${body}`;
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Buscando cruces...</div>;
    }

    if (matches.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Sin coincidencias actuales</h3>
                <p className="text-slate-500">No hay propiedades disponibles que se ajusten mínimamente a estos criterios.</p>
            </div>
        );
    }

    // Safely get contact arrays
    const leadPhones = lead.telefonos || (lead.telefono ? [lead.telefono] : []);
    const leadEmails = lead.emails || (lead.email ? [lead.email] : []);

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                        <Sparkles className="text-emerald-600" size={18} />
                    </div>
                    <span className="text-lg">Propiedades Compatibles</span>
                </h3>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 uppercase tracking-wider">
                    {matches.length} Sugerencias
                </span>
            </div>

            <div className="divide-y divide-slate-100">
                {matches.map((match, i) => (
                    <div key={match.property.id} className="p-5 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row gap-6 items-center">
                        {/* Score Indicator */}
                        <div className="shrink-0 flex flex-col items-center">
                            <div className={`relative h-16 w-16 flex items-center justify-center rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-lg ${match.score >= 90 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200' :
                                match.score >= 70 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-200' :
                                    'bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-slate-200'
                                }`}>
                                <div className="text-center font-black">
                                    <span className="text-2xl leading-none block">{match.score}</span>
                                    <span className="text-[10px] uppercase opacity-80 tracking-tighter">% MATCH</span>
                                </div>
                                {match.score >= 95 && (
                                    <div className="absolute -top-2 -right-2 bg-white text-emerald-600 p-1 rounded-full shadow-md">
                                        <Check size={12} className="stroke-[4px]" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Property Info */}
                        <div className="flex-1 min-w-0 space-y-3">
                            <div>
                                <Link
                                    href={`/admin/propiedades/editar/${match.property.id}`}
                                    className="font-bold text-slate-900 hover:text-[#881337] text-lg leading-tight transition-colors line-clamp-1 block"
                                >
                                    {match.property.title}
                                </Link>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${match.badge.color}`}>
                                        {match.badge.label}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                        <MapPin size={12} className="text-slate-400" /> {match.property.city}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <span className="text-lg font-black text-[#881337]">
                                    {Number(match.property.price).toLocaleString('de-DE')} €
                                </span>
                                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-slate-400" /> {match.property.bedrooms || match.property.features?.bedrooms || 0} Dorm</span>
                                    <span className="flex items-center gap-1.5"><Bath size={14} className="text-slate-400" /> {match.property.bathrooms || match.property.features?.bathrooms || 0} Baños</span>
                                    <span className="flex items-center gap-1.5"><Maximize size={14} className="text-slate-400" /> {match.property.size_m2 || match.property.features?.size_m2 || 0} m²</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="w-full md:w-auto shrink-0 flex flex-row md:flex-col gap-2">
                            <div className="flex flex-1 gap-2">
                                {leadPhones.length > 0 && (
                                    <a
                                        href={`https://wa.me/${leadPhones[0].replace(/\+/g, '').replace(/ /g, '')}?text=${getWhatsappMessage(match.property)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#1DA851] transition-all shadow-md shadow-green-100 hover:shadow-green-200 active:scale-95"
                                        title={`Enviar WhatsApp a ${leadPhones[0]}`}
                                    >
                                        <MessageCircle size={18} />
                                        <span className="sm:inline">WhatsApp</span>
                                    </a>
                                )}

                                {leadEmails.length > 0 && (
                                    <a
                                        href={getEmailContent(match.property, leadEmails[0])}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100 hover:shadow-blue-200 active:scale-95"
                                        title={`Enviar Email a ${leadEmails[0]}`}
                                    >
                                        <Mail size={18} />
                                        <span className="sm:inline">Email</span>
                                    </a>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/propiedades/editar/${match.property.id}`}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-widest"
                                >
                                    <Edit size={14} /> Ficha Interna
                                </Link>
                                <Link
                                    href={`/propiedades/${match.property.id}`}
                                    target="_blank"
                                    className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                                    title="Ver en la web"
                                >
                                    <ExternalLink size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
