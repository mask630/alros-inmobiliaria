import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    const knowledgeData = [
        {
            title: "¿Cuáles son los gastos al comprar una vivienda?",
            content: "Al comprar una vivienda en Andalucía, debes considerar:\n1. ITP (Impuesto de Transmisiones Patrimoniales): Generalmente el 7%.\n2. Gastos de Notaría: Entre 600€ y 1000€.\n3. Registro de la Propiedad: Unos 400€ - 600€.\n4. Gestoría: Aproximadamente 300€.\nSe recomienda calcular un 10-12% adicional al precio de venta para cubrir todos estos gastos.",
            category: "legal"
        },
        {
            title: "¿Qué documentos necesito para vender mi casa?",
            content: "Para iniciar la venta con Alros, necesitamos:\n- Nota Simple actualizada.\n- Recibo del IBI.\n- Certificado de Eficiencia Energética (CEE).\n- Certificado de estar al corriente con la comunidad.\n- Escritura de la propiedad.",
            category: "venta"
        },
        {
            title: "¿Cuánto tiempo se tarda en alquilar un piso?",
            content: "En la zona de Benalmádena, la media de alquiler con Alros es de 15 a 20 días, siempre que el precio esté acorde al mercado y la vivienda esté en buen estado. Realizamos un filtro exhaustivo de inquilinos con estudio de solvencia.",
            category: "alquiler"
        },
        {
            title: "¿Ayudáis con la hipoteca?",
            content: "¡Sí! En Alros colaboramos con asesores financieros que pueden ayudarte a conseguir hasta el 90-100% de financiación según tu perfil. Hacemos un estudio previo gratuito para saber cuánto puedes comprar.",
            category: "financiero"
        }
    ];

    const { data, error } = await supabase
        .from('agency_knowledge')
        .insert(knowledgeData);

    if (error) return NextResponse.json({ error }, { status: 500 });

    return NextResponse.json({ success: true, message: "Conocimiento sembrado correctamente" });
}
