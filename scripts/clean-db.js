const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDatabase() {
    console.log("Fetching properties...");
    const { data: properties, error } = await supabase.from('properties').select('*');

    if (error) {
        console.error("Error fetching properties:", error);
        return;
    }

    console.log(`Found ${properties.length} properties. Checking...`);

    for (const prop of properties) {
        const titleL = prop.title.toLowerCase();

        // Delete fake properties
        if (titleL.includes('fake') || titleL.includes('test') || titleL === 'tactac') {
            console.log(`Deleting fake property: ${prop.title}...`);
            await supabase.from('properties').delete().eq('id', prop.id);
            continue;
        }

        // Fix title
        let newTitle = prop.title;
        if (newTitle.includes('maravillos inmueble')) {
            newTitle = newTitle.replace('maravillos inmueble', 'Maravilloso Inmueble');
        }

        let shouldUpdate = false;

        if (newTitle !== prop.title) {
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            console.log(`Updating title from "${prop.title}" to "${newTitle}"`);
            await supabase.from('properties').update({ title: newTitle }).eq('id', prop.id);
        }
    }
    console.log("Finished cleaning database!");
}

cleanDatabase();
