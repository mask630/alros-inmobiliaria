import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('--- INICIANDO LIMPIEZA DE BASE DE DATOS PARA PRODUCCIÓN ---');

  // ELIMINAR INTERESADOS (Leads)
  console.log('Borrando leads (interesados)...');
  const { error: errorLeads } = await supabase.from('interesados').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errorLeads) console.error('Error leads:', errorLeads);

  // ELIMINAR PROPIEDADES Y MEDIA
  // Nota: La tabla 'media' suele tener ON DELETE CASCADE con 'properties'
  console.log('Borrando propiedades y fotos...');
  const { error: errorProps } = await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errorProps) console.error('Error propiedades:', errorProps);

  // ELIMINAR PROPIETARIOS
  console.log('Borrando propietarios...');
  const { error: errorOwners } = await supabase.from('propietarios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errorOwners) console.error('Error propietarios:', errorOwners);

  // ELIMINAR DOCUMENTOS
  console.log('Borrando documentos...');
  const { error: errorDocs } = await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errorDocs) console.error('Error documentos:', errorDocs);

  console.log('--- LIMPIEZA COMPLETADA ---');
  console.log('Ya puedes empezar a subir información real desde el panel de administración.');
}

cleanup();
