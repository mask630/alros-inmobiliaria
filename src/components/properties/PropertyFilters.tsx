'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, Bed, Bath, MapPin } from "lucide-react";

// Property type categories
const PROPERTY_TYPES = {
    apartamento: {
        label: 'Apartamento',
        subtypes: ['piso', 'apartamento', 'atico', 'duplex', 'estudio', 'loft']
    },
    casa: {
        label: 'Casa',
        subtypes: ['villa', 'adosado', 'pareado', 'casa_rural', 'casa_mata']
    },
    obra_nueva: {
        label: 'Obra Nueva',
        subtypes: ['piso', 'atico', 'villa', 'adosado']
    }
};

export function PropertyFilters({ locale = 'es' }: { locale?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial state from URL params
    const [filters, setFilters] = useState({
        operation: searchParams.get('operation') || '',
        type: searchParams.get('type') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        bedrooms: searchParams.get('bedrooms') || '',
        bathrooms: searchParams.get('bathrooms') || '',
        city: searchParams.get('city') || searchParams.get('zone') || '',
    });

    const [isOpen, setIsOpen] = useState(false);

    // Update state when URL changes
    useEffect(() => {
        setFilters({
            operation: searchParams.get('operation') || '',
            type: searchParams.get('type') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            bedrooms: searchParams.get('bedrooms') || '',
            bathrooms: searchParams.get('bathrooms') || '',
            city: searchParams.get('city') || searchParams.get('zone') || '',
        });
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, type } = e.target;
        let newValue = value;
        
        if (type === 'number') {
            newValue = Math.max(0, parseInt(value) || 0).toString();
            if (value === '') newValue = '';
        }
        
        setFilters(prev => ({ ...prev, [name]: newValue }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filters.operation) params.set('operation', filters.operation);
        if (filters.type) params.set('type', filters.type);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
        if (filters.bathrooms) params.set('bathrooms', filters.bathrooms);
        if (filters.city) params.set('city', filters.city);

        router.push(locale === 'en' ? `/en/propiedades?${params.toString()}` : `/propiedades?${params.toString()}`);
        setIsOpen(false);
    };

    const clearFilters = () => {
        setFilters({ operation: '', type: '', maxPrice: '', bedrooms: '', bathrooms: '', city: '' });
        router.push(locale === 'en' ? '/en/propiedades' : '/propiedades');
        setIsOpen(false);
    };

    const activeCount = Object.values(filters).filter(Boolean).length;

    // Get title based on operation filter
    const getTitle = () => {
        if (locale === 'en') {
            if (filters.operation === 'alquiler') return 'Properties for Rent';
            if (filters.operation === 'venta') return 'Properties for Sale';
            return 'Our Properties';
        }
        if (filters.operation === 'alquiler') return 'Propiedades en Alquiler';
        if (filters.operation === 'venta') return 'Propiedades en Venta';
        return 'Nuestras Propiedades';
    };

    return (
        <div className="w-full">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        {getTitle()}
                    </h1>
                    <div className="h-1 w-12 bg-[#881337] mt-2 rounded-full" />
                </div>

                <div className="w-full lg:w-auto">
                    {/* Desktop Filters Bar */}
                    <div className="hidden lg:flex gap-1 items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                        {/* Operation Type - Chip style */}
                        <div className="flex bg-white rounded-xl shadow-sm border border-slate-100 p-1 mr-2">
                             {['venta', 'alquiler'].map((op) => (
                                <button
                                    key={op}
                                    onClick={() => setFilters(prev => ({ ...prev, operation: filters.operation === op ? '' : op }))}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                        filters.operation === op 
                                            ? 'bg-slate-900 text-white shadow-md' 
                                            : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {op === 'venta' ? (locale === 'en' ? 'Buy' : 'Comprar') : (locale === 'en' ? 'Rent' : 'Alquiler')}
                                </button>
                             ))}
                        </div>

                        {/* Property Type Selector */}
                        <div className="relative group border-r border-slate-200 px-2">
                            <select
                                name="type"
                                value={filters.type}
                                onChange={handleChange}
                                className="pl-3 pr-8 py-2.5 bg-transparent text-sm font-black text-slate-700 outline-none cursor-pointer appearance-none hover:text-[#881337] transition-colors"
                            >
                                <option value="">{locale === 'en' ? 'Property Type' : 'Tipo de Inmueble'}</option>
                                <optgroup label={locale === 'en' ? "Apartments" : "Apartamentos"}>
                                    <option value="apartamento">{locale === 'en' ? 'Apartment' : 'Apartamento'}</option>
                                    <option value="piso">{locale === 'en' ? 'Flat' : 'Piso'}</option>
                                    <option value="atico">{locale === 'en' ? 'Penthouse' : 'Ático'}</option>
                                    <option value="duplex">Dúplex</option>
                                    <option value="estudio">{locale === 'en' ? 'Studio' : 'Estudio'}</option>
                                </optgroup>
                                <optgroup label={locale === 'en' ? "Houses" : "Casas"}>
                                    <option value="villa">Villa</option>
                                    <option value="adosado">{locale === 'en' ? 'Townhouse' : 'Adosado'}</option>
                                    <option value="pareado">{locale === 'en' ? 'Semi-detached' : 'Pareado'}</option>
                                    <option value="casa_mata">{locale === 'en' ? 'Village house' : 'Casa Mata'}</option>
                                    <option value="casa_rural">{locale === 'en' ? 'Country house' : 'Casa Rural'}</option>
                                </optgroup>
                            </select>
                            <Filter size={14} className="absolute right-2 top-3.5 text-slate-400 pointer-events-none" />
                        </div>

                        {/* City / Zone Selector */}
                        <div className="relative group border-r border-slate-200 px-2">
                            <select
                                name="city"
                                value={filters.city}
                                onChange={handleChange}
                                className="pl-3 pr-8 py-2.5 bg-transparent text-sm font-black text-slate-700 outline-none cursor-pointer appearance-none hover:text-[#881337] transition-colors"
                            >
                                <option value="">{locale === 'en' ? 'All Areas' : 'Todas las zonas'}</option>
                                <optgroup label="Costa Central">
                                    <option value="Benalmádena">Benalmádena</option>
                                    <option value="Fuengirola">Fuengirola</option>
                                    <option value="Torremolinos">Torremolinos</option>
                                    <option value="Mijas">Mijas</option>
                                </optgroup>
                                <optgroup label="Costa Poniente">
                                    <option value="Marbella">Marbella</option>
                                    <option value="Estepona">Estepona</option>
                                    <option value="Casares">Casares</option>
                                    <option value="Manilva">Manilva</option>
                                </optgroup>
                                <optgroup label="Málaga">
                                    <option value="Málaga">Málaga</option>
                                </optgroup>
                                <optgroup label="Costa Oriente">
                                    <option value="Rincón de la Victoria">Rincón de la Victoria</option>
                                    <option value="Vélez-Málaga">Vélez-Málaga</option>
                                    <option value="Nerja">Nerja</option>
                                </optgroup>
                            </select>
                            <MapPin size={14} className="absolute right-2 top-3.5 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Max Price Input */}
                        <div className="flex items-center gap-2 px-4 border-r border-slate-200 group">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{locale === 'en' ? 'Max' : 'Hasta'}</span>
                            <div className="flex items-center">
                                <input
                                    name="maxPrice"
                                    type="number"
                                    placeholder="€"
                                    value={filters.maxPrice}
                                    onChange={handleChange}
                                    className="w-28 py-2 bg-transparent text-sm font-bold text-slate-800 focus:outline-none placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {/* Beds & Baths */}
                        <div className="flex items-center gap-4 px-4 pr-6">
                            <div className="flex items-center gap-2">
                                <Bed size={16} className="text-slate-400" />
                                <select 
                                    name="bedrooms" 
                                    value={filters.bedrooms} 
                                    onChange={handleChange}
                                    className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
                                >
                                    <option value="">{locale === 'en' ? 'Beds' : 'Habs'}</option>
                                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Bath size={16} className="text-slate-400" />
                                <select 
                                    name="bathrooms" 
                                    value={filters.bathrooms} 
                                    onChange={handleChange}
                                    className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
                                >
                                    <option value="">{locale === 'en' ? 'Baths' : 'Baños'}</option>
                                    {[1, 2, 3].map(n => <option key={n} value={n}>{n}+</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-2 ml-2">
                             {activeCount > 0 && (
                                <button 
                                    onClick={clearFilters} 
                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Limpiar filtros"
                                >
                                    <X size={18} />
                                </button>
                            )}
                            <button
                                onClick={applyFilters}
                                className="bg-[#881337] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-[0.1em] hover:bg-slate-900 transition-all shadow-lg shadow-red-900/10 active:scale-95 flex items-center gap-2"
                            >
                                <Search size={16} />
                                {locale === 'en' ? 'Apply' : 'Filtrar'}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Filter Button */}
                    <button
                        className="lg:hidden flex items-center justify-between w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className="font-black text-slate-900 text-sm uppercase tracking-widest flex items-center gap-3">
                            <div className="p-2 bg-[#881337]/5 rounded-lg text-[#881337]">
                                <Filter className="h-4 w-4" />
                            </div>
                            {locale === 'en' ? 'Filters & Search' : 'Filtros y Búsqueda'}
                        </span>
                        {activeCount > 0 && (
                            <span className="bg-[#881337] text-white px-3 py-1 rounded-full text-[10px] font-black">
                                {activeCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Filter Drawer (Polished) */}
            {isOpen && (
                <div className="lg:hidden mt-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                            {locale === 'en' ? 'Transaction' : 'Operación'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['venta', 'alquiler'].map((op) => (
                                <button
                                    key={op}
                                    onClick={() => setFilters(prev => ({ ...prev, operation: filters.operation === op ? '' : op }))}
                                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                                        filters.operation === op 
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                            : 'bg-white text-slate-500 border-slate-200'
                                    }`}
                                >
                                    {op === 'venta' ? (locale === 'en' ? 'Buy' : 'Compra') : (locale === 'en' ? 'Rent' : 'Alquiler')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">
                            {locale === 'en' ? 'Property Type' : 'Tipo de Inmueble'}
                        </label>
                        <select name="type" value={filters.type} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none">
                            <option value="">{locale === 'en' ? 'Any Type' : 'Cualquier Tipo'}</option>
                            <optgroup label="Apartment">
                                <option value="apartamento">Apartamento / Piso</option>
                                <option value="atico">Ático</option>
                            </optgroup>
                            <optgroup label="Houses">
                                <option value="villa">Villa / Casa</option>
                                <option value="adosado">Adosado</option>
                            </optgroup>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">{locale === 'en' ? 'Max Price' : 'Precio Máx.'}</label>
                            <input name="maxPrice" type="number" min="0" value={filters.maxPrice} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none" placeholder="€" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">{locale === 'en' ? 'Min. Beds' : 'Dorm. Mín.'}</label>
                            <select name="bedrooms" value={filters.bedrooms} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none">
                                <option value="">-</option>
                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button 
                            onClick={clearFilters} 
                            className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest"
                        >
                            {locale === 'en' ? 'Reset' : 'Limpiar'}
                        </button>
                        <button 
                            onClick={applyFilters} 
                            className="flex-[2] py-4 bg-[#881337] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-900/20"
                        >
                            {locale === 'en' ? 'Apply Filters' : 'Mostrar Resultados'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
