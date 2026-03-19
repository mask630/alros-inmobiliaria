const fs = require('fs');
const path = require('path');

const nuevaPath = path.join(__dirname, 'src', 'app', 'admin', 'propiedades', 'nueva', 'page.tsx');
const editarPath = path.join(__dirname, 'src', 'app', 'admin', 'propiedades', 'editar', '[id]', 'page.tsx');

let content = fs.readFileSync(nuevaPath, 'utf8');

// Modificaciones
content = content.replace("export default function NewPropertyPage() {", "export default function EditPropertyPage() {\n    const params = useParams();\n    const [fetching, setFetching] = useState(true);");

content = content.replace('import { createProperty } from "@/app/actions/create-property";', 'import { updateProperty } from "@/app/actions/update-property";');
content = content.replace('import { useRouter } from "next/navigation";', 'import { useRouter, useParams } from "next/navigation";');

// Reemplazar useEffect fetch
const originalUseEffect = `    useEffect(() => {
        const fetchData = async () => {
            const { data: ownersData } = await supabase.from('propietarios').select('id, nombre_completo, documento_identidad').order('nombre_completo', { ascending: true });
            if (ownersData) {
                // Filter out empty/invalid test records
                const validOwners = ownersData.filter(o => o.nombre_completo && o.nombre_completo.trim() !== '' && o.nombre_completo !== 'EMPTY');
                setOwners(validOwners);
            }

            const { data: agentsData } = await supabase.from('agentes').select('id, nombre').order('nombre', { ascending: true });
            if (agentsData) {
                setAgents(agentsData);
            }
        };
        fetchData();
    }, []);`;

const newUseEffect = `    useEffect(() => {
        const fetchData = async () => {
            let ownersLookup = [];
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

            const { data, error } = await supabase.from('properties').select('*').eq('id', params.id).single();
            if (error) {
                console.error(error);
                alert("Error al cargar la propiedad");
            } else if (data) {
                // Determine owner search name
                let mappedOwnerSearch = '';
                if (data.propietario_id && ownersLookup.length > 0) {
                    const owner = ownersLookup.find(o => o.id === data.propietario_id);
                    if (owner) mappedOwnerSearch = \`\${owner.nombre_completo} \${owner.documento_identidad ? \`(\${owner.documento_identidad})\` : ''}\`;
                }

                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    price: data.price?.toString() || '',
                    operation: data.operation_type || 'venta',
                    type: data.property_type || 'apartamento',
                    subtypes: data.features?.subtypes || (data.features?.subtype ? data.features.subtype.split(',').map(s=>s.trim()) : []),
                    city: data.city || 'Benalmádena',
                    address_street: data.address_street || '',
                    address_number: data.address_number || '',
                    address_floor: data.address_floor || '',
                    address_block: data.address_block || '',
                    address_door: data.address_door || '',
                    urbanization: data.urbanization || '',
                    zip: data.zip || data.postal_code || '',
                    status: data.status || 'disponible',
                    bedrooms: data.bedrooms?.toString() || '',
                    bathrooms: data.bathrooms?.toString() || '',
                    size_m2: data.size_m2?.toString() || '',
                    useful_m2: data.useful_m2?.toString() || '',
                    year: data.year_built?.toString() || '',
                    elevator: data.elevator === true ? 'si' : 'no',
                    orientation: Array.isArray(data.orientation) ? data.orientation : (typeof data.orientation === 'string' ? data.orientation.split(',') : []),
                    energy_consumption: data.energy_consumption || '',
                    energy_consumption_kwh: data.energy_consumption_kwh?.toString() || '',
                    energy_emissions: data.energy_emissions || '',
                    energy_emissions_kg: data.energy_emissions_kg?.toString() || '',
                    heating_type: data.heating_type || '',
                    acceso_exterior_adaptado: data.acceso_exterior_adaptado || false,
                    uso_silla_ruedas: data.uso_silla_ruedas || false,
                    images: data.images && data.images.length > 0 ? data.images : (data.image ? [data.image] : []),
                    imageUrl: data.image || '',
                    video: data.video || '',
                    matterport: data.matterport || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                    public_latitude: data.public_latitude?.toString() || '',
                    public_longitude: data.public_longitude?.toString() || '',
                    propietario_id: data.propietario_id || '',
                    agente_id: data.agente_id || '',
                    is_published: data.is_published !== false,
                    certificado_energetico: data.certificado_energetico || 'en_tramite',
                    internal_notes: data.internal_notes || data.notes || '',
                    garage_num: data.garage_num?.toString() || '',
                    views_type: data.views_type || '',
                    reference_id: data.referencia || data.reference_id || '',
                    
                    // Derivar booleanos de features
                    ac: (data.features || []).includes("Aire Acondicionado") || false,
                    heating: (data.features || []).some(f => typeof f === 'string' && f.includes('Calefacción')) || !!data.heating_type,
                    terrace: (data.features || []).includes("Terraza") || false,
                    balcony: (data.features || []).includes("Balcón") || false,
                    pool: (data.features || []).includes("Piscina") || false,
                    garden: (data.features || []).includes("Jardín") || false,
                    garage: (data.features || []).some(f => typeof f === 'string' && f.includes('Plaza de Garaje')) || !!data.garage_num,
                    storage: (data.features || []).includes("Trastero") || false,
                    accessible: (data.features || []).includes("Acceso Minusválidos") || false,
                    views: (data.features || []).some(f => typeof f === 'string' && f.includes('Vistas')) || !!data.views_type,

                    key_highlights: ''
                });

                if (mappedOwnerSearch) {
                    setOwnerSearch(mappedOwnerSearch);
                }

                if (data.latitude && data.longitude) {
                    setExactCoordsInput(\`\${data.latitude}, \${data.longitude}\`);
                }
                if (data.public_latitude && data.public_longitude) {
                    setPublicCoordsInput(\`\${data.public_latitude}, \${data.public_longitude}\`);
                }
            }
            setFetching(false);
        };
        fetchData();
    }, [params.id]);`;

content = content.replace(originalUseEffect, newUseEffect);

// Add early return for fetching
const returnStatement = "    return (";
const returnWithLoader = `    if (fetching) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (`
content = content.replace(returnStatement, returnWithLoader);

// Update title logic
content = content.replace('<h1 className="text-3xl font-bold text-slate-900">Nueva Propiedad</h1>', '<h1 className="text-3xl font-bold text-slate-900">Editar Propiedad</h1>');
content = content.replace('<p className="text-slate-500">Completa la ficha técnica para publicar el inmueble.</p>', '<p className="text-slate-500">Modificando la ficha del inmueble existente.</p>');
content = content.replace('{loading ? \'Guardando...\' : successMsg ? \'Guardado ✅\' : \'Guardar\'}', '{loading ? \'Actualizando...\' : successMsg ? \'Actualizado ✅\' : \'Guardar Cambios\'}');

// Modify handleSubmit to point to updateProperty and pass params.id
const submitStart = "const result = await createProperty(payload);";
const submitEnd = "const result = await updateProperty(params.id as string, payload);";
content = content.replace(submitStart, submitEnd);

content = content.replace('setSuccessMsg("¡Propiedad guardada correctamente! Redirigiendo al listado...");', 'setSuccessMsg("¡Propiedad actualizada correctamente! Redirigiendo al listado...");');
content = content.replace('let msg = result.error?.message || "Error al crear la propiedad";', 'let msg = result.error?.message || "Error al actualizar la propiedad";');

// Address disabled nature of reference_id
// It was disabled in 'nueva', let's keep it disabled in edit (it shouldn't change).
// But we want to ensure it uses the fetched one. It's already bound to formData.reference_id.

fs.writeFileSync(editarPath, content);
console.log("Edit page successfully generated.");
