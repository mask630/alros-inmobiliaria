"use client";

import { useState, useEffect } from "react";
import {
    User, Mail, Phone, MapPin,
    Lock, Bell, Palette, Save,
    CheckCircle2, Building2,
    Globe, Shield, FileText, Loader2,
    AlertCircle, History, Clock
} from "lucide-react";
import { 
    getAgencySettings, 
    updateAgencySettings, 
    updateProfile, 
    changePassword 
} from "./actions";
import { supabase } from "@/lib/supabase";

type Tab = 'perfil' | 'empresa' | 'contratos' | 'seguridad' | 'actividad';

export default function ConfigPage() {
    const [activeTab, setActiveTab] = useState<Tab>('perfil');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Profile State
    const [profile, setProfile] = useState({
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });

    // Agency State
    const [agency, setAgency] = useState({
        id: '',
        company_name: '',
        company_email: '',
        company_phone: '',
        company_website: '',
        company_address: '',
        legal_representative: '',
        default_commission_percentage: 5,
        default_deposit_months: 1
    });

    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Load User Profile
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    
                    if (profileData) {
                        setProfile({
                            id: profileData.id,
                            first_name: profileData.first_name || '',
                            last_name: profileData.last_name || '',
                            email: user.email || '',
                            phone: profileData.phone || ''
                        });
                    }
                }

                // Load Agency Settings
                const result = await getAgencySettings();
                if (result.data) {
                    setAgency({
                        id: result.data.id,
                        company_name: result.data.company_name || 'Alros Investments S.L.',
                        company_email: result.data.company_email || '',
                        company_phone: result.data.company_phone || '',
                        company_website: result.data.company_website || 'https://alros-inmobiliaria.com',
                        company_address: result.data.company_address || '',
                        legal_representative: result.data.legal_representative || '',
                        default_commission_percentage: result.data.default_commission_percentage || 5,
                        default_deposit_months: result.data.default_deposit_months || 1
                    });
                }
            } catch (err) {
                console.error(err);
                setError("Error al cargar la configuración");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);
    const handleCancel = () => {
        window.location.href = '/admin'; 
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSaved(false);

        try {
            if (activeTab === 'perfil') {
                const res = await updateProfile({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    phone: profile.phone
                });
                if (res.error) throw new Error(res.error);
            } else if (activeTab === 'empresa' || activeTab === 'contratos') {
                const res = await updateAgencySettings(agency);
                if (res.error) throw new Error(res.error);
            } else if (activeTab === 'seguridad') {
                if (passwords.new) {
                    if (passwords.new !== passwords.confirm) {
                        throw new Error("Las contraseñas no coinciden");
                    }
                    if (passwords.new.length < 6) {
                        throw new Error("La contraseña debe tener al menos 6 caracteres");
                    }
                    const res = await changePassword(passwords.new);
                    if (res.error) throw new Error(res.error);
                    setPasswords({ new: '', confirm: '' });
                }
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-slate-500 font-medium whitespace-nowrap">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl pb-20">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
                <p className="text-slate-500 mt-2">Gestiona las preferencias generales, perfil y apariencia de la plataforma.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Menu (Left/Top on Mobile) */}
                <div className="lg:col-span-1">
                    <div className="relative">
                        {/* Mobile Fade Overlays */}
                        <div className="lg:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
                        <div className="lg:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
                        
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-1.5 flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar snap-x">
                            <TabButton 
                                active={activeTab === 'perfil'} 
                                onClick={() => setActiveTab('perfil')} 
                                icon={<User size={18} />} 
                                label="Mi Perfil" 
                            />
                            <TabButton 
                                active={activeTab === 'empresa'} 
                                onClick={() => setActiveTab('empresa')} 
                                icon={<Building2 size={18} />} 
                                label="Empresa" 
                            />
                            <TabButton 
                                active={activeTab === 'contratos'} 
                                onClick={() => setActiveTab('contratos')} 
                                icon={<FileText size={18} />} 
                                label="Agencia" 
                            />
                            <TabButton 
                                active={activeTab === 'seguridad'} 
                                onClick={() => setActiveTab('seguridad')} 
                                icon={<Lock size={18} />} 
                                label="Seguridad" 
                            />
                            <TabButton 
                                active={activeTab === 'actividad'} 
                                onClick={() => setActiveTab('actividad')} 
                                icon={<History size={18} />} 
                                label="Actividad" 
                            />
                        </div>
                    </div>
                </div>

                {/* Settings Content (Right) */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Section 1: Mi Perfil */}
                    {activeTab === 'perfil' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <User className="text-blue-500" size={20} />
                                    Información Personal
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Actualiza tus datos de contacto y representación.
                                </p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Nombre</label>
                                        <input
                                            type="text"
                                            value={profile.first_name}
                                            onChange={e => setProfile({...profile, first_name: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Apellidos</label>
                                        <input
                                            type="text"
                                            value={profile.last_name}
                                            onChange={e => setProfile({...profile, last_name: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Correo Electrónico (Solo Lectura)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                readOnly
                                                value={profile.email}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed text-slate-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Teléfono Personal</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                onChange={e => setProfile({...profile, phone: e.target.value})}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                                                placeholder="Ej: 600 000 000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 2: Datos de la Empresa */}
                    {activeTab === 'empresa' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Building2 className="text-blue-500" size={20} />
                                    Datos de la Empresa
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Esta información se utiliza en los documentos y la web pública.
                                </p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-slate-700">Nombre de la Empresa</label>
                                        <input
                                            type="text"
                                            value={agency.company_name}
                                            onChange={e => setAgency({...agency, company_name: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Email de Contacto</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                value={agency.company_email}
                                                onChange={e => setAgency({...agency, company_email: e.target.value})}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Teléfono Público</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                value={agency.company_phone}
                                                onChange={e => setAgency({...agency, company_phone: e.target.value})}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Sitio Web</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input
                                                type="url"
                                                value={agency.company_website}
                                                onChange={e => setAgency({...agency, company_website: e.target.value})}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-slate-700">Dirección Principal</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={agency.company_address}
                                                onChange={e => setAgency({...agency, company_address: e.target.value})}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 3: Ajustes de Agencia y Contratos */}
                    {activeTab === 'contratos' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <FileText className="text-blue-500" size={20} />
                                    Honorarios y Representación
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Configura los valores por defecto para generar autorizaciones y contratos.
                                </p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Honorarios de Agencia (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={agency.default_commission_percentage}
                                                onChange={e => setAgency({...agency, default_commission_percentage: parseFloat(e.target.value)})}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                                            />
                                            <span className="absolute right-4 top-3 text-slate-400 font-bold">%</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Valor predeterminado al crear contratos de venta.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Meses Depósito (Alquiler)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={agency.default_deposit_months}
                                                onChange={e => setAgency({...agency, default_deposit_months: parseInt(e.target.value)})}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-slate-700">Representante Legal (Contratos)</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Juan Pérez - CIF: B12345678"
                                            value={agency.legal_representative}
                                            onChange={e => setAgency({...agency, legal_representative: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                                        />
                                        <p className="text-xs text-slate-500">Esta persona aparecerá como la parte firmante por parte de la agencia en los documentos automatizados.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 4: Seguridad */}
                    {activeTab === 'seguridad' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Shield className="text-red-500" size={20} />
                                        Seguridad
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Cambia tu contraseña de acceso.
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            value={passwords.new}
                                            onChange={e => setPasswords({...passwords, new: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Confirmar Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            placeholder="Repite la contraseña"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 5: Actividad */}
                    {activeTab === 'actividad' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <History className="text-blue-600" size={20} />
                                        Registro de Actividad
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Historial completo de acciones realizadas en el sistema.
                                    </p>
                                </div>
                            </div>
                            <div className="p-2 max-h-[600px] overflow-y-auto">
                                <ActivityList />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in zoom-in duration-300">
                            <AlertCircle size={20} />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {/* Actions Box */}
                    <div className="flex items-center justify-end gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        {saved && (
                            <span className="text-green-600 font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                <CheckCircle2 size={18} />
                                Cambios guardados correctamente
                            </span>
                        )}
                        <button 
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2.5 px-6 py-3 lg:px-4 lg:py-3.5 text-sm lg:text-base font-bold transition-all whitespace-nowrap lg:w-full lg:text-left rounded-xl ${
                active 
                    ? 'bg-[#831832] text-white shadow-lg shadow-red-900/20' 
                    : 'text-slate-500 hover:bg-slate-50 lg:hover:text-[#831832]'
            }`}
        >
            <span className={active ? 'scale-110' : ''}>{icon}</span>
            {label}
        </button>
    );
}

function ActivityList() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            const { data, error } = await supabase
                .from('audit_logs')
                .select(`
                    *,
                    profiles:user_id (first_name, last_name)
                `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setLogs(data);
            }
            setLoading(false);
        }

        fetchLogs();
    }, []);

    if (loading) {
        return (
            <div className="p-10 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="font-medium">Cargando historial...</p>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="p-20 text-center text-slate-400">
                <History className="mx-auto mb-4 opacity-20" size={48} />
                <p>No se ha registrado ninguna actividad aún.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-slate-100">
            {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 group">
                    <div className={`p-2 rounded-lg shrink-0 mt-1 ${
                        log.action === 'created' ? 'bg-green-50 text-green-600' :
                        log.action === 'updated' ? 'bg-blue-50 text-blue-600' :
                        log.action === 'deleted' ? 'bg-red-50 text-red-600' :
                        'bg-slate-50 text-slate-600'
                    }`}>
                        {log.action === 'created' ? <CheckCircle2 size={16} /> : 
                         log.action === 'updated' ? <Save size={16} /> : 
                         log.action === 'deleted' ? <AlertCircle size={16} /> : 
                         <Clock size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-900">
                            <span className="font-bold">
                                {(log.profiles as any)?.first_name || 'Sistema'} {(log.profiles as any)?.last_name || ''}
                            </span>
                            {' '}{log.action === 'created' ? 'añadió' : log.action === 'updated' ? 'modificó' : 'eliminó'}{' '}
                            <span className="text-blue-700 font-medium">{log.entity_type === 'property' ? 'la propiedad' : log.entity_type === 'owner' ? 'el propietario' : log.entity_type === 'lead' ? 'el interesado' : 'la configuración'}</span>
                            {' "'}
                            <span className="font-bold italic">{log.entity_name}</span>
                            {'"'}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                                <Clock size={12} /> {new Date(log.created_at).toLocaleString('es-ES', { 
                                    day: '2-digit', month: 'short', 
                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                })}
                            </span>
                            {log.details && (
                                <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[300px]">
                                    {log.details}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
