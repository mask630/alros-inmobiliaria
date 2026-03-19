const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const coords = {
    "2FD268BA-01": { lat: 36.591, lng: -4.568 }, // Benalmádena Pueblo
    "2FD268BA-02": { lat: 36.549, lng: -4.614 }, // Fuengirola Los Boliches
    "2FD268BA-03": { lat: 36.581, lng: -4.605 }, // Higueron
    "2FD268BA-04": { lat: 36.541, lng: -4.619 }, // Fuengirola Centro
    "2FD268BA-05": { lat: 36.621, lng: -4.503 }, // Torremolinos
    "2FD268BA-06": { lat: 36.596, lng: -4.512 }, // Puerto Marina
    "2FD268BA-07": { lat: 36.542, lng: -4.623 }, // Fuengirola Studio
    "2FD268BA-08": { lat: 36.594, lng: -4.542 }, // Benalmádena Low
    "2FD268BA-09": { lat: 36.595, lng: -4.637 }, // Mijas
    "2FD268BA-10": { lat: 36.582, lng: -4.535 }  // Torrequebrada
};

async function run() {
    console.log("Updating coordinates for properties...");
    for (const [ref, pos] of Object.entries(coords)) {
        const { error } = await supabase
            .from('properties')
            .update({ 
                latitude: pos.lat, 
                longitude: pos.lng,
                public_latitude: pos.lat + (Math.random() - 0.5) * 0.005, // Slight offset for public map
                public_longitude: pos.lng + (Math.random() - 0.5) * 0.005
            })
            .eq('referencia', ref);
            
        if (error) console.error(`Error updating ${ref}:`, error.message);
        else console.log(`Updated ${ref} with [${pos.lat}, ${pos.lng}]`);
    }
}
run();
