'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Instagram, Facebook, Video, Copy, Check, Download, Image as ImageIcon, MessageSquare, Printer } from "lucide-react";
import Link from "next/link";
import MatchingLeads from "@/components/properties/MatchingLeads";

export default function RedesSocialesPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'instagram' | 'facebook' | 'tiktok'>('instagram');
    const [activeVibe, setActiveVibe] = useState<'standard' | 'lux' | 'urgente'>('standard');
    const [copiedContent, setCopiedContent] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [generatingPoster, setGeneratingPoster] = useState(false);

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
    const propertyLink = `https://www.alros-inmobiliaria.vercel.app/propiedades/${property.id}`;

    // --- GENERATORS --- //

    const generateInstagram = () => {
        if (activeVibe === 'lux') {
            return `🌟 EXCLUSIVIDAD Y ELEGANCIA EN ${city.toUpperCase()} 🌟\n\n` +
                   `Te presentamos una joya arquitectónica. Est${typeLabel.endsWith('a') ? 'a' : 'e'} ${typeLabel.replace('_',' ')} redefine el concepto de hogar premium.\n\n` +
                   `✨ Lo más destacado:\n` +
                   `💎 Acabados de lujo y diseño contemporáneo\n` +
                   `🌅 Vistas privilegiadas y ubicación estratégica\n` +
                   `🏊‍♀️ ${hasPool ? 'Piscina infinity y club social\n' : 'Zonas comunes de alto nivel\n'}` +
                   `💰 Precio: ${priceStr} €\n\n` +
                   `Si buscas lo mejor de la Costa del Sol, ya lo has encontrado.\n\n` +
                   `DM para un dossier privado o visita exclusiva. ✨\n\n` +
                   `#LuxuryRealEstate #Exclusivo #AlrosInmobiliaria #${city.replace(/\s+/g, '')} #HighEndHome #MarbellaVibe`;
        }
        
        if (activeVibe === 'urgente') {
            return `🔥 ¡OPORTUNIDAD FLASH! RECÉN BAJADO 🔥\n\n` +
                   `¡No pierdas est${typeLabel.endsWith('a') ? 'a' : 'e'} ${typeLabel.replace('_',' ')}! Acaba de entrar al mercado a un precio imbatible en ${city}.\n\n` +
                   `⚡️ ¿Por qué es una inversión 10/10?\n` +
                   `✅ Bajo el precio de mercado\n` +
                   `✅ Listo para entrar a vivir o alquilar\n` +
                   `✅ Ubicación de alta demanda\n\n` +
                   `💰 Solo: ${priceStr} €\n\n` +
                   `🚀 Las propiedades con este perfil NO duran más de 48h. ¿Quieres verla hoy mismo?\n\n` +
                   `Mándanos un WhatsApp al 691 687 316 ¡YA! 📲\n\n` +
                   `#OportunidadBrutal #CholloDelDia #InversionInmobiliaria #VentaRapida #AlrosInmobiliaria #Rentabilidad`;
        }

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
        return `🎥 GUION PARA TIKTOK / REELS:\n\n` +
               `[Escena 1: Tú en la puerta abriéndola]\n` +
               `🗣 "¡No vas a creer este ofertón en ${city}!"\n\n` +
               `[Escena 2: Salón ultra luminoso]\n` +
               `🗣 "Mira qué espacio, qué luz. Ideal para desconectar."\n\n` +
               `${hasTerrace ? '[Escena 3: Terraza]\n🗣 "Y el patio/terraza... ¡increíble!"\n\n' : ''}` +
               `[Escena 4: Pantalla rápida]\n` +
               `🗣 "${bedrooms} Hab | ${bathrooms} Baños. Precio: ${priceStr} €"\n\n` +
               `📝 CAPTION:\n` +
               `📍 ${city} | 💰 ${priceStr}€\n\n` +
               `Comenta "INFO" y te mando el enlace por MD. 📲\n\n` +
               `#HouseTour #AlrosInmobiliaria #${city.replace(/\s+/g, '')}`;
    };

    const generateWhatsApp = () => {
        return `¡Hola! Mira est${typeLabel.endsWith('a') ? 'a' : 'e'} ${typeLabel.replace('_',' ')} que tenemos en ${city} (${priceStr} €). \n\n` +
               `Te paso la ficha completa con todas las fotos aquí:\n` +
               `${propertyLink}\n\n` +
               `Dime si te gustaría ir a verla. ¡Saludos!`;
    };

    const texts = {
        instagram: generateInstagram(),
        facebook: generateFacebook(),
        tiktok: generateTikTok(),
        whatsapp: generateWhatsApp()
    };

    // --- VISUAL POSTER GENERATOR --- //
    const downloadPoster = () => {
        setGeneratingPoster(true);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 1080;
        canvas.height = 1080; // Square format for IG/FB

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = activeImage || '';
        
        img.onload = () => {
            // 1. Draw Background Image (Cover style)
            const aspect = img.width / img.height;
            let drawWidth = canvas.width;
            let drawHeight = canvas.width / aspect;
            if (drawHeight < canvas.height) {
                drawHeight = canvas.height;
                drawWidth = canvas.height * aspect;
            }
            const offsetX = (canvas.width - drawWidth) / 2;
            const offsetY = (canvas.height - drawHeight) / 2;
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            // 2. Add Dark Gradient at bottom
            const gradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height * 0.5);

            // 3. Add Brand Overlay (Top Left Bubble)
            ctx.fillStyle = '#831832'; // Alros Maroon
            ctx.beginPath();
            ctx.roundRect(40, 40, 320, 80, 10);
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px Arial';
            ctx.fillText('ALROS INMOBILIARIA', 65, 93);
            
            // 4. Add Price Badge (Bottom Right)
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.beginPath();
            ctx.roundRect(canvas.width - 450, canvas.height - 180, 410, 120, 15);
            ctx.fill();

            ctx.fillStyle = '#831832';
            ctx.font = 'black 64px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${priceStr} €`, canvas.width - 70, canvas.height - 100);

            // 5. Add Location (Bottom Left)
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.font = 'bold 44px Arial';
            ctx.fillText(city.toUpperCase(), 60, canvas.height - 110);
            
            ctx.font = 'normal 28px Arial';
            ctx.fillText(typeLabel.replace('_',' ').toUpperCase(), 60, canvas.height - 70);

            // 6. Download
            const link = document.createElement('a');
            link.download = `Alros_Post_${city}_${property.id.substring(0,5)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setGeneratingPoster(false);
        };
        
        img.onerror = () => {
            alert("Vaya, no hemos podido cargar la imagen para generar el póster. Prueba a descargar la imagen manualmente.");
            setGeneratingPoster(false);
        };
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

                        {/* Vibe Selection */}
                        <div className="flex gap-2 p-4 bg-slate-100/50 border-b border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
                            <button 
                                onClick={() => setActiveVibe('standard')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${activeVibe === 'standard' ? 'bg-[#831832] text-white border-[#831832] shadow-md shadow-[#831832]/20' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                                🏠 Estilo Estándar
                            </button>
                            <button 
                                onClick={() => setActiveVibe('lux')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${activeVibe === 'lux' ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                                💎 Enfoque Lujo
                            </button>
                            <button 
                                onClick={() => setActiveVibe('urgente')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${activeVibe === 'urgente' ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                                🔥 Oportunidad Urgente
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
                                <button 
                                    onClick={downloadPoster} 
                                    disabled={generatingPoster}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:bg-slate-400"
                                >
                                    {generatingPoster ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <Download size={18} /> 
                                    )}
                                    GENERAR PÓSTER CUADRADO
                                </button>
                                
                                <button 
                                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(texts.whatsapp)}`, '_blank')}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold text-sm transition-all active:scale-95"
                                >
                                    <MessageSquare size={18} /> COMPARTIR POR WHATSAPP
                                </button>
                                
                                <p className="text-[10px] text-center text-slate-500 mt-2 italic px-2">
                                    Genera una imagen optimizada para Instagram con logo y precio incrustado automáticamente.
                                </p>
                                
                            </div>
                        </div>
                    </div>

                    {/* Window Cards / Escaparate */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Printer size={20} className="text-[#831832]" /> Cartelería (Escaparate)
                        </h3>
                        
                        <p className="text-xs text-slate-500 mb-4">Exporta fichas en Alta Resolución listas para imprimir y colocar en el escaparate o entregar a clientes.</p>

                        <div className="space-y-2">
                            <button
                                onClick={() => window.open(`/print/${property.id}?format=a4`, '_blank')}
                                className="w-full text-left px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center justify-between text-sm text-amber-900 font-medium border border-amber-200 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Printer className="h-4 w-4 text-amber-600" />
                                    Ficha Simple (A4 Vertical)
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-amber-600/50 group-hover:text-amber-600 transition-colors">Imprimir</span>
                            </button>

                            <div className="pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Modelos Premium (A3 Horizontal)</div>
                            
                            {[
                                { id: 1, name: "Burgundy Pro" },
                                { id: 2, name: "Rejilla Lujo" },
                                { id: 3, name: "Lujo Cinematográfico" },
                                { id: 4, name: "Revista Elegante" },
                                { id: 5, name: "Diamante Luminoso" }
                            ].map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => window.open(`/print/${property.id}?format=a3&model=${model.id}`, '_blank')}
                                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 rounded-lg flex items-center justify-between text-sm text-slate-700 font-medium transition-colors border border-transparent hover:border-slate-200 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded bg-slate-100 text-[#831832] flex items-center justify-center text-xs font-black">{model.id}</div>
                                        {model.name}
                                    </div>
                                    <Printer className="h-4 w-4 text-slate-300 group-hover:text-[#831832] transition-colors" />
                                </button>
                            ))}
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

            {/* Automated Lead Matching Section */}
            <MatchingLeads property={property} />
        </div>
    );
}

