-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROPIETARIOS (Información Confidencial)
create table owners (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text,
  phone text,
  dni_cif text,
  address text,
  notes text
);

-- PROPIEDADES
create table properties (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  title text not null,
  description text,
  address text,
  city text,
  province text,
  postal_code text,
  
  operation_type text not null, -- 'venta', 'alquiler', 'traspaso'
  property_type text not null, -- 'piso', 'casa', 'local', 'oficina', 'terreno'
  
  price numeric not null,
  currency text default 'EUR',
  
  status text default 'disponible', -- 'disponible', 'reservado', 'vendido', 'alquilado'
  
  features jsonb default '{}'::jsonb, -- { "bedrooms": 3, "bathrooms": 2, "pool": true, "garage": true, "size_m2": 100 }
  
  -- Top-level columns for easier filtering/sorting (added in v2)
  bedrooms integer,
  bathrooms integer,
  size_m2 integer,
  year_built integer,
  
  owner_id uuid references owners(id) on delete set null, -- Link to owner (internal use only)
  
  is_featured boolean default false,
  energy_certificate_rating text, -- 'A', 'B', 'C', etc.
  reference_id text unique -- Custom Internal Reference (e.g. REF-001)
);

-- MULTIMEDIA (Fotos, Videos, Recorridos Virtuales)
create table media (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references properties(id) on delete cascade not null,
  
  file_url text not null,
  media_type text not null, -- 'image', 'video', 'matterport', 'youtube'
  title text,
  display_order integer default 0
);

-- CLIENTES (Interesados)
create table clients (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text,
  phone text,
  requirements text, -- Texto libre o JSON con lo que buscan
  status text default 'activo' -- 'activo', 'inactivo', 'comprado'
);

-- DOCUMENTOS (Contratos, Fichas generadas)
create table documents (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references properties(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  
  name text not null,
  file_url text not null,
  document_type text -- 'autorizacion_venta', 'ficha_visita', 'domiciliacion'
);

-- RLS (Row Level Security) - Basic setup
alter table owners enable row level security;
alter table properties enable row level security;
alter table media enable row level security;
alter table clients enable row level security;
alter table documents enable row level security;

-- Policies need to be defined based on Auth setup (Admin vs Public)
-- For now, public read access to properties and media (except sensitive fields if any)
create policy "Public properties are viewable by everyone" on properties
  for select using (true);

create policy "Public media is viewable by everyone" on media
  for select using (true);

-- TEMPORARY: Allow full access to properties until Admin Auth is implemented
-- WARNING: This is insecure for production but allows the Admin Panel to work locally without login
create policy "Enable insert for everyone" on properties for insert with check (true);
create policy "Enable update for everyone" on properties for update using (true);
create policy "Enable delete for everyone" on properties for delete using (true);
