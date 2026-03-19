"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const homeSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
const mapPinSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';

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

const createPriceIcon = (bgColor: string, price: number) => {
    const formattedPrice = formatAbbreviatedPrice(price);

    return L.divIcon({
        className: 'custom-leaflet-auto-marker',
        html: `
            <div style="position: relative; display: inline-flex; flex-direction: column; align-items: center; filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.4)); transform: translate(-50%, -100%); margin-top: 4px;">
                <div style="background-color: ${bgColor}; color: white; padding: 3px 6px; border-radius: 6px; font-weight: 800; font-size: 11px; border: 2px solid white; white-space: nowrap; line-height: 1.1;">
                    ${formattedPrice}€
                </div>
                <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid white; margin-top: -1px;"></div>
                <div style="position: absolute; bottom: 2px; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid ${bgColor}; z-index: 10;"></div>
            </div>
        `,
        iconAnchor: [0, 0],
        popupAnchor: [0, -28]
    });
};

const getHomeIcon = () => L.divIcon({
    className: 'custom-leaflet-auto-marker',
    html: `
        <div style="position: relative; display: inline-flex; flex-direction: column; align-items: center; filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.4)); transform: translate(-50%, -100%); z-index: 100;">
            <div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; z-index: 100;">
                ${homeSvg}
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid white; margin-top: -2px;"></div>
            <div style="position: absolute; bottom: 2px; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid #ef4444; z-index: 10;"></div>
        </div>
    `,
    iconAnchor: [0, 0],
    popupAnchor: [0, -38]
});

const getOfficeIcon = () => L.divIcon({
    className: 'custom-leaflet-auto-marker',
    html: `
        <div style="position: relative; display: inline-flex; flex-direction: column; align-items: center; filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.4)); transform: translate(-50%, -100%); z-index: 200;">
            <div style="background-color: #ffffff; padding: 4px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px; border: 2px solid #fbbf24; z-index: 200;">
                ${mapPinSvg}
                <span style="color: #0f172a; font-weight: 800; font-size: 10px; line-height: 1; white-space: nowrap;">¡Visítanos!</span>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #fbbf24; margin-top: -1px;"></div>
            <div style="position: absolute; bottom: 2px; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid #ffffff; z-index: 10;"></div>
        </div>
    `,
    iconAnchor: [0, 0],
    popupAnchor: [0, -32]
});

interface Property {
    id: string;
    title: string;
    title_en?: string;
    city: string;
    price: number;
    operation_type: string;
    lat?: number;
    lng?: number;
    image?: string;
    images?: string[];
    bedrooms?: number;
    bathrooms?: number;
    size_m2?: number;
    features?: {
        bedrooms?: number;
        bathrooms?: number;
        size_m2?: number;
        image?: string;
        latitude?: number;
        longitude?: number;
    };
}

interface MapClientProps {
    centerLat: number;
    centerLng: number;
    approximateAddress: string;
    otherProperties: Property[];
    hideCenterMarker?: boolean;
    locale?: string;
}

export default function MapClient({ centerLat, centerLng, approximateAddress, otherProperties, hideCenterMarker, locale = 'es' }: MapClientProps) {
    const defaultCenter: [number, number] = [centerLat, centerLng];
    const homeIcon = getHomeIcon();
    const officeIcon = getOfficeIcon();

    return (
        <MapContainer center={defaultCenter} zoom={14} scrollWheelZoom={false} style={{ height: '350px', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {/* Current property marker */}
            {!hideCenterMarker && (
                <Marker position={defaultCenter} icon={homeIcon} zIndexOffset={50}>
                    <Popup>
                        <div className="font-bold text-sm">{locale === 'en' ? 'This property' : 'Esta propiedad'}</div>
                        <div className="text-xs text-gray-600">{approximateAddress}</div>
                    </Popup>
                </Marker>
            )}

            {/* Office marker */}
            <Marker position={[36.595555, -4.573103]} icon={officeIcon} zIndexOffset={100}>
                <Popup className="property-popup">
                    <div className="p-3 text-center">
                        <h4 className="font-bold text-slate-900 mb-1">Alros Inmobiliaria</h4>
                        <p className="text-xs text-slate-600 mb-2">Avenida Juan Luis Peralta 22</p>
                        <p className="text-xs text-slate-600 mb-3">29639 Benalmádena, Málaga</p>
                        <a href={locale === 'en' ? "/en/contacto" : "/contacto"} className="block text-center text-xs bg-slate-900 text-[#fbbf24] px-3 py-1.5 rounded hover:bg-slate-800 transition-colors font-medium">
                            {locale === 'en' ? 'Come visit us →' : 'Ven a visitarnos →'}
                        </a>
                    </div>
                </Popup>
            </Marker>

            {otherProperties.map((prop) => {
                const lat = prop.lat || prop.features?.latitude;
                const lng = prop.lng || prop.features?.longitude;
                if (!lat || !lng) return null;

                const iconColor = prop.operation_type === 'venta' ? '#10b981' : '#f97316';
                const icon = createPriceIcon(iconColor, prop.price);

                return (
                    <Marker key={prop.id} position={[lat, lng]} icon={icon}>
                        <Popup className="property-popup">
                            <div className="w-48 overflow-hidden rounded">
                                <img
                                    src={prop.image || (prop.images && prop.images[0]) || prop.features?.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200"}
                                    alt={locale === 'en' ? (prop.title_en || prop.title) : prop.title}
                                    className="w-full h-24 object-cover"
                                />
                                <div className="p-1.5 px-2">
                                    <h4 className="font-bold text-slate-900 text-[13px] tracking-tight mb-0.5 truncate">{locale === 'en' ? (prop.title_en || prop.title) : prop.title}</h4>
                                    <p className="text-[13px] font-black text-black mb-0.5">{formatAbbreviatedPrice(prop.price)}€</p>

                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1.5 font-medium tracking-tight">
                                        {(prop.bedrooms || prop.features?.bedrooms) ? <span>{prop.bedrooms || prop.features?.bedrooms} {locale === 'en' ? 'beds' : 'hab'}</span> : null}
                                        {(prop.bathrooms || prop.features?.bathrooms) ? <span>• {prop.bathrooms || prop.features?.bathrooms} {locale === 'en' ? 'baths' : 'ba'}</span> : null}
                                        {(prop.size_m2 || prop.features?.size_m2) ? <span>• {prop.size_m2 || prop.features?.size_m2} m²</span> : null}
                                    </div>

                                    <div className="px-1 pb-0.5">
                                        <a href={locale === 'en' ? `/en/propiedades/${prop.id}` : `/propiedades/${prop.id}`} className="block text-center text-xs bg-[#881337] text-white px-2 py-1.5 rounded-md hover:bg-[#6b0f2b] transition-colors font-bold shadow-sm" style={{ color: 'white' }}>
                                            {locale === 'en' ? 'View property →' : 'Ver propiedad →'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            <style>{`
                .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 0.5rem; }
                .leaflet-popup-content { margin: 0; }
                .leaflet-container { z-index: 10; }
                .custom-leaflet-auto-marker { background: transparent; border: none; }
                .custom-leaflet-auto-marker > div { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .custom-leaflet-auto-marker:hover { z-index: 1000 !important; cursor: pointer; }
                .custom-leaflet-auto-marker:hover > div { transform: translate(-50%, -100%) scale(1.15) !important; }
            `}</style>
        </MapContainer>
    );
}
