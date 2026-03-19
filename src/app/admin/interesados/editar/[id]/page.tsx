"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EditarInteresadoPage() {
    const router = useRouter();
    const params = useParams();
    const leadId = params.id as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre_completo: "",
        telefonos: "",
        emails: "",
        tipo_operacion: "venta",
        presupuesto_maximo: "",
        dormitorios_minimo: "",
        preferencias_zonas: "",
        observaciones: "",
        notas_internas: "",
        urgencia: "Media",
        estado: "Nuevo"
    });

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const { data, error } = await supabase
                    .from('interesados')
                    .select('*')
                    .eq('id', leadId)
                    .single();

                if (error) throw error;
                if (data) {
                    // Normalize phones and emails from potential old single fields or new array fields
                    const telefonosArr = data.telefonos || (data.telefono ? [data.telefono] : []);
                    const emailsArr = data.emails || (data.email ? [data.email] : []);

                    setFormData({
                        nombre_completo: data.nombre_completo || "",
                        telefonos: telefonosArr.join(', '),
                        emails: emailsArr.join(', '),
                        tipo_operacion: data.tipo_operacion || "venta",
                        presupuesto_maximo: data.presupuesto_maximo ? data.presupuesto_maximo.toString() : "",
                        dormitorios_minimo: data.dormitorios_minimo ? data.dormitorios_minimo.toString() : "",
                        preferencias_zonas: data.preferencias_zonas ? data.preferencias_zonas.join(', ') : "",
                        observaciones: data.observaciones || "",
                        notas_internas: data.notas_internas || "",
                        urgencia: data.urgencia || "Media",
                        estado: data.estado || "Nuevo"
                    });
                }
            } catch (err) {
                console.error("Error fetching lead:", err);
                setError("No se pudo cargar el interesado. Puede que haya sido eliminado.");
            } finally {
                setIsLoading(false);
            }
        };

        if (leadId) fetchLead();
    }, [leadId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const zonasArray = formData.preferencias_zonas
            .split(',')
            .map(z => z.trim())
            .filter(z => z.length > 0);

        const telefonosArray = formData.telefonos
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        const emailsArray = formData.emails
            .split(',')
            .map(e => e.trim())
            .filter(e => e.length > 0);

        try {
            const { error: updateError } = await supabase
                .from('interesados')
                .update({
                    nombre_completo: formData.nombre_completo,
                    telefonos: telefonosArray.length > 0 ? telefonosArray : null,
                    emails: emailsArray.length > 0 ? emailsArray : null,
                    tipo_operacion: formData.tipo_operacion,
                    presupuesto_maximo: formData.presupuesto_maximo ? parseFloat(formData.presupuesto_maximo) : null,
                    dormitorios_minimo: formData.dormitorios_minimo ? parseInt(formData.dormitorios_minimo) : null,
                    preferencias_zonas: zonasArray,
                    observaciones: formData.observaciones || null,
                    notas_internas: formData.notas_internas || null,
                    urgencia: formData.urgencia,
                    estado: formData.estado
                })
                .eq('id', leadId);

            if (updateError) throw updateError;

            setSuccessMsg("¡Interesado actualizado correctamente! Redirigiendo al listado...");
            setTimeout(() => {
                router.push('/admin/interesados');
                router.refresh();
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setError("Error al actualizar el interesado. Inténtalo de nuevo.");
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-24 text-slate-400">
                <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/interesados" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Editar Interesado</h1>
                    <p className="text-slate-500">Modifica los detalles o criterios de búsqueda del cliente.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 font-medium">
                    ✅ {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 space-y-8">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Datos Personales</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">Nombre Completo *</label>
                                <input
                                    type="text"
                                    name="nombre_completo"
                                    required
                                    value={formData.nombre_completo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Teléfonos</label>
                                <input
                                    type="text"
                                    name="telefonos"
                                    value={formData.telefonos}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Ej: 600123456, 952000000"
                                />
                                <p className="text-[10px] text-slate-500 italic">Puedes poner varios separados por comas.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Emails</label>
                                <input
                                    type="text"
                                    name="emails"
                                    value={formData.emails}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="correo@ejemplo.com, otro@..."
                                />
                                <p className="text-[10px] text-slate-500 italic">Puedes poner varios separados por comas.</p>
                            </div>
                        </div>
                    </div>

                    {/* Search Criteria */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Criterios de Búsqueda</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Tipo de Operación *</label>
                                <select
                                    name="tipo_operacion"
                                    value={formData.tipo_operacion}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                    <option value="venta">Compra</option>
                                    <option value="alquiler">Alquiler</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Presupuesto Máximo (€)</label>
                                <input
                                    type="number"
                                    name="presupuesto_maximo"
                                    value={formData.presupuesto_maximo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Dormitorios (Min.)</label>
                                <input
                                    type="number"
                                    name="dormitorios_minimo"
                                    value={formData.dormitorios_minimo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-3">
                                <label className="text-sm font-semibold text-slate-700">Zonas de Preferencia</label>
                                <input
                                    type="text"
                                    name="preferencias_zonas"
                                    value={formData.preferencias_zonas}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Ej: Benalmádena Costa, Arroyo de la Miel, Torremolinos"
                                />
                                <p className="text-xs text-slate-500">Separa las zonas por comas.</p>
                            </div>
                        </div>
                    </div>

                    {/* Status & Notes */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Estado y Notas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Estado</label>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                                >
                                    <option value="Nuevo">🔴 Nuevo (Sin atender)</option>
                                    <option value="Contactado">🔵 Contactado</option>
                                    <option value="En seguimiento">🟡 En seguimiento</option>
                                    <option value="Cerrado">🟢 Cerrado / Venta</option>
                                    <option value="Baja">⚪ Baja</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Urgencia / Prioridad</label>
                                <select
                                    name="urgencia"
                                    value={formData.urgencia}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                                >
                                    <option value="Alta">🔥 Alta (Inmediata)</option>
                                    <option value="Media">⚡ Media (Estándar)</option>
                                    <option value="Baja">💤 Baja (Inversores/Futuro)</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">Observaciones Públicas / Comentarios del Cliente</label>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                                ></textarea>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    Notas Internas <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">SOLO EQUIPO</span>
                                </label>
                                <textarea
                                    name="notas_internas"
                                    value={formData.notas_internas}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end gap-3">
                    <Link
                        href="/admin/interesados"
                        className="px-6 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting || successMsg !== null}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-emerald-600/20"
                    >
                        <Save size={18} />
                        {isSubmitting ? 'Guardando...' : successMsg ? 'Guardado ✅' : 'Actualizar Datos'}
                    </button>
                </div>
            </form>
        </div>
    );
}
