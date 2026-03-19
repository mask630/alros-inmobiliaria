'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Instagram, Facebook, Video, Copy, Check, Download, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function RedesSocialesPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'instagram' | 'facebook' | 'tiktok'>('instagram');
    const [copiedContent, setCopiedContent] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        const fetchProperty = async () => {
            if (!params.id) return;
            try {
                const { data, error } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('id', params.id as string)
                    .single();
                
                if (error) throw error;
                setProperty(data);
            } catch (err) {
                console.error("Error fetching property:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [params.id]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedContent(text);
        setTimeout(() => setCopiedContent(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(323,84%,29%)] border-t-transparent"></div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="p-8 text-center text-slate-500">
                <p>Propiedad no encontrada.</p>
                <button onClick={() => router.back()} className="mt-4 text-[hsl(323,84%,29%)] font-bold">Volver</button>
            </div>
        );
    }

    // Extraction helpers
    const features = property.features || {};
    const typeLabel = property.property_type || 'propiedad';
    const city = property.city || 'Benalmádena';
    const priceStr = Number(property.price || 0).toLocaleString('de-DE');
    const bedrooms = property.bedrooms || features.bedrooms || 'varios';
    const bathrooms = property.bathrooms || features.bathrooms || 'varios';
    const hasPool = property.features?.amenities?.includes('Piscina') || property.features?.pool || false;
    const hasTerrace = property.features?.amenities?.includes('Terraza') || property.features?.terrace || false;
    const isRent = property.operation_type === 'alquiler';
    
    // Link to public property page
    const propertyLink = `https://www.alros.eu/propiedades/${property.id}`;

    // --- GENERATORS --- //

    const generateInstagram = () => {
        return `✨ ¡NOVEDAD EN ${city.toUpperCase()}! ✨\n\n` +
               `Descubre est${typeLabel.endsWith('a') ? 'a' : 'e'} espectacular ${typeLabel.replace('_',' ')} que acabamos de incorporar a nuestra cartera. ¡Ideal para ti!\n\n` +
               `💎 Características que te enamorarán:\n` +
               `🛏 ${bedrooms} dormitorios ${bedrooms === 1 ? 'doble' : 'dobles'}\n` +
               `🛁 ${bathrooms} baños completos\n` +
               `${hasTerrace ? '☀️ Impresionante terraza\n' : ''}` +
               `${hasPool ? '🏊‍♀️ Piscina y zonas ajardinadas\n' : ''}` +
               `💰 Precio: ${priceStr} €\n\n` +
               `👉🏼 ¿Te imaginas viviendo aquí? Déjanos un 💛 en los comentarios o envíanos un MD para más detalles.\n\n` +
               `📲 El enlace directo con todas las fotos está en nuestra bio o envíanos un Dm y te mandamos la ficha completa.\n\n` +
               `#AlrosInmobiliaria #${city.replace(/\s+/g, '')} #Inmobiliaria${property.province ? property.province.replace('á','a') : 'Malaga'} #CasaDeTusSuenos #${typeLabel.replace('_','')} #RealEstate #Vivienda${isRent ? 'Alquiler' : 'EnVenta'} #Inversion`;
    };

    const generateFacebook = () => {
        return `🏠 ¿Buscando tu nuevo hogar en ${city}? ¡Mira lo que acabamos de recibir! 👇🏼\n\n` +
               `En Alros Inmobiliaria te presentamos est${typeLabel.endsWith('a') ? 'a' : 'e'} increíble ${typeLabel.replace('_',' ')} ${isRent ? 'en alquiler' : 'en venta'}. Situado en una zona fantástica, es exactamente lo que estabas buscando para dar el siguiente paso.\n\n` +
               `✔️ ${bedrooms} Dormitorios amplios y luminosos\n` +
               `✔️ ${bathrooms} Baños\n` +
               `✔️ Precio de Inversión: ${priceStr} €\n\n` +
               `Aquí tienes todos los detalles y una galería completa de fotos para que la visites desde tu sofá:\n` +
               `🔗 ${propertyLink}\n\n` +
               `No dudes en compartir esta publicación con ese amigo o familiar que sabes que está buscando por la zona. ¡Quizás le acabas de encontrar su nueva casa! 😉\n\n` +
               `📞 O llámanos directamente al +34 691 687 316 para concertar una visita presencial. ¡Vuelan!`;
    };

    const generateTikTok = () => {
        return `🎥 GUION PARA TIKTOK / REELS (Solo graba el video usando estos pasos):\n\n` +
               `[Escena 1: Tú en la puerta abriéndola (Apertura rápida)]\n` +
               `🗣 "¡No vas a creer lo que cuesta est${typeLabel.endsWith('a') ? 'a' : 'e'} ${typeLabel.replace('_',' ')} en ${city}!"\n\n` +
               `[Escena 2: Muestras el salón luminoso y amplio]\n` +
               `🗣 "¿De verdad estabas buscando espacio? Mira este salón ultra luminoso. Perfecto para desconectar."\n\n` +
               `${hasTerrace ? '[Escena 3: Abriendo la ventana hacia la terraza]\n🗣 "Y espera a ver el plato fuerte... ¡Efectivamente! Aquí tienes tu nueva zona chill-out."\n\n' : ''}` +
               `[Escena 4: Pantalla rápida enseñando las habitaciones (transiciones rápidas)]\n` +
               `🗣 "${bedrooms} habitaciones completas. ${bathrooms} baños. Lista para entrar."\n\n` +
               `[Escena 5: Grabándote a ti con la casa de fondo]\n` +
               `🗣 "Todo esto por solo ${priceStr}€. Si quieres que te pase el link con todas las fotos, ¡dímelo en los comentarios y te lo envío por MD!"\n\n` +
               `-----------------------------------------------------\n\n` +
               `📝 TEXTO (CAPTION) PARA EL VIDEO:\n` +
               `¿Qué te parece? A nosotros nos tiene enamorados 😍\n\n` +
               `📍 ${city}\n` +
               `🛏 ${bedrooms} Hab | 🛁 ${bathrooms} Baños\n` +
               `💰 ${priceStr}€\n\n` +
               `Dime "INFO" en los comentarios y te mando la ficha técnica y todas las fotos por mensaje directo. 📲\n\n` +
               `#HouseTour #RealEstateEspaña #${city.replace(/\s+/g, '')} #Inmobiliaria #HomeTour #AlrosInmobiliaria`;
    };

    const texts = {
        instagram: generateInstagram(),
        facebook: generateFacebook(),
        tiktok: generateTikTok()
    };

    const images = property.images && property.images.length > 0 ? property.images : (property.features?.images || []);
    const displayImages = images.slice(0, 4);
    const activeImage = displayImages[selectedImageIndex] || property.image || property.features?.image || null;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Post Redes Sociales</h1>
                    <p className="text-slate-500 text-sm">Contenido semi-automático para publicar {property.title}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Text Generation Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 bg-slate-50 text-sm font-medium">
                            <button 
                                onClick={() => setActiveTab('instagram')}
                                className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'instagram' ? 'text-pink-600 bg-white border-b-2 border-pink-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                                <Instagram size={18} /> Instagram
                            </button>
                            <button 
                                onClick={() => setActiveTab('facebook')}
                                className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'facebook' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                                <Facebook size={18} /> Facebook
                            </button>
                            <button 
                                onClick={() => setActiveTab('tiktok')}
                                className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'tiktok' ? 'text-slate-900 bg-white border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                                <Video size={18} /> TikTok / Reels
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 relative">
                            <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100 text-[15px]">
                                {texts[activeTab]}
                            </pre>

                            <button
                                onClick={() => handleCopy(texts[activeTab])}
                                className="absolute top-10 right-10 bg-white shadow-md hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all active:scale-95"
                            >
                                {copiedContent === texts[activeTab] ? (
                                    <><Check size={16} className="text-green-500" /> ¡Copiado!</>
                                ) : (
                                    <><Copy size={16} /> Copiar Texto</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Media Assets Column */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <ImageIcon size={20} className="text-[#831832]" /> Assets Visuales
                        </h3>
                        
                        <div className="space-y-4">
                            {activeImage ? (
                                <div className="rounded-lg overflow-hidden border border-slate-200">
                                    <img src={activeImage} className="w-full aspect-square object-cover" alt="Selected property" />
                                </div>
                            ) : (
                                <div className="aspect-square bg-slate-100 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                                    <p className="text-sm">Sin imagen principal</p>
                                </div>
                            )}

                            {displayImages.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {displayImages.map((img: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-[#831832] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-2 mt-4">
                                <button onClick={() => window.open(activeImage, '_blank')} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors cursor-pointer">
                                    <Download size={16} /> Descargar Foto Seleccionada
                                </button>
                                
                                <p className="text-xs text-center text-slate-500 mt-2 font-medium">O puedes imprimir el "Window Card A3" Modelo 5 para generar una imagen cuadrada perfecta con la información incrustada.</p>
                                
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                        <h4 className="font-bold text-amber-900 mb-2 text-sm">Consejo Pro 💡</h4>
                        <p className="text-xs text-amber-800 leading-relaxed">
                            Abre esta misma pantalla en tu móvil. Solo tendrás que darle a "Copiar Texto", guardar la foto en tu carrete manteniendo el dedo pulsado sobre ella (o descargándola), y pegarlo directamente en Instagram o Facebook.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

