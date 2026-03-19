const fs = require('fs');
const path = require('path');

const editarPath = path.join(__dirname, 'src', 'app', 'admin', 'propiedades', 'editar', '[id]', 'page.tsx');
let editContent = fs.readFileSync(editarPath, 'utf8');

// 1. Fix the infinite fetching by writing the full useEffect needed
const oldFetch = `    // Fetch owners and agents on mount
    useEffect(() => {
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

const newFetch = `    // Fetch owners, agents and the property data
    useEffect(() => {
        const fetchData = async () => {
            try {
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

                // Make sure params has the id. In Next.js 15 this is available directly from useParams().
                const propertyId = params.id;
                
                if (propertyId) {
                    const { data, error } = await supabase.from('properties').select('*').eq('id', propertyId).single();
                    if (error) {
                        console.error(error);
                        alert("Error al cargar la propiedad");
                    } else if (data) {
                        // Determine owner search name for autocomplete
                        let mappedOwnerSearch = '';
                        if (data.propietario_id && ownersLookup.length > 0) {
                            const owner = ownersLookup.find(o => o.id === data.propietario_id);
                            if (owner) mappedOwnerSearch = \`\${owner.nombre_completo} \${owner.documento_identidad ? \`(\${owner.documento_identidad})\` : ''}\`;
                        }

                        // Determine boolean variables from features or new columns
                        const currentFeatures = data.features || {};
                        const amenities = currentFeatures.amenities || [];
                        const hasFeature = (name) => amenities.includes(name) || (Array.isArray(currentFeatures) && currentFeatures.includes(name));

                        setFormData({
                            title: data.title || '',
                            description: data.description || '',
                            price: data.price?.toString() || '',
                            operation: data.operation_type || 'venta',
                            type: data.property_type || 'apartamento',
                            subtypes: currentFeatures.subtypes || (currentFeatures.subtype ? currentFeatures.subtype.split(',').map(s=>s.trim()) : []),
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
                            propietario_id: data.propietario_id || '',
                            agente_id: data.agente_id || '',
                            is_published: data.is_published !== false,
                            certificado_energetico: data.certificado_energetico || 'en_tramite',
                            internal_notes: data.internal_notes || data.notes || '',
                            garage_num: data.garage_num?.toString() || '',
                            views_type: data.views_type || '',
                            reference_id: data.reference_id || data.referencia || currentFeatures.reference_id || '',
                            
                            ac: hasFeature('Aire Acondicionado'),
                            heating: !!data.heating_type || hasFeature('Calefacción'),
                            terrace: hasFeature('Terraza'),
                            balcony: hasFeature('Balcón'),
                            pool: hasFeature('Piscina') || hasFeature('Piscina comunitaria'),
                            garden: hasFeature('Jardín') || hasFeature('Zonas verdes'),
                            garage: !!data.garage_num || hasFeature('Garaje') || hasFeature('Plaza de Garaje'),
                            storage: hasFeature('Trastero'),
                            accessible: data.acceso_exterior_adaptado || hasFeature('Acceso Minusválidos'),
                            views: !!data.views_type || hasFeature('Vistas al mar') || hasFeature('Vistas'),
                            floor_level: data.floor_level || currentFeatures.floor_level || '',

                            key_highlights: ''
                        });

                        if (mappedOwnerSearch) {
                            setOwnerSearch(mappedOwnerSearch);
                        }

                        // Set latitude longitude inputs explicitly
                        const lat = currentFeatures.latitude || data.latitude;
                        const lon = currentFeatures.longitude || data.longitude;
                        if (lat && lon) setExactCoordsInput(\`\${lat}, \${lon}\`);
                        
                        const pubLat = currentFeatures.public_latitude || data.public_latitude;
                        const pubLon = currentFeatures.public_longitude || data.public_longitude;     
                        if (pubLat && pubLon) setPublicCoordsInput(\`\${pubLat}, \${pubLon}\`);
                    }
                }
            } catch(e) {
                console.error(e);
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [params.id]);`;

editContent = editContent.replace(oldFetch, newFetch);


// 2. Improve AI Generator Text (Shorter) in both files
const oldGenerator = `        // Title generation
        let title = \`\${formData.operation === 'venta' ? 'Venta de' : 'Alquiler de'} \${typeLabel} en \${formData.city}\`;
        if (formData.urbanization) title += \` (\${formData.urbanization})\`;
        if (formData.bedrooms) title += \` - \${formData.bedrooms} hab.\`;
        if (formData.views && formData.views_type) title += \` con vistas al \${formData.views_type}\`;

        setFormData(prev => ({ ...prev, description: text, title: title.toUpperCase() }));`;

const newGenerator = `        // Title generation (Shorter + Attractive)
        const typeBase = typeLabel.split(' ')[0] || formData.type; // "Villa", "Adosado", "Piso"...
        
        let titleParts = [];
        
        // Pick an adjective
        if (formData.type === 'atico' || formData.type === 'apartamento') {
             titleParts.push("Luminoso");
        } else if (formData.type === 'casa' || formData.type === 'obra_nueva') {
             titleParts.push("Espectacular");
        } else {
             titleParts.push("Fantástico");
        }
        
        titleParts.push(typeBase.toLowerCase());
        
        if (formData.operation === 'alquiler') titleParts.push("en alquiler");
        
        if (formData.condition === 'reformado') titleParts.push("totalmente reformado");
        else if (formData.condition === 'a_estrenar') titleParts.push("a estrenar");
        
        if (formData.views && formData.views_type) {
            titleParts.push(\`con vistas al \${formData.views_type}\`);
        } else if (formData.views) {
            titleParts.push(\`con vistas despejadas\`);
        }
        
        const currentTitleJoined = titleParts.join(" ");
        if (formData.pool && !currentTitleJoined.includes('piscina')) {
             titleParts.push(currentTitleJoined.includes('vistas') ? 'y piscina' : 'con piscina');
        }

        // Add location
        if (formData.urbanization) {
            titleParts.push(\`en \${formData.urbanization}\`);
        } else if (formData.city && !currentTitleJoined.includes(formData.city)) {
            titleParts.push(\`en \${formData.city}\`);
        }

        let title = titleParts.join(" ");
        title = title.charAt(0).toUpperCase() + title.slice(1);
        
        if (title.length > 80) { // Safety cut
             title = title.substring(0, 80) + "...";
        }

        setFormData(prev => ({ ...prev, description: text, title: title }));`;

editContent = editContent.replace(oldGenerator, newGenerator);
fs.writeFileSync(editarPath, editContent);

const nuevaPath = path.join(__dirname, 'src', 'app', 'admin', 'propiedades', 'nueva', 'page.tsx');
let nuevaContent = fs.readFileSync(nuevaPath, 'utf8');
nuevaContent = nuevaContent.replace(oldGenerator, newGenerator);
fs.writeFileSync(nuevaPath, nuevaContent);


// 3. Fix the table width and text truncation in page.tsx
const pagePath = path.join(__dirname, 'src', 'app', 'admin', 'propiedades', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Reduce "Propiedad / Ref." header size
pageContent = pageContent.replace('<th className="px-6 py-4 font-semibold text-slate-700 min-w-[300px]">Propiedad / Ref.</th>', '<th className="px-6 py-4 font-semibold text-slate-700 w-[20%] max-w-[200px]">Propiedad / Ref.</th>');

// Fix truncation in Title (It needs a max-width to actually truncate in a table cell)
pageContent = pageContent.replace('<p className="font-bold text-slate-900 truncate" title={property.title}>{property.title}</p>', '<p className="font-bold text-slate-900 truncate max-w-[140px] md:max-w-[200px]" title={property.title}>{property.title}</p>');

fs.writeFileSync(pagePath, pageContent);

console.log("All fixes applied successfully.");
