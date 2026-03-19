require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
    const { data, error } = await supabase.from('agentes').select('*').limit(1);
    if (error && error.code === '42P01') {
        console.log("Table 'agentes' does not exist.");
        // We could create it in a migration script if we have postgres access, 
        // but typically we can try using raw query if rpc allows it, 
        // or tell the user to create it in the Supabase dashboard.
        // Wait, the easiest way is to use Supabase API or direct postgres. 
        // Does .env.local have a connection string?
    } else {
        console.log(error || "Table exists!");
    }
}
setup();
