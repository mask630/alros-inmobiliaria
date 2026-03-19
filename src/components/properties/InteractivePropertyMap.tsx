"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Navigation, MapPin } from "lucide-react";
import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./MapClient'), {
    ssr: false,
    loading: () => <div className="h-[350px] bg-slate-100 flex items-center justify-center border border-slate-200 rounded-xl">Cargando mapa interactivo...</div>
});

interface Property {
    id: string;
    title: string;
    title_en?: string;
    city: string;
    price: number;
    operation_type: string;
    latitude?: number;
    longitude?: number;
    public_latitude?: number;
    public_longitude?: number;
    image?: string;
    images?: string[];
    features?: {
        bedrooms?: number;
        bathrooms?: number;
        image?: string;
        latitude?: number;
        longitude?: number;
    };
}

interface Props {
    currentPropertyId: string;
    currentCity: string;
    approximateAddress: string;
    publicLat?: number;
    publicLng?: number;
    locale?: string;
}

// Default fallback coordinates roughly in Benalmádena if not set
const DEFAULT_LAT = 36.598;
const DEFAULT_LNG = -4.526;

const formatAbbreviatedPrice = (price: number) => {
    if (price >= 1000000) {
        return (Number(price) / 1000000).toFixed(1).replace('.0', '') + 'M';
    } else if (price >= 10000) {
        return (Number(price) / 1000).toFixed(0) + 'K';
    } else if (price >= 1000) {
        return (Number(price) / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return Number(price).toLocaleString('de-DE');
};

export function InteractivePropertyMap({ currentPropertyId, currentCity, approximateAddress, publicLat, publicLng, locale = 'es' }: Props) {
    const [otherProperties, setOtherProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mapFilter, setMapFilter] = useState<'todos' | 'venta' | 'alquiler'>('todos');

    useEffect(() => {
        async function fetchOtherProperties() {
            try {
                const res = await fetch(`/api/properties?exclude=${currentPropertyId}&limit=50`);
                const data = await res.json();
                // solo coger las que tienen lat y lng (en raiz o en features)
                const validProps = (data.properties || []).filter((p: Property) => 
                    (p.latitude && p.longitude) || (p.features?.latitude && p.features?.longitude)
                );
                setOtherProperties(validProps);
            } catch (error) {
                console.error("Error fetching other properties:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchOtherProperties();
    }, [currentPropertyId]);

    const centerLat = publicLat || DEFAULT_LAT;
    const centerLng = publicLng || DEFAULT_LNG;

    return (
        <div className="space-y-4">
            {/* Map Container */}
            <div className="relative h-[350px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 mb-4">
                {!isLoading ? (
                    <MapClient
                        centerLat={centerLat}
                        centerLng={centerLng}
                        approximateAddress={approximateAddress}
                        otherProperties={otherProperties.filter(p => mapFilter === 'todos' || p.operation_type === mapFilter)}
                        locale={locale}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">{locale === 'en' ? 'Loading interactive map...' : 'Cargando mapa interactivo...'}</div>
                )}
            </div>

            {/* Legend as Filters (moved outside map to not overlap) */}
            <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <Home className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-slate-700 text-xs font-medium">{locale === 'en' ? 'Current Property' : 'Propiedad Actual'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-white rounded-full border border-amber-400 flex gap-1 items-center shadow-sm whitespace-nowrap">
                        <MapPin className="h-3 w-3 text-amber-500" />
                        <span className="font-bold text-[10px] text-slate-800">{locale === 'en' ? 'Visit us!' : '¡Visítanos!'}</span>
                    </div>
                </div>

                <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block"></div>

                <button
                    onClick={() => setMapFilter(mapFilter === 'venta' ? 'todos' : 'venta')}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors border ${mapFilter === 'venta' ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'border-transparent hover:bg-slate-100'}`}
                >
                    <div className="px-2 py-0.5 bg-emerald-500 rounded-full text-white font-bold text-[10px] border-2 border-white shadow-sm">
                        {locale === 'en' ? 'Price' : 'Precio'}
                    </div>
                    <span className={`text-xs font-bold ${mapFilter === 'venta' ? 'text-emerald-700' : 'text-slate-600'}`}>{locale === 'en' ? 'Sale Only' : 'Solo Venta'}</span>
                </button>

                <button
                    onClick={() => setMapFilter(mapFilter === 'alquiler' ? 'todos' : 'alquiler')}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors border ${mapFilter === 'alquiler' ? 'bg-orange-50 border-orange-200 shadow-sm' : 'border-transparent hover:bg-slate-100'}`}
                >
                    <div className="px-2 py-0.5 bg-orange-500 rounded-full text-white font-bold text-[10px] border-2 border-white shadow-sm">
                        {locale === 'en' ? 'Price' : 'Precio'}
                    </div>
                    <span className={`text-xs font-bold ${mapFilter === 'alquiler' ? 'text-orange-700' : 'text-slate-600'}`}>{locale === 'en' ? 'Rent Only' : 'Solo Alquiler'}</span>
                </button>
            </div>

            {/* Open in Google Maps button */}
            <a
                href={`https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
            >
                <Navigation className="h-4 w-4" />
                {locale === 'en' ? 'Open in Google Maps' : 'Abrir en Google Maps'}
            </a>

            {/* Properties List */}
            {!isLoading && otherProperties.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{locale === 'en' ? 'Other properties on the map' : 'Otras propiedades en el mapa'}</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {otherProperties
                            .filter(p => mapFilter === 'todos' || p.operation_type === mapFilter)
                            .slice(0, 5)
                            .map((prop) => (
                                    <Link
                                        key={prop.id}
                                        href={locale === 'en' ? `/en/propiedades/${prop.id}` : `/propiedades/${prop.id}`}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors group"
                                    >
                                        <div className={`w-3 h-3 rounded-full flex-shrink-0 border border-white ${prop.operation_type === 'venta' ? 'bg-emerald-500' : 'bg-orange-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                                {locale === 'en' ? (prop.title_en || prop.title) : prop.title}
                                            </p>
                                        </div>
                                    <p className="text-sm font-bold text-blue-600 flex-shrink-0">
                                        {formatAbbreviatedPrice(prop.price)}€
                                    </p>
                                </Link>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
