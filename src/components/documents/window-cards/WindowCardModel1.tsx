import React from 'react';
import { BedDouble, Bath, Maximize } from "lucide-react";
import QRCodeDynamic from "@/components/properties/QRCodeDynamic";
import { LegalFooter } from "./LegalFooter";
import { EnergyBadge } from "./EnergyBadge";

interface WindowCardProps {
    property: any;
    images: string[];
}

/**
 * Modelo 1 — "Burgundy Pro"
 * Barra lateral burgundy con datos. Foto hero grande + 3 fotos secundarias.
 * Optimizado para acera estrecha y retroiluminación.
 */
export function WindowCardModel1({ property, images }: WindowCardProps) {
    const opLabel = (property.operation_type || 'venta').toLowerCase().includes('alquiler') ? 'ALQUILER · RENT' : 'VENTA · SALE';

    return (
        <div className="flex flex-col h-full bg-white relative p-0 m-0 border-[4px] border-slate-100">
            {/* MAIN CONTENT BLOCK */}
            <div className="flex flex-1 min-h-0 w-full relative">
                
                {/* LEFT CONTENT (Photos & Title) */}
                <div className="flex flex-col w-[78%] gap-4 p-8 pr-4">
                    {/* Hero Photo */}
                    <div className="relative flex-1 rounded-sm overflow-hidden bg-slate-50 shadow-2xl group">
                        <img src={images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main Photo" />
                        
                        {/* Alros Logo */}
                        <div className="absolute top-10 left-10">
                            <img 
                                src="/logo-print.png" 
                                className="h-28 w-auto object-contain brightness-0 invert drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]" 
                                alt="Alros Investments" 
                            />
                        </div>

                        {/* Operation badge */}
                        <div className="absolute top-10 right-10 bg-[#831832] text-white px-8 py-3 rounded-sm shadow-2xl border border-white/10">
                            <span className="text-xl font-black uppercase tracking-[0.2em]">{opLabel}</span>
                        </div>
                    </div>

                    {/* Title & City */}
                    <div className="flex-none flex items-center h-24 bg-slate-100/50 rounded-sm px-6 border border-slate-200">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter truncate leading-tight">
                                {property.title_en || property.title}
                            </h2>
                            <p className="text-xl text-slate-500 uppercase font-black tracking-[0.3em] font-sans">
                                {property.city}
                            </p>
                        </div>
                        <div className="w-1.5 h-12 bg-[#831832] mx-8 rounded-full shadow-[0_0_10px_rgba(131,24,50,0.3)]" />
                        <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">REFERENCIA</p>
                             <p className="text-xl font-black text-slate-800 tracking-wider font-mono">
                                REF: {property.reference_id || property.id.split('-')[0].toUpperCase()}
                            </p>
                        </div>
                    </div>

                    {/* Three Images Array */}
                    <div className="flex-none h-[220px] grid grid-cols-3 gap-5">
                        {[1, 2, 3].map(idx => (
                            <div key={idx} className="relative rounded-sm overflow-hidden border border-slate-200 shadow-xl">
                                <img src={images[idx] || images[0]} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-black/5" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDEBAR (Burgundy) */}
                <div className="w-[22%] bg-[#831832] flex flex-col items-center text-white relative shadow-[0_0_40px_rgba(0,0,0,0.2)] z-10 border-l border-white/5">
                    
                    {/* Price Block - Overhanging */}
                    <div className="absolute top-[4%] -left-6 w-[110%] bg-white py-8 shadow-[15px_15px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center border-l-[12px] border-[#831832] z-20 rounded-sm overflow-hidden">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-2 leading-none">PRECIO · PRICE</p>
                        <p className="text-4xl font-black tracking-tighter text-[#831832] leading-none">
                            {Number(property.price).toLocaleString('de-DE')} €
                        </p>
                        <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#831832]/5 rotate-45 translate-x-8 translate-y-8" />
                    </div>

                    <div className="h-[200px] w-full" /> 

                    {/* Features Icons */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-14 w-full px-4">
                        <div className="flex flex-col items-center group">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
                                <BedDouble size={45} strokeWidth={1} className="text-white/95" />
                            </div>
                            <p className="text-5xl font-black mt-4 drop-shadow-lg">{property.bedrooms || property.features?.bedrooms || '-'}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 text-white/40">DORMITORIOS</p>
                        </div>

                        <div className="flex flex-col items-center group">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
                                <Bath size={45} strokeWidth={1} className="text-white/95" />
                            </div>
                            <p className="text-5xl font-black mt-4 drop-shadow-lg">{property.bathrooms || property.features?.bathrooms || '-'}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 text-white/40">BAÑOS</p>
                        </div>

                        <div className="flex flex-col items-center group">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
                                <Maximize size={45} strokeWidth={1} className="text-white/95" />
                            </div>
                            <p className="text-5xl font-black mt-4 drop-shadow-lg">{property.size_m2 || property.features?.size_m2 || '-'}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 text-white/40">M² CONSTR.</p>
                        </div>
                    </div>

                    {/* Bottom Status Branding */}
                    <div className="w-full py-8 border-t border-white/10 text-center">
                         <span className="text-[11px] font-black text-white/40 tracking-[0.6em] uppercase">ALROS PRO</span>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="flex-none flex justify-between items-center h-[200px] px-10 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-12">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xl">
                        <QRCodeDynamic size={120} />
                    </div>
                    <div className="flex flex-col gap-4">
                        <EnergyBadge property={property} variant="full" />
                    </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-1">CONOCER MÁS · LEARN MORE</p>
                    <p className="text-5xl font-black text-slate-900 tracking-tighter">+34 691 687 316</p>
                    <p className="text-xl font-bold text-[#831832] tracking-[0.4em] uppercase">alros.eu</p>
                </div>
            </div>

            {/* Legal */}
            <div className="absolute bottom-4 left-10 w-[55%] pointer-events-none">
                <LegalFooter variant="light" compact={false} />
            </div>
        </div>
    );
}
