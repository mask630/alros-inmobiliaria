'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, Bed, Bath, Maximize, ArrowRight, Star, Shield, TrendingUp, Heart, Loader2, Home, Building2, ChevronDown, Map } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('@/components/properties/MapClient'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center text-slate-500">Cargando mapa interactivo...</div>
});

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapFilter, setMapFilter] = useState<'todos' | 'venta' | 'alquiler'>('todos');
  const router = useRouter();

  // Search filters state
  const [filters, setFilters] = useState({
    operation: 'todos', // 'todos', 'venta', 'alquiler'
    minBedrooms: 0,
    minBathrooms: 0,
    maxPrice: 0, // 0 = sin límite
    zone: 'todas'
  });

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select('*');

      if (data) {
        // Soporta tanto el sistema antiguo (dentro de features) como el nuevo (columna is_featured)
        const featured = data.filter(p => p.features?.is_featured === true || p.is_featured === true);
        setFeaturedProperties(featured);
        setAllProperties(data);
      }
      setLoading(false);
    }
    fetchProperties();
  }, []);

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();

    if (filters.operation !== 'todos') {
      params.set('operation', filters.operation);
    }
    if (filters.minBedrooms > 0) {
      params.set('bedrooms', filters.minBedrooms.toString());
    }
    if (filters.minBathrooms > 0) {
      params.set('bathrooms', filters.minBathrooms.toString());
    }
    if (filters.maxPrice > 0) {
      params.set('maxPrice', filters.maxPrice.toString());
    }
    if (filters.zone !== 'todas') {
      params.set('zone', filters.zone);
    }

    router.push(`/propiedades?${params.toString()}`);
  };

  // Dynamic zones based on existing properties (Case-insensitive & Unique)
  const zonesRaw = allProperties.map(p => p.city?.trim()).filter(Boolean);
  const zonesNormalized = Array.from(new Set(zonesRaw.map(z => z.toLowerCase())))
    .map(lower => zonesRaw.find(z => z.toLowerCase() === lower)) as string[];
    
  const zones = ['todas', ...zonesNormalized].sort((a, b) => 
    a === 'todas' ? -1 : b === 'todas' ? 1 : a.localeCompare(b)
  );

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-[#881337] selection:text-white">

      {/* --- HERO SECTION --- Premium & Immersive --- */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Animated Background Image */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
          />
          {/* Overlay with primary color tint */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-900/90" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black tracking-[0.2em] uppercase mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Excelencia Inmobiliaria desde 1992
              </span>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white tracking-tight leading-[1.1]">
                Tu hogar ideal <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200">
                  en la Costa del Sol
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
                Descubre una selección exclusiva de propiedades gestionadas por <span className="text-white font-bold underline decoration-[#881337] decoration-2 underline-offset-4">Alros Investments</span>.
              </p>
            </motion.div>
          </div>

          {/* --- FLOATING SEARCH BAR (Glassmorphism) --- */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-5xl mx-auto mt-8"
          >
            <div className="bg-white/10 backdrop-blur-xl p-2 rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-white rounded-[1.8rem] p-2 md:p-3 flex flex-col md:flex-row items-center gap-2">
                    {/* Operation Selector */}
                    <div className="w-full md:w-48 relative border-r border-slate-100 px-4 py-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Operación</p>
                        <select 
                            value={filters.operation}
                            onChange={(e) => setFilters({...filters, operation: e.target.value})}
                            className="w-full bg-transparent font-bold text-slate-800 outline-none cursor-pointer appearance-none"
                        >
                            <option value="todos">Cualquiera</option>
                            <option value="venta">En Venta</option>
                            <option value="alquiler">Alquiler</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 bottom-3 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Zone Selector */}
                    <div className="w-full md:flex-1 relative border-r border-slate-100 px-4 py-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Zona / Ciudad</p>
                        <select 
                            value={filters.zone}
                            onChange={(e) => setFilters({...filters, zone: e.target.value})}
                            className="w-full bg-transparent font-bold text-slate-800 outline-none cursor-pointer appearance-none"
                        >
                            {zones.map(z => (
                                <option key={z} value={z}>{z === 'todas' ? 'Toda la Costa' : z}</option>
                            ))}
                        </select>
                        <MapPin size={14} className="absolute right-4 bottom-3 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Quick Search Button */}
                    <button 
                        onClick={handleSearch}
                        className="w-full md:w-auto bg-[#881337] hover:bg-slate-900 text-white px-10 py-4 rounded-[1.4rem] font-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-900/20 active:scale-95 group"
                    >
                        <Search size={20} className="group-hover:rotate-12 transition-transform" />
                        BUSCAR AHORA
                    </button>
                </div>
            </div>
            
            <div className="flex justify-center gap-8 mt-6">
                <a href="#buscar" className="text-white/70 hover:text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all group">
                    <div className="h-px w-8 bg-white/20 group-hover:w-12 transition-all" />
                    Búsqueda Avanzada
                </a>
            </div>
          </motion.div>
        </div>

        {/* Floating Indicator */}
        <div className="absolute bottom-10 left-10 hidden lg:block">
            <div className="flex items-center gap-4 text-white/40">
                <span className="text-[10px] font-black uppercase tracking-widest vertical-text">Scroll Explorar</span>
                <div className="h-20 w-px bg-gradient-to-b from-white/40 to-transparent" />
            </div>
        </div>
      </section>

      {/* --- FEATURED PROPERTIES --- */}
      <section className="py-20 md:py-28 bg-white relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <motion.div {...fadeInUp}>
              <span className="inline-block py-1 px-3 rounded bg-[#881337]/10 text-[#881337] font-black tracking-[0.2em] uppercase text-[10px] mb-4">
                Oportunidades Seleccionadas
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Propiedades Destacadas</h2>
              <div className="h-1.5 w-20 bg-[#881337] mt-4 rounded-full" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link href="/propiedades" className="group flex items-center gap-3 text-slate-900 font-black hover:text-[#881337] transition-all text-sm uppercase tracking-widest">
                Explorar Catálogo Completo
                <div className="p-2 bg-slate-100 rounded-full group-hover:bg-[#881337] group-hover:text-white transition-all">
                  <ArrowRight size={18} />
                </div>
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Cargando propiedades...</p>
              </div>
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map((prop, index) => {
                const imageUrl = prop.image || prop.images?.[0] || prop.features?.image || '/placeholder-property.jpg';
                const beds = prop.bedrooms || prop.features?.bedrooms || 0;
                const baths = prop.bathrooms || prop.features?.bathrooms || 0;
                const area = prop.size_m2 || prop.features?.size_m2 || 0;

                return (
                  <PropertyCard
                    key={prop.id}
                    id={prop.id}
                    delay={0.1 * (index + 1)}
                    image={imageUrl}
                    title={prop.title}
                    price={Number(prop.price).toLocaleString('de-DE') + (prop.operation_type === 'alquiler' ? ' €/mes' : ' €')}
                    location={prop.city}
                    specs={{ beds, baths, area }}
                    referencia={prop.referencia}
                    badge={prop.features?.badge || (prop.operation_type === 'venta' ? 'Venta' : 'Alquiler')}
                    isPremium={prop.features?.badge === 'Lujo' || prop.features?.badge === 'Exclusivo'}
                  />
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center text-slate-500">
                <p>No hay propiedades destacadas en este momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- ADVANCED SEARCH WITH MAP --- */}
      <section id="buscar" className="py-20 bg-slate-100">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <span className="text-[#881337] font-bold tracking-wider uppercase text-sm mb-2 block">
              Encuentra tu propiedad ideal
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Búsqueda Avanzada
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Utiliza los filtros para encontrar exactamente lo que buscas o explora el mapa interactivo
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-200"
          >
            {/* Filters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {/* Operation Type */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tipo de operación
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200">
                  {[
                    { value: 'todos', label: 'Todos' },
                    { value: 'venta', label: 'Venta' },
                    { value: 'alquiler', label: 'Alquiler' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilters(f => ({ ...f, operation: opt.value }))}
                      className={`flex-1 py-3 text-sm font-medium transition-all ${filters.operation === opt.value
                        ? 'bg-[#881337] text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Zona
                </label>
                <select
                  value={filters.zone}
                  onChange={(e) => setFilters(f => ({ ...f, zone: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium appearance-none cursor-pointer hover:bg-white transition-all focus:ring-2 focus:ring-[#881337]/20 focus:border-[#881337]"
                >
                  {zones.map(zone => (
                    <option key={zone} value={zone}>
                      {zone === 'todas' ? 'Todas las zonas' : zone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Bedrooms */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Bed className="inline h-4 w-4 mr-1" />
                  Dormitorios mín.
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200">
                  {[0, 1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setFilters(f => ({ ...f, minBedrooms: num }))}
                      className={`flex-1 py-3 text-sm font-medium transition-all ${filters.minBedrooms === num
                        ? 'bg-[#881337] text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {num === 0 ? 'Todo' : num === 4 ? '4+' : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Bathrooms */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Bath className="inline h-4 w-4 mr-1" />
                  Baños mín.
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setFilters(f => ({ ...f, minBathrooms: num }))}
                      className={`flex-1 py-3 text-sm font-medium transition-all ${filters.minBathrooms === num
                        ? 'bg-[#881337] text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {num === 0 ? 'Todo' : num === 3 ? '3+' : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Precio máximo (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters(f => ({ ...f, maxPrice: parseInt(e.target.value) || 0 }))}
                    placeholder="Ej: 350000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium hover:bg-white transition-all focus:ring-2 focus:ring-[#881337]/20 focus:border-[#881337] outline-none"
                  />
                  {filters.maxPrice > 0 && (
                    <button
                      onClick={() => setFilters(f => ({ ...f, maxPrice: 0 }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSearch}
                className="bg-[#881337] hover:bg-[#6b0f2b] text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#881337]/20 flex items-center justify-center gap-3 transform active:scale-95"
              >
                <Search className="h-5 w-5" />
                Buscar propiedades
              </button>
              <Link
                href="/propiedades"
                className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3"
              >
                <Building2 className="h-5 w-5" />
                Ver todas
              </Link>
            </div>

            {/* Interactive Map Preview */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Map className="h-5 w-5 text-[#881337]" />
                  Explora en el mapa
                </h3>
                <span className="text-sm text-slate-500">
                  {allProperties.length} propiedades disponibles
                </span>
              </div>

              <div className="relative h-[350px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                {!loading && (
                  <MapClient
                    centerLat={36.5946}
                    centerLng={-4.5516}
                    approximateAddress="Costa del Sol"
                    otherProperties={allProperties.filter(p => (p.latitude || p.features?.latitude) && (p.longitude || p.features?.longitude) && (mapFilter === 'todos' || p.operation_type === mapFilter))}
                    hideCenterMarker={true}
                  />
                )}
                {/* Legend as Filters */}
                <div className="absolute top-3 right-3 z-[400] bg-white rounded-xl shadow-lg p-2 text-xs flex flex-col gap-2 border border-slate-200">
                  <button
                    onClick={() => setMapFilter(mapFilter === 'venta' ? 'todos' : 'venta')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border ${mapFilter === 'venta' ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'border-transparent hover:bg-slate-100'}`}
                  >
                    <div className="px-2 py-0.5 bg-emerald-500 rounded-full text-white font-bold text-[10px] border-2 border-white shadow-sm">
                      Precio
                    </div>
                    <span className={`font-bold ${mapFilter === 'venta' ? 'text-emerald-700' : 'text-slate-600'}`}>Solo Venta</span>
                  </button>
                  <button
                    onClick={() => setMapFilter(mapFilter === 'alquiler' ? 'todos' : 'alquiler')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border ${mapFilter === 'alquiler' ? 'bg-orange-50 border-orange-200 shadow-sm' : 'border-transparent hover:bg-slate-100'}`}
                  >
                    <div className="px-2 py-0.5 bg-orange-500 rounded-full text-white font-bold text-[10px] border-2 border-white shadow-sm">
                      Precio
                    </div>
                    <span className={`font-bold ${mapFilter === 'alquiler' ? 'text-orange-700' : 'text-slate-600'}`}>Solo Alquiler</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SERVICES / VALUE PROPOSITION --- */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#881337] opacity-10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900 opacity-10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Más que una inmobiliaria, <br />
                <span className="text-[#881337]">tu asesor de confianza.</span>
              </h2>
              <div className="space-y-6 text-slate-300 text-lg">
                <p>
                  En <strong>Alros Investments S.L.</strong>, combinamos 35 años de experiencia local con una perspectiva global. No solo vendemos propiedades; gestionamos sueños y construimos patrimonios.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <FeatureBox icon={<Star />} title="Experiencia Premium" text="Trato VIP y asesoramiento personalizado." />
                  <FeatureBox icon={<Shield />} title="Gestión Segura" text="Te asesoramos en cada paso del proceso." />
                  <FeatureBox icon={<TrendingUp />} title="Inversión Inteligente" text="Expertos en rentabilidad y revalorización." />
                  <FeatureBox icon={<Heart />} title="Especialistas en la zona" text="Conocemos cada rincón de la Costa del Sol." />
                </div>
              </div>
              <div className="mt-10">
                <Link href="/contacto" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                  Hablemos de tu futuro
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop"
                  alt="Interior de lujo"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                    <p className="text-white font-serif italic text-xl">
                      "El verdadero lujo es sentirse en casa desde el primer momento."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeInUp} className="max-w-3xl mx-auto bg-white p-12 rounded-3xl shadow-xl border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Pensando en vender tu propiedad?</h2>
            <p className="text-slate-600 text-lg mb-8">
              Nos encargamos de todo el proceso para que obtengas el mejor precio con cero estrés. Valoración gratuita y sin compromiso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tasacion" className="bg-[#881337] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#6b0f2b] transition-colors shadow-lg shadow-[#881337]/30">
                Valorar mi inmueble gratis
              </Link>
              <Link href="/contacto" className="bg-white text-slate-700 border border-slate-200 px-8 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors">
                Contactar asesor
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

// --- SUB-COMPONENTS ---

function PropertyCard({ id, image, title, price, location, specs, badge, delay, isPremium, referencia }: any) {
  return (
    <Link href={`/propiedades/${id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay }}
        className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] transition-all duration-500 border border-slate-100 flex flex-col h-full transform hover:-translate-y-2 cursor-pointer"
      >
        <div className="relative h-72 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
          />
          
          {/* Status Badge */}
          <div className="absolute top-5 left-5">
            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md border shadow-lg ${
              isPremium 
                ? 'bg-amber-400/90 text-amber-950 border-amber-300' 
                : 'bg-white/90 text-slate-900 border-white/50'
            }`}>
              {badge}
            </span>
          </div>

          {referencia && (
            <div className="absolute top-5 right-5 z-20">
              <span className="text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest bg-white/95 text-slate-800 shadow-md border border-white/50 backdrop-blur-sm">
                {referencia}
              </span>
            </div>
          )}

          {/* Price Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent">
            <p className="text-2xl font-black text-white tracking-tighter drop-shadow-lg">
              {price}
            </p>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow bg-white">
          <div className="mb-6">
            <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 gap-2">
              <MapPin className="h-3 w-3 text-[#881337]" />
              {location}
            </div>
            <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-[#881337] transition-colors line-clamp-2">
              {title}
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50 mt-auto">
            <SpecItem icon={<Bed className="h-4 w-4" />} value={specs.beds} label="Dorm" />
            <SpecItem icon={<Bath className="h-4 w-4" />} value={specs.baths} label="Baños" />
            <SpecItem icon={<Maximize className="h-4 w-4" />} value={specs.area} label="m²" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function SpecItem({ icon, value, label }: any) {
  return (
    <div className="flex flex-col items-center justify-center text-slate-600 gap-1">
      <div className="text-slate-400">{icon}</div>
      <span className="text-sm font-semibold">{value} <span className="font-normal text-xs text-slate-400">{label}</span></span>
    </div>
  );
}

function FeatureBox({ icon, title, text }: any) {
  return (
    <div className="flex gap-4">
      <div className="bg-[#881337]/20 p-3 rounded-lg h-fit text-[#ff4d8c]">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-slate-400 text-sm">{text}</p>
      </div>
    </div>
  );
}
