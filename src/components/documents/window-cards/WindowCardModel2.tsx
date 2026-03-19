import React from 'react';
import { BedDouble, Bath, Maximize, MapPin } from "lucide-react";
import QRCodeDynamic from "@/components/properties/QRCodeDynamic";
import { LegalFooter } from "./LegalFooter";
import { EnergyBadge } from "./EnergyBadge";

interface WindowCardProps {
    property: any;
    images: string[];
}

/**
 * Modelo 2 — "Rejilla Dinámica"
 * Rejilla de fotos arriba, barra de color, info abajo.
 * CORREGIDO: eficiencia NO pisa otra info. Legal añadido.
 */
export function WindowCardModel2({ property, images }: WindowCardProps) {
    const opLabel = (property.operation_type || 'venta').toLowerCase().includes('alquiler') ? 'Alquiler · Rent' : 'Venta · Sale';

    return (
        <div className="flex flex-col h-full bg-white relative p-0 m-0 box-border">
            {/* Top Grid Images */}
            <div className="flex-none h-[48%] flex">
                <div className="w-[68%] h-full p-4 pr-2 pb-2">
                    <div className="w-full h-full relative overflow-hidden bg-slate-100 shadow-xl group">
                        <img src={images[0]} className="w-full h-full object-cover rounded-tl-xl transition-transform duration-700 group-hover:scale-105" alt="" />
                        <div className="absolute top-8 left-8 drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)]">
                            <img src="/logo-print.png" className="h-14 w-auto object-contain brightness-0 invert" alt="Alros Investments" />
                        </div>
                        <div className="absolute top-8 right-8 bg-[#831832] text-white px-6 py-3 rounded-sm shadow-2xl">
                            <span className="text-lg font-black uppercase tracking-[0.2em]">{opLabel}</span>
                        </div>
                    </div>
                </div>
                <div className="w-[32%] h-full flex flex-col pt-4 pr-4 pl-2 pb-2">
                    <div className="flex-1 pb-2">
                        <div className="w-full h-full relative overflow-hidden rounded-tr-xl shadow-xl">
                            <img src={images[1] || images[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                    </div>
                    <div className="flex-1 pt-2 relative">
                        <div className="w-full h-full relative overflow-hidden shadow-xl rounded-br-sm">
                            <img src={images[2] || images[0]} className="w-full h-full object-cover" alt="" />
                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-sm text-xs uppercase font-black tracking-[0.2em] border border-white/10">
                                REF: {property.reference_id || property.id.split('-')[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Accent Bar */}
            <div className="h-6 w-full bg-[#831832] shadow-lg relative z-10">
                <div className="absolute right-10 top-1/2 -translate-y-1/2 h-1.5 w-32 bg-white/20 rounded-full" />
            </div>

            {/* Bottom Info */}
            <div className="flex-1 flex p-8 px-10 gap-12 bg-slate-50">
                
                {/* Left: Text Info */}
                <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-[1.0] mb-3 line-clamp-2 drop-shadow-sm">
                        {property.title_en || property.title}
                    </h2>
                    <div className="flex items-center gap-3 text-slate-500 mb-6">
                        <div className="p-2 bg-[#831832]/10 rounded-lg">
                            <MapPin size={24} className="text-[#831832]" strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black uppercase tracking-[0.3em]">{property.city}</span>
                    </div>

                    {/* Features Boxes */}
                    <div className="flex gap-4">
                        {[
                            { icon: <BedDouble size={32} />, value: property.bedrooms || property.features?.bedrooms || '-', label: 'Dorm · Bed' },
                            { icon: <Bath size={32} />, value: property.bathrooms || property.features?.bathrooms || '-', label: 'Baños · Bath' },
                            { icon: <Maximize size={32} />, value: property.size_m2 || property.features?.size_m2 || '-', label: 'M² Const.' }
                        ].map((f, i) => (
                            <div key={i} className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-xl border-b-4 border-b-slate-100">
                                <div className="text-[#831832] opacity-80">{f.icon}</div>
                                <div>
                                    <span className="block text-3xl font-black text-slate-900 leading-none">{f.value}</span>
                                    <span className="block text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">{f.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px bg-slate-200 my-4 h-auto shadow-sm"></div>

                {/* Right: Price, Energy, Contact, QR */}
                <div className="w-[36%] flex flex-col items-center justify-between py-2">
                    
                    {/* Price Block */}
                    <div className="w-full bg-white border-4 border-[#831832] rounded-2xl py-4 shadow-2xl relative overflow-hidden group flex flex-col items-center justify-center">
                        <div className="absolute top-0 left-0 w-full h-[6px] bg-[#831832]" />
                        <div className="absolute top-0 left-5 bg-[#831832] text-white px-4 py-1 text-[11px] font-black uppercase tracking-widest rounded-b-lg shadow-md">
                            Precio · Price
                        </div>
                        <span className="text-4xl font-black text-[#831832] tracking-tighter leading-none mt-2">
                            {Number(property.price).toLocaleString('de-DE')} €
                        </span>
                    </div>

                    {/* Energy & Contact */}
                    <div className="w-full flex items-center justify-between gap-8 my-2">
                         <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex-1 flex justify-center">
                            <EnergyBadge property={property} variant="full" />
                         </div>
                         <div className="flex flex-col items-end flex-1">
                            <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">+34 691 687 316</p>
                            <p className="text-sm font-black text-[#831832] uppercase tracking-[0.4em] leading-none">alros.eu</p>
                         </div>
                    </div>

                    {/* QR Code */}
                    <div className="w-full flex items-center gap-6 bg-slate-900 p-3 rounded-2xl shadow-2xl border border-white/5">
                        <div className="flex-1 text-left">
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none mb-1">Escanear para más info</p>
                            <p className="text-xs text-white/80 font-bold leading-tight">Scan for full details & more photos</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg shrink-0">
                            <QRCodeDynamic size={70} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Footer Overlay */}
            <div className="px-10 pb-4 pt-4 bg-white flex items-center justify-between border-t border-slate-200">
                <div className="max-w-[75%]">
                    <LegalFooter variant="light" compact={false} />
                </div>
                <p className="text-[10px] font-black text-slate-300 tracking-[0.5em] uppercase">ALROS MODERN</p>
            </div>
        </div>
    );
}
