import { supabase } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
import { createClient } from '@/utils/supabase/server';
import PrintController from "./PrintController";
import { WindowCardModel1 } from "@/components/documents/window-cards/WindowCardModel1";
import { WindowCardModel2 } from "@/components/documents/window-cards/WindowCardModel2";
import { WindowCardModel3 } from "@/components/documents/window-cards/WindowCardModel3";
import { WindowCardModel4 } from "@/components/documents/window-cards/WindowCardModel4";
import { WindowCardModel5 } from "@/components/documents/window-cards/WindowCardModel5";

export const dynamic = 'force-dynamic';

async function getProperty(id: string) {
    const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
    if (error || !property) return null;
    return property;
}

export default async function PropertyPrintPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ format?: string, model?: string }> }) {
    const { id } = await props.params;
    const searchParams = await props.searchParams;
    const format = searchParams.format === 'a3' ? 'a3' : 'a4';
    const model = searchParams.model || '1';

    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    
    if (!user) {
        redirect('/login');
    }

    const property = await getProperty(id);
    if (!property) notFound();

    // Helper to get direct image
    const getDirectImageUrl = (url: string) => {
        if (!url) return '';
        try {
            if (url.includes('/file/d/')) {
                const idMatch = url.match(/\/file\/d\/(.*?)\//);
                if (idMatch && idMatch[1]) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
            }
            if (url.includes('drive.google.com') && url.includes('/view')) {
                const idMatch = url.match(/\/d\/(.*?)\//);
                if (idMatch && idMatch[1]) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
            }
        } catch (e) {
            return url;
        }
        return url;
    };

    const rawImages = property.images && property.images.length > 0 ? property.images : property.features?.images || [
        property.image || property.features?.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ];
    const images = rawImages.map(getDirectImageUrl);

    const isA3 = format === 'a3';

    // Global print styles - minimal padding since marquesinas have their own frame
    const pageStyle = `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;500;700;900&display=swap');
        
        @page { size: ${isA3 ? '420mm 297mm landscape' : 'A4 portrait'}; margin: 0; }
        html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            background-color: #525252 !important; 
            min-height: 100vh;
            font-family: 'Outfit', sans-serif !important;
        }
        .print-container {
            width: ${isA3 ? '420mm' : '210mm'};
            height: ${isA3 ? '297mm' : '297mm'};
            box-sizing: border-box;
            background-color: white; 
            margin: 2rem auto;
            position: relative;
            padding: ${isA3 ? '6mm' : '10mm'}; 
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            font-family: 'Outfit', sans-serif !important;
            overflow: hidden;
        }
        @media print {
            html, body { background-color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .print-container { margin: 0 !important; box-shadow: none !important; }
        }
    `;

    return (
        <div className="print-container text-slate-900">
            <style dangerouslySetInnerHTML={{ __html: pageStyle }} />
            <PrintController />

            {model === '1' && <WindowCardModel1 property={property} images={images} />}
            {model === '2' && <WindowCardModel2 property={property} images={images} />}
            {model === '3' && <WindowCardModel3 property={property} images={images} />}
            {model === '4' && <WindowCardModel4 property={property} images={images} />}
            {model === '5' && <WindowCardModel5 property={property} images={images} />}
        </div>
    );
}
