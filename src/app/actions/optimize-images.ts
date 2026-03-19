'use server';

import sharp from 'sharp';
import { supabase } from '@/lib/supabase';

// Helper to get public URL for an image in Supabase
const getPublicUrl = (referenceId: string, fileName: string) => {
    const { data } = supabase.storage.from('property_images').getPublicUrl(`${referenceId}/${fileName}`);
    return data.publicUrl;
};

export async function optimizeAndScanImages(referenceId: string) {
    if (!referenceId) return { success: false, images: [] };

    try {
        // List from Supabase Storage instead of local FS
        const { data: files, error } = await supabase.storage.from('property_images').list(referenceId);

        if (error) {
            console.error("Error listing images from Supabase:", error);
            return { success: false, images: [], error: error.message };
        }

        if (!files || files.length === 0) {
            return { success: false, images: [], error: 'No se han encontrado imágenes en la nube.' };
        }

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const images = files
            .filter(file => imageExtensions.includes(file.name.substring(file.name.lastIndexOf('.')).toLowerCase()))
            .map(file => getPublicUrl(referenceId, file.name));

        return { success: true, images, optimizedCount: 0 };
    } catch (error) {
        console.error("Error scanning images:", error);
        return { success: false, images: [], error: 'Error al escanear imágenes en la nube' };
    }
}

export async function uploadAndOptimize(referenceId: string, fileName: string, buffer: Buffer) {
    if (!referenceId) throw new Error("Reference ID is required");

    const watermarkSvg = Buffer.from(`
        <svg width="800" height="400">
            <text x="50%" y="50%" text-anchor="middle" 
                font-family="Arial, sans-serif" font-size="100" font-weight="900" 
                fill="white" fill-opacity="0.15" stroke="black" stroke-opacity="0.05" stroke-width="1">
                ALROS.EU
            </text>
        </svg>
    `);

    try {
        // Process with sharp in-memory
        const processedBuffer = await sharp(buffer)
            .resize({ width: 1920, withoutEnlargement: true })
            .composite([{
                input: watermarkSvg,
                gravity: 'center'
            }])
            .webp({ quality: 80 })
            .toBuffer();

        const cleanName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "").replace(/\.[^/.]+$/, "") + ".webp";
        const storagePath = `${referenceId}/${cleanName}`;

        // Upload to Supabase Storage
        const { error } = await supabase.storage.from('property_images').upload(storagePath, processedBuffer, {
            contentType: 'image/webp',
            upsert: true
        });

        if (error) throw error;

        return getPublicUrl(referenceId, cleanName);
    } catch (error) {
        console.error("Error optimizing/uploading to Supabase:", error);
        throw error;
    }
}
