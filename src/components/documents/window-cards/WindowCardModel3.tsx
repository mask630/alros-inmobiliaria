import React from 'react';
import { BedDouble, Bath, Maximize, MapPin, Star } from "lucide-react";
import QRCodeDynamic from "@/components/properties/QRCodeDynamic";
import { LegalFooter } from "./LegalFooter";
import { EnergyBadge } from "./EnergyBadge";

interface WindowCardProps {
    property: any;
    images: string[];
}

/**
 * Modelo 3 — "Cinematic Impact"
 * Enfoque en retroiluminación. Fondo oscuro, contrastes altos, tipografía neón/blanca.
 * Máximo impacto visual.
 */
export function WindowCardModel3({ property, images }: WindowCardProps) {
    const opLabel = (property.operation_type || 'venta').toLowerCase().includes('alquiler') ? 'ALQUILER · RENT' : 'VENTA · SALE';

    return (
        <div className="flex flex-col h-full bg-black text-white relative font-sans p-0 m-0 overflow-hidden">
            {/* Background Full Bleed Photo */}
            <div className="absolute inset-0 z-0">
                <img src={images[0]} className="w-full h-full object-cover opacity-90" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />
            </div>

            {/* Top Bar Branding */}
            <div className="relative z-10 flex justify-between items-start p-10">
                <div className="flex flex-col gap-2">
                    <img src="/logo-print.png" className="h-20 w-auto brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" alt="" />
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-1.5 w-1.5 bg-[#831832] rounded-full animate-pulse" />
                        <span className="text-[10px] uppercase font-black tracking-[0.5em] text-white/80 drop-shadow-md">Exclusive Listing</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-4">
                    <div className="bg-[#831832] text-white px-8 py-3 rounded-sm shadow-[0_0_30px_rgba(131,24,-50,0.8)] border border-white/20">
                        <span className="text-xl font-black uppercase tracking-[0.3em] drop-shadow-sm">{opLabel}</span>
                    </div>
                    <span className="text-white/80 font-sans text-xs font-black tracking-widest uppercase bg-black/40 px-3 py-1 rounded backdrop-blur-md">Ref. {property.reference_id || property.id.split('-')[0].toUpperCase()}</span>
                </div>
            </div>

            {/* Main Information Center with 2 Extra Photos */}
            <div className="relative z-10 flex-1 flex items-end justify-between px-12 pb-12">
                <div className="max-w-[60%]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                        </div>
                        <span className="h-px w-20 bg-white/40" />
                        <span className="text-xs font-black text-white/90 tracking-[0.5em] uppercase drop-shadow-md">Premium Property</span>
                    </div>
                    <h1 className="text-6xl font-black uppercase tracking-tighter leading-[1] mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] italic text-white line-clamp-2">
                        {property.title_en || property.title}
                    </h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                            <MapPin size={24} className="text-[#831832]" strokeWidth={3} />
                            <span className="text-3xl font-bold uppercase tracking-[0.3em] text-white italic drop-shadow-md">{property.city}</span>
                        </div>
                    </div>
                </div>
                
                {/* Secondary Photos */}
                <div className="flex gap-4 items-end mb-4">
                    <div className="w-48 h-40 rounded-lg overflow-hidden border-4 border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform -rotate-3 hover:rotate-0 transition-transform">
                        <img src={images[1] || images[0]} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="w-48 h-40 rounded-lg overflow-hidden border-4 border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform rotate-3 hover:rotate-0 transition-transform">
                        <img src={images[2] || images[0]} className="w-full h-full object-cover" alt="" />
                    </div>
                </div>
            </div>

            {/* Bottom Panel - Glassmorphism */}
            <div className="relative z-20 h-[240px] bg-white/5 backdrop-blur-3xl border-t border-white/10 flex items-center px-12 gap-12">
                
                {/* Price Label */}
                <div className="flex flex-col">
                    <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.6em] mb-2 leading-none">Investment</span>
                    <p className="text-7xl font-black tracking-tighter text-white leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        {Number(property.price).toLocaleString('de-DE')} €
                    </p>
                </div>

                <div className="h-20 w-px bg-white/10" />

                {/* Characteristics */}
                <div className="flex flex-1 gap-12 justify-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
                            <BedDouble size={36} className="text-white" strokeWidth={1} />
                        </div>
                        <span className="text-3xl font-black leading-none">{property.bedrooms || property.features?.bedrooms || '-'}</span>
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-2">Dormitorios</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
                            <Bath size={36} className="text-white" strokeWidth={1} />
                        </div>
                        <span className="text-3xl font-black leading-none">{property.bathrooms || property.features?.bathrooms || '-'}</span>
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-2">Baños</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
                            <Maximize size={36} className="text-white" strokeWidth={1} />
                        </div>
                        <span className="text-3xl font-black leading-none">{property.size_m2 || property.features?.size_m2 || '-'}</span>
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-2">M² Const.</span>
                    </div>
                </div>

                <div className="h-20 w-px bg-white/10" />

                {/* QR & Legal */}
                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <EnergyBadge property={property} variant="inline" dark />
                        <p className="text-3xl font-black text-white mt-4 tracking-tighter italic">+34 691 687 316</p>
                        <p className="text-sm font-black text-[#831832] uppercase tracking-[0.4em] mt-1">alros.eu</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] ring-4 ring-white/5">
                        <QRCodeDynamic size={110} />
                    </div>
                </div>
            </div>

            {/* Mandatory Legal Footer */}
            <div className="relative z-30 px-12 py-4 bg-black/80 flex justify-between items-center border-t border-white/5">
                <div className="max-w-[70%]">
                    <LegalFooter variant="dark" compact={false} />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-white/20 tracking-[0.5em] uppercase italic">Cinematic Edition</span>
                    <div className="h-6 w-px bg-white/10" />
                    <span className="text-[10px] font-black text-[#831832] tracking-[0.5em] uppercase italic">Alros Investments</span>
                </div>
            </div>
        </div>
    );
}
