-- Tabla de perfiles de usuario (conectada a auth.users de Supabase)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text not null check (role in ('admin', 'agente')),
  first_name text,
  last_name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seguridad a nivel de filas (RLS)
alter table public.profiles enable row level security;

-- Políticas de RLS para el perfil
create policy "Los perfiles son públicos" 
on public.profiles for select 
using (true);

create policy "Los usuarios pueden actualizar su propio perfil" 
on public.profiles for update 
using (auth.uid() = id);

-- Trigger para crear perfil automáticamente cuando un usuario se registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email, role)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.email, 'agente'); 
  return new;
end;
$$ language plpgsql security definer;

-- Asociamos el trigger a auth.users (Solo se puede correr si no existe, o drop / create)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
