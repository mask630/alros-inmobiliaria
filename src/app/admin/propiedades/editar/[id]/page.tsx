'use client';

import { useState, useEffect } from "react";
import { Save, ImageIcon, Loader2, Sparkles, Wand2, FolderSearch, MapPin, ExternalLink, UploadCloud, File, Trash, Download, Plus, FileText, FileSignature, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { optimizeAndScanImages } from "@/app/actions/optimize-images";
import { updateProperty } from "@/app/actions/update-property";
import { ImageGallery } from "@/components/admin/ImageGallery";
import dynamic from 'next/dynamic';

const DraggableMap = dynamic(
    () => import('@/components/admin/DraggableMap'),
    { ssr: false }
);

export default function EditPropertyPage() {
    const params = useParams();
    const [fetching, setFetching] = useState(true);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [mapPreviewMode, setMapPreviewMode] = useState<'coords' | 'address'>('coords');
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [owners, setOwners] = useState<any[]>([]); // New state for owners
    const [agents, setAgents] = useState<any[]>([]); // New state for agents

    // Dropdown search state
    const [ownerSearch, setOwnerSearch] = useState('');
    const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);

    // Local state for inputs to allow free typing/editing
    const [exactCoordsInput, setExactCoordsInput] = useState('');
    const [publicCoordsInput, setPublicCoordsInput] = useState('');

    // State for all fields
    const [formData, setFormData] = useState({
        // Core
        title: '',
        description: '',
        price: '',
        views_type: '',
        key_highlights: '',
        reference_id: '',

        // Categorization
        type: 'apartamento', // apartamento, casa, local, oficina, terreno, garaje, trastero, edificio
        subtypes: [] as string[],  // atico, duplex, etc. (multiple allowed)
        operation: 'venta',

        // Location (Detailed)
        address: '', // We can keep as a full summary or mostly use the individual ones
        address_street: '',
        address_number: '',
        address_floor: '',
        address_block: '',
        address_door: '',
        urbanization: '',
        city: 'Benalmádena',
        province: 'Málaga',
        zip: '',
        internal_location_notes: '',
        latitude: '',
        longitude: '',
        public_latitude: '',
        public_longitude: '',

        // Surface & Distribution
        size_m2: '',        // Construidos
        useful_m2: '',      // Útiles
        bedrooms: '',
        bathrooms: '',

        // Building & State
        status: 'disponible',
        year: '',
        elevator: 'no',
        orientation: [] as string[],
        floor_level: '',    // bajo, intermedio, atico

        // Energy
        energy_consumption: '', // A-G
        energy_consumption_kwh: '', // number
        energy_emissions: '',   // A-G
        energy_emissions_kg: '', // number

        // Features (Checkboxes)
        ac: false,
        heating: false,
        heating_type: '', // individual, centralizada
        terrace: false,
        balcony: false,
        pool: false,
        garden: false,
        garage: false,
        garage_num: '',
        storage: false,
        accessible: false,
        views: false,
        acceso_exterior_adaptado: false,
        uso_silla_ruedas: false,

        // Media
        imageUrl: '',
        images: [] as string[],
        video: '',
        matterport: '',

        // Private
        owner: '',
        propietario_id: '',
        agente_id: '',
        is_published: true,
        notes: '',
        internal_notes: '',

        // New fields
        has_keys: false,
        commission_percentage: '',
        community_fees: '',
        garbage_tax: '',
        ibi: '',
        kitchen_type: '',
        terrace_meters: '',
        sports_areas: false,
        plot_m2: '',
        furnished: '',

        // Energy Certificate
        certificado_energetico: 'en_tramite',

        // Contract management
        contract_signature_date: '',
        contract_duration_months: '6',
        is_manual_contract: false,

        // i18n
        title_en: '',
        description_en: ''
    });

    // Dynamic Subtypes based on Type
    const subtypesMap: Record<string, string[]> = {
        'apartamento': ['Piso', 'Ático', 'Dúplex', 'Estudio', 'Loft'],
        'casa': ['Villa', 'Adosado', 'Pareado', 'Casa Mata', 'Casa Rural'],
        'obra_nueva': ['Piso', 'Ático', 'Villa', 'Adosado']
    };

    const currentSubtypes = subtypesMap[formData.type];

    // Fetch owners, agents and the property data on mount
    const [propertyDocuments, setPropertyDocuments] = useState<any[]>([]);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let ownersLookup: any[] = [];
                const { data: ownersData } = await supabase.from('propietarios').select('id, nombre_completo, documento_identidad').order('nombre_completo', { ascending: true });
                if (ownersData) {
                    const validOwners = ownersData.filter(o => o.nombre_completo && o.nombre_completo.trim() !== '' && o.nombre_completo !== 'EMPTY');
                    setOwners(validOwners);
                    ownersLookup = validOwners;
                }

                const { data: agentsData } = await supabase.from('agentes').select('id, nombre').order('nombre', { ascending: true });
                if (agentsData) {
                    setAgents(agentsData);
                }

                // Load specific property
                const propertyId = params.id as string;
                if (propertyId) {
                    const { data, error } = await supabase.from('properties').select('*').eq('id', propertyId).single();
                    if (error) {
                        console.error(error);
                        alert("Error al cargar la propiedad");
                    } else if (data) {
                        let mappedOwnerSearch = '';
                        if (data.propietario_id && ownersLookup.length > 0) {
                            const owner = ownersLookup.find(o => o.id === data.propietario_id);
                            if (owner) mappedOwnerSearch = `${owner.nombre_completo} ${owner.documento_identidad ? `(${owner.documento_identidad})` : ''}`;
                        }

                        const currentFeatures = data.features || {};
                        const amenities = currentFeatures.amenities || [];
                        const hasFeature = (name: string) => amenities.includes(name) || (Array.isArray(currentFeatures) && currentFeatures.includes(name));

                        setFormData({
                            title: data.title || '',
                            description: data.description || '',
                            price: data.price?.toString() || '',
                            operation: data.operation_type || 'venta',
                            type: data.property_type || 'apartamento',
                            subtypes: currentFeatures.subtypes || (currentFeatures.subtype ? currentFeatures.subtype.split(',').map((s: string) => s.trim()) : []),
                            city: data.city || 'Benalmádena',
                            address: data.address || '',
                            address_street: data.address_street || '',
                            address_number: data.address_number || '',
                            address_floor: data.address_floor || '',
                            address_block: data.address_block || '',
                            address_door: data.address_door || '',
                            urbanization: data.urbanization || '',
                            zip: data.zip || data.postal_code || '',
                            status: data.status || 'disponible',
                            bedrooms: currentFeatures.bedrooms?.toString() || data.bedrooms?.toString() || '',
                            bathrooms: currentFeatures.bathrooms?.toString() || data.bathrooms?.toString() || '',
                            size_m2: currentFeatures.size_m2?.toString() || data.size_m2?.toString() || '',
                            useful_m2: currentFeatures.useful_m2?.toString() || data.useful_m2?.toString() || '',
                            year: currentFeatures.year_built?.toString() || data.year_built?.toString() || currentFeatures.year?.toString() || '',
                            elevator: currentFeatures.has_elevator ? 'si' : (data.elevator === true ? 'si' : 'no'),
                            orientation: Array.isArray(data.orientation) ? data.orientation : (typeof data.orientation === 'string' ? data.orientation.split(',') : (currentFeatures.orientation || [])),
                            energy_consumption: currentFeatures.energy_consumption || data.energy_consumption || '',
                            energy_consumption_kwh: data.energy_consumption_kwh?.toString() || '',
                            energy_emissions: currentFeatures.energy_emissions || data.energy_emissions || '',
                            energy_emissions_kg: data.energy_emissions_kg?.toString() || '',
                            heating_type: data.heating_type || '',
                            acceso_exterior_adaptado: data.acceso_exterior_adaptado || false,
                            uso_silla_ruedas: data.uso_silla_ruedas || false,
                            images: currentFeatures.images && Array.isArray(currentFeatures.images) ? currentFeatures.images : (data.images && data.images.length > 0 ? data.images : (currentFeatures.image ? [currentFeatures.image] : [])),
                            imageUrl: data.image || currentFeatures.image || '',
                            video: data.video || currentFeatures.video || '',
                            matterport: data.matterport || currentFeatures.matterport || '',
                            latitude: currentFeatures.latitude?.toString() || data.latitude?.toString() || '',
                            longitude: currentFeatures.longitude?.toString() || data.longitude?.toString() || '',
                            public_latitude: currentFeatures.public_latitude?.toString() || data.public_latitude?.toString() || '',
                            public_longitude: currentFeatures.public_longitude?.toString() || data.public_longitude?.toString() || '',
                            owner: '',
                            propietario_id: data.propietario_id || '',
                            agente_id: data.agente_id || '',
                            is_published: data.is_published !== false,
                            certificado_energetico: data.certificado_energetico || 'en_tramite',
                            notes: data.notes || '',
                            internal_notes: data.internal_notes || data.notes || '',
                            has_keys: data.has_keys || false,
                            commission_percentage: data.commission_percentage?.toString() || '',
                            community_fees: data.community_fees?.toString() || '',
                            garbage_tax: data.garbage_tax?.toString() || '',
                            ibi: data.ibi?.toString() || '',
                            kitchen_type: data.kitchen_type || '',
                            terrace_meters: data.terrace_meters?.toString() || '',
                            plot_m2: data.plot_m2?.toString() || '',
                            furnished: data.furnished || '',
                            garage_num: data.garage_num?.toString() || '',
                            views_type: data.views_type || '',
                            key_highlights: data.key_highlights || '',
                            reference_id: data.reference_id || data.referencia || currentFeatures.reference_id || '',
                            province: data.province || 'Málaga',
                            internal_location_notes: data.internal_location_notes || '',

                            ac: hasFeature('Aire Acondicionado'),
                            heating: !!data.heating_type || hasFeature('Calefacción'),
                            terrace: hasFeature('Terraza'),
                            balcony: hasFeature('Balcón'),
                            pool: hasFeature('Piscina') || hasFeature('Piscina comunitaria'),
                            garden: hasFeature('Jardín') || hasFeature('Zonas verdes') || hasFeature('Zonas Verdes'),
                            sports_areas: hasFeature('Zonas Deportivas') || hasFeature('Zonas deportivas'),
                            garage: !!data.garage_num || hasFeature('Garaje') || hasFeature('Plaza de Garaje'),
                            storage: hasFeature('Trastero'),
                            accessible: data.acceso_exterior_adaptado || hasFeature('Acceso Minusválidos'),
                            views: !!data.views_type || hasFeature('Vistas al mar') || hasFeature('Vistas'),
                            floor_level: data.floor_level || currentFeatures.floor_level || '',

                            // Contract
                            contract_signature_date: data.contract_signature_date ? new Date(data.contract_signature_date).toISOString().split('T')[0] : '',
                            contract_duration_months: data.contract_duration_months?.toString() || '6',
                            is_manual_contract: data.is_manual_contract || (!!data.contract_signature_date && !data.owner_signature),

                            // i18n
                            title_en: data.title_en || '',
                            description_en: data.description_en || ''
                        });

                        if (mappedOwnerSearch) {
                            setOwnerSearch(mappedOwnerSearch);
                        }

                        const lat = currentFeatures.latitude || data.latitude;
                        const lon = currentFeatures.longitude || data.longitude;
                        if (lat && lon) setExactCoordsInput(`${lat}, ${lon}`);

                        const pubLat = currentFeatures.public_latitude || data.public_latitude;
                        const pubLon = currentFeatures.public_longitude || data.public_longitude;
                        if (pubLat && pubLon) setPublicCoordsInput(`${pubLat}, ${pubLon}`);

                        // Load property documents
                        await loadDocuments(data.reference_id || data.referencia);
                    }
                }
            } catch (error) {
                console.error("Error in fetchData: ", error);
            } finally {
                setFetching(false);
            }
        };
        fetchData();

        // Fetch user role
        const fetchRole = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                    setCurrentUserRole(profile?.role || 'agente');
                } else {
                    setCurrentUserRole('anon');
                }
            } catch (e) {
                console.error("Error fetching role:", e);
                setCurrentUserRole('error');
            }
        };
        fetchRole();
    }, [params.id]);

    // Sync local input state when formData changes (e.g. from randomize button)
    useEffect(() => {
        if (formData.latitude && formData.longitude) {
            // Only update if the input is empty or doesn't match the current data (to avoid cursor jumping if we were doing strict sync, but here we just want to ensure button clicks reflect)
            // We'll trust the buttons to update formData AND we want that reflected.
            // But we must check if the USER is typing.
            // Simplified: The buttons will explicitly update the input state if needed.
            // But for initial load or external updates, we might need this.
            // Let's rely on the inputs being controlled value={exactCoordsInput}
        }
    }, [formData.latitude, formData.longitude]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name === 'type' && value !== formData.type) {
            setFormData(prev => ({ ...prev, type: value, subtypes: [] }));
            return;
        }

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const zip = e.target.value;
        setFormData(prev => ({ ...prev, zip }));

        if (zip.length === 5) {
            try {
                const res = await fetch(`https://api.zippopotam.us/es/${zip}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.places && data.places.length > 0) {
                        const city = data.places[0]['place name'];
                        const state = data.places[0]['state'];
                        setFormData(prev => ({
                            ...prev,
                            city: prev.city || city,
                            province: prev.province || (state === 'Andalucía' && zip.startsWith('29') ? 'Málaga' : state)
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching zip info:", err);
            }
        }
    };

    const handleOrientationChange = (orientationValue: string, checked: boolean) => {
        setFormData(prev => {
            const current = new Set(prev.orientation);
            if (checked) {
                current.add(orientationValue);
            } else {
                current.delete(orientationValue);
            }
            return { ...prev, orientation: Array.from(current) };
        });
    };

    const handleSubtypeChange = (subtypeValue: string, checked: boolean) => {
        setFormData(prev => {
            const current = new Set(prev.subtypes);
            if (checked) {
                current.add(subtypeValue);
            } else {
                current.delete(subtypeValue);
            }
            return { ...prev, subtypes: Array.from(current) };
        });
    };

    const handleScanImages = async () => {
        if (!formData.reference_id) {
            alert("Introduce primero una referencia (ID Carpeta)");
            return;
        }

        // Use an alert to let the user know this might take a few seconds
        const toast = document.createElement("div");
        toast.className = "fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-xl z-50 transition-all font-medium text-sm flex items-center gap-3";
        toast.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Comprimiendo y escaneando fotos, por favor espera...';
        document.body.appendChild(toast);

        try {
            const result = await optimizeAndScanImages(formData.reference_id);
            if (result.success && result.images && result.images.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    images: result.images as string[],
                    imageUrl: (result.images as string[])[0]
                }));
                const optimizationMsg = result.optimizedCount && result.optimizedCount > 0
                    ? `\nSe han optimizado y comprimido automáticamente ${result.optimizedCount} fotos pesadas para que la web cargue rápido.`
                    : '';
                alert(`Se han detectado ${result.images.length} imágenes.` + optimizationMsg);
            } else {
                alert("No se han encontrado imágenes en la carpeta public/propiedades/" + formData.reference_id);
            }
        } catch (error) {
            alert("Error al escanear/optimizar las fotos.");
        } finally {
            document.body.removeChild(toast);
        }
    };

    const resizeImage = (file: File, maxWidth: number = 1920): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (maxWidth * height) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas blob failure'));
                    }, 'image/jpeg', 0.85); // High quality JPEG for upload
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        if (selectedFiles.length === 0) return;

        if (!formData.reference_id) {
            alert("Para subir fotos, esta propiedad debe tener un número de Referencia ID.");
            return;
        }

        setIsUploading(true);
        const refId = formData.reference_id;
        let errorCount = 0;
        let successCount = 0;

        const toast = document.createElement("div");
        toast.className = "fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] transition-all font-medium text-sm flex flex-col gap-3 min-w-[320px] border border-blue-400";
        document.body.appendChild(toast);

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                
                // Update UI: Compressing...
                toast.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                        <div class="flex flex-col">
                            <span class="font-bold">Procesando foto ${i + 1} de ${selectedFiles.length}</span>
                            <span class="text-[11px] opacity-80">Optimizando tamaño localmente...</span>
                        </div>
                    </div>
                    <div class="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div class="bg-white h-full transition-all duration-500" style="width: ${(i / selectedFiles.length) * 100}%"></div>
                    </div>
                `;

                try {
                    // 1. LOCAL RESIZE (Crucial for Vercel 4.5MB limit)
                    const optimizedBlob = file.size > 800 * 1024 
                        ? await resizeImage(file) 
                        : file; // Only resize if > 800KB

                    // 2. UPLOAD
                    toast.innerHTML = `
                        <div class="flex items-center gap-3">
                            <div class="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                            <div class="flex flex-col">
                                <span class="font-bold">Subiendo foto ${i + 1} de ${selectedFiles.length}</span>
                                <span class="text-[11px] opacity-80">${file.name}</span>
                            </div>
                        </div>
                        <div class="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                            <div class="bg-white h-full transition-all duration-300" style="width: ${(i / selectedFiles.length) * 100}%"></div>
                        </div>
                    `;

                    const data = new FormData();
                    data.append('reference_id', refId);
                    data.append('files', optimizedBlob, file.name.replace(/\.[^/.]+$/, "") + ".jpg");

                    const response = await fetch('/api/upload-images', {
                        method: 'POST',
                        body: data
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                        throw new Error(errorData.error || `HTTP ${response.status}`);
                    }

                    const result = await response.json();

                    if (result.success && result.images) {
                        successCount++;
                        // Immediate UI update for the gallery
                        setFormData(prev => ({
                            ...prev,
                            images: result.images as string[],
                            imageUrl: (result.images as string[])[0]
                        }));
                    } else {
                        throw new Error(result.error || "Error en el servidor");
                    }
                } catch (err: any) {
                    console.error(`Error on ${file.name}:`, err);
                    errorCount++;
                    // Show small error hint in toast
                    const errHint = document.createElement("div");
                    errHint.className = "text-[10px] text-red-200 mt-1";
                    errHint.innerText = `Fallo en: ${file.name} - ${err.message}`;
                    toast.appendChild(errHint);
                    await new Promise(r => setTimeout(r, 1000)); // Pause briefly to let user read error
                }
            }

            const finalMsg = `Proceso de subida finalizado.\n✅ ${successCount} fotos procesadas con éxito.${errorCount > 0 ? `\n❌ ${errorCount} fotos fallaron.` : ''}`;
            alert(finalMsg);

        } catch (e) {
            console.error(e);
            alert("Ocurrió un error crítico durante la subida masiva.");
        } finally {
            if (document.body.contains(toast)) document.body.removeChild(toast);
            setIsUploading(false);
            if (event.target) event.target.value = ''; // Clear input for next use
        }
    };

    const getStoragePath = () => {
        const ref = formData.reference_id || 'SIN_REF';
        const id = params.id as string;
        return `${ref}_${id}`;
    };

    const loadDocuments = async (refId?: string) => {
        try {
            const ref = refId || formData.reference_id || 'SIN_REF';
            const id = params.id as string;
            const folderPath = `${ref}_${id}`;
            
            const { data, error } = await supabase.storage.from('property_documents').list(folderPath);
            if (error) {
                console.error("Error loading documents:", error);
                // Fallback: check if old folder exists (pure UUID)
                const { data: oldData, error: oldError } = await supabase.storage.from('property_documents').list(params.id as string);
                if (!oldError && oldData && oldData.length > 0) {
                    setPropertyDocuments(oldData.filter(f => f.name !== '.emptyFolderPlaceholder'));
                    return;
                }
                return;
            }
            if (data) {
                setPropertyDocuments(data.filter(f => f.name !== '.emptyFolderPlaceholder'));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limpiar nombre de archivo (reemplazar espacios, tildes y caracteres raros) para evitar error "Invalid key" en Supabase
        const cleanFileName = file.name
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/[^a-zA-Z0-9.\-_]/g, "_"); // replace special chars/spaces with _

        setUploadingDoc(true);
        const folderPath = getStoragePath();
        try {
            // Upload to private bucket: property_documents/REFERENCE_ID_UUID/filename
            const { error } = await supabase.storage.from('property_documents').upload(`${folderPath}/${cleanFileName}`, file, {
                upsert: true
            });
            if (error) throw error;

            await loadDocuments(formData.reference_id);
            alert("Documento subido con éxito.");
        } catch (error: any) {
            console.error("Error al subir documento:", error);
            alert("Error al subir el documento: " + (error.message || "Invalid key. Renombra el archivo y quítale los acentos."));
        } finally {
            setUploadingDoc(false);
            if (e.target) e.target.value = ''; // clear input
        }
    };

    const handleDocDelete = async (fileName: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar el documento: ${fileName}?`)) return;
        const folderPath = getStoragePath();
        try {
            const { error } = await supabase.storage.from('property_documents').remove([`${folderPath}/${fileName}`]);
            if (error) {
                // Try fallback delete for old folder
                await supabase.storage.from('property_documents').remove([`${params.id}/${fileName}`]);
            }
            await loadDocuments(formData.reference_id);
        } catch (error: any) {
            console.error("Error al eliminar documento:", error);
            alert("Error al eliminar: " + error.message);
        }
    };

    const downloadDoc = async (fileName: string) => {
        const folderPath = getStoragePath();
        try {
            // Document bucket is private, so we create a signed URL valid for 60 seconds
            let { data, error } = await supabase.storage.from('property_documents').createSignedUrl(`${folderPath}/${fileName}`, 60);

            if (error) {
                // Try old folder fallback
                const { data: oldData, error: oldError } = await supabase.storage.from('property_documents').createSignedUrl(`${params.id}/${fileName}`, 60);
                data = oldData;
                error = oldError;
            }

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (error: any) {
            console.error("Error al descargar documento:", error);
            alert("Error al acceder al documento.");
        }
    };

    const generateDescription = () => {
        const typeLabel = formData.subtypes.length > 0 ? formData.subtypes.join(' y ') : formData.type;
        const featuresList = [];
        const expenses = [];
        if (formData.community_fees) expenses.push(`Comunidad: ${formData.community_fees} €/mes`);
        if (formData.ibi) expenses.push(`IBI: ${formData.ibi} €/año`);
        if (formData.garbage_tax) expenses.push(`Basura: ${formData.garbage_tax} €/año`);

        const getVistasText = (type: string) => {
            if (!type || type === 'despejadas') return "vistas despejadas";
            if (type === 'mar') return "vistas frontales al mar";
            if (type === 'montaña') return "impresionantes vistas a la montaña";
            return `vistas a la ${type}`;
        };

        if (formData.terrace && formData.terrace_meters) featuresList.push(`una magnífica terraza de ${formData.terrace_meters}m² ideal para disfrutar del clima de la zona`);
        else if (formData.terrace) featuresList.push("una fantástica terraza");

        if (formData.plot_m2 && parseFloat(formData.plot_m2) > 0) featuresList.push(`una amplia parcela privada de ${formData.plot_m2}m²`);

        if (formData.kitchen_type) {
            const kType = formData.kitchen_type === 'americana' ? 'estilo americano' : (formData.kitchen_type === 'integrada' ? 'integrada en el salón' : 'independiente y totalmente equipada');
            featuresList.push(`cocina ${kType}`);
        }

        if (formData.furnished === 'amueblado') featuresList.push('se entrega totalmente amueblado con gusto');
        else if (formData.furnished === 'sin_amueblar') featuresList.push('se entrega sin amueblar, ofreciendo un lienzo en blanco para su nuevo hogar');

        if (formData.pool) featuresList.push("piscina comunitaria rodeada de zonas verdes");
        if (formData.garage) {
            const garageText = formData.garage_num ? `${formData.garage_num} plazas de garaje incluidas` : "plaza de garaje incluida en el precio";
            featuresList.push(garageText);
        }
        if (formData.views) {
            featuresList.push(getVistasText(formData.views_type));
        }
        if (formData.garden) featuresList.push("exquisitos jardines comunitarios");
        if (formData.sports_areas) featuresList.push("completas zonas deportivas");
        if (formData.elevator === 'si') featuresList.push("ascensor con acceso directo");
        if (formData.ac) featuresList.push("sistema de aire acondicionado");

        let text = `¡OPORTUNIDAD EXCLUSIVA EN ${formData.city.toUpperCase()}! \n\n`;

        // Location Context
        let locationContext = "";
        if (formData.urbanization) {
            locationContext = `ubicado en la prestigiosa urbanización ${formData.urbanization}`;
        } else if (formData.address_street) {
            locationContext = `situado en la zona de ${formData.address_street}`;
        } else {
            locationContext = `en una de las ubicaciones más demandadas de ${formData.city}`;
        }

        const floorText = formData.floor_level ? ` en planta ${formData.floor_level}` : "";
        text += `Alros Inmobiliaria presenta este exclusivo ${typeLabel.toLowerCase()}${floorText} ${locationContext}. Una propiedad que destaca no solo por su ubicación privilegiada, sino por su excepcional luminosidad y amplitud. \n\n`;

        text += `La vivienda dispone de una superficie de ${formData.size_m2}m² construidos`;
        if (formData.useful_m2) text += ` (${formData.useful_m2}m² útiles)`;
        text += `, perfectamente distribuidos en ${formData.bedrooms} dormitorios dobles y ${formData.bathrooms} baños completos. `;

        if (formData.orientation.length > 0) {
            text += `Gracias a su orientación ${formData.orientation.join("/")}, la propiedad disfruta de luz natural durante todo el día, creando un ambiente cálido y acogedor en todas sus estancias. `;
        }
        text += `\n\n`;

        if (featuresList.length > 0) {
            text += `Entre sus principales características y equipamiento excepcional, destacan: \n`;
            featuresList.forEach(f => {
                text += `• ${f.charAt(0).toUpperCase() + f.slice(1)}\n`;
            });
            text += `\n`;
        }

        if (formData.key_highlights) {
            text += `A DESTACAR: ${formData.key_highlights}. \n\n`;
        }

        text += `Esta propiedad representa una excelente opción tanto para residencia habitual como para inversión, dada la alta rentabilidad y revalorización de la zona. \n\n`;
        text += `No deje escapar esta oportunidad. Póngase en contacto con nosotros para concertar una visita o recibir más información. En Alros Inmobiliaria, le acompañamos en cada paso para encontrar su hogar ideal.`;

        if (expenses.length > 0) {
            text += `\n\n* Gastos de la propiedad: ${expenses.join(' | ')}`;
        }

        setFormData(prev => ({ ...prev, description: text }));

        // Title generation (SHOUTY + ATTRACTIVE)
        const typeBase = typeLabel.split(' ')[0] || formData.type;

        let titleParts = [];
        if (formData.price && parseFloat(formData.price) > 500000) titleParts.push("LUJOSO");
        else if (formData.type === 'atico' || formData.type === 'apartamento') titleParts.push("LUMINOSO");
        else titleParts.push("ESPECTACULAR");

        titleParts.push(typeBase.toUpperCase());

        if (formData.bedrooms) titleParts.push(`${formData.bedrooms} DORM.`);

        if (formData.views && formData.views_type === 'mar') titleParts.push("VISTAS AL MAR");
        else if (formData.terrace) titleParts.push("CON TERRAZA");

        if (formData.urbanization) titleParts.push(`EN ${formData.urbanization.toUpperCase()}`);
        else titleParts.push(`EN ${formData.city.toUpperCase()}`);

        let title = titleParts.join(" ");
        if (title.length > 100) title = title.substring(0, 97) + "...";

        // ---- ENGLISH TRANSLATION ----
        let textEn = `EXCLUSIVE OPPORTUNITY IN ${formData.city.toUpperCase()}! \n\n`;
        let locationContextEn = "";
        if (formData.urbanization) {
            locationContextEn = `located in the prestigious urbanization ${formData.urbanization}`;
        } else if (formData.address_street) {
            locationContextEn = `situated in the ${formData.address_street} area`;
        } else {
            locationContextEn = `in one of the most sought-after locations in ${formData.city}`;
        }

        const typeBaseEn = formData.type === 'apartamento' ? 'apartment' : (formData.type === 'casa' ? 'house/villa' : 'property');
        const floorTextEn = formData.floor_level ? ` on the ${formData.floor_level} floor` : "";
        
        textEn += `Alros Inmobiliaria presents this exclusive ${typeBaseEn}${floorTextEn} ${locationContextEn}. A property that stands out not only for its privileged location but also for its exceptional luminosity and spaciousness. \n\n`;
        textEn += `The property features a built area of ${formData.size_m2}m²`;
        if (formData.useful_m2) textEn += ` (${formData.useful_m2}m² usable)`;
        textEn += `, perfectly distributed into ${formData.bedrooms} double bedrooms and ${formData.bathrooms} full bathrooms. `;

        if (formData.orientation.length > 0) {
            textEn += `Thanks to its ${formData.orientation.join("/")} orientation, the property enjoys natural light throughout the day, creating a warm and welcoming atmosphere in all rooms. \n\n`;
        } else {
            textEn += `\n\n`;
        }

        const featuresListEn = [];
        if (formData.terrace && formData.terrace_meters) featuresListEn.push(`magnificent ${formData.terrace_meters}m² terrace ideal for enjoying the local climate`);
        else if (formData.terrace) featuresListEn.push("fantastic terrace");
        if (formData.plot_m2 && parseFloat(formData.plot_m2) > 0) featuresListEn.push(`large private plot of ${formData.plot_m2}m²`);
        if (formData.kitchen_type) {
            const kType = formData.kitchen_type === 'americana' ? 'American-style' : (formData.kitchen_type === 'integrada' ? 'integrated into the living room' : 'independent and fully equipped');
            featuresListEn.push(`${kType} kitchen`);
        }
        if (formData.furnished === 'amueblado') featuresListEn.push('delivered fully and tastefully furnished');
        else if (formData.furnished === 'sin_amueblar') featuresListEn.push('delivered unfurnished, offering a blank canvas for your new home');
        
        if (formData.pool) featuresListEn.push("communal swimming pool surrounded by green areas");
        if (formData.garage) featuresListEn.push(formData.garage_num ? `${formData.garage_num} parking spaces included` : "parking space included in the price");
        if (formData.views) {
            let viewText = 'clear views';
            if (formData.views_type === 'mar') viewText = 'front-line sea views';
            else if (formData.views_type === 'montaña') viewText = 'stunning mountain views';
            featuresListEn.push(viewText);
        }
        if (formData.garden) featuresListEn.push("exquisite communal gardens");
        if (formData.sports_areas) featuresListEn.push("comprehensive sports areas");
        if (formData.elevator === 'si') featuresListEn.push("elevator with direct access");
        if (formData.ac) featuresListEn.push("air conditioning system");

        if (featuresListEn.length > 0) {
            textEn += `Among its main features and exceptional equipment, it stands out for: \n`;
            featuresListEn.forEach(f => {
                textEn += `• ${f.charAt(0).toUpperCase() + f.slice(1)}\n`;
            });
            textEn += `\n`;
        }

        if (formData.key_highlights) {
            textEn += `HIGHLIGHTS: ${formData.key_highlights}. \n\n`;
        }

        textEn += `This property represents an excellent option both as a primary residence and as an investment, given the high profitability and revaluation of the area. \n\n`;
        textEn += `Don't miss this opportunity. Contact us to arrange a viewing or to receive more information. At Alros Inmobiliaria, we accompany you every step of the way to finding your ideal home.`;

        const expensesEn = [];
        if (formData.community_fees) expensesEn.push(`Community Fees: ${formData.community_fees} €/month`);
        if (formData.ibi) expensesEn.push(`IBI: ${formData.ibi} €/year`);
        if (formData.garbage_tax) expensesEn.push(`Rubbish: ${formData.garbage_tax} €/year`);
        if (expensesEn.length > 0) {
            textEn += `\n\n* Property Expenses: ${expensesEn.join(' | ')}`;
        }

        let titleEnParts = [];
        if (formData.price && parseFloat(formData.price) > 500000) titleEnParts.push("LUXURY");
        else if (formData.type === 'atico' || formData.type === 'apartamento') titleEnParts.push("BRIGHT");
        else titleEnParts.push("SPECTACULAR");
        titleEnParts.push(typeBaseEn.toUpperCase());
        if (formData.bedrooms) titleEnParts.push(`${formData.bedrooms} BED.`);
        if (formData.views && formData.views_type === 'mar') titleEnParts.push("SEA VIEWS");
        else if (formData.terrace) titleEnParts.push("WITH TERRACE");
        if (formData.urbanization) titleEnParts.push(`IN ${formData.urbanization.toUpperCase()}`);
        else titleEnParts.push(`IN ${formData.city.toUpperCase()}`);
        
        let titleEn = titleEnParts.join(" ");
        if (titleEn.length > 100) titleEn = titleEn.substring(0, 97) + "...";

        setFormData(prev => ({ ...prev, description: text, title: title, description_en: textEn, title_en: titleEn }));
    };

    const handleDelete = async () => {
        if (!confirm("⚠️ ¿ESTÁS SEGURO?\n\nEsta acción es IRREVERSIBLE.\n\nSe borrará:\n1. La ficha del sistema\n2. Todas las FOTOS en la nube\n3. Toda la DOCUMENTACIÓN privada")) return;
        
        setLoading(true);
        try {
            const propertyId = params.id as string;
            const ref = formData.reference_id || 'SIN_REF';
            
            // 1. Clean Images (property_images bucket)
            if (ref && ref !== 'SIN_REF') {
                const { data: imageFiles } = await supabase.storage.from('property_images').list(ref);
                if (imageFiles && imageFiles.length > 0) {
                    const paths = imageFiles.map(f => `${ref}/${f.name}`);
                    await supabase.storage.from('property_images').remove(paths);
                }
            }

            // 2. Clean Documents (property_documents bucket)
            const docFolder = getStoragePath();
            const { data: docFiles } = await supabase.storage.from('property_documents').list(docFolder);
            if (docFiles && docFiles.length > 0) {
                const paths = docFiles.map(f => `${docFolder}/${f.name}`);
                await supabase.storage.from('property_documents').remove(paths);
            }

            // 3. Delete from DB
            const { error } = await supabase.from('properties').delete().eq('id', propertyId);
            if (error) throw error;
            
            router.push('/admin/propiedades');
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert("Error al eliminar por completo: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (loading) return;
        
        // Validación obligatoria: Propietario
        if (!formData.propietario_id) {
            setError("Error: Debes asignar un propietario a la propiedad.");
            // Scroll to owner field
            const ownerSection = document.getElementById('section-1-datos');
            if (ownerSection) ownerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload: any = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                operation_type: formData.operation,
                property_type: formData.type,
                city: formData.city,
                address_street: formData.address_street,
                address_number: formData.address_number,
                address_floor: formData.address_floor,
                address_block: formData.address_block,
                address_door: formData.address_door,
                urbanization: formData.urbanization,
                zip: formData.zip,
                status: formData.status,
                bedrooms: parseInt(formData.bedrooms) || 0,
                bathrooms: parseInt(formData.bathrooms) || 0,
                size_m2: parseInt(formData.size_m2) || 0,
                useful_m2: parseInt(formData.useful_m2) || 0,
                year_built: parseInt(formData.year) || undefined,
                elevator: formData.elevator === 'si',
                orientation: formData.orientation,
                energy_consumption: formData.energy_consumption,
                energy_consumption_kwh: parseFloat(formData.energy_consumption_kwh) || undefined,
                energy_emissions: formData.energy_emissions,
                energy_emissions_kg: parseFloat(formData.energy_emissions_kg) || undefined,
                heating_type: formData.heating_type,
                acceso_exterior_adaptado: formData.acceso_exterior_adaptado,
                uso_silla_ruedas: formData.uso_silla_ruedas,
                images: formData.images,
                image: formData.images[0] || undefined,
                video: formData.video,
                matterport: formData.matterport,
                latitude: parseFloat(formData.latitude) || undefined,
                longitude: parseFloat(formData.longitude) || undefined,
                public_latitude: parseFloat(formData.public_latitude) || undefined,
                public_longitude: parseFloat(formData.public_longitude) || undefined,
                propietario_id: formData.propietario_id || null,
                agente_id: formData.agente_id || null,
                is_published: formData.is_published,
                certificado_energetico: formData.certificado_energetico || null,
                 // New specialized columns
                internal_notes: formData.internal_notes || null,
                has_keys: formData.has_keys,
                commission_percentage: parseFloat(formData.commission_percentage) || null,
                community_fees: parseFloat(formData.community_fees) || null,
                garbage_tax: parseFloat(formData.garbage_tax) || null,
                ibi: parseFloat(formData.ibi) || null,
                kitchen_type: formData.kitchen_type || null,
                terrace_meters: parseFloat(formData.terrace_meters) || null,
                plot_m2: parseFloat(formData.plot_m2) || null,
                furnished: formData.furnished || null,
                garage_num: parseInt(formData.garage_num) || null,
                views_type: formData.views_type || null,
                province: formData.province || 'Málaga',
                internal_location_notes: formData.internal_location_notes || null,
            };

            // Verificar si existen las columnas de traducción antes de enviarlas (para evitar error 42703)
            const { error: schemaCheck } = await supabase.from('properties').select('title_en').limit(0);
            if (!schemaCheck) {
                payload.title_en = formData.title_en || null;
                payload.description_en = formData.description_en || null;
            } else {
                console.warn("Las columnas 'title_en' o 'description_en' no existen en la tabla properties. Por favor, ejecuta el script i18n_columns.sql en Supabase.");
            }

            payload.contract_signature_date = formData.contract_signature_date ? new Date(formData.contract_signature_date).toISOString() : null;
            payload.contract_duration_months = parseInt(formData.contract_duration_months) || 6;
            payload.is_manual_contract = formData.is_manual_contract;
            payload.features = {
                amenities: [
                    formData.ac && "Aire Acondicionado",
                    formData.heating && `Calefacción${formData.heating_type ? ` (${formData.heating_type})` : ''}`,
                    formData.terrace && "Terraza",
                    formData.balcony && "Balcón",
                    formData.pool && "Piscina",
                    formData.garden && "Zonas Verdes",
                    formData.sports_areas && "Zonas Deportivas",
                    formData.garage && (formData.garage_num ? `${formData.garage_num} Plazas de Garaje` : "Plaza de Garaje"),
                    formData.storage && "Trastero",
                    formData.accessible && "Acceso Minusválidos",
                    formData.acceso_exterior_adaptado && "Acceso exterior adaptado",
                    formData.uso_silla_ruedas && "Adaptado silla de ruedas",
                    formData.views && (formData.views_type ? `Vistas a ${formData.views_type}` : "Vistas despejadas")
                ].filter(Boolean),
                subtypes: formData.subtypes
            };

            const result = await updateProperty(params.id as string, payload);

            if (result.success) {
                setSuccessMsg("¡Propiedad actualizada correctamente! Redirigiendo al listado...");
                setTimeout(() => {
                    router.push("/admin/propiedades");
                    router.refresh();
                }, 1500);
            } else {
                let msg = result.error?.message || "Error al actualizar la propiedad";
                if (result.error?.code === "23505") msg = "Error: La referencia ya existe.";
                setError(msg);
                setLoading(false);
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            setError("Error de red o servidor.");
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    // DEBUG: Log role to console for user
    console.log("ALROS DEBUG: Current Role =", currentUserRole);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Editar Propiedad</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Modificando la ficha del inmueble.</p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* Botón de borrado forzado (sin guardas para admins/agentes logueados) */}
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center shadow-lg shadow-red-500/20"
                        title="Borrar Propiedad y Documentos"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                    </button>
                    <Link href={`/admin/propiedades/contrato/${params.id}`} className="flex-1 md:flex-none justify-center px-4 py-2 border border-blue-300 text-blue-700 font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
                        <span>📄 Contrato</span>
                    </Link>
                    <Link href="/admin/propiedades" className="flex-1 md:flex-none justify-center px-4 py-2 border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors">
                        Cancelar
                    </Link>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || successMsg !== null}
                        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {loading ? 'Guardando...' : successMsg ? 'Guardado ✅' : 'Guardar'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 font-medium">
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-medium mb-6">
                    ✅ {successMsg}
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-8">
                    <section id="section-1-datos" className={`bg-white p-6 rounded-xl shadow-sm border transition-all space-y-6 ${!formData.propietario_id ? 'border-orange-200' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="font-bold text-lg text-slate-900 leading-none">1. Operación y Datos Generales</h2>
                            {!formData.propietario_id && (
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full animate-pulse border border-orange-100">
                                    Propietario obligatorio
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Operación</label>
                                <select name="operation" value={formData.operation} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white">
                                    <option value="venta">Venta</option>
                                    <option value="alquiler">Alquiler</option>
                                    <option value="alquiler_temporada">Alquiler Temporal</option>
                                    <option value="alquiler_vacacional">Alquiler Vacacional</option>
                                    <option value="traspaso">Traspaso</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-1">Precio (€)</label>
                                <input name="price" value={formData.price} onChange={handleChange} type="number" className="w-full px-4 py-2 font-bold text-lg rounded-lg border border-slate-300 text-blue-600 bg-blue-50 focus:bg-white transition-colors" placeholder="0 €" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Inmueble</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white">
                                    <option value="apartamento">Apartamento</option>
                                    <option value="casa">Casa / Chalet</option>
                                    <option value="obra_nueva">Obra Nueva</option>
                                    <option value="local">Local Comercial</option>
                                    <option value="oficina">Oficina</option>
                                    <option value="terreno">Terreno</option>
                                    <option value="edificio">Edificio</option>
                                    <option value="garaje">Garaje</option>
                                    <option value="trastero">Trastero</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white font-bold text-blue-900">
                                    <option value="disponible">Disponible</option>
                                    <option value="reservado">Reservado</option>
                                    <option value="vendido">Vendido</option>
                                    <option value="alquilado">Alquilado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Referencia Auto</label>
                                <input name="reference_id" disabled value={formData.reference_id || ''} type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 font-mono text-sm bg-slate-50 placeholder:text-slate-400" placeholder="P0..." />
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Propietario (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o DNI..."
                                    value={ownerSearch}
                                    onChange={e => {
                                        setOwnerSearch(e.target.value);
                                        setIsOwnerDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsOwnerDropdownOpen(true)}
                                    // Use onBlur with timeout to allow clicking options before it closes
                                    onBlur={() => setTimeout(() => setIsOwnerDropdownOpen(false), 200)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white shadow-sm border-blue-200 placeholder:text-slate-400"
                                />
                                {isOwnerDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg max-h-60 overflow-y-auto">
                                        <div
                                            className="px-4 py-3 cursor-pointer hover:bg-slate-50 text-slate-500 italic border-b border-slate-100 text-sm"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, propietario_id: '' }));
                                                setOwnerSearch('');
                                            }}
                                        >
                                            Sin propietario (Vaciar)
                                        </div>
                                        {owners
                                            .filter(o => o.nombre_completo.toLowerCase().includes(ownerSearch.toLowerCase()) || (o.documento_identidad && o.documento_identidad.toLowerCase().includes(ownerSearch.toLowerCase())))
                                            .map(o => (
                                                <div
                                                    key={o.id}
                                                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 border-b border-slate-100 last:border-0 ${formData.propietario_id === o.id ? 'bg-blue-50' : ''}`}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, propietario_id: o.id }));
                                                        setOwnerSearch(`${o.nombre_completo} ${o.documento_identidad ? `(${o.documento_identidad})` : ''}`);
                                                    }}
                                                >
                                                    <div className="font-bold text-slate-800 text-sm">{o.nombre_completo}</div>
                                                    {o.documento_identidad && <div className="text-xs text-slate-500">DNI/NIE: {o.documento_identidad}</div>}
                                                </div>
                                            ))}
                                        {owners.filter(o => o.nombre_completo.toLowerCase().includes(ownerSearch.toLowerCase()) || (o.documento_identidad && o.documento_identidad.toLowerCase().includes(ownerSearch.toLowerCase()))).length === 0 && (
                                            <div className="px-4 py-3 text-sm text-slate-500 text-center">No se encontraron propietarios</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Agente Captador</label>
                                <select name="agente_id" value={formData.agente_id} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white">
                                    <option value="">Seleccione Agente...</option>
                                    {agents && agents.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <label className={`flex items-center gap-3 cursor-pointer p-2 w-full border rounded-lg transition-colors ${formData.is_published ? 'border-green-200 bg-green-50 shadow-sm' : 'border-slate-200 bg-slate-50'}`}>
                                    <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} className="rounded text-green-600 focus:ring-green-500 w-5 h-5 ml-2" />
                                    <div>
                                        <span className={`block text-sm font-bold ${formData.is_published ? 'text-green-800' : 'text-slate-600'}`}>{formData.is_published ? 'Publicado' : 'No Publicado'}</span>
                                        <span className="block text-[10px] text-slate-500">Visible en la web pública</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="col-span-1 sm:col-span-3">
                                <h3 className="text-sm font-bold text-orange-900 border-b border-orange-200 pb-2 mb-1">Datos Internos (No Públicos)</h3>
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center gap-3 cursor-pointer p-2 w-full border border-orange-300 bg-white rounded-lg transition-colors hover:bg-orange-100">
                                    <input type="checkbox" name="has_keys" checked={formData.has_keys} onChange={handleChange} className="rounded text-orange-600 focus:ring-orange-500 w-5 h-5 ml-2" />
                                    <span className="text-sm font-bold text-orange-800">Custodia de Llaves</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-orange-800 mb-1">Comisión (%)</label>
                                <input name="commission_percentage" value={formData.commission_percentage} onChange={handleChange} type="number" step="0.1" className="w-full px-3 py-2 rounded border border-orange-300 bg-white" placeholder="Ej: 5" />
                            </div>
                            <div className="col-span-1 sm:col-span-3 mt-1">
                                <label className="block text-sm font-bold text-orange-800 mb-1">Notas Internas</label>
                                <textarea name="internal_notes" value={formData.internal_notes} onChange={handleChange} className="w-full px-3 py-2 rounded border border-orange-300 bg-white min-h-[60px] text-sm" placeholder="Añade notas visibles solo para administradores..." />
                            </div>
                        </div>



                        {currentSubtypes && (
                            <div className="bg-slate-50 p-4 rounded-lg flex flex-wrap gap-4">
                                {currentSubtypes.map(st => {
                                    const value = st.toLowerCase().replace(/\s+/g, '_');
                                    return (
                                        <label key={st} className="flex items-center gap-2 cursor-pointer whitespace-nowrap bg-white px-3 py-1 rounded-md border border-slate-200 hover:border-blue-300 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.subtypes.includes(value)}
                                                onChange={(e) => handleSubtypeChange(value, e.target.checked)}
                                                className="text-blue-600 focus:ring-blue-500 rounded"
                                            />
                                            <span className="text-sm font-medium text-slate-700">{st}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileSignature size={18} className="text-blue-600" />
                                Estado del Contrato / Autorización
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Firma</label>
                                    <input 
                                        type="date" 
                                        name="contract_signature_date" 
                                        value={formData.contract_signature_date} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white" 
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Si el cliente lo firma a mano, anota aquí la fecha para que el sistema controle la caducidad.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duración del Contrato (Meses)</label>
                                    <select 
                                        name="contract_duration_months" 
                                        value={formData.contract_duration_months} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white"
                                    >
                                        <option value="3">3 meses</option>
                                        <option value="6">6 meses</option>
                                        <option value="12">12 meses</option>
                                        <option value="24">24 meses</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            name="is_manual_contract" 
                                            checked={formData.is_manual_contract} 
                                            onChange={handleChange} 
                                            className="rounded text-blue-600 w-5 h-5" 
                                        />
                                        <div>
                                            <span className="text-sm font-bold text-slate-800">Contrato firmado fuera del sistema (Manual/Físico)</span>
                                            <p className="text-[10px] text-slate-500">Marca esto si tienes el documento en papel o PDF externo. El "semáforo" del listado se pondrá en verde.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                        <h2 className="font-bold text-lg text-slate-900 border-b pb-2">2. Ubicación</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Desglose Interno del Inmueble (Para visitas)</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre de la vía</label>
                                        <input name="address_street" value={formData.address_street} onChange={handleChange} type="text" className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white" placeholder="Ej: Avda. del Trabajo" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Número</label>
                                        <input name="address_number" value={formData.address_number} onChange={handleChange} type="text" className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white" placeholder="Ej: 15" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Planta</label>
                                        <input name="address_floor" value={formData.address_floor} onChange={handleChange} type="text" className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white" placeholder="Ej: 3" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Bloque / Escalera</label>
                                        <input name="address_block" value={formData.address_block} onChange={handleChange} type="text" className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white" placeholder="Ej: Bloque A" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Puerta</label>
                                        <input name="address_door" value={formData.address_door} onChange={handleChange} type="text" className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white" placeholder="Ej: C" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre de la Urbanización</label>
                                        <input name="urbanization" value={formData.urbanization} onChange={handleChange} type="text" className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white" placeholder="Ej: Residencial Los Naranjos" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Localidad (Ciudad)</label>
                                        <input name="city" value={formData.city} onChange={handleChange} type="text" className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white" placeholder="Ej: Benalmádena" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Provincia</label>
                                        <input name="province" value={formData.province} onChange={handleChange} type="text" className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white" placeholder="Ej: Málaga" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Código Postal</label>
                                        <input name="zip" value={formData.zip} onChange={handleZipChange} type="text" className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white" placeholder="Ej: 29639" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-xs font-bold text-orange-800 mb-1 flex items-center gap-1">
                                        <FileText size={14} />
                                        Información Interna de Ubicación (No Pública)
                                    </label>
                                    <textarea 
                                        name="internal_location_notes" 
                                        value={formData.internal_location_notes} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 text-sm rounded border border-orange-200 bg-orange-50/30 min-h-[60px] focus:bg-white transition-colors" 
                                        placeholder="Ej: Garaje número 12, código portal 1234, o detalles del timbre..."
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 p-4 bg-blue-50 rounded-xl border border-blue-100 mt-2">
                                <h3 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
                                    <MapPin size={16} />
                                    Ubicación Pública (Visible en el Mapa)
                                </h3>
                                <p className="text-xs text-blue-700 mb-3">
                                    Esta es la única chincheta visible en la web. Muévela para decidir exactamente qué ven los clientes.
                                </p>
                                <div className="h-[400px] bg-slate-200 rounded-xl overflow-hidden relative border border-blue-200 shadow-inner" style={{ zIndex: 0 }}>
                                    <DraggableMap
                                        lat={parseFloat(formData.public_latitude) || 36.59}
                                        lng={parseFloat(formData.public_longitude) || -4.52}
                                        onLocationChange={(lat, lng) => {
                                            const latStr = lat.toFixed(6);
                                            const lngStr = lng.toFixed(6);
                                            setFormData(prev => ({
                                                ...prev,
                                                public_latitude: latStr,
                                                public_longitude: lngStr
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="text-xs font-mono bg-white px-2 py-1 rounded border border-blue-200 text-slate-500">
                                        Lat/Lng: {formData.public_latitude || '0.000'} , {formData.public_longitude || '0.000'}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const query = `${formData.address_street || ''} ${formData.address_number || ''}, ${formData.city || ''}, ${formData.zip || ''}, España`;
                                            if (!query.replace(/,/g, '').replace('España', '').trim()) {
                                                alert("Rellena primero los datos básicos de la calle y ciudad en el desglose.");
                                                return;
                                            }

                                            const toast = document.createElement("div");
                                            toast.className = "fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-xl z-50 text-sm";
                                            toast.innerText = 'Buscando dirección...';
                                            document.body.appendChild(toast);

                                            try {
                                                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                                                const data = await res.json();
                                                if (data && data.length > 0) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        public_latitude: data[0].lat,
                                                        public_longitude: data[0].lon
                                                    }));
                                                    toast.innerText = '¡Encontrado!';
                                                    toast.classList.replace('bg-slate-800', 'bg-green-600');
                                                } else {
                                                    toast.innerText = 'No encontrada. Intenta especificar más la vía o ciudad.';
                                                    toast.classList.replace('bg-slate-800', 'bg-red-600');
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                toast.innerText = 'Error buscando.';
                                            }
                                            setTimeout(() => document.body.removeChild(toast), 3000);
                                        }}
                                        className="text-xs bg-white text-blue-700 font-bold px-3 py-1.5 rounded border border-blue-300 hover:bg-blue-100 transition-colors"
                                    >
                                        Centrar desde Desglose
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                        <h2 className="font-bold text-lg text-slate-900 border-b pb-2">3. Distribución y Características</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">M² Const.</label>
                                <input name="size_m2" value={formData.size_m2} onChange={handleChange} type="number" className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">M² Útiles</label>
                                <input name="useful_m2" value={formData.useful_m2} onChange={handleChange} type="number" className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">M² Parcela</label>
                                <input name="plot_m2" value={formData.plot_m2} onChange={handleChange} type="number" className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Habitaciones</label>
                                <input name="bedrooms" value={formData.bedrooms} onChange={handleChange} type="number" className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Baños</label>
                                <input name="bathrooms" value={formData.bathrooms} onChange={handleChange} type="number" className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Año Const.</label>
                                <input name="year" value={formData.year} onChange={handleChange} type="number" className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Ej: 2005" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Gastos Comunidad (€/mes)</label>
                                <input name="community_fees" value={formData.community_fees} onChange={handleChange} type="number" className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white" placeholder="Ej: 80" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">IBI Anual (€/año)</label>
                                <input name="ibi" value={formData.ibi} onChange={handleChange} type="number" className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white" placeholder="Ej: 450" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Limpieza/Basura (€/año)</label>
                                <input name="garbage_tax" value={formData.garbage_tax} onChange={handleChange} type="number" className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white" placeholder="Ej: 60" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Características Extra</label>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Cocina</label>
                                        <select name="kitchen_type" value={formData.kitchen_type} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white">
                                            <option value="">No definida</option>
                                            <option value="independiente">Independiente</option>
                                            <option value="americana">Americana</option>
                                            <option value="integrada">Integrada</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">M² Terraza</label>
                                        <input name="terrace_meters" value={formData.terrace_meters} onChange={handleChange} type="number" className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white" placeholder="Ej: 15" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Mobiliario</label>
                                        <select name="furnished" value={formData.furnished} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white">
                                            <option value="">No especificado</option>
                                            <option value="amueblado">Amueblado</option>
                                            <option value="sin_amueblar">Sin Amueblar</option>
                                            <option value="semi_amueblado">Semi-amueblado</option>
                                        </select>
                                    </div>
                                </div>

                                <label className="block text-sm font-bold text-slate-800 mb-2">Edificio / Ubicación</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Ascensor</label>
                                        <select name="elevator" value={formData.elevator} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white">
                                            <option value="no">No</option>
                                            <option value="si">Sí</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Planta</label>
                                        <input name="floor_level" value={formData.floor_level} onChange={handleChange} type="text" placeholder="Ej: Bajo, Ático..." className="w-full px-3 py-2 text-sm rounded border border-slate-300" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-orange-800 mb-2">Orientación</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Norte', 'Sur', 'Este', 'Oeste'].map(ori => {
                                        const checked = formData.orientation.includes(ori);
                                        return (
                                            <label key={ori} className={`cursor-pointer px-3 py-1 text-xs rounded-full border transition-colors ${checked ? 'bg-orange-600 text-white border-orange-600' : 'bg-orange-50 text-slate-600 border-orange-200 hover:border-orange-400'}`}>
                                                <input type="checkbox" className="hidden" checked={checked} onChange={(e) => handleOrientationChange(ori, e.target.checked)} />
                                                {ori}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                        <h2 className="font-bold text-lg text-slate-900 border-b pb-2">4. Equipamiento y Extras</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                ['ac', 'Aire Acondicionado'],
                                ['terrace', 'Terraza'],
                                ['balcony', 'Balcón'],
                                ['pool', 'Piscina'],
                                ['garden', 'Zonas Verdes / Jardín'],
                                ['sports_areas', 'Zonas Deportivas'],
                                ['storage', 'Trastero'],
                                ['accessible', 'Adaptado movilidad reducida'],
                            ].map(([k, label]) => (
                                <label key={k} className="flex items-center gap-2 cursor-pointer p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                    <input type="checkbox" name={k} checked={formData[k as keyof typeof formData] as boolean} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-slate-700">{label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className={`p-3 rounded-lg border transition-colors ${formData.garage ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                                <label className="flex items-center gap-2 cursor-pointer mb-2">
                                    <input type="checkbox" name="garage" checked={formData.garage} onChange={handleChange} className="rounded text-blue-600" />
                                    <span className="text-sm font-bold text-slate-800">Plaza de Garaje</span>
                                </label>
                                {formData.garage && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">¿Cuántas?</span>
                                        <input name="garage_num" value={formData.garage_num} onChange={handleChange} type="number" placeholder="1" className="w-20 px-2 py-1 text-sm rounded border border-blue-300" />
                                    </div>
                                )}
                            </div>

                            <div className={`p-3 rounded-lg border transition-colors ${formData.views ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                                <label className="flex items-center gap-2 cursor-pointer mb-2">
                                    <input type="checkbox" name="views" checked={formData.views} onChange={handleChange} className="rounded text-blue-600" />
                                    <span className="text-sm font-bold text-slate-800">Vistas</span>
                                </label>
                                {formData.views && (
                                    <select name="views_type" value={formData.views_type} onChange={handleChange} className="w-full px-2 py-1 text-sm rounded border border-blue-300 bg-white">
                                        <option value="">-- Tipo de vistas --</option>
                                        <option value="mar">Al Mar</option>
                                        <option value="montaña">A la Montaña</option>
                                        <option value="ciudad">A la Ciudad / Despejadas</option>
                                        <option value="calle">A la Calle</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 border-b border-slate-200 pb-2">
                                    <input type="checkbox" name="heating" checked={formData.heating} onChange={handleChange} className="rounded text-blue-600 w-4 h-4" />
                                    <span>Calefacción</span>
                                </label>
                                {formData.heating && (
                                    <div className="pt-2">
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Calefacción</label>
                                        <select name="heating_type" value={formData.heating_type} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white">
                                            <option value="">-- Seleccionar --</option>
                                            <option value="individual">Individual</option>
                                            <option value="central">Centralizada</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800 border-b border-emerald-200 pb-2">
                                    <input type="checkbox" name="accessible" checked={formData.accessible} onChange={handleChange} className="rounded text-emerald-600 w-4 h-4" />
                                    <span>Adaptado movilidad reducida</span>
                                </label>
                                {formData.accessible && (
                                    <div className="pt-2 flex flex-col gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="acceso_exterior_adaptado" checked={formData.acceso_exterior_adaptado} onChange={handleChange} className="rounded text-emerald-600" />
                                            <span className="text-sm text-emerald-900">Acceso exterior adaptado</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="uso_silla_ruedas" checked={formData.uso_silla_ruedas} onChange={handleChange} className="rounded text-emerald-600" />
                                            <span className="text-sm text-emerald-900">Interior adaptado silla ruedas</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 bg-orange-50/50 p-4 rounded-lg border border-orange-100">
                            <label className="block text-sm font-bold text-slate-800 mb-3">Certificado Energético</label>
                            <div className="flex items-center gap-4 mb-3">
                                <select name="certificado_energetico" value={formData.certificado_energetico} onChange={handleChange} className="px-3 py-2 text-sm rounded border border-slate-300 bg-white font-medium">
                                    <option value="en_tramite">En Trámite</option>
                                    <option value="exento">Exento</option>
                                    <option value="disponible">Disponible (Calificado)</option>
                                </select>
                            </div>

                            {formData.certificado_energetico === 'disponible' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Calif. Consumo</label>
                                        <select name="energy_consumption" value={formData.energy_consumption} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white">
                                            <option value="">Letra</option>
                                            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Consumo (kWh)</label>
                                        <input name="energy_consumption_kwh" value={formData.energy_consumption_kwh} onChange={handleChange} type="number" placeholder="145" className="w-full px-3 py-2 text-sm rounded border border-slate-300" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Calif. Emisiones</label>
                                        <select name="energy_emissions" value={formData.energy_emissions} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white">
                                            <option value="">Letra</option>
                                            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Emis. (kg CO₂)</label>
                                        <input name="energy_emissions_kg" value={formData.energy_emissions_kg} onChange={handleChange} type="number" placeholder="30" className="w-full px-3 py-2 text-sm rounded border border-slate-300" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                        <div className="border-b pb-2 mb-2 flex items-center justify-between">
                            <h2 className="font-bold text-lg text-slate-900">5. Textos del Anuncio</h2>
                            <button onClick={generateDescription} type="button" className="text-sm bg-blue-600 text-white font-bold hover:bg-blue-700 px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-200">
                                <Sparkles size={16} /> Redactar con IA
                            </button>
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                            <label className="block text-sm font-bold text-blue-900 mb-1">Puntos clave a destacar (Opcional)</label>
                            <p className="text-[11px] text-blue-600 mb-3 italic">Escribe detalles que la IA deba incluir, como "vistas frontales al mar", "recién pintado", "junto al tren", etc.</p>
                            <input
                                name="key_highlights"
                                value={formData.key_highlights}
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 py-2.5 rounded-lg border border-blue-200 bg-white shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 outline-none"
                                placeholder="Ej: Vistas panorámicas, gran potencial de inversión, zona muy tranquila..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">🇪🇸 Versión en Español</h3>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Título del Anuncio (ES)</label>
                                    <input name="title" value={formData.title || ''} onChange={handleChange} type="text" className="w-full px-3 py-2 rounded border border-slate-300 font-medium text-sm uppercase" placeholder="Ej: ESPECTACULAR ÁTICO..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Descripción detallada (ES)</label>
                                    <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={12} className="w-full px-3 py-2 rounded border border-slate-300 text-sm leading-relaxed" placeholder="Describe el inmueble..."></textarea>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">🇬🇧 English Version</h3>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Listing Title (EN)</label>
                                    <input name="title_en" value={formData.title_en || ''} onChange={handleChange} type="text" className="w-full px-3 py-2 rounded border border-slate-300 font-medium text-sm uppercase" placeholder="Ex: SPECTACULAR APARTMENT..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Detailed Description (EN)</label>
                                    <textarea name="description_en" value={formData.description_en || ''} onChange={handleChange} rows={12} className="w-full px-3 py-2 rounded border border-slate-300 text-sm leading-relaxed" placeholder="Property description..."></textarea>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-slate-900 border-b pb-2 flex-grow">6. Multimedia Extras</h2>
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${isUploading ? 'bg-slate-50 border-slate-200' : 'bg-blue-50/50 border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.add('border-blue-500', 'bg-blue-100');
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');

                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                    // Mock a normal event structure for handleFileUpload
                                    const mockEvent = {
                                        target: { files: e.dataTransfer.files, value: '' }
                                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                                    handleFileUpload(mockEvent);
                                }
                            }}
                        >
                            <UploadCloud className="mx-auto h-12 w-12 text-blue-400 mb-3" />
                            <h3 className="font-bold text-slate-800 mb-1">Subir Fotos Originales</h3>
                            <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">Selecciona o arrastra aquí las fotos masivas originales. El sistema las comprimirá, optimizará y asignará automáticamente a esta propiedad.</p>

                            <label className={`cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                {isUploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                                {isUploading ? "Subiendo y Optimizando..." : "Seleccionar Fotos"}
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                            </label>

                            <div className="mt-4 pt-4 border-t border-blue-200/50">
                                <button type="button" onClick={handleScanImages} className="text-sm shadow-sm font-medium border border-blue-300 bg-white hover:bg-slate-50 text-blue-700 px-4 py-1.5 rounded-full transition-colors">
                                    Avanzado: Escanear Carpeta
                                </button>
                                <p className="text-xs text-slate-400 mt-2">Solo pulsar esto si subiste las fotos manualmente vía FTP/Disco Duro.</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Galería de Imágenes (Arrastra para reordenar)</label>
                            <ImageGallery
                                images={formData.images}
                                onChange={(newImages: string[]) => setFormData(prev => ({ ...prev, images: newImages, imageUrl: newImages[0] || '' }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">URL Video (YouTube / Vimeo)</label>
                                <input name="video" value={formData.video} onChange={handleChange} type="url" className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">URL Tour 3D / Matterport</label>
                                <input name="matterport" value={formData.matterport} onChange={handleChange} type="url" className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="https://..." />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl shadow-sm border border-red-200 space-y-4 bg-red-50/20">
                        <h2 className="font-bold text-lg text-red-900 border-b border-red-100 pb-2 flex items-center gap-2">
                            <FolderSearch size={20} className="text-red-600" /> 7. Notas Internas (Confidencial)
                        </h2>
                        <div>
                            <textarea
                                name="internal_notes"
                                value={formData.internal_notes}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-red-200 bg-white text-sm"
                                placeholder="Escribe aquí anotaciones que NO se publicarán: llaves, alarmas, tratos con el dueño, plazas específicas..."
                            ></textarea>
                        </div>
                    </section>

                    {/* NEW DOCUMENT MANAGER SECTION */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6 mb-12">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                            <div>
                                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <FolderSearch className="text-blue-600" size={24} />
                                    8. Documentación Privada
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Archivador en la nube (Nota Simple, IBI, Contrato de Captación...).</p>
                            </div>
                            <label className={`cursor-pointer inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-sm rounded-lg font-bold transition-colors shadow-sm ${uploadingDoc ? 'opacity-50 pointer-events-none' : ''}`}>
                                {uploadingDoc ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                Subir Nuevo Archivo
                                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleDocUpload} disabled={uploadingDoc} />
                            </label>
                        </div>

                        {propertyDocuments.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                                <File className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                                <p className="text-sm font-medium text-slate-500">No hay documentos subidos en esta propiedad.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {propertyDocuments.map((doc, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between group hover:border-blue-300 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-white p-2 rounded border border-slate-200 text-slate-400">
                                                <FileText size={20} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-slate-700 truncate" title={doc.name}>{doc.name}</p>
                                                <p className="text-xs text-slate-500">{(doc.metadata?.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={() => downloadDoc(doc.name)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 bg-white shadow-sm"
                                                title="Ver / Descargar"
                                            >
                                                <Download size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDocDelete(doc.name)}
                                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100 bg-white shadow-sm"
                                                title="Eliminar"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 pt-8 pb-20">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || successMsg !== null}
                            className="w-full md:w-auto px-12 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-all flex justify-center items-center gap-3 disabled:opacity-50 shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {loading ? 'Guardando...' : successMsg ? '¡Cambios guardados! ✅' : 'Actualizar Propiedad'}
                        </button>
                        
                        
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="w-full md:w-auto px-6 py-2.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                Eliminar Ficha Completa
                            </button>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
