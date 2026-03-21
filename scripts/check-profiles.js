import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProfiles() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error fetching profiles:', JSON.stringify(error, null, 2));
  } else {
    console.log('Profiles Found:', profiles.length);
    profiles.forEach(p => {
      console.log(`- ID: ${p.id} | Email: ${p.email} | Role: ${p.role} | Name: ${p.first_name} ${p.last_name}`);
    });
  }
}

checkProfiles();
