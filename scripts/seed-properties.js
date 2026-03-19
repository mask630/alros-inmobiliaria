const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role to delete and insert freely

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
    console.log("Starting data reset and seed...");

    // 1. Delete all properties
    const { error: deleteError } = await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (deleteError) {
        console.error("Error clearing properties:", deleteError);
        return;
    }
    console.log("Cleared all existing properties.");

    // 2. Prepare 10 high-quality properties
    const properties = [
        // VENTA - BENALMÁDENA
        {
            referencia: "2FD268BA-V1",
            title: "Espectacular Villa de Lujo en Benalmádena Pueblo",
            title_en: "Spectacular Luxury Villa in Benalmádena Pueblo",
            price: 1250000,
            operation_type: "venta",
            property_type: "villa",
            city: "Benalmádena",
            bedrooms: 5,
            bathrooms: 4,
            size_m2: 380,
            images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"],
            status: "disponible"
        },
        {
            referencia: "2FD268BA-V2",
            title: "Ático con Vistas Panorámicas en El Higuerón",
            title_en: "Penthouse with Panoramic Views in El Higuerón",
            price: 895000,
            operation_type: "venta",
            property_type: "atico",
            city: "Benalmádena",
            bedrooms: 3,
            bathrooms: 2,
            size_m2: 145,
            images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"],
            status: "disponible"
        },
        // VENTA - FUENGIROLA
        {
            referencia: "2FD268BA-V3",
            title: "Apartamento Moderno en Primera Línea de Playa Fuengirola",
            title_en: "Modern Frontline Beach Apartment Fuengirola",
            price: 425000,
            operation_type: "venta",
            property_type: "apartamento",
            city: "Fuengirola",
            bedrooms: 2,
            bathrooms: 2,
            size_m2: 95,
            images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"],
            status: "disponible"
        },
        {
            referencia: "2FD268BA-V4",
            title: "Chalet Independiente en Torreblanca del Sol",
            title_en: "Independent Villa in Torreblanca del Sol",
            price: 649000,
            operation_type: "venta",
            property_type: "casa",
            city: "Fuengirola",
            bedrooms: 4,
            bathrooms: 3,
            size_m2: 210,
            images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80"],
            status: "disponible"
        },
        // VENTA - MIJAS / OTROS
        {
            referencia: "2FD268BA-V5",
            title: "Casa de Campo Reformada en Mijas Pueblo",
            title_en: "Renovated Country House in Mijas Village",
            price: 535000,
            operation_type: "venta",
            property_type: "casa",
            city: "Mijas",
            bedrooms: 3,
            bathrooms: 2,
            size_m2: 160,
            images: ["https://images.unsplash.com/photo-1580587767376-067df04400a7?auto=format&fit=crop&w=1200&q=80"],
            status: "disponible"
        },
        
        // ALQUILER - BENALMÁDENA
        {
            referencia: "2FD268BA-R1",
            title: "Apartamento de Diseño en Puerto Marina",
            title_en: "Design Apartment in Puerto Marina",
            price: 1350,
            operation_type: "alquiler",
            property_type: "apartamento",
            city: "Benalmádena",
            bedrooms: 2,
            bathrooms: 1,
            size_m2: 70,
            images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"],
            status: "disponible"
        },
        {
            referencia: "2FD268BA-R2",
            title: "Estudio Reformado en Arroyo de la Miel",
            title_en: "Renovated Studio in Arroyo de la Miel",
            price: 750,
            operation_type: "alquiler",
            property_type: "estudio",
            city: "Benalmádena",
            bedrooms: 1,
            bathrooms: 1,
            size_m2: 45,
            images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80"],
            status: "disponible"
        },
        // ALQUILER - FUENGIROLA
        {
            referencia: "2FD268BA-R3",
            title: "Piso Amplio en Los Boliches",
            title_en: "Large Flat in Los Boliches",
            price: 1100,
            operation_type: "alquiler",
            property_type: "apartamento",
            city: "Fuengirola",
            bedrooms: 3,
            bathrooms: 2,
            size_m2: 115,
            images: ["https://images.unsplash.com/photo-1600585154340-be6199f7a096?auto=format&fit=crop&w=1200&q=80"],
            status: "disponible"
        },
        {
            referencia: "2FD268BA-R4",
            title: "Dúplex con Terraza en el Centro de Fuengirola",
            title_en: "Duplex with Terrace in Fuengirola Center",
            price: 1250,
            operation_type: "alquiler",
            property_type: "duplex",
            city: "Fuengirola",
            bedrooms: 2,
            bathrooms: 2,
            size_m2: 90,
            images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"],
            status: "disponible"
        },
        {
            referencia: "2FD268BA-R5",
            title: "Ático Exclusivo en Reserva del Higuerón",
            title_en: "Exclusive Penthouse in Reserva del Higuerón",
            price: 2400,
            operation_type: "alquiler",
            property_type: "atico",
            city: "Fuengirola",
            bedrooms: 3,
            bathrooms: 2,
            size_m2: 130,
            images: ["https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=1200&q=80"],
            status: "disponible"
        }
    ];

    // 3. Insert!
    const { error: insertError } = await supabase.from('properties').insert(properties);
    if (insertError) {
        console.error("Error seeding properties:", insertError);
    } else {
        console.log(`Successfully seeded ${properties.length} high-quality properties.`);
    }
}

seedData();
