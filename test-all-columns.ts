
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllColumns() {
    const columns = [
        'title_en', 'description_en', 'internal_notes', 'has_keys', 
        'commission_percentage', 'community_fees', 'garbage_tax', 'ibi', 
        'kitchen_type', 'terrace_meters', 'plot_m2', 'furnished', 
        'garage_num', 'views_type', 'province', 'internal_location_notes'
    ];
    
    for (const col of columns) {
        const { error } = await supabase.from('properties').select(col).limit(0);
        if (error) {
            console.log(`Column ${col}: MISSING (${error.code})`);
        } else {
            console.log(`Column ${col}: OK`);
        }
    }
}

checkAllColumns();
