import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('interesados').select('*').limit(1).then(({data}) => console.log(JSON.stringify(data[0], null, 2)));
