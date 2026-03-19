import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Using Anon key for simplicity as this is dev/demo. In prod, use Service Role or protect with auth.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    // 1. Clear existing properties to avoid duplicates
    const { error: deleteError } = await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const mockProperties = [
        // ==================== PROPIEDADES EN VENTA ====================
        {
            title: "Ático de Lujo con Terraza Panorámica",
            description: `Espectacular ático en primera línea de playa con vistas panorámicas al Mar Mediterráneo. 

Esta propiedad de alta gama cuenta con una terraza de 60m² perfecta para disfrutar de puestas de sol inolvidables. Acabados de primera calidad: suelos de mármol, cocina de diseño italiano con electrodomésticos Miele, domótica completa y sistema de climatización por zonas.

La urbanización dispone de piscina infinita, gimnasio, seguridad 24h y 2 plazas de garaje incluidas. Una oportunidad única para quien busca el máximo lujo y confort.`,
            price: 785000,
            property_type: "atico",
            operation_type: "venta",
            status: "disponible",
            city: "Benalmádena Costa",
            address: "Av. Antonio Machado, Benalmádena Costa", // Zona aproximada, no exacta
            features: {
                bedrooms: 3,
                bathrooms: 3,
                size_m2: 165,
                year_built: 2021,
                garage: true,
                pool: true,
                terrace: true,
                elevator: true,
                air_conditioning: true,
                heating: true,
                image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85"
                ],
                video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                is_featured: true,
                badge: "Lujo"
            }
        },
        {
            title: "Villa Contemporánea con Piscina Infinita",
            description: `Impresionante villa de diseño contemporáneo ubicada en la exclusiva zona de Reserva del Higuerón.

Esta propiedad excepcional ofrece 450m² construidos en una parcela de 1.200m², con jardín paisajístico y piscina infinita con vistas al mar. La casa cuenta con 5 dormitorios en suite, salón de doble altura con chimenea, cocina profesional, bodega climatizada y cine privado.

Materiales de primera calidad: ventanales de suelo a techo, madera de roble, piedra natural y sistema de domótica KNX. Garaje para 3 vehículos y cuarto de servicio independiente.`,
            price: 2450000,
            property_type: "casa",
            operation_type: "venta",
            status: "disponible",
            city: "Benalmádena Pueblo",
            address: "Camino de Capellanía, Benalmádena Pueblo",
            features: {
                bedrooms: 5,
                bathrooms: 5,
                size_m2: 450,
                plot_size: 1200,
                year_built: 2019,
                garage: true,
                pool: true,
                garden: true,
                terrace: true,
                air_conditioning: true,
                heating: true,
                image: "https://images.unsplash.com/photo-1613490493576-2f045b1a0677?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1613490493576-2f045b1a0677?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85"
                ],
                video_url: "https://www.youtube.com/embed/K4TOrB7at0Y",
                matterport: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
                is_featured: true,
                badge: "Exclusivo"
            }
        },
        {
            title: "Apartamento Reformado junto al Parque de la Paloma",
            description: `Luminoso apartamento completamente reformado a escasos metros del famoso Parque de la Paloma.

Distribución inteligente con 85m² útiles: amplio salón-comedor, cocina americana equipada, 2 dormitorios (principal con vestidor) y baño moderno con plato de ducha. Orientación sur con mucha luz natural.

Urbanización con zonas verdes, piscina comunitaria y plaza de garaje incluida. Ideal como primera vivienda o inversión para alquiler. ¡No necesita reformas!`,
            price: 225000,
            property_type: "apartamento",
            operation_type: "venta",
            status: "disponible",
            city: "Arroyo de la Miel",
            address: "Avenida de la Constitución, Arroyo de la Miel",
            features: {
                bedrooms: 2,
                bathrooms: 1,
                size_m2: 85,
                year_built: 2008,
                garage: true,
                pool: true,
                elevator: true,
                air_conditioning: true,
                image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=85"
                ],
                is_featured: true,
                badge: "Reformado"
            }
        },
        {
            title: "Dúplex con Jardín Privado en Torrequebrada",
            description: `Fantástico dúplex con jardín privado de 80m² en la prestigiosa zona de Torrequebrada.

Planta baja: salón con salida directa al jardín, cocina equipada con office y aseo de cortesía. Planta alta: 3 dormitorios con armarios empotrados y 2 baños completos.

A 5 minutos andando del campo de golf y a 10 minutos de la playa. Urbanización con piscina, pádel y vigilancia 24h. Perfecto para familias que buscan tranquilidad sin renunciar a los servicios.`,
            price: 385000,
            property_type: "duplex",
            operation_type: "venta",
            status: "disponible",
            city: "Benalmádena Costa",
            address: "Urbanización Torrequebrada, Benalmádena",
            features: {
                bedrooms: 3,
                bathrooms: 2,
                size_m2: 135,
                year_built: 2015,
                garden: true,
                pool: true,
                terrace: true,
                air_conditioning: true,
                heating: true,
                image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=85"
                ],
                video_url: "https://www.youtube.com/embed/2Vv-BfVoq4g"
            }
        },
        {
            title: "Estudio de Diseño en Puerto Marina",
            description: `Moderno estudio con vistas al icónico Puerto Marina, ganador del premio "Mejor Marina del Mundo".

Espacio diáfano de 48m² con acabados de alta calidad: suelo laminado, cocina abierta con barra americana y electrodomésticos nuevos. Baño reformado con mampara de cristal.

Ubicación inmejorable: restaurantes, tiendas y vida nocturna a tus pies. Inversión perfecta para alquiler turístico con alta rentabilidad. Se vende amueblado.`,
            price: 165000,
            property_type: "estudio",
            operation_type: "venta",
            status: "disponible",
            city: "Benalmádena Costa",
            address: "Puerto Deportivo Marina, Benalmádena",
            features: {
                bedrooms: 0,
                bathrooms: 1,
                size_m2: 48,
                year_built: 2010,
                air_conditioning: true,
                image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1630699144867-37acec97df5a?auto=format&fit=crop&w=1200&q=85"
                ],
                badge: "Inversión"
            }
        },
        {
            title: "Adosado Familiar en La Capellanía",
            description: `Encantador adosado en la tranquila urbanización de La Capellanía, zona residencial por excelencia.

Vivienda de 3 plantas: planta baja con salón, cocina y aseo; primera planta con 3 dormitorios y 2 baños; sótano con garaje para 2 coches y trastero. Jardín delantero y patio trasero.

Comunidad familiar con piscina, zonas verdes y parque infantil. Cerca de colegios, supermercados y transporte público. Ideal para familias que buscan calidad de vida.`,
            price: 295000,
            property_type: "casa",
            operation_type: "venta",
            status: "disponible",
            city: "Arroyo de la Miel",
            address: "Zona La Capellanía, Arroyo de la Miel",
            features: {
                bedrooms: 3,
                bathrooms: 2,
                size_m2: 175,
                year_built: 2005,
                garage: true,
                pool: true,
                garden: true,
                air_conditioning: true,
                image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600566752355-35792bedcfe3?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=85"
                ]
            }
        },
        {
            title: "Apartamento Nuevo a Estrenar con Vistas Mar",
            description: `Apartamento de obra nueva en edificio recién terminado con impresionantes vistas al mar.

Calidades premium: ventanas con rotura de puente térmico, aerotermia, suelos porcelánicos, griferías Grohe y sanitarios Roca. Cocina amueblada con encimera de cuarzo.

Urbanización moderna con piscina desbordante, gimnasio equipado y jardines tropicales. Primera ocupación con certificación energética A. ¡Últimas unidades disponibles!`,
            price: 345000,
            property_type: "apartamento",
            operation_type: "venta",
            status: "disponible",
            city: "Benalmádena Costa",
            address: "Zona Bil Bil, Benalmádena Costa",
            features: {
                bedrooms: 2,
                bathrooms: 2,
                size_m2: 95,
                year_built: 2024,
                garage: true,
                pool: true,
                terrace: true,
                elevator: true,
                air_conditioning: true,
                heating: true,
                image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600566753104-685f4f24cb4d?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=85"
                ],
                video_url: "https://www.youtube.com/embed/1La4QzGeaaQ",
                is_featured: true,
                badge: "Obra Nueva"
            }
        },

        // ==================== PROPIEDADES EN ALQUILER ====================
        {
            title: "Apartamento Amueblado Larga Temporada Centro",
            description: `Cómodo apartamento completamente amueblado para alquiler de larga temporada en el centro de Arroyo de la Miel.

Distribución perfecta: salón comedor luminoso, cocina equipada con lavadora y lavavajillas, 2 dormitorios exteriores y baño completo. AC frío/calor en todas las estancias.

Ubicación privilegiada: junto a C.C. Miramar, parada de metro, autobuses y todos los servicios. Gastos de comunidad incluidos. Disponible inmediata.`,
            price: 950,
            property_type: "apartamento",
            operation_type: "alquiler",
            status: "disponible",
            city: "Arroyo de la Miel",
            address: "Centro Arroyo de la Miel, Benalmádena",
            features: {
                bedrooms: 2,
                bathrooms: 1,
                size_m2: 75,
                year_built: 2000,
                elevator: true,
                air_conditioning: true,
                heating: true,
                image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=85"
                ]
            }
        },
        {
            title: "Apartamento de Lujo Primera Línea de Playa",
            description: `Exclusivo apartamento en primera línea de playa disponible para alquiler mensual o de temporada.

Decoración de diseño con vistas espectaculares desde el amplio salón y dormitorio principal. Cocina de autor totalmente equipada. 2 dormitorios, 2 baños y terraza frente al mar.

Edificio con conserjería, piscina climatizada, spa y acceso directo a la playa. Ideal para ejecutivos o familias que buscan la máxima calidad. WiFi de alta velocidad incluido.`,
            price: 1850,
            property_type: "apartamento",
            operation_type: "alquiler",
            status: "disponible",
            city: "Benalmádena Costa",
            address: "Paseo Marítimo, Benalmádena Costa",
            features: {
                bedrooms: 2,
                bathrooms: 2,
                size_m2: 110,
                year_built: 2018,
                pool: true,
                terrace: true,
                elevator: true,
                air_conditioning: true,
                heating: true,
                image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=85"
                ],
                video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                badge: "Premium"
            }
        },
        {
            title: "Chalet Vacacional con Piscina Privada",
            description: `Espectacular chalet disponible para alquiler vacacional por semanas o meses.

Casa de 4 dormitorios con capacidad para 8 personas. Amplio salón con chimenea, cocina totalmente equipada, piscina privada climatizable, barbacoa y jardín de 500m².

Ubicación perfecta: zona tranquila pero a 10 minutos en coche de la playa y del centro. Aire acondicionado, WiFi, Smart TV en todas las habitaciones y plaza de parking privado. Mascotas bienvenidas.`,
            price: 2800,
            property_type: "casa",
            operation_type: "alquiler",
            status: "disponible",
            city: "Benalmádena Pueblo",
            address: "Zona alta Benalmádena Pueblo",
            features: {
                bedrooms: 4,
                bathrooms: 3,
                size_m2: 280,
                plot_size: 800,
                year_built: 2012,
                pool: true,
                garden: true,
                terrace: true,
                garage: true,
                air_conditioning: true,
                heating: true,
                image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1613490493576-2f045b1a0677?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=85"
                ],
                video_url: "https://www.youtube.com/embed/K4TOrB7at0Y",
                is_featured: true,
                badge: "Vacacional"
            }
        },
        {
            title: "Estudio Céntrico Arroyo de la Miel",
            description: `Acogedor estudio reformado en pleno centro de Arroyo de la Miel.

Espacio optimizado de 38m² con zona de estar/dormitorio, cocina americana nueva y baño moderno. Muy luminoso con balcón a calle peatonal.

Ideal para persona sola o pareja. Cerca de transporte público, comercios y ocio. Gastos de agua y comunidad incluidos. No se admiten mascotas. Fianza: 2 meses.`,
            price: 650,
            property_type: "estudio",
            operation_type: "alquiler",
            status: "disponible",
            city: "Arroyo de la Miel",
            address: "Calle Malagueña, Arroyo de la Miel",
            features: {
                bedrooms: 0,
                bathrooms: 1,
                size_m2: 38,
                year_built: 1995,
                elevator: true,
                air_conditioning: true,
                image: "https://images.unsplash.com/photo-1630699144867-37acec97df5a?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1630699144867-37acec97df5a?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=85"
                ]
            }
        },
        {
            title: "Apartamento Familiar en Urbanización con Piscina",
            description: `Amplio apartamento de 3 dormitorios en urbanización cerrada con todas las comodidades.

Vivienda luminosa con salón grande, cocina independiente equipada, 3 dormitorios (1 en suite) y 2 baños. Terraza con vistas a la piscina comunitaria.

Urbanización con jardines, zona infantil, pádel y seguridad. Cerca de colegios internacionales y del centro comercial. Plaza de garaje y trastero incluidos. Contrato mínimo 1 año.`,
            price: 1200,
            property_type: "apartamento",
            operation_type: "alquiler",
            status: "disponible",
            city: "Benalmádena Costa",
            address: "Zona Parque de la Paloma, Benalmádena",
            features: {
                bedrooms: 3,
                bathrooms: 2,
                size_m2: 105,
                year_built: 2008,
                garage: true,
                pool: true,
                terrace: true,
                elevator: true,
                air_conditioning: true,
                image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=85",
                images: [
                    "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600566752355-35792bedcfe3?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=85",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85"
                ]
            }
        }
    ];

    // Add reference_id to each property for searchability
    const propertiesWithRefs = mockProperties.map((p, index) => ({
        ...p,
        reference_id: `ALT-${String(index + 1).padStart(3, '0')}`
    }));

    const { error } = await supabase.from('properties').insert(propertiesWithRefs);

    if (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        count: mockProperties.length,
        message: `Se han insertado ${mockProperties.length} propiedades con datos completos de Benalmádena`,
        deleted_error: deleteError
    });
}
