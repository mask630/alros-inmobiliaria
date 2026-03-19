const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function testWatermark() {
    const inputPath = 'C:/Users/telem/.gemini/antigravity/scratch/alros-inmobiliaria/public/propiedades/P1005/IMG_6915.JPG.webp';
    const outputPath = 'C:/Users/telem/.gemini/antigravity/scratch/alros-inmobiliaria/public/watermark_test.webp';

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
        await sharp(inputPath)
            .resize({ width: 1920, withoutEnlargement: true })
            .composite([{
                input: watermarkSvg,
                gravity: 'center'
            }])
            .webp({ quality: 80 })
            .toFile(outputPath);
        console.log('Watermark test image created at:', outputPath);
    } catch (err) {
        console.error('Error during watermark test:', err);
    }
}

testWatermark();
