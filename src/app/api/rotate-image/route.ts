import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function POST(req: Request) {
    try {
        const { url, direction } = await req.json();

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // We only want to rotate local images
        if (!url.startsWith('/propiedades/') && !url.startsWith('/')) {
            return NextResponse.json({ error: 'Can only rotate local images.' }, { status: 400 });
        }

        // Parse local path
        const relativePath = url.split('?')[0]; // Remove query params like ?t=...
        const absolutePath = path.join(process.cwd(), 'public', relativePath);

        if (!fs.existsSync(absolutePath)) {
            return NextResponse.json({ error: 'Image file not found on server' }, { status: 404 });
        }

        const angle = direction === 'left' ? -90 : 90;

        // Read file into memory first to avoid Windows locking the file
        const fileBuffer = fs.readFileSync(absolutePath);

        // Perform rotation in memory
        const rotatedBuffer = await sharp(fileBuffer)
            .rotate(angle)
            .toBuffer();

        // Overwrite original file
        fs.writeFileSync(absolutePath, rotatedBuffer);

        // Append timestamp to bust cache in browser
        const newUrl = `${relativePath}?t=${Date.now()}`;

        return NextResponse.json({ success: true, url: newUrl });

    } catch (error: any) {
        console.error('Error rotating image:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
