export interface Owner {
    id: string;
    nombre_completo: string;
    documento_identidad: string | null;
    direccion: string | null;
    codigo_postal: string | null;
    poblacion: string | null;
    provincia: string | null;
    pais: string | null;
    telefonos: string[] | null;
    email: string | null;
    observaciones: string | null;
    tipo: string | null;
    codigo: string | null;
    created_at: string;
}

export interface Lead {
    id: string;
    nombre_completo: string;
    telefono: string | null;
    email: string | null;
    telefonos: string[] | null;
    emails: string[] | null;
    tipo_operacion: string | null;
    presupuesto_maximo: number | null;
    dormitorios_minimo: number | null;
    preferencias_zonas: string[] | null;
    observaciones: string | null;
    estado: string | null;
    codigo: string | null;
    created_at: string;
}

// Extender la interfaz existente de Property (asegurándonos de que incluye todo lo que usamos)
export interface Property {
    id: string;
    title: string;
    description: string;
    price: number | null;
    city: string;
    operation_type: string;
    property_type: string;
    status: string;
    features: {
        bedrooms?: number;
        bathrooms?: number;
        size_m2?: number;
        image?: string;
        [key: string]: any;
    } | null;
    created_at: string;
    // Nuevos campos para la relación con el Propietario
    propietario_id: string | null;
    referencia: string | null;
    certificado_energetico: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    size_m2?: number | null;
    image?: string | null;
    images?: string[] | null;
    is_featured?: boolean | null;
    // ...otros campos existentes si los hay
}
