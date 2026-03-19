"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EditarPropietarioPage() {
    const router = useRouter();
    const params = useParams();
    const ownerId = params.id as string;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre_completo: "",
        documento_identidad: "",
        direccion: "",
        codigo_postal: "",
        poblacion: "",
        provincia: "",
        pais: "España",
        telefonos: "",
        email: "",
        tipo: "ambos",
        observaciones: "",
    });

    useEffect(() => {
        const fetchOwner = async () => {
            try {
                const { data, error } = await supabase
                    .from('propietarios')
                    .select('*')
                    .eq('id', ownerId)
                    .single();

                if (error) throw error;
                if (data) {
                    setFormData({
                        nombre_completo: data.nombre_completo || "",
                        documento_identidad: data.documento_identidad || "",
                        direccion: data.direccion || "",
                        codigo_postal: data.codigo_postal || "",
                        poblacion: data.poblacion || "",
                        provincia: data.provincia || "",
                        pais: data.pais || "España",
                        telefonos: data.telefonos ? data.telefonos.join(', ') : "",
                        email: data.email || "",
                        tipo: data.tipo || "ambos",
                        observaciones: data.observaciones || "",
                    });
                }
            } catch (err) {
                console.error("Error fetching owner:", err);
                setError("No se pudo cargar el propietario. Puede que haya sido eliminado.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOwner();
    }, [ownerId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Auto-completar Población y Provincia al introducir C.P. español (5 dígitos)
    useEffect(() => {
        if (formData.codigo_postal && formData.codigo_postal.length === 5 && !isLoading) {
            const prefijo = formData.codigo_postal.substring(0, 2);
            const PROVINCIAS: Record<string, string> = {
                "01": "Álava", "02": "Albacete", "03": "Alicante", "04": "Almería", "05": "Ávila",
                "06": "Badajoz", "07": "Baleares", "08": "Barcelona", "09": "Burgos", "10": "Cáceres",
                "11": "Cádiz", "12": "Castellón", "13": "Ciudad Real", "14": "Córdoba", "15": "A Coruña",
                "16": "Cuenca", "17": "Girona", "18": "Granada", "19": "Guadalajara", "20": "Guipúzcoa",
                "21": "Huelva", "22": "Huesca", "23": "Jaén", "24": "León", "25": "Lleida",
                "26": "La Rioja", "27": "Lugo", "28": "Madrid", "29": "Málaga", "30": "Murcia",
                "31": "Navarra", "32": "Ourense", "33": "Asturias", "34": "Palencia", "35": "Las Palmas",
                "36": "Pontevedra", "37": "Salamanca", "38": "S.C. Tenerife", "39": "Cantabria", "40": "Segovia",
                "41": "Sevilla", "42": "Soria", "43": "Tarragona", "44": "Teruel", "45": "Toledo",
                "46": "Valencia", "47": "Valladolid", "48": "Vizcaya", "49": "Zamora", "50": "Zaragoza",
                "51": "Ceuta", "52": "Melilla"
            };
            const provinciaReconocida = PROVINCIAS[prefijo] || "";

            fetch(`https://api.zippopotam.us/es/${formData.codigo_postal}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.places && data.places.length > 0) {
                        const place = data.places[0];
                        setFormData(prev => ({
                            ...prev,
                            // Solo sobreescribir si está vacío, para evitar borrar lo que traemos de la BBDD a menos que sea un CP nuevo 
                            poblacion: prev.poblacion || place["place name"],
                            provincia: prev.provincia || provinciaReconocida,
                            pais: "España"
                        }));
                    }
                })
                .catch(err => {
                    if (provinciaReconocida) {
                        setFormData(prev => ({
                            ...prev,
                            provincia: prev.provincia || provinciaReconocida,
                            pais: "España"
                        }));
                    }
                });
        }
    }, [formData.codigo_postal, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const telefonosArray = formData.telefonos
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        try {
            const { error: updateError } = await supabase
                .from('propietarios')
                .update({
                    nombre_completo: formData.nombre_completo,
                    documento_identidad: formData.documento_identidad,
                    direccion: formData.direccion,
                    codigo_postal: formData.codigo_postal,
                    poblacion: formData.poblacion,
                    provincia: formData.provincia,
                    pais: formData.pais,
                    telefonos: telefonosArray,
                    email: formData.email,
                    tipo: formData.tipo,
                    observaciones: formData.observaciones
                })
                .eq('id', ownerId);

            if (updateError) throw updateError;

            setSuccessMsg("¡Propietario actualizado correctamente! Redirigiendo al listado...");
            setTimeout(() => {
                router.push('/admin/propietarios');
                router.refresh();
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setError("Error al actualizar el propietario. Inténtalo de nuevo.");
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-24 text-slate-400">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/propietarios" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Editar Propietario</h1>
                    <p className="text-slate-500">Modifica los datos del dueño en la base de datos.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-medium">
                    ✅ {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Nombre Completo *</label>
                            <input
                                type="text"
                                name="nombre_completo"
                                required
                                value={formData.nombre_completo}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">DNI / NIE / CIF *</label>
                            <input
                                type="text"
                                name="documento_identidad"
                                required
                                value={formData.documento_identidad}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Ubicación</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Dirección (Calle, número, piso...) *</label>
                            <input
                                type="text"
                                name="direccion"
                                required
                                value={formData.direccion}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">C.P.</label>
                                <input
                                    type="text"
                                    name="codigo_postal"
                                    value={formData.codigo_postal}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Población</label>
                                <input
                                    type="text"
                                    name="poblacion"
                                    value={formData.poblacion}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Provincia</label>
                                <input
                                    type="text"
                                    name="provincia"
                                    value={formData.provincia}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">País</label>
                                <input
                                    type="text"
                                    name="pais"
                                    value={formData.pais}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Email *</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Teléfono(s) *</label>
                            <input
                                type="text"
                                name="telefonos"
                                required
                                value={formData.telefonos}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-slate-500">Ej: 600123456, 912345678</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Tipo de Propietario *</label>
                        <select
                            name="tipo"
                            required
                            value={formData.tipo}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="venta">Venta</option>
                            <option value="alquiler">Alquiler</option>
                            <option value="ambos">Ambos</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Observaciones</label>
                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        ></textarea>
                    </div>

                </div>

                <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end gap-3">
                    <Link
                        href="/admin/propietarios"
                        className="px-6 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting || successMsg !== null}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                    >
                        <Save size={18} />
                        {isSubmitting ? 'Guardando...' : successMsg ? 'Guardado ✅' : 'Actualizar Datos'}
                    </button>
                </div>
            </form>
        </div>
    );
}
