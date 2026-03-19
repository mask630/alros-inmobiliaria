'use server';

import fs from 'fs';
import path from 'path';

export async function scanPropertyImages(referenceId: string) {
    if (!referenceId) return { success: false, images: [] };

    const publicDir = path.join(process.cwd(), 'public');
    const propertyDir = path.join(publicDir, 'propiedades', referenceId);

    try {
        // Check if directory exists
        const fullPath = path.join(process.cwd(), 'public', 'propiedades', referenceId);
        if (!fs.existsSync(fullPath)) {
            console.log(`Directory not found: ${fullPath}`);
            return { success: false, images: [], error: 'Directory not found' };
        }

        const files = fs.readdirSync(fullPath);

        // Filter images
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const images = files
            .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
            .map(file => `/propiedades/${referenceId}/${file}`);

        return { success: true, images };
    } catch (error) {
        console.error("Error scanning images:", error);
        return { success: false, images: [], error: 'Error scanning images' };
    }
}
