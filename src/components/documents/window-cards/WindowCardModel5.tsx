import React from 'react';
import { BedDouble, Bath, Maximize, MapPin, CheckCircle } from "lucide-react";
import QRCodeDynamic from "@/components/properties/QRCodeDynamic";
import { LegalFooter } from "./LegalFooter";
import { EnergyBadge } from "./EnergyBadge";

interface WindowCardProps {
    property: any;
    images: string[];
}

/**
 * Modelo 5 — "Diamante Luminoso"
 * Diseño exquisito y luminoso. Predominio blanco con acentos elegantes.
 * 3 fotos mínimas, lujo sutil, máxima legibilidad.
 */
export function WindowCardModel5({ property, images }: WindowCardProps) {
    const opLabel = (property.operation_type || 'venta').toLowerCase().includes('alquiler') ? 'ALQUILER · RENT' : 'VENTA · SALE';

    return (
        <div className="flex flex-col h-full bg-slate-50 relative p-0 m-0 border-[8px] border-white shadow-inner z-0 overflow-hidden font-sans">
            
            {/* TOP HEADER - VERY CLEAN */}
            <div className="flex-none h-[12%] bg-white w-full border-b border-slate-100 flex items-center justify-between px-16 z-20 shadow-sm relative">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-400 via-[#831832] to-amber-400" />
                
                {/* Logo */}
                <div className="flex items-center gap-6">
                    <img src="/logo-print.png" className="h-16 w-auto object-contain drop-shadow-md brightness-0" alt="Alros Investments" />
                    <div className="h-10 w-px bg-slate-200" />
                    <div className="flex items-center gap-2 text-[#831832]">
                        <CheckCircle size={16} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Premium Selection</span>
                    </div>
                </div>

                {/* Status & Ref */}
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">REFERENCIA</p>
                        <p className="text-xl font-black text-slate-900 tracking-wider font-mono">
                            REF: {property.reference_id || property.id.split('-')[0].toUpperCase()}
                        </p>
                    </div>
                    <div className="bg-[#831832] text-white px-8 py-3 rounded-full shadow-[0_4px_15px_rgba(131,24,50,0.3)] border-[3px] border-white">
                        <span className="text-sm font-black uppercase tracking-[0.3em]">{opLabel}</span>
                    </div>
                </div>
            </div>

            {/* MIDDLE SECTION - IMAGES */}
            <div className="flex-none h-[40%] w-full flex p-8 gap-6 z-10">
                {/* Main Hero Photo */}
                <div className="flex-[2] h-full rounded-2xl overflow-hidden shadow-xl border border-white relative group bg-white">
                    <div className="absolute inset-0 border-4 border-white z-10 rounded-2xl pointer-events-none" />
                    <img src={images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                    <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-white/50 z-20">
                        <div className="flex items-center gap-2">
                            <MapPin size={20} className="text-[#831832]" strokeWidth={2.5} />
                            <span className="text-lg font-black uppercase tracking-[0.2em] text-slate-800">{property.city}</span>
                        </div>
                    </div>
                </div>

                {/* Secondary Photos Column */}
                <div className="flex-1 h-full flex flex-col gap-6">
                    <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-white relative bg-white">
                        <div className="absolute inset-0 border-4 border-white z-10 rounded-2xl pointer-events-none" />
                        <img src={images[1] || images[0]} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" alt="" />
                    </div>
                    <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-white relative bg-white">
                        <div className="absolute inset-0 border-4 border-white z-10 rounded-2xl pointer-events-none" />
                        <img src={images[2] || images[0]} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" alt="" />
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION - INFO & MORE */}
            <div className="flex-1 w-full bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-slate-100 px-12 pt-8 pb-14 flex flex-col justify-between relative z-20">
                
                {/* Title & Price Row */}
                <div className="flex justify-between items-start gap-8">
                    <div className="flex-1">
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-[1] mb-6 italic drop-shadow-sm line-clamp-2">
                            {property.title_en || property.title}
                        </h1>
                        
                        <div className="flex gap-4 items-center">
                            {[
                                { icon: <BedDouble size={28} />, value: property.bedrooms || property.features?.bedrooms || '-', label: 'Dormitorios' },
                                { icon: <Bath size={28} />, value: property.bathrooms || property.features?.bathrooms || '-', label: 'Baños' },
                                { icon: <Maximize size={28} />, value: property.size_m2 || property.features?.size_m2 || '-', label: 'M² Const.' }
                            ].map((f, i) => (
                                <div key={i} className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
                                    <div className="text-[#831832] bg-white p-3 rounded-full shadow-sm">{f.icon}</div>
                                    <div className="text-center">
                                        <span className="block text-2xl font-black text-slate-900 leading-none">{f.value}</span>
                                        <span className="block text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">{f.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Tag */}
                    <div className="w-[30%] shrink-0 flex flex-col items-end">
                         <div className="bg-[#831832] w-full text-center py-6 rounded-[2rem] shadow-[10px_10px_30px_rgba(131,24,50,0.2)] border border-[#831832]/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10" />
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.5em] mb-1 leading-none relative z-10">PRECIO DE INVERSIÓN</p>
                            <p className="text-4xl font-black tracking-tighter text-white leading-none relative z-10">
                                {Number(property.price).toLocaleString('de-DE')} €
                            </p>
                         </div>
                    </div>
                </div>

                {/* Footer Data Row */}
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                    
                    <div className="flex items-center gap-6">
                        {/* QR Code */}
                        <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                            <QRCodeDynamic size={70} />
                            <div className="hidden xl:block pr-2">
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none mb-1 text-right">Escanear ID</p>
                                <p className="text-xs text-slate-800 font-black uppercase tracking-tight text-right">Más<br/>Info</p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-col gap-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">CONTACTO DIRECTO</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">+34 691 687 316</p>
                            <p className="text-xs font-black text-[#831832] tracking-[0.4em] uppercase">alros.eu</p>
                        </div>
                    </div>

                    {/* Energy */}
                    <div className="shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                        <EnergyBadge property={property} variant="inline" dark={false} />
                    </div>
                </div>

            </div>

            {/* Absolute Legal Footer */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center w-full z-30 pointer-events-none px-10">
                <LegalFooter variant="light" compact={true} />
            </div>

        </div>
    );
}
