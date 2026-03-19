"use client";

import { useState, useEffect } from "react";
import { 
    MessageSquare, Plus, Save, Trash2, 
    BookOpen, ShieldCheck, HelpCircle, 
    Sparkles, Info, Loader2, AlertCircle,
    ChevronDown, ChevronUp, Search, Filter
} from "lucide-react";
import { getKnowledge, saveKnowledge, deleteKnowledge } from "./actions";

export default function ChatbotConfigPage() {
    const [knowledge, setKnowledge] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '', category: 'general' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const { data } = await getKnowledge();
        if (data) setKnowledge(data);
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const fd = new FormData();
        if (isEditing) fd.append('id', isEditing);
        fd.append('title', formData.title);
        fd.append('content', formData.content);
        fd.append('category', formData.category);

        const res = await saveKnowledge(fd);
        if (res.success) {
            setFormData({ title: '', content: '', category: 'general' });
            setIsEditing(null);
            loadData();
        } else {
            setError(res.error || "Error al guardar");
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("¿Seguro que quieres eliminar este conocimiento?")) return;
        const res = await deleteKnowledge(id);
        if (res.success) loadData();
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Sparkles className="text-blue-600" size={32} />
                        Configuración del Agente IA
                    </h1>
                    <p className="text-slate-500 font-medium">Entrena a tu asistente virtual con textos y procedimientos personalizados.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Knowledge Form (Sticky) */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                            {isEditing ? <Save className="text-blue-500" /> : <Plus className="text-green-500" />}
                            {isEditing ? 'Editar Conocimiento' : 'Añadir Nuevo Texto'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Título / Pregunta</label>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="Ej: Gastos de Notaría"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
                                <select 
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="general">Cultura e Información General</option>
                                    <option value="venta">Procedimientos de Venta</option>
                                    <option value="alquiler">Procedimientos de Alquiler</option>
                                    <option value="legal">Aspectos Legales y Documentos</option>
                                    <option value="financiero">Financiación e Hipotecas</option>
                                    <option value="servicios">Servicios (Tasación, Seguros, etc.)</option>
                                    <option value="faq">Preguntas Frecuentes (FAQ)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Contenido / Respuesta</label>
                                <textarea 
                                    rows={8}
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                    placeholder="Escribe aquí la información que el bot debe conocer..."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm leading-relaxed"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 italic">Evita incluir datos confidenciales como teléfonos personales de propietarios.</p>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-2">
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                {isEditing && (
                                    <button 
                                        type="button"
                                        onClick={() => { setIsEditing(null); setFormData({title:'', content:'', category:'general'}); }}
                                        className="flex-1 py-3 text-slate-500 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    {isEditing ? 'Guardar Cambios' : 'Añadir Base'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Pro-Tip Box */}
                    <div className="mt-8 bg-blue-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={60} />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Info size={16} /> Tip de Experto
                        </h4>
                        <p className="text-xs text-blue-100 leading-relaxed font-medium">
                            Cuanto más específicos sean tus textos, mejores serán las respuestas del bot. 
                            Usa oraciones simples y claras. El bot también lee automáticamente tus propiedades públicas, 
                            así que no necesitas escribirlas aquí.
                        </p>
                    </div>
                </div>

                {/* Knowledge List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen size={20} className="text-blue-600" />
                                Biblioteca de Conocimientos ({knowledge.length})
                            </h3>
                        </div>

                        {loading ? (
                            <div className="p-20 flex justify-center">
                                <Loader2 className="animate-spin text-blue-200" size={40} />
                            </div>
                        ) : knowledge.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {knowledge.map((item) => (
                                    <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors group">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                                        item.category === 'legal' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                        item.category === 'venta' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                        item.category === 'alquiler' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                        item.category === 'financiero' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                                        item.category === 'servicios' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                        item.category === 'faq' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                        'bg-slate-50 text-slate-600 border border-slate-100'
                                                    }`}>
                                                        {item.category === 'legal' ? 'Legal' : 
                                                         item.category === 'venta' ? 'Venta' : 
                                                         item.category === 'alquiler' ? 'Alquiler' : 
                                                         item.category === 'financiero' ? 'Finanzas' : 
                                                         item.category === 'servicios' ? 'Servicios' : 
                                                         item.category === 'faq' ? 'FAQ' : 'General'}
                                                    </span>
                                                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                                        {item.title}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 italic">
                                                    "{item.content}"
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button 
                                                    onClick={() => {
                                                        setIsEditing(item.id);
                                                        setFormData({ title: item.title, content: item.content, category: item.category });
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center text-slate-400">
                                <MessageSquare className="mx-auto mb-4 opacity-10" size={60} />
                                <p className="font-medium">Tu bot aún no tiene conocimientos personalizados.</p>
                                <p className="text-xs">Empieza añadiendo tu primera guía o FAQ en el formulario lateral.</p>
                            </div>
                        )}
                    </div>

                    {/* Security Info */}
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4">
                        <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-md">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h5 className="font-bold text-emerald-900 mb-1">Capa de Protección Inteligente Activa</h5>
                            <p className="text-sm text-emerald-700 leading-relaxed">
                                El sistema de filtrado RAG está preconfigurado para omitir direcciones exactas y datos de contacto de propietarios, 
                                incluso si los mencionas en tus descripciones de propiedades. Tu privacidad está garantizada por diseño.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
