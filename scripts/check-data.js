const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: owners } = await supabase.from('owners').select('*').limit(5);
    const { data: props } = await supabase.from('properties').select('city').limit(5);
    console.log("OWNERS:", JSON.stringify(owners, null, 2));
    console.log("PROPS CITIES:", JSON.stringify(props, null, 2));
}

checkData();
