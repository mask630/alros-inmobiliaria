"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix generic leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
    lat: number;
    lng: number;
    onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onLocationChange }: Props) {
    const markerRef = useRef<L.Marker>(null);
    const map = useMap();

    useEffect(() => {
        map.flyTo({ lat, lng }, map.getZoom(), { animate: false });
    }, [lat, lng, map]);

    useMapEvents({
        click(e) {
            onLocationChange(e.latlng.lat, e.latlng.lng);
        }
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    onLocationChange(newPos.lat, newPos.lng);
                }
            },
            click() {
                const marker = markerRef.current;
                if (marker) marker.openPopup();
            }
        }),
        [onLocationChange],
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={{ lat, lng }}
            ref={markerRef}
        >
            <Popup minWidth={90}>
                Arrastra este marcador o haz clic en el mapa para ajustar la ubicación.
            </Popup>
        </Marker>
    );
}

export default function DraggableMap({ lat, lng, onLocationChange }: Props) {
    // Safe defaults if NaN
    let useLat = isNaN(lat) || !lat ? 36.59 : lat;
    let useLng = isNaN(lng) || !lng ? -4.52 : lng;

    return (
        <MapContainer center={[useLat, useLng]} zoom={15} style={{ height: "100%", width: "100%", zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker lat={useLat} lng={useLng} onLocationChange={onLocationChange} />
        </MapContainer>
    );
}
