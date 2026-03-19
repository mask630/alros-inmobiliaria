'use client';

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FileText, Download, Loader2, Search, Building, User, CreditCard, Euro } from "lucide-react";
import { AuthorizationDocument } from "@/components/documents/AuthorizationDoc";
import { createClient } from "@/utils/supabase/client";

// Import PDFViewer and PDFDownloadLink dynamically to avoid SSR issues
const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="h-[600px] flex items-center justify-center bg-slate-100 rounded-xl"><Loader2 className="animate-spin text-slate-400" /></div>,
    }
);

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <button className="opacity-50 cursor-not-allowed px-4 py-2 bg-slate-200 rounded-lg font-bold">Iniciando...</button>,
    }
);

export default function DocumentsPage() {
    const supabase = createClient();
    const [isClient, setIsClient] = useState(false);
    const [properties, setProperties] = useState<any[]>([]);
    const [loadingProps, setLoadingProps] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        ownerName: "",
        ownerDni: "",
        propertyAddress: "",
        price: "",
        agentName: ""
    });

    useEffect(() => {
        setIsClient(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoadingProps(true);
        // 1. Get current user profile for the agent name
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
                setCurrentUser(profile);
                setFormData(prev => ({ ...prev, agentName: fullName }));
            }
        }

        // 2. Get properties for the selector
        // We join with propietarios to get owner data automatically
        const { data: props } = await supabase
            .from('properties')
            .select('*, propietarios(nombre_completo, documento_identidad)')
            .order('created_at', { ascending: false });
        
        if (props) setProperties(props);
        setLoadingProps(false);
    };

    const handlePropertySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const propId = e.target.value;
        if (!propId) return;

        const prop = properties.find(p => p.id === propId);
        if (prop) {
            setFormData({
                ...formData,
                ownerName: prop.propietarios?.nombre_completo || "",
                ownerDni: prop.propietarios?.documento_identidad || "",
                propertyAddress: `${prop.address || ''}, ${prop.city || ''}`.trim().replace(/^, /, ''),
                price: prop.price?.toString() || ""
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase italic">
                        Generador de <span className="text-[#831832]">Documentos</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">Automatiza contratos y autorizaciones vinculados a tus propiedades.</p>
                </div>
                {formData.agentName && (
                    <div className="bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-slate-400 mr-1">Agente:</span>
                        <span className="text-xs font-bold text-slate-700">{formData.agentName}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Panel: Selection & Editor */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Property Selector */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <h2 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Building size={14} /> Seleccionar Inmueble
                        </h2>
                        <select 
                            onChange={handlePropertySelect}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#831832] outline-none appearance-none"
                        >
                            <option value="">-- Elige una propiedad --</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>
                                    [{p.reference_id || 'SIN REF'}] {p.title.substring(0, 25)}...
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-2 italic">Al seleccionar, los datos se auto-completarán.</p>
                    </div>

                    {/* Editor Form */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <h2 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <FileText size={14} /> Editar Contenido
                        </h2>

                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><User size={10} /> Propietario</label>
                                <input
                                    name="ownerName"
                                    placeholder="Nombre completo"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#831832] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><CreditCard size={10} /> DNI / NIE</label>
                                <input
                                    name="ownerDni"
                                    placeholder="CIF / DNI"
                                    value={formData.ownerDni}
                                    onChange={handleChange}
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#831832] outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><Building size={10} /> Dirección</label>
                                <input
                                    name="propertyAddress"
                                    placeholder="Calle, Número, Localidad"
                                    value={formData.propertyAddress}
                                    onChange={handleChange}
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#831832] outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><Euro size={10} /> Precio (€)</label>
                                <input
                                    name="price"
                                    placeholder="250.000"
                                    value={formData.price}
                                    onChange={handleChange}
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#831832] outline-none"
                                />
                            </div>

                            <div className="pt-4">
                                {isClient && formData.ownerName && (
                                    <PDFDownloadLink
                                        document={<AuthorizationDocument {...formData} />}
                                        fileName={`autorizacion_${formData.ownerName.replace(/\s+/g, '_')}.pdf`}
                                        className="w-full flex items-center justify-center gap-2 bg-[#831832] hover:bg-black text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#831832]/20 transition-all active:scale-95"
                                    >
                                        {({ blob, url, loading, error }) =>
                                            loading ? <Loader2 className="animate-spin" size={20} /> : (
                                                <>
                                                    <Download size={20} />
                                                    Descargar Autorización
                                                </>
                                            )
                                        }
                                    </PDFDownloadLink>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Live Preview */}
                <div className="lg:col-span-3 bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 h-[850px] shadow-2xl relative">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-slate-800/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#831832]" />
                             <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Vista Previa en Tiempo Real</span>
                        </div>
                    </div>
                    {isClient && formData.ownerName ? (
                        <PDFViewer width="100%" height="100%" showToolbar={false} className="border-none">
                            <AuthorizationDocument {...formData} />
                        </PDFViewer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                            <div className="p-8 bg-slate-800/50 rounded-full border border-white/5">
                                <FileText size={64} className="opacity-20 text-white" />
                            </div>
                            <p className="font-bold text-lg">Selecciona una propiedad para previsualizar</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
