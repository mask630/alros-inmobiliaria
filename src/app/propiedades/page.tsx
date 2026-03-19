import Link from "next/link";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PropertyFilters } from "@/components/properties/PropertyFilters";

// Force dynamic rendering so we always get the latest properties and params
export const dynamic = 'force-dynamic';

interface Props {
    searchParams: { [key: string]: string | string[] | undefined }
}

interface PropertyWithScore {
    property: any;
    score: number;
    matchesOperation: boolean;
}

async function getProperties(params: any) {
    let query = supabase.from('properties').select('*');

    // STRICT FILTER: Operation type (venta/alquiler) - This must be respected
    if (params.operation && params.operation !== 'todos') {
        query = query.eq('operation_type', params.operation);
    }
    if (params.city && params.city !== 'todas') {
        query = query.eq('city', params.city);
    }

    const { data: properties, error } = await query;

    if (error) {
        console.error('Error fetching properties:', error);
        return [];
    }

    if (!properties || properties.length === 0) {
        return [];
    }

    // Parse filter parameters
    const targetType = params.type || null;
    const targetMaxPrice = params.maxPrice ? parseInt(params.maxPrice, 10) : null;
    const targetBedrooms = params.bedrooms ? parseInt(params.bedrooms, 10) : null;
    const targetBathrooms = params.bathrooms ? parseInt(params.bathrooms, 10) : null;
    const isStrict = params.strict === 'true';

    // If no filters applied, just return all properties sorted by date
    if (!targetType && !targetMaxPrice && !targetBedrooms && !targetBathrooms) {
        return properties.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    // Filter properties strictly if requested
    let filteredProperties = properties;
    if (isStrict) {
        if (targetBedrooms) {
            filteredProperties = filteredProperties.filter(p => (p.features?.bedrooms || 0) === targetBedrooms || p.bedrooms === targetBedrooms);
        }
        if (targetBathrooms) {
            filteredProperties = filteredProperties.filter(p => (p.features?.bathrooms || 0) === targetBathrooms || p.bathrooms === targetBathrooms);
        }
    }

    // Calculate a score for each property based on how well it matches the filters
    const scoredProperties: PropertyWithScore[] = filteredProperties.map(property => {
        let score = 0;
        const features = property.features || {};

        // Property type match (exact match gets high score)
        if (targetType) {
            if (property.property_type === targetType) {
                score += 100; // Exact match
            } else {
                // Check if it's in the same category (apartamento/casa)
                const apartamentoTypes = ['apartamento', 'atico', 'duplex', 'estudio', 'loft'];
                const casaTypes = ['casa', 'villa', 'adosado', 'pareado', 'chalet', 'casa_rural'];

                if (apartamentoTypes.includes(targetType) && apartamentoTypes.includes(property.property_type)) {
                    score += 50; // Same category
                } else if (casaTypes.includes(targetType) && casaTypes.includes(property.property_type)) {
                    score += 50; // Same category
                }
            }
        }

        // Price match - distance-based scoring
        if (targetMaxPrice) {
            const price = property.price || 0;
            if (price <= targetMaxPrice) {
                const utilizationPercent = price / targetMaxPrice;
                if (utilizationPercent >= 0.8) {
                    score += 100;
                } else if (utilizationPercent >= 0.5) {
                    score += 80;
                } else {
                    score += 60;
                }
            } else {
                const overBudgetPercent = (price - targetMaxPrice) / targetMaxPrice;
                if (overBudgetPercent <= 0.1) score += 70;
                else if (overBudgetPercent <= 0.25) score += 50;
                else if (overBudgetPercent <= 0.5) score += 30;
                else score += 5;
            }
        }

        // Bedrooms match (only if not already strictly filtered)
        if (targetBedrooms && !isStrict) {
            const bedrooms = property.bedrooms || features.bedrooms || 0;
            if (bedrooms >= targetBedrooms) {
                score += 50;
                if (bedrooms === targetBedrooms) score += 10;
            } else if (bedrooms === targetBedrooms - 1) {
                score += 25;
            }
        }

        // Bathrooms match (only if not already strictly filtered)
        if (targetBathrooms && !isStrict) {
            const bathrooms = property.bathrooms || features.bathrooms || 0;
            if (bathrooms >= targetBathrooms) {
                score += 40;
                if (bathrooms === targetBathrooms) score += 10;
            } else if (bathrooms === targetBathrooms - 1) {
                score += 20;
            }
        }

        return {
            property,
            score,
            matchesOperation: true // Already filtered by operation
        };
    });

    // Sort by score (highest first), then by price proximity (closest to target), then by date
    scoredProperties.sort((a, b) => {
        // 1. Primary: Score (relevance)
        if (b.score !== a.score) {
            return b.score - a.score;
        }

        // 2. Secondary: Price proximity (if maxPrice was searched)
        if (targetMaxPrice) {
            const diffA = Math.abs((a.property.price || 0) - targetMaxPrice);
            const diffB = Math.abs((b.property.price || 0) - targetMaxPrice);
            if (diffA !== diffB) {
                return diffA - diffB; // Smaller difference is better
            }
        }

        // 3. Tertiary: Creation date
        return new Date(b.property.created_at).getTime() - new Date(a.property.created_at).getTime();
    });

    return scoredProperties.map(sp => sp.property);
}


export default async function PropertiesPage({ searchParams }: Props) {
    const params = await Promise.resolve(searchParams);
    const properties = await getProperties(params);

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Header / Filter Bar */}
            <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <PropertyFilters />
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">

                {properties.length === 0 ? (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-slate-700">No se encontraron propiedades.</h3>
                        <p className="text-slate-500">Prueba a ajustar los filtros de búsqueda.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-500 mb-6 text-sm">
                            {properties.length} {properties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
                            {(params.bedrooms || params.bathrooms || params.maxPrice || params.type) && (
                                <span className="ml-1">• Ordenadas por relevancia</span>
                            )}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {properties.map((property, idx) => (
                                <PropertyCard
                                    key={property.id}
                                    id={property.id}
                                    index={idx}
                                    image={property.image || property.features?.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                                    title={property.title}
                                    price={Number(property.price).toLocaleString('de-DE') + (property.operation_type === 'alquiler' ? ' €/mes' : ' €')}
                                    location={property.city}
                                    specs={{
                                        beds: property.bedrooms || property.features?.bedrooms || 0,
                                        baths: property.bathrooms || property.features?.bathrooms || 0,
                                        area: property.size_m2 || property.features?.size_m2 || 0
                                    }}
                                    tag={property.operation_type === 'venta' ? (params.locale === 'en' ? 'For Sale' : 'Venta') : (params.locale === 'en' ? 'To Rent' : 'Alquiler')}
                                    propertyType={property.property_type}
                                    status={property.status}
                                />
                            ))}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

function PropertyCard({ id, index, image, title, price, location, specs, tag, propertyType, status }: any) {
    const formatPropertyType = (type: string | undefined) => {
        if (!type) return null;
        const typeLabels: Record<string, string> = {
            'apartamento': 'Apartamento',
            'atico': 'Ático',
            'duplex': 'Dúplex',
            'estudio': 'Estudio',
            'loft': 'Loft',
            'villa': 'Villa',
            'adosado': 'Adosado',
            'pareado': 'Pareado',
            'chalet': 'Chalet',
            'casa_rural': 'Casa Rural',
            'piso': 'Apartamento',
            'casa': 'Casa'
        };
        return typeLabels[type] || type;
    };

    return (
        <Link href={`/propiedades/${id}`} className="group block h-full">
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] transition-all duration-500 border border-slate-100 flex flex-col h-full transform hover:-translate-y-2 cursor-pointer relative">
                
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                    />
                    
                    {/* Status Overlays */}
                    {status && status !== 'disponible' && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-10 backdrop-blur-[2px]">
                            <span className="text-white font-black text-xl uppercase tracking-[0.2em] border-2 border-white/50 px-6 py-2 rotate-[-10deg] shadow-2xl">
                                {status === 'vendido' ? 'VENDIDO' :
                                    status === 'reservado' ? 'RESERVADO' :
                                        status === 'alquilado' ? 'ALQUILADO' : status}
                            </span>
                        </div>
                    )}

                    <div className="absolute top-4 left-4 flex gap-2 z-20">
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md shadow-lg border ${
                            tag.includes('Rent') || tag === 'Alquiler' 
                                ? 'bg-orange-500/90 text-white border-orange-400' 
                                : 'bg-[#881337]/90 text-white border-red-400'
                        }`}>
                            {tag}
                        </span>
                    </div>

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-900/80 to-transparent">
                        <p className="text-xl font-black text-white tracking-tighter drop-shadow-md">{price}</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow bg-white">
                    <div className="mb-4 flex-grow">
                         <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5 gap-2">
                            <MapPin className="h-3 w-3 text-[#881337]" />
                            {location}
                        </div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-[#881337] transition-colors line-clamp-2">
                            {title}
                        </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-5 border-t border-slate-50 mt-auto">
                        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50/50">
                            <Bed size={14} className="text-slate-400 mb-1" />
                            <span className="text-xs font-black text-slate-800">{specs.beds}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50/50">
                            <Bath size={14} className="text-slate-400 mb-1" />
                            <span className="text-xs font-black text-slate-800">{specs.baths}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50/50">
                            <Maximize size={14} className="text-slate-400 mb-1" />
                            <span className="text-xs font-black text-slate-800">{specs.area}m²</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

