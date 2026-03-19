const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const pData = JSON.parse(fs.readFileSync(path.join(__dirname, 'final-seed-data.json'), 'utf8'));

async function run() {
    console.log("Seeding in batches...");
    for (const p of pData) {
        // Remove the internal ID if it exists to let Supabase generate a new one
        const { id, ...cleanData } = p;
        
        const { error } = await supabase.from('properties').insert([cleanData]);
        if (error) {
            console.error(`Error inserting ${p.referencia}:`, error);
        } else {
            console.log(`Inserted ${p.referencia}`);
        }
    }
}
run();
