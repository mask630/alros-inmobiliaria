const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role for delete

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupProperties() {
  console.log("Starting property cleanup (removing properties without photos)...");

  // 1. Fetch properties to check
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, title, images, referencia');

  if (error) {
    console.error("Error fetching properties:", error);
    return;
  }

  const toDelete = properties.filter(p => {
    // Check if images is null, undefined, empty array, or array with empty strings
    return !p.images || p.images.length === 0 || (p.images.length === 1 && !p.images[0]);
  });

  console.log(`Found ${toDelete.length} properties without valid photos.`);

  if (toDelete.length === 0) {
    console.log("No properties to delete.");
    return;
  }

  // 2. Delete them
  const idsToDelete = toDelete.map(p => p.id);
  console.log("Deleting IDs:", idsToDelete);

  const { error: deleteError } = await supabase
    .from('properties')
    .delete()
    .in('id', idsToDelete);

  if (deleteError) {
    console.error("Error deleting properties:", deleteError);
  } else {
    console.log(`Successfully deleted ${toDelete.length} properties.`);
    toDelete.forEach(p => console.log(`- Deleted: ${p.title} (${p.referencia})`));
  }
}

cleanupProperties();
