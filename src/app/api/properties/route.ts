import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get('exclude');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    let query = supabase
        .from('properties')
        .select('id, title, city, price, operation_type, features')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (excludeId) {
        query = query.neq('id', excludeId);
    }

    const { data: properties, error } = await query;

    if (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json({ properties: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({ properties: properties || [] });
}
