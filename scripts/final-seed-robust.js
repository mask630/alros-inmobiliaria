const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const pData = [
    {
        referencia: "2FD268BA-01",
        title: "Villa de Lujo en Benalmádena Pueblo",
        title_en: "Luxury Villa in Benalmádena Pueblo",
        description: "Impresionante villa de estilo contemporáneo con piscina privada y vistas panorámicas. 5 dormitorios espaciosos y acabados de lujo.",
        description_en: "Stunning contemporary villa with private pool and panoramic views. 5 spacious bedrooms and luxury finishes.",
        price: 1350000,
        operation_type: "venta",
        property_type: "villa",
        city: "Benalmádena",
        bedrooms: 5,
        bathrooms: 4,
        size_m2: 350,
        status: "disponible",
        images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"],
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
    },
    {
        referencia: "2FD268BA-02",
        title: "Apartamento Playa Los Boliches",
        title_en: "Los Boliches Beach Apartment",
        description: "Luminoso apartamento frente al mar en Fuengirola. Totalmente amueblado y listo para disfrutar.",
        description_en: "Bright beachfront apartment in Fuengirola. Fully furnished and ready to enjoy.",
        price: 420000,
        operation_type: "venta",
        property_type: "apartamento",
        city: "Fuengirola",
        bedrooms: 2,
        bathrooms: 2,
        size_m2: 85,
        status: "disponible",
        images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"],
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
    },
    {
        referencia: "2FD268BA-03",
        title: "Ático Reserva del Higuerón",
        title_en: "Higuerón Luxury Penthouse",
        description: "Exclusivo ático con gran terraza y jacuzzi. Ubicado en la mejor zona residencial de la Costa del Sol.",
        description_en: "Exclusive penthouse with large terrace and jacuzzi. Located in the best residential area of the Costa del Sol.",
        price: 890000,
        operation_type: "venta",
        property_type: "atico",
        city: "Fuengirola",
        bedrooms: 3,
        bathrooms: 3,
        size_m2: 155,
        status: "disponible",
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
    },
    {
        referencia: "2FD268BA-04",
        title: "Dúplex Centro Fuengirola",
        title_en: "Fuengirola Center Duplex",
        description: "Moderno dúplex reformado en el corazón de Fuengirola. Cerca de todos los servicios y la playa.",
        description_en: "Modern renovated duplex in the heart of Fuengirola. Close to all services and the beach.",
        price: 315000,
        operation_type: "venta",
        property_type: "duplex",
        city: "Fuengirola",
        bedrooms: 2,
        bathrooms: 2,
        size_m2: 95,
        status: "disponible",
        images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"],
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
    },
    {
        referencia: "2FD268BA-05",
        title: "Villa con Vistas, Torremolinos",
        title_en: "Villa with Views, Torremolinos",
        description: "Chalet independiente con jardín privado y piscina. Vistas espectaculares a la bahía de Málaga.",
        description_en: "Independent villa with private garden and pool. Spectacular views of the bay of Malaga.",
        price: 750000,
        operation_type: "venta",
        property_type: "villa",
        city: "Torremolinos",
        bedrooms: 4,
        bathrooms: 3,
        size_m2: 210,
        status: "disponible",
        images: ["https://images.unsplash.com/photo-1580587767376-067df04400a7?w=800"],
        image: "https://images.unsplash.com/photo-1580587767376-067df04400a7?w=800"
    },
    {
        referencia: "2FD268BA-06",
        title: "Apartamento Alquiler Puerto Marina",
        title_en: "Puerto Marina Rental Apartment",
        description: "Perfecto para larga temporada en Benalmádena. Totalmente equipado y con vistas al puerto.",
        description_en: "Perfect for long term in Benalmádena. Fully equipped and with marina views.",
        price: 1350,
        operation_type: "alquiler",
        property_type: "apartamento",
        city: "Benalmádena",
        bedrooms: 2,
        bathrooms: 1,
        size_m2: 70,
        status: "disponible",
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
    },
    {
        referencia: "2FD268BA-07",
        title: "Estudio Fuengirola Centro",
        title_en: "Fuengirola Center Studio",
        description: "Estudio moderno ideal para una persona o pareja. Cerca de comercios y transporte.",
        description_en: "Modern studio ideal for one person or a couple. Close to shops and transport.",
        price: 850,
        operation_type: "alquiler",
        property_type: "estudio",
        city: "Fuengirola",
        bedrooms: 1,
        bathrooms: 1,
        size_m2: 45,
        status: "disponible",
        images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"],
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
    },
    {
        referencia: "2FD268BA-08",
        title: "Piso Familiar en Benalmádena",
        title_en: "Family Flat in Benalmádena",
        description: "Espacioso bajo con jardín privado. 3 dormitorios y garaje incluido.",
        description_en: "Spacious ground floor with private garden. 3 bedrooms and garage included.",
        price: 1200,
        operation_type: "alquiler",
        property_type: "piso",
        city: "Benalmádena",
        bedrooms: 3,
        bathrooms: 2,
        size_m2: 110,
        status: "disponible",
        images: ["https://images.unsplash.com/photo-1600585154340-be6199f7a096?w=800"],
        image: "https://images.unsplash.com/photo-1600585154340-be6199f7a096?w=800"
    },
    {
        referencia: "2FD268BA-09",
        title: "Chalet Adosado en Mijas",
        title_en: "Townhouse in Mijas",
        description: "En zona tranquila a 5 minutos de Fuengirola. Jardín y piscina comunitaria.",
        description_en: "In a quiet area 5 minutes from Fuengirola. Garden and communal pool.",
        price: 1550,
        operation_type: "alquiler",
        property_type: "casa",
        city: "Mijas",
        bedrooms: 3,
        bathrooms: 2,
        size_m2: 130,
        status: "disponible",
        images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"],
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
    },
    {
        referencia: "2FD268BA-10",
        title: "Ático Lujo Torrequebrada",
        title_en: "Luxury Penthouse Torrequebrada",
        description: "Ático espectacular con solárium. Calidades premium y seguridad.",
        description_en: "Spectacular penthouse with solarium. Premium qualities and security.",
        price: 2400,
        operation_type: "alquiler",
        property_type: "atico",
        city: "Benalmádena",
        bedrooms: 3,
        bathrooms: 2,
        size_m2: 125,
        status: "disponible",
        images: ["https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?w=800"],
        image: "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?w=800"
    }
];

async function run() {
    console.log("Seeding core properties...");
    for (const p of pData) {
        const { error } = await supabase.from('properties').insert([p]);
        if (error) console.error(`Error ${p.referencia}:`, error.message);
        else console.log(`Inyectada ${p.referencia}`);
    }
}
run();
