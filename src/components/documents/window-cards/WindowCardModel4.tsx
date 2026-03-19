import React from 'react';
import { BedDouble, Bath, Maximize, MapPin, CheckCircle2 } from "lucide-react";
import QRCodeDynamic from "@/components/properties/QRCodeDynamic";
import { LegalFooter } from "./LegalFooter";
import { EnergyBadge } from "./EnergyBadge";

interface WindowCardProps {
    property: any;
    images: string[];
}

/**
 * Modelo 4 — "Split Magazine"
 * Mitad foto, mitad información. Estilo editorial de lujo.
 * Muy limpio y profesional.
 */
export function WindowCardModel4({ property, images }: WindowCardProps) {
    const opLabel = (property.operation_type || 'venta').toLowerCase().includes('alquiler') ? 'En Alquiler · Long Term Rent' : 'En Venta · For Sale';

    return (
        <div className="flex h-full bg-white relative font-serif p-0 m-0">
            {/* LEFT SIDE: THE IMAGE */}
            <div className="w-[52%] h-full relative p-6">
                <div className="w-full h-full relative overflow-hidden rounded-sm shadow-2xl">
                    <img src={images[0]} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Alros Floating Logo */}
                    <div className="absolute top-10 left-10">
                        <img src="/logo-print.png" className="h-24 w-auto brightness-0 invert drop-shadow-xl" alt="" />
                    </div>

                    {/* Image Caption/Ref */}
                    <div className="absolute bottom-10 left-10">
                        <p className="text-white/80 font-sans text-xs uppercase font-black tracking-[0.5em] mb-1">REFERENCE CODE</p>
                        <p className="text-white font-sans text-2xl font-black tracking-widest uppercase">
                            {property.reference_id || property.id.split('-')[0].toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: THE CONTENT */}
            <div className="w-[48%] h-full flex flex-col pt-10 px-10 pb-6 bg-slate-50 border-l border-slate-200">
                
                {/* Header Info */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                         <span className="h-px flex-1 bg-slate-200" />
                         <span className="text-[#831832] font-sans font-black text-sm uppercase tracking-[0.6em] text-center">{opLabel}</span>
                         <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    
                    <h1 className="text-5xl font-black text-slate-900 leading-[1.05] uppercase tracking-tighter mb-4 italic font-sans lg:line-clamp-3">
                        {property.title_en || property.title}
                    </h1>
                    
                    <div className="flex items-center gap-4 text-slate-500 font-sans">
                        <MapPin size={28} className="text-[#831832]" strokeWidth={2} />
                        <span className="text-2xl font-bold uppercase tracking-[0.3em]">{property.city}</span>
                    </div>
                </div>

                {/* Main Stats Block */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 border border-slate-200 shadow-xl rounded-sm flex flex-col items-center">
                        <p className="font-sans text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Investment Price</p>
                        <p className="font-sans text-5xl font-black text-[#831832] tracking-tighter">
                            {Number(property.price).toLocaleString('de-DE')} €
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 size={16} />
                            <span className="font-sans text-[9px] font-black uppercase tracking-widest">Available Now</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col justify-center gap-6 pl-4">
                        <div className="flex items-center gap-4">
                            <BedDouble size={28} className="text-slate-400" strokeWidth={1.5} />
                            <span className="font-sans text-2xl font-black text-slate-800">{property.bedrooms || '-'} <small className="text-xs font-bold text-slate-400">Dorm · Bed</small></span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Bath size={28} className="text-slate-400" strokeWidth={1.5} />
                            <span className="font-sans text-2xl font-black text-slate-800">{property.bathrooms || '-'} <small className="text-xs font-bold text-slate-400">Baños · Bath</small></span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Maximize size={28} className="text-slate-400" strokeWidth={1.5} />
                            <span className="font-sans text-2xl font-black text-slate-800">{property.size_m2 || '-'} <small className="text-xs font-bold text-slate-400">M² Const.</small></span>
                        </div>
                    </div>
                </div>

                {/* Secondary Photos Row */}
                <div className="flex gap-4 mb-auto h-40">
                    <div className="flex-1 rounded-sm overflow-hidden border border-slate-200 shadow-lg transition-all duration-500">
                        <img src={images[1] || images[0]} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 rounded-sm overflow-hidden border border-slate-200 shadow-lg transition-all duration-500">
                        <img src={images[2] || images[0]} className="w-full h-full object-cover" alt="" />
                    </div>
                </div>

                {/* Contact Footer */}
                <div className="pt-6 border-t border-slate-200 flex items-center justify-between font-sans">
                    <div className="flex flex-col gap-4">
                        <EnergyBadge property={property} variant="full" />
                        <div className="text-left">
                            <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">+34 691 687 316</p>
                            <p className="text-lg font-bold text-[#831832] tracking-[0.3em] uppercase leading-none">alros.eu</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="hidden xl:block text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Scan for more</p>
                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">Full property file</p>
                        </div>
                        <div className="bg-white p-3 rounded-sm border border-slate-200 shadow-xl">
                            <QRCodeDynamic size={110} />
                        </div>
                    </div>
                </div>

                {/* Legal Footer Section */}
                <div className="mt-6 pt-3 border-t border-slate-100">
                    <LegalFooter variant="light" compact={true} />
                </div>
            </div>

            {/* Absolute Brand Label */}
            <div className="absolute top-10 right-10 pointer-events-none">
                 <span className="text-[10px] font-black text-slate-300 tracking-[0.8em] uppercase rotate-90 origin-right">ALROS MAGAZINE</span>
            </div>
        </div>
    );
}
