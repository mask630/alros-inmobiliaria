'use server';

import { createClient } from "@/utils/supabase/server";

export async function processChatMessage(message: string, locale: string = 'es') {
    const isEn = locale === 'en';
    const supabase = await createClient();
    const query = message.toLowerCase();

    // 0. Hardcoded Knowledge (Backup if DB is empty)
    const backupKnowledge = [
        { title: "gastos compra", content: "Los gastos de compra suelen ser entre el 10-12% adicional (7% ITP + Notaría, Registro y Gestoría)." },
        { title: "vender documentos", content: "Para vender necesitamos Nota Simple, IBI, CEE, Escritura y Certificado de Comunidad." },
        { title: "hipoteca financacion", content: "Colaboramos con asesores que consiguen hasta el 100% de financiación según perfil." }
    ];

    // 1. Fetch Agency Knowledge
    const { data: knowledge } = await supabase
        .from('agency_knowledge')
        .select('*')
        .eq('is_active', true);

    const allKnowledge = [...backupKnowledge, ...(knowledge || [])];

    // 2. Fetch Public Properties (Limited data for context)
    const { data: properties } = await supabase
        .from('properties')
        .select('referencia, title, price, operation_type, property_type, city, bedrooms, bathrooms')
        .eq('status', 'disponible')
        .limit(5);

    // 3. Simple Keyword Match Engine (Fallback for no LLM)
    // We try to find the best match in the knowledge base
    let bestMatch: any = null;
    let maxOverlap = 0;

    if (allKnowledge) {
        for (const item of allKnowledge) {
            const words = item.title.toLowerCase().split(' ');
            const overlap = words.filter((w: string) => query.includes(w)).length;
            if (overlap > maxOverlap) {
                maxOverlap = overlap;
                bestMatch = item;
            }
        }
    }

    // Response Logic for Knowledge Base
    if (maxOverlap > 1 && bestMatch) {
        return {
            success: true,
            reply: bestMatch.content,
            suggestions: isEn ? ["Anything else?", "See properties"] : ["¿Algo más?", "Ver propiedades"]
        };
    }

    // 2. Social & Greetings Handling (The "Smartness" layer)
    const socialKeywords = {
        guest: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'hey', 'saludos', 'hi', 'hello', 'good morning', 'good afternoon'],
        thanks: ['gracias', 'perfecto', 'oc', 'ok', 'vale', 'entendido', 'thanks', 'thank you', 'great', 'awesome'],
        identity: ['quien eres', 'eres un robot', 'que puedes hacer', 'ayuda', 'who are you', 'help', 'what can you do']
    };

    if (socialKeywords.guest.some(k => query === k || query.startsWith(k + ' '))) {
        return {
            success: true,
            reply: isEn 
                ? "Hello! 😊 It's a pleasure to greet you. I am the Alros family assistant. I'm here to lend you a hand with whatever you need: from finding the home of your dreams to clearing up any doubts about procedures. Where would you like to start?"
                : "¡Hola! 😊 Qué alegría saludarte. Soy el asistente de la familia Alros. Estoy aquí para echarte una mano en lo que necesites: desde encontrarte la casa de tus sueños hasta aclararte cualquier duda sobre trámites. ¿Por dónde te gustaría empezar?",
            suggestions: isEn 
                ? ["What are the buying costs?", "Search for a home", "I want to sell"]
                : ["¿Qué gastos hay al comprar?", "Buscar un hogar", "Quiero vender"]
        };
    }

    if (socialKeywords.thanks.some(k => query.includes(k))) {
        return {
            success: true,
            reply: isEn
                ? "You're welcome! It's a pleasure to help you. 😊 At Alros, we love our clients to feel at home. If you have any other questions, no matter how small, here I am!"
                : "¡De nada! Es un placer ayudarte. 😊 En Alros nos encanta que nuestros clientes se sientan como en casa. Si tienes cualquier otra duda, por pequeña que sea, ¡aquí me tienes!",
            suggestions: isEn
                ? ["See properties", "No more questions, thanks!"]
                : ["Ver propiedades", "No hay más dudas, ¡gracias!"]
        };
    }

    if (socialKeywords.identity.some(k => query.includes(k))) {
        return {
            success: true,
            reply: isEn
                ? "Hello! I am the intelligent assistant of Alros Investments. My mission is to make things easier for you and quickly resolve your doubts so that your real estate experience is a ten. Tell me what you have in mind!"
                : "¡Hola! Soy el asistente inteligente de Alros Investments. Mi misión es facilitarte las cosas y resolver tus dudas de forma rápida para que tu experiencia inmobiliaria sea de diez. ¡Dime qué tienes en mente!",
            suggestions: isEn
                ? ["Buying costs", "Selling documents"]
                : ["Gastos de compra", "Documentos para vender"]
        };
    }

    // 3. Navigation & Filtering Logic (Smart Assistant)
    if (query.includes('buscar') || query.includes('search') || query.includes('filtro') || query.includes('filter') || query.includes('ver los') || query.includes('see the') || query.includes('where are')) {
        return {
            success: true,
            reply: isEn
                ? "Sure! I can help you navigate. You can see all our properties in the listing section, or if you tell me what you're looking for (e.g., 'looking for rental in Benalmádena'), I can apply the filters directly for you. Do you want to go see all properties now?"
                : "¡Claro! Puedo ayudarte a navegar. Puedes ver todas nuestras propiedades en la sección de listado, o si me dices qué buscas (ej: 'busco alquiler en Benalmádena'), puedo aplicarte los filtros directamente. ¿Quieres ir a ver todas las propiedades ahora?",
            suggestions: isEn
                ? ["See all sales", "See all rentals", "Help me filter"]
                : ["Ver todas las ventas", "Ver todos los alquileres", "Ayúdame a filtrar"]
        };
    }

    // Advanced Filter Detection
    const findOperation = query.includes('alquiler') || query.includes('alquilar') || query.includes('rent') ? 'alquiler' : (query.includes('compra') || query.includes('comprar') || query.includes('venta') || query.includes('buy') || query.includes('sale') ? 'venta' : null);
    const findType = query.includes('piso') || query.includes('apartamento') || query.includes('apartment') || query.includes('flat') ? 'apartamento' : (query.includes('casa') || query.includes('villa') || query.includes('chalet') || query.includes('house') ? 'casa' : null);
    
    if (findOperation || findType) {
        let path = '/propiedades?';
        let filterDesc = "";
        if (findOperation) {
            path += `operation=${findOperation}&`;
            filterDesc += isEn ? ` for ${findOperation === 'alquiler' ? 'rent' : 'sale'}` : ` de ${findOperation}`;
        }
        if (findType) {
            path += `type=${findType}&`;
            const typeLabel = findType === 'apartamento' ? (isEn ? 'apartments' : 'apartamentos') : (isEn ? 'houses' : 'casas');
            filterDesc = ` ${typeLabel}` + filterDesc;
        }

        return {
            success: true,
            reply: isEn
                ? `I have prepared a custom filter to see the properties${filterDesc} we have available. You can access it directly by clicking the button below.`
                : `He preparado un filtro personalizado para ver los${filterDesc} que tenemos disponibles. Puedes acceder directamente haciendo clic en el botón de abajo.`,
            navigateTo: isEn ? `/en${path}` : path,
            suggestions: isEn ? ["See results", "New search"] : ["Ver resultados personalizados", "Hacer otra búsqueda"]
        };
    }

    // 4. Specific Property Handling (ID or Title)
    const refMatch = query.match(/ref:\s*([api]\d+)/i) || query.match(/\b([api]\d{4,})\b/i);
    let targetProperty = null;

    if (refMatch) {
        const ref = refMatch[0].toUpperCase().replace('REF:', '').trim();
        const { data: byRef } = await supabase
            .from('properties')
            .select('*')
            .eq('referencia', ref)
            .single();
        targetProperty = byRef;
    } else if (query.length > 5) {
        const keywords = query.split(' ').filter(w => w.length > 3 && !['para', 'esta', 'este', 'casa', 'piso', 'con', 'this', 'that', 'house'].includes(w));
        if (keywords.length > 0) {
            const { data: byTitle } = await supabase
                .from('properties')
                .select('*')
                .ilike('title', `%${keywords[0]}%`)
                .eq('status', 'disponible')
                .limit(1)
                .maybeSingle();
            targetProperty = byTitle;
        }
    }

    if (targetProperty) {
        const specs = targetProperty.features || {};
        const bedrooms = targetProperty.bedrooms || specs.bedrooms;
        const size = targetProperty.size_m2 || specs.size_m2;
        
        return {
            success: true,
            reply: isEn
                ? `Great choice! 😍 I see you're interested in: "${targetProperty.title}" (Ref: ${targetProperty.referencia}).\n\nIt's a wonderful ${bedrooms} bedroom property with ${size}m² in ${targetProperty.city}. It's available for ${targetProperty.price.toLocaleString('de-DE')}€.\n\nWould you like to schedule a viewing? Or if you prefer, I can send you more details or have a colleague call you.`
                : `¡Qué buena elección! 😍 Veo que te interesa: "${targetProperty.title}" (Ref: ${targetProperty.referencia}).\n\nEs una maravilla de ${bedrooms} dormitorios y ${size}m² en ${targetProperty.city}. Está disponible por ${targetProperty.price.toLocaleString('de-DE')}€.\n\n¿Te gustaría que agendemos un hueco para ir a verla? O si lo prefieres, puedo pasarte más detalles o avisar a un compañero para que te llame.`,
            navigateTo: isEn ? `/en/propiedades/${targetProperty.id}` : `/propiedades/${targetProperty.id}`,
            suggestions: isEn ? ["I want to see it!", "More details", "Call me"] : ["¡Quiero verla!", "Más detalles", "Que me llamen"]
        };
    }

    if (query.includes('esta casa') || query.includes('este piso') || query.includes('this house') || query.includes('this apartment') || query.includes('this property')) {
        return {
            success: true,
            reply: isEn
                ? "To give you exact information about that property, could you provide its reference number? (Usually starts with P, A, or I). That way I can give you meters, exact price, and availability instantly."
                : "Para poder darte la información exacta de esa propiedad, ¿podrías facilitarme su número de referencia? (Suele empezar por P, A o I). Así podré darte metros, precio exacto y disponibilidad al momento.",
            suggestions: isEn ? ["Where is the reference?", "See all properties"] : ["¿Dónde veo la referencia?", "Ver todas las propiedades"]
        };
    }

    if (query.includes('visita') || query.includes('visit') || query.includes('verla') || query.includes('see it') || query.includes('detalles') || query.includes('information') || query.includes('info')) {
        return {
            success: true,
            reply: isEn
                ? "That sounds like a fantastic idea! 😊 There's nothing like seeing a home in person to feel if it's yours. For a colleague to call you and organize the viewing (or give you those extra details you're looking for), could you please leave your details right here?"
                : "¡Me parece una idea fantástica! 😊 Nada como ver un hogar en persona para sentir si es el tuyo. Para que un compañero pueda llamarte y organizar la visita (o darte esos detalles extra que buscas), ¿podrías dejarme tus datos aquí mismo?",
            needsLead: true,
            suggestions: isEn ? ["Yes, call me!", "More photos"] : ["¡Sí, llamadme!", "Ver más fotos"]
        };
    }

    if (query.includes('piso') || query.includes('casa') || query.includes('house') || query.includes('apartment') || query.includes('property')) {
        let reply = isEn ? "We currently have several properties available. " : "Actualmente tenemos varias propiedades disponibles. ";
        if (properties && properties.length > 0) {
            const list = properties.map(p => isEn 
                ? `- ${p.title} in ${p.city} (${p.price}€)`
                : `- ${p.title} en ${p.city} (${p.price}€)`).join('\n');
            reply += isEn 
                ? `Here are some highlighted ones:\n\n${list}\n\nAre you looking for something specific regarding price or area?`
                : `Aquí tienes algunas destacadas:\n\n${list}\n\n¿Buscas algo en concreto por precio o zona?`;
        } else {
            reply += isEn 
                ? "Tell me what area and budget you are looking for and I'll help you find something."
                : "Dime qué zona y presupuesto buscas y te ayudaré a encontrar algo.";
        }
        return {
            success: true,
            reply,
            suggestions: isEn ? ["Apartments in Benalmadena", "Houses for sale"] : ["Pisos en Benalmádena", "Casas en venta"]
        };
    }

    // Default Fallback
    return {
        success: true,
        reply: isEn
            ? "That's a good question and I would love to help you in a fully personalized way. 😊 To give you exact information, would you like to leave your details and have an Alros expert call you as soon as possible?"
            : "Esa es una buena pregunta y me encantaría ayudarte de forma totalmente personalizada. 😊 Para darte la información exacta, ¿te gustaría dejar tus datos y que un compañero experto de Alros te llame lo antes posible?",
        needsLead: true,
        suggestions: isEn ? ["Yes, call me!", "Not now, thanks"] : ["¡Sí, llamadme!", "Ahora no, gracias"]
    };
}
