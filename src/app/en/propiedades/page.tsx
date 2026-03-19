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
                    <PropertyFilters locale="en" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">

                {properties.length === 0 ? (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-slate-700">No properties found.</h3>
                        <p className="text-slate-500">Try adjusting your search filters.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-500 mb-6 text-sm">
                            {properties.length} {properties.length === 1 ? 'property found' : 'properties found'}
                            {(params.bedrooms || params.bathrooms || params.maxPrice || params.type) && (
                                <span className="ml-1">• Sorted by relevance</span>
                            )}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {properties.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    id={property.id}
                                    image={property.image || property.features?.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                                    title={property.title_en || property.title}
                                    price={Number(property.price).toLocaleString('de-DE') + (property.operation_type === 'alquiler' ? ' €/month' : ' €')}
                                    location={property.city}
                                    specs={{
                                        beds: property.bedrooms || property.features?.bedrooms || 0,
                                        baths: property.bathrooms || property.features?.bathrooms || 0,
                                        area: property.size_m2 || property.features?.size_m2 || 0
                                    }}
                                    tag={property.operation_type === 'venta' ? 'Sale' : 'Rent'}
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

interface PropertyCardProps {
    id: string;
    image: string;
    title: string;
    price: string;
    location: string;
    specs: { beds: number; baths: number; area: number };
    tag: string;
    propertyType?: string;
    status?: string;
}

function PropertyCard({ id, image, title, price, location, specs, tag, propertyType, status }: PropertyCardProps) {
    // Format property type for display
    const formatPropertyType = (type: string | undefined) => {
        if (!type) return null;
        const typeLabels: Record<string, string> = {
            'apartamento': 'Apartment',
            'atico': 'Penthouse',
            'duplex': 'Duplex',
            'estudio': 'Studio',
            'loft': 'Loft',
            'villa': 'Villa',
            'adosado': 'Townhouse',
            'pareado': 'Semi-detached',
            'chalet': 'Chalet',
            'casa_rural': 'Country House',
            'piso': 'Apartment', // Map old 'piso' to 'Apartment'
            'casa': 'House'
        };
        return typeLabels[type] || type;
    };

    return (
        <Link href={`/en/propiedades/${id}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200">
            <div className="relative h-56 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                {status && status !== 'disponible' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                        <span className="text-white font-black text-2xl uppercase tracking-widest border-4 border-white px-4 py-2 rotate-[-15deg] shadow-xl">
                            {status === 'vendido' ? 'SOLD' :
                                status === 'reservado' ? 'RESERVED' :
                                    status === 'alquilado' ? 'RENTED' : status}
                        </span>
                    </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${tag === 'Rent' ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                        {tag}
                    </span>
                    {propertyType && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/90 text-slate-700">
                            {formatPropertyType(propertyType)}
                        </span>
                    )}
                </div>
            </div>
            <div className="p-4">
                <div className="mb-3">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-[#881337] transition-colors">{title}</h3>
                    <div className="flex items-center text-slate-500 text-sm mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {location}
                    </div>
                </div>

                <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                    <div className="flex gap-3 text-slate-600 text-sm">
                        <div className="flex items-center gap-1"><Bed className="h-3 w-3" /> {specs.beds}</div>
                        <div className="flex items-center gap-1"><Bath className="h-3 w-3" /> {specs.baths}</div>
                        <div className="flex items-center gap-1"><Maximize className="h-3 w-3" /> {specs.area}m²</div>
                    </div>
                    <p className="text-lg font-bold text-[#881337]">{price}</p>
                </div>
            </div>
        </Link>
    );
}
