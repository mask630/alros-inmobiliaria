import { NextRequest, NextResponse } from "next/server";
import { uploadAndOptimize, optimizeAndScanImages } from "@/app/actions/optimize-images";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const referenceId = formData.get("reference_id") as string;
        const files = formData.getAll("files") as File[];

        if (!referenceId) {
            return NextResponse.json({ success: false, error: "Referencia requerida" }, { status: 400 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, error: "No se subieron archivos" }, { status: 400 });
        }

        let uploadCount = 0;
        for (const file of files) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                await uploadAndOptimize(referenceId, file.name, buffer);
                uploadCount++;
            } catch (err) {
                console.error(`Error uploading ${file.name}:`, err);
            }
        }

        // Return updated list from Supabase
        const result = await optimizeAndScanImages(referenceId);
        return NextResponse.json({ 
            ...result, 
            optimizedCount: uploadCount 
        });

    } catch (error) {
        console.error("Error uploading images to Supabase:", error);
        return NextResponse.json({ success: false, error: "Error en el servidor al subir fotos a la nube" }, { status: 500 });
    }
}
