const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: props, error } = await supabase.from('properties').select('*').limit(1);
    if (error) {
        console.error("Error fetching properties:", error);
    } else {
        console.log("PROPS SAMPLE:", JSON.stringify(props, null, 2));
    }
}

checkData();
