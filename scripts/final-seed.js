const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const properties = [
    { referencia: "2FD268BA-01", title: "Villa de Lujo en Benalmádena Pueblo", title_en: "Luxury Villa in Benalmádena Pueblo", price: 1250000, operation_type: "venta", property_type: "villa", city: "Benalmádena", address: "Calle Santo Domingo", bedrooms: 5, bathrooms: 4, size_m2: 350, images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"] },
    { referencia: "2FD268BA-02", title: "Apartamento Playa Los Boliches", title_en: "Los Boliches Beach Apartment", price: 420000, operation_type: "venta", property_type: "apartamento", city: "Fuengirola", address: "Av. del Rey de España", bedrooms: 2, bathrooms: 2, size_m2: 85, images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"] },
    { referencia: "2FD268BA-03", title: "Ático Reserva del Higuerón", title_en: "Higuerón Luxury Penthouse", price: 950000, operation_type: "venta", property_type: "atico", city: "Fuengirola", address: "Avda. del Higuerón", bedrooms: 3, bathrooms: 3, size_m2: 160, images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"] },
    { referencia: "2FD268BA-04", title: "Villa Moderna en La Capellanía", title_en: "Modern Villa in La Capellanía", price: 890000, operation_type: "venta", property_type: "villa", city: "Benalmádena", address: "Calle Jilguero", bedrooms: 4, bathrooms: 3, size_m2: 280, images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"] },
    { referencia: "2FD268BA-05", title: "Piso Centro Fuengirola", title_en: "Fuengirola Center Flat", price: 295000, operation_type: "venta", property_type: "piso", city: "Fuengirola", address: "Calle Condes de San Isidro", bedrooms: 3, bathrooms: 2, size_m2: 105, images: ["https://images.unsplash.com/photo-1580587767376-067df04400a7?w=800"] },
    { referencia: "2FD268BA-06", title: "Apartamento Puerto Marina", title_en: "Puerto Marina Apartment", price: 1200, operation_type: "alquiler", property_type: "apartamento", city: "Benalmádena", address: "Plaza de la Goleta", bedrooms: 2, bathrooms: 1, size_m2: 75, images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"] },
    { referencia: "2FD268BA-07", title: "Estudio Arroyo de la Miel", title_en: "Arroyo de la Miel Studio", price: 850, operation_type: "alquiler", property_type: "estudio", city: "Benalmádena", address: "Avda. de la Constitución", bedrooms: 1, bathrooms: 1, size_m2: 40, images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"] },
    { referencia: "2FD268BA-08", title: "Piso Amplio Los Boliches", title_en: "Spacious Flat Los Boliches", price: 1350, operation_type: "alquiler", property_type: "piso", city: "Fuengirola", address: "Calle Francisco Cano", bedrooms: 3, bathrooms: 2, size_m2: 110, images: ["https://images.unsplash.com/photo-1600585154340-be6199f7a096?w=800"] },
    { referencia: "2FD268BA-09", title: "Bajo con Jardín Torrequebrada", title_en: "Garden Flat Torrequebrada", price: 1600, operation_type: "alquiler", property_type: "piso", city: "Benalmádena", address: "Calle Camelias", bedrooms: 2, bathrooms: 2, size_m2: 95, images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"] },
    { referencia: "2FD268BA-10", title: "Ático Frontal Reserva del Higuerón", title_en: "Frontline Penthouse Higuerón", price: 2800, operation_type: "alquiler", property_type: "atico", city: "Fuengirola", address: "Avda. del Higuerón", bedrooms: 3, bathrooms: 2, size_m2: 140, images: ["https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?w=800"] }
];

async function run() {
    console.log("Cleaning and seeding...");
    try {
        await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const { error } = await supabase.from('properties').insert(properties);
        if (error) throw error;
        console.log("Success!");
    } catch (e) {
        console.error("Failed. If it's a permission error, run 'ALTER TABLE properties DISABLE ROW LEVEL SECURITY;' in Supabase SQL Editor.");
        console.error(e);
    }
}
run();
