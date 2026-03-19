import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from the project root
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const columnsToCheck = [
        'acceso_exterior_adaptado',
        'owner_signature',
        'contract_signature_date',
        'contract_duration_months',
        'province',
        'internal_location_notes'
    ];

    for (const col of columnsToCheck) {
        const { error } = await supabase
            .from('properties')
            .select(col)
            .limit(1);

        if (error) {
            console.log(`❌ Column '${col}' error: ${error.message}`);
        } else {
            console.log(`✅ Column '${col}' exists!`);
        }
    }
}

checkColumns();
