'use client';

import { useState, useEffect } from "react";
import { UserPlus, Shield, User, Mail, Phone, Trash2, ShieldAlert, Edit2, Check, X, Loader2, Key } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { createAgentAction } from "./actions";

export default function AgentesManagementPage() {
    const supabase = createClient();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [isCheckingRole, setIsCheckingRole] = useState(true);

    // Editing states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Modal/New Member states
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [newMemberForm, setNewMemberForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'agente'
    });
    const [isCreating, setIsCreating] = useState(false);

    const fetchProfiles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) setProfiles(data);
        setLoading(false);
    };

    const checkCurrentUser = async () => {
        setIsCheckingRole(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setCurrentUserProfile(profile);
        }
        setIsCheckingRole(false);
    };

    useEffect(() => {
        fetchProfiles();
        checkCurrentUser();
    }, []);

    const handleUpdateRole = async (id: string, newRole: string) => {
        if (currentUserProfile?.role !== 'admin') {
            return alert("No tienes permisos para cambiar roles.");
        }
        
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', id);
        
        if (error) {
            alert("Error actualizando rol: " + error.message);
        } else {
            fetchProfiles();
        }
    };

    const startEditing = (profile: any) => {
        setEditingId(profile.id);
        setEditForm({
            first_name: profile.first_name || '',
            last_name: profile.last_name || ''
        });
    };

    const saveProfile = async (id: string) => {
        setIsSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: editForm.first_name,
                last_name: editForm.last_name
            })
            .eq('id', id);

        if (error) {
            alert("Error al guardar: " + error.message);
        } else {
            setEditingId(null);
            fetchProfiles();
        }
        setIsSaving(false);
    };

    const handleCreateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        const formData = new FormData();
        formData.append('email', newMemberForm.email);
        formData.append('password', newMemberForm.password);
        formData.append('first_name', newMemberForm.first_name);
        formData.append('last_name', newMemberForm.last_name);
        formData.append('role', newMemberForm.role);

        const result = await createAgentAction(formData);

        if (result.error) {
            alert(result.error);
        } else {
            setIsAddingMember(false);
            setNewMemberForm({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                role: 'agente'
            });
            fetchProfiles();
        }
        setIsCreating(false);
    };

    const handleDeleteProfile = async (id: string) => {
        if (id === currentUserProfile?.id) return alert("No puedes eliminarte a ti mismo.");
        if (!confirm("¿Estás seguro de quitar a este miembro del equipo? Esto no borrará su cuenta de acceso, pero le quitará sus permisos.")) return;

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);
        
        if (error) {
            alert("Error al eliminar: " + error.message);
        } else {
            fetchProfiles();
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black tracking-tight uppercase italic mb-2">
                        Gestión de <span className="text-[#831832]">Equipo</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Administra nombres, roles y permisos del personal.</p>
                </div>
                
                <div className="flex gap-4 relative z-10 w-full md:w-auto">
                    {currentUserProfile?.role === 'admin' && (
                        <button 
                            onClick={() => setIsAddingMember(true)}
                            className="bg-[#831832] hover:bg-[#a11d3e] text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
                        >
                            <UserPlus size={20} />
                            Añadir Miembro
                        </button>
                    )}
                </div>

                <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-[#831832]/20 rounded-full blur-[80px]" />
            </div>

            {currentUserProfile?.role !== 'admin' && (
                <div className="bg-red-50 border border-red-200 p-6 rounded-3xl flex gap-4 items-center">
                    <ShieldAlert className="text-red-600" size={24} />
                    <p className="text-red-800 font-bold">MODO LECTURA: Solo los administradores pueden realizar cambios sensibles.</p>
                </div>
            )}

            {/* List of Users */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-3xl" />
                    ))
                ) : (
                    <>
                        {profiles.map((profile) => (
                            <div key={profile.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all relative group flex flex-col min-h-[280px]">
                                
                                {/* Status & Role Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-2xl shadow-lg ${
                                        profile.role === 'admin' 
                                            ? 'bg-gradient-to-br from-[#831832] to-[#4c0d1d] text-white shadow-red-100' 
                                            : 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-blue-100'
                                    }`}>
                                        {profile.role === 'admin' ? <Shield size={20} /> : <User size={20} />}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${
                                            profile.role === 'admin' 
                                                ? 'bg-red-50 text-[#831832] border-red-100' 
                                                : 'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                            {profile.role}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Info Section */}
                                <div className="space-y-4 mb-6 flex-1">
                                    {editingId === profile.id ? (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <input 
                                                autoFocus
                                                type="text" 
                                                placeholder="Nombre"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#831832] outline-none font-bold"
                                                value={editForm.first_name}
                                                onChange={e => setEditForm({...editForm, first_name: e.target.value})}
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Apellidos"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#831832] outline-none font-bold"
                                                value={editForm.last_name}
                                                onChange={e => setEditForm({...editForm, last_name: e.target.value})}
                                            />
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => saveProfile(profile.id)}
                                                    disabled={isSaving}
                                                    className="flex-1 bg-[#831832] text-white py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                                                >
                                                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} /> Guardar</>}
                                                </button>
                                                <button 
                                                    onClick={() => setEditingId(null)}
                                                    className="px-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className={`text-lg font-black leading-tight mb-1 truncate ${(!profile.first_name && !profile.last_name) ? 'text-slate-300 italic' : 'text-slate-900'}`}>
                                                        {profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}` : 'Identidad Pendiente'}
                                                    </h3>
                                                    {profile.id === currentUserProfile?.id && (
                                                        <span className="inline-block text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
                                                            Este eres tú
                                                        </span>
                                                    )}
                                                </div>
                                                {currentUserProfile?.role === 'admin' && (
                                                    <button onClick={() => startEditing(profile)} className="p-2 text-slate-300 hover:text-[#831832] transition-colors rounded-xl hover:bg-slate-50">
                                                        <Edit2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 text-slate-500">
                                                    <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                                        <Mail size={12} className="shrink-0" />
                                                    </div>
                                                    <span className="text-[11px] font-bold truncate tracking-tight">{profile.email}</span>
                                                </div>
                                                {profile.phone && (
                                                    <div className="flex items-center gap-3 text-slate-500">
                                                        <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                                            <Phone size={12} className="shrink-0" />
                                                        </div>
                                                        <span className="text-[11px] font-bold tracking-tight">{profile.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Footer Actions */}
                                <div className="pt-6 border-t border-slate-50 flex justify-between items-center gap-4 mt-auto">
                                    <button 
                                        disabled={currentUserProfile?.role !== 'admin' || profile.id === currentUserProfile?.id}
                                        onClick={() => handleUpdateRole(profile.id, profile.role === 'admin' ? 'agente' : 'admin')}
                                        className="text-[10px] font-black text-slate-400 hover:text-slate-900 flex items-center gap-2 transition-all disabled:opacity-0 group-hover:disabled:opacity-20"
                                    >
                                        <Key size={12} />
                                        CAMBIAR ROL
                                    </button>
                                    
                                    {currentUserProfile?.role === 'admin' && profile.id !== currentUserProfile?.id && (
                                        <button 
                                            onClick={() => handleDeleteProfile(profile.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Modal para añadir miembro */}
            {isAddingMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddingMember(false)} />
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 uppercase italic">Nuevo <span className="text-[#831832]">Miembro</span></h2>
                            <button onClick={() => setIsAddingMember(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleCreateMember} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#831832] outline-none"
                                        value={newMemberForm.first_name}
                                        onChange={e => setNewMemberForm({...newMemberForm, first_name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Apellidos</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#831832] outline-none"
                                        value={newMemberForm.last_name}
                                        onChange={e => setNewMemberForm({...newMemberForm, last_name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        required
                                        type="email" 
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#831832] outline-none"
                                        value={newMemberForm.email}
                                        onChange={e => setNewMemberForm({...newMemberForm, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        required
                                        type="password" 
                                        placeholder="Min. 6 caracteres"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#831832] outline-none"
                                        value={newMemberForm.password}
                                        onChange={e => setNewMemberForm({...newMemberForm, password: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Rol Asignado</label>
                                <select 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#831832] outline-none appearance-none"
                                    value={newMemberForm.role}
                                    onChange={e => setNewMemberForm({...newMemberForm, role: e.target.value})}
                                >
                                    <option value="agente">Agente (Comercial)</option>
                                    <option value="admin">Administrador (Control Total)</option>
                                </select>
                            </div>

                            <button 
                                disabled={isCreating}
                                type="submit"
                                className="w-full bg-[#831832] hover:bg-[#a11d3e] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#831832]/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isCreating ? <Loader2 className="animate-spin" size={20} /> : "Crear Cuenta de Miembro"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Admin notice */}
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex gap-4 items-start">
                <ShieldAlert className="text-amber-600 shrink-0" size={24} />
                <div className="text-sm text-amber-800">
                    <p className="font-bold mb-1">Nota del Sistema:</p>
                    <p className="opacity-80 underline">Importante</p>
                    <p className="opacity-80">Si al crear el usuario da un error de "E-mail confirmation", debes entrar en tu panel de Supabase y desactivar la opción "Confirm email" en la configuración de Autenticación.</p>
                </div>
            </div>
        </div>
    );
}
