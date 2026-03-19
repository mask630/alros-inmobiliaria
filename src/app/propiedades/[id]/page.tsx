import { MapPin, Bed, Bath, Maximize, Calendar, Share2, Heart, Check, Box, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { InteractivePropertyMap } from "@/components/properties/InteractivePropertyMap";
import { PropertyGallery } from "@/components/properties/PropertyGallery";
import { PropertyContactForm } from "@/components/properties/PropertyContactForm";
import { PropertyShareButton } from "@/components/properties/PropertyShareButton";

// Force dynamic rendering so we always get the latest properties
export const dynamic = 'force-dynamic';

async function getProperty(id: string) {
    const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !property) {
        return null;
    }

    return property;
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const property = await getProperty(id);

    if (!property) {
        notFound();
    }

    // Helper to convert Google Drive links to direct images
    const getDirectImageUrl = (url: string) => {
        if (!url) return '';
        try {
            if (url.includes('/file/d/')) {
                const idMatch = url.match(/\/file\/d\/(.*?)\//);
                if (idMatch && idMatch[1]) {
                    return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
                }
            }
            if (url.includes('drive.google.com') && url.includes('/view')) {
                const idMatch = url.match(/\/d\/(.*?)\//);
                if (idMatch && idMatch[1]) {
                    return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
                }
            }
        } catch (e) {
            return url;
        }
        return url;
    };

    // Helper to get embeddable video URL
    const getEmbeddableVideoUrl = (url: string) => {
        if (!url) return '';
        // YouTube Standards
        if (url.includes('youtube.com/watch?v=')) return url.replace("watch?v=", "embed/");
        if (url.includes('youtu.be/')) return url.replace("youtu.be/", "www.youtube.com/embed/");

        // Vimeo
        if (url.includes('vimeo.com/')) return url.replace("vimeo.com/", "player.vimeo.com/video/");

        return url;
    };

    // Fallback data if some fields are missing/null
    const rawImages = property.images && property.images.length > 0 ? property.images : property.features?.images || [
        property.image || property.features?.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ];
    const images = rawImages.map(getDirectImageUrl);

    const featuresList = property.features?.amenities || (Array.isArray(property.features) ? property.features : [
        "Piscina", "Jardín", "Garaje"
    ]);

    // Approximate address for map (City + Street name without numbers)
    const approximateAddress = property.address ? property.address.replace(/[0-9]/g, '').trim() + ", " + property.city : property.city;

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Image Gallery Grid */}
            <div className="container mx-auto px-4 py-8">
                <PropertyGallery images={images} />
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Header Info */}
                        <div className="border-b pb-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    {property.status && property.status !== 'disponible' && (
                                        <span className={`inline-block px-3 py-1 font-bold text-sm tracking-widest uppercase rounded mb-3 text-white shadow-sm
                                            ${property.status === 'vendido' ? 'bg-red-600' :
                                                property.status === 'reservado' ? 'bg-amber-500' :
                                                    property.status === 'alquilado' ? 'bg-orange-500' : 'bg-slate-600'}`}>
                                            {property.status === 'vendido' ? 'VENDIDO' :
                                                property.status === 'reservado' ? 'RESERVADO' :
                                                    property.status === 'alquilado' ? 'ALQUILADO' : property.status}
                                        </span>
                                    )}
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.title}</h1>
                                    <a
                                        href="#mapa-ubicacion"
                                        className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group"
                                    >
                                        <MapPin className="h-5 w-5 mr-2 text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span className="hover:underline">{property.city}</span>
                                        <span className="text-slate-400 ml-2 text-sm">(Ver mapa)</span>
                                    </a>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-blue-600 whitespace-nowrap">{Number(property.price).toLocaleString('de-DE')} €</p>
                                    <p className="text-sm text-slate-500">Ref: {property.referencia || property.reference_id || property.id.slice(0, 8)}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 md:gap-8 text-slate-700 mt-6">
                                <Link
                                    href={`/propiedades?operation=${property.operation_type}&bedrooms=${property.bedrooms || property.features?.bedrooms || 0}&strict=true`}
                                    className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded-xl transition-colors cursor-pointer group"
                                    title={`Ver propiedades con exactamente ${property.bedrooms || property.features?.bedrooms || 0} habitaciones`}
                                >
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors"><Bed className="h-5 w-5" /></div>
                                    <span className="font-semibold group-hover:text-blue-600 transition-colors">{property.bedrooms || property.features?.bedrooms || 0} Habs</span>
                                </Link>
                                <Link
                                    href={`/propiedades?operation=${property.operation_type}&bathrooms=${property.bathrooms || property.features?.bathrooms || 0}&strict=true`}
                                    className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded-xl transition-colors cursor-pointer group"
                                    title={`Ver propiedades con exactamente ${property.bathrooms || property.features?.bathrooms || 0} baños`}
                                >
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors"><Bath className="h-5 w-5" /></div>
                                    <span className="font-semibold group-hover:text-blue-600 transition-colors">{property.bathrooms || property.features?.bathrooms || 0} Baños</span>
                                </Link>
                                <div className="flex items-center gap-2 p-2">
                                    <div className="p-2 bg-slate-100 rounded-lg"><Maximize className="h-5 w-5" /></div>
                                    <span className="font-semibold">{property.size_m2 || property.features?.size_m2 || 0} m²</span>
                                </div>
                                <div className="flex items-center gap-2 p-2">
                                    <div className="p-2 bg-slate-100 rounded-lg"><Calendar className="h-5 w-5" /></div>
                                    <span className="font-semibold">Año {property.year_built || property.features?.year_built || property.features?.year || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Descripción</h2>
                            <div className="prose max-w-none text-slate-600 whitespace-pre-line">
                                {property.description}
                            </div>

                            {/* Legal Disclaimer for Sales */}
                            {property.operation_type === 'venta' && (
                                <div className="mt-8 pt-8 border-t border-slate-100 italic text-slate-400 text-xs leading-relaxed">
                                    <p className="mb-2">
                                        Información al consumidor: En cumplimiento del Decreto 218/2005, de 11 de octubre, de la Junta de Andalucía, por el que se aprueba el Reglamento de información al consumidor en la compraventa y arrendamiento de viviendas en Andalucía, se informa al cliente que los gastos notariales, registrales, impuestos (ITP o IVA + AJD, según corresponda) y otros gastos inherentes a la compraventa no están incluidos en el precio.
                                    </p>
                                    <p className="mb-2">
                                        La información facilitada es orientativa, no tiene carácter vinculante y puede haber sufrido modificaciones que aún no hayan sido incorporadas. Se recomienda contactar con la agencia para confirmar los datos y obtener la información actualizada.
                                    </p>
                                    <p className="font-semibold">
                                        Honorarios de intermediación inmobiliaria incluidos en el precio de venta.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Features */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Características</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {featuresList.map((feature: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2 text-slate-700">
                                        <Check className="h-4 w-4 text-green-500" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Media: Video & 3D Tour */}
                        {(property.video || property.features?.video || property.matterport || property.features?.matterport) && (
                            <div className="space-y-8">
                                {(property.video || property.features?.video) && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Video</h2>
                                        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                                            <iframe
                                                src={getEmbeddableVideoUrl(property.video || property.features.video)}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                title="Video del inmueble"
                                            />
                                        </div>
                                    </div>
                                )}

                                {(property.matterport || property.features?.matterport) && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Visita Virtual 3D</h2>
                                        <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
                                            <iframe
                                                src={property.matterport || property.features.matterport}
                                                className="w-full h-full"
                                                allowFullScreen
                                                title="Visita Virtual Matterport"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Location Map with Other Properties */}
                        <div id="mapa-ubicacion" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Ubicación y Propiedades Cercanas</h2>
                            <details className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden" open>
                                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-100 transition-colors list-none font-bold text-slate-800">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-blue-500" />
                                        <span>Ver mapa interactivo</span>
                                    </div>
                                    <span className="text-blue-600 text-sm group-open:rotate-180 transition-transform">▼</span>
                                </summary>

                                <div className="p-6 pt-0">
                                    <p className="text-slate-500 mb-4 text-sm flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Ubicación aproximada (Zona de {property.city}) - Haz clic en los marcadores para ver otras propiedades
                                    </p>
                                    <InteractivePropertyMap
                                        currentPropertyId={property.id}
                                        currentCity={property.city}
                                        approximateAddress={approximateAddress}
                                        publicLat={property.lat || property.public_latitude || property.features?.public_latitude}
                                        publicLng={property.lng || property.public_longitude || property.features?.public_longitude}
                                    />
                                </div>
                            </details>
                        </div>

                    </div>

                    {/* Sidebar / Contact Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white border shadow-xl rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">¿Te interesa?</h3>
                                <div className="flex gap-2">
                                    <PropertyShareButton
                                        propertyTitle={property.title}
                                        propertyRef={property.reference_id || property.id.slice(0, 8)}
                                        propertyId={property.id}
                                    />
                                </div>
                            </div>

                            <PropertyContactForm
                                propertyTitle={property.title}
                                propertyRef={property.reference_id || property.id.slice(0, 8)}
                            />

                            <div className="mt-6 pt-6 border-t text-center text-sm text-slate-500">
                                <p>Referencia del inmueble: {property.referencia || property.reference_id || property.id.slice(0, 8)}</p>
                                <p className="mt-1">Publicado el {new Date(property.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
