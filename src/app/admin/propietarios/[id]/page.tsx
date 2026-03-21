import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Building, Calendar, Edit, FileText, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import DeleteOwnerButton from "@/components/admin/DeleteOwnerButton";

export const dynamic = 'force-dynamic';

export default async function DetallePropietarioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch owner
    const { data: owner, error: ownerError } = await supabase
        .from('propietarios')
        .select('*')
        .eq('id', id)
        .single();

    if (ownerError || !owner) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold text-slate-800">Propietario no encontrado</h2>
                <Link href="/admin/propietarios" className="text-blue-600 hover:underline mt-4 inline-block">
                    Volver a la cartera
                </Link>
            </div>
        );
    }

    // Fetch related properties
    const { data: properties } = await supabase
        .from('properties')
        .select('id, title, reference_id, city, property_type, operation_type, price, status')
        .eq('propietario_id', owner.id);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/propietarios" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 bg-white shadow-sm border border-slate-200">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-slate-900">{owner.nombre_completo}</h1>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">
                                {owner.tipo}
                            </span>
                        </div>
                        <p className="text-slate-500 font-mono text-sm mt-1">REF: {owner.codigo}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/propietarios/editar/${owner.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Edit size={18} />
                        Modificar Datos
                    </Link>
                    <DeleteOwnerButton id={owner.id} name={owner.nombre_completo} propCount={properties?.length || 0} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Personal Data */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Main Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                            <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold shrink-0">
                                {owner.nombre_completo.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Documento de Identidad</p>
                                <p className="font-semibold text-slate-800">{owner.documento_identidad || "No registrado"}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Phone className="text-slate-400 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Teléfonos</p>
                                    {owner.telefonos && owner.telefonos.length > 0 ? (
                                        owner.telefonos.map((t: string, i: number) => (
                                            <p key={i} className="font-medium text-slate-800">{t}</p>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 italic">Sin teléfonos</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="text-slate-400 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Correo Electrónico</p>
                                    <p className="font-medium text-slate-800 break-all">{owner.email || "No registrado"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="text-slate-400 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Dirección de Residencia</p>
                                    <p className="font-medium text-slate-800">
                                        {owner.direccion || "Sin dirección"}<br />
                                        {[owner.codigo_postal, owner.poblacion, owner.provincia].filter(Boolean).join(", ")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="text-slate-400 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Fecha de Alta</p>
                                    <p className="font-medium text-slate-800">
                                        {formatDate(owner.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Observations */}
                    {owner.observaciones && (
                        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                            <h3 className="flex items-center gap-2 font-bold text-amber-800 mb-2">
                                <FileText size={18} /> Notas / Observaciones
                            </h3>
                            <p className="text-amber-900 whitespace-pre-wrap text-sm leading-relaxed">
                                {owner.observaciones}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Properties */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Building className="text-blue-600" size={20} />
                                Propiedades Asignadas
                            </h2>
                            <span className="bg-white px-3 py-1 rounded-full text-sm font-bold border border-slate-200 text-slate-600">
                                {properties?.length || 0} Inmuebles
                            </span>
                        </div>

                        {properties && properties.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {properties.map((prop) => (
                                    <div key={prop.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-900 text-lg">{prop.title}</h3>
                                                <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono uppercase">
                                                    REF: {prop.reference_id || prop.id.split('-')[0]}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 text-sm text-slate-500 items-center">
                                                <span className="capitalize">{prop.property_type.replace('_', ' ')}</span>
                                                <span>•</span>
                                                <span>{prop.city}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${prop.status === 'disponible' ? 'bg-green-100 text-green-700' :
                                                    prop.status === 'reservado' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {prop.status}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${prop.operation_type === 'venta' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {prop.operation_type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-bold text-slate-900">{Number(prop.price).toLocaleString('de-DE')} €</p>
                                                <Link href={`/admin/propiedades/editar/${prop.id}`} className="text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 p-1.5 rounded" title="Editar Propiedad">
                                                    <ExternalLink size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-500">
                                <Building className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                <p>Este propietario no tiene ninguna propiedad asignada todavía.</p>
                                <Link href="/admin/propiedades/nueva" className="text-blue-600 font-medium hover:underline mt-2 inline-block">
                                    + Crear nueva propiedad
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
