'use client';

import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Printer, ArrowLeft, Mail, FileSignature, X, Save, Share2 } from 'lucide-react';
import Link from 'next/link';
import SignatureCanvas from 'react-signature-canvas';
import { useRef, useState, useEffect } from 'react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function ContratoPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [property, setProperty] = useState<any>(null);
    const [owner, setOwner] = useState<any>(null);

    // Contract options
    const [exclusivity, setExclusivity] = useState<boolean>(true);
    const [months, setMonths] = useState<number>(6);
    const [comission, setComission] = useState<number>(5); // default 5% o 1 mes

    // Signature options
    const [showSigModal, setShowSigModal] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);
    const sigPad = useRef<SignatureCanvas>(null);
    const [savingSig, setSavingSig] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Legal Checkboxes
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [acceptedMarketing, setAcceptedMarketing] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Fetch property
                const id = params.id as string;
                if (!id) return;

                const { data: propData, error: propError } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (propError) throw propError;
                setProperty(propData);

                if (propData.owner_signature) {
                    setSignature(propData.owner_signature);
                }

                // Set initial default behaviors based on operation
                if (propData.operation_type === 'alquiler') {
                    setMonths(3);
                    setComission(1); // 1 month is typical for rent
                } else {
                    setMonths(6);
                    setComission(propData.commission_percentage || 5);
                }

                // Fetch owner
                if (propData.propietario_id) {
                    const { data: ownerData, error: ownerError } = await supabase
                        .from('propietarios')
                        .select('*')
                        .eq('id', propData.propietario_id)
                        .single();

                    if (!ownerError) setOwner(ownerData);
                }
            } catch (err) {
                console.error("Error loading data for contract", err);
                alert("Error al cargar los datos. Asegúrate de que la propiedad existe.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [params.id]);

    const handlePrint = () => {
        if (!acceptedPrivacy || !acceptedMarketing) {
            alert("Por favor, el propietario debe marcar las dos casillas de Protección de Datos y Consentimiento antes de generar el documento.");
            return;
        }
        window.print();
    };

    const clearSignature = () => {
        sigPad.current?.clear();
    };

    const saveSignature = async () => {
        if (sigPad.current?.isEmpty()) {
            alert("Por favor, debe proporcionar una firma primero.");
            return;
        }

        setSavingSig(true);
        const dataUrl = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');

        if (dataUrl) {
            setSignature(dataUrl);
            setShowSigModal(false);

            // Guardar en Supabase. Requiere agregar la columna 'owner_signature' texto a 'properties'
            try {
                const { error } = await supabase
                    .from('properties')
                    .update({
                        owner_signature: dataUrl,
                        contract_signature_date: new Date().toISOString(),
                        contract_duration_months: months
                    })
                    .eq('id', params.id);

                if (error) {
                    console.error("Error saving signature in db. You might need to add the owner_signature column: ", error);
                    // Silently fail if column doesn't exist yet so it at least works on screen.
                }
            } catch (err) {
                console.error(err);
            }
        }
        setSavingSig(false);
    };

    const handleShare = async () => {
        if (!acceptedPrivacy || !acceptedMarketing) {
            alert("Por favor, el propietario debe marcar las dos casillas de Protección de Datos y Consentimiento antes de enviar el documento.");
            return;
        }

        setGeneratingPdf(true);
        try {
            const contractElement = document.getElementById('contract-content');
            if (!contractElement) {
                alert("Error al encontrar el cuerpo del documento.");
                return;
            }

            // Ocultar elementos si es necesario o renderizar con html-to-image
            // Pasamos a JPEG con pixel ratio normal y altura forzada para evitar cortes y 14MB de peso gigante
            const imgData = await toJpeg(contractElement, {
                quality: 0.9,
                backgroundColor: '#ffffff',
                pixelRatio: 1.5,
                width: contractElement.scrollWidth,
                height: contractElement.scrollHeight,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [contractElement.scrollWidth, contractElement.scrollHeight]
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Añadir imagen al PDF
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            const pdfBlob = pdf.output('blob');
            const fileName = `Contrato_Firmado_${property.reference_id || property.id.substring(0, 6)}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            // NUEVO: Guardar automáticamente en el Archivador de la propiedad (Supabase Storage)
            try {
                const folderName = `${property.reference_id || 'SIN_REF'}_${property.id}`;
                const { error: uploadError } = await supabase.storage
                    .from('property_documents')
                    .upload(`${folderName}/${fileName}`, file, { upsert: true });

                if (uploadError) console.error("Error al archivar contrato:", uploadError);
                else console.log("Contrato archivado correctamente en la nube.");
            } catch (e) {
                console.error("Error silencioso al subir al storage:", e);
            }

            // Comprobar si existe la API Share Nativa (Móviles / Tablets / Windows 11)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Contrato Alros Investments',
                    text: `Adjuntamos copia de la hoja de captación y privacidad firmada para la propiedad Ref: ${property.reference_id || ''}.`,
                    files: [file]
                });
                alert("✅ Contrato enviado y ARCHIVADO en la carpeta de la propiedad.");
            } else {
                // Fallback para ordenadores de sobremesa que no tienen menú de "Compartir" de serie
                // Forzamos la descarga del PDF en el navegador creando un elemento invisible
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Esperamos un momento para que el navegador procese la descarga antes de abrir el mail
                setTimeout(() => {
                    const subject = encodeURIComponent(`Contrato de Gestión Inmobiliaria - Ref: ${property.reference_id || ''}`);
                    const body = encodeURIComponent(`Estimado/a ${owner?.nombre_completo || 'cliente'},\n\nAdjuntamos en este correo su copia del documento de gestión inmobiliaria suscrito y rubricado hoy, en relación a su propiedad en ${property.city || ''}.\n\nPara el agente de Alros: El PDF se ha descargado en tus "Descargas" y se ha guardado una copia en el archivador de la web.\n\nPor favor, adjunta el PDF manualmente a este email.\n\nAtentamente,\nAlros Investments S.L.\nIsaac.alros@gmail.com`);
                    window.location.href = `mailto:${owner?.email || ''}?subject=${subject}&body=${body}`;

                    alert("✅ Contrato ARCHIVADO en la nube.\n\nEste ordenador no permite envío directo automático, por lo que hemos DESCARGADO el PDF y ABIERTO tu email.\n\nPor favor, adjunta el archivo manualmente al correo.");
                }, 500);
            }

        } catch (err: any) {
            console.error("Error generando PDF", err);
            alert("Hubo un error al procesar el PDF de alta calidad: " + (err?.message || err));
        } finally {
            setGeneratingPdf(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={50} />
            </div>
        );
    }

    if (!property) {
        return <div className="p-8 text-center text-red-600 font-bold">Propiedad no encontrada.</div>;
    }

    const isRental = property.operation_type === 'alquiler';
    const addressParts = [
        property.urbanization,
        `${property.address_street || ''} ${property.address_number || ''}`.trim(),
        property.address_block,
        `${property.address_floor || ''} ${property.address_door || ''}`.trim(),
        `${property.city || ''} ${property.province || ''}`.trim()
    ].filter(Boolean);
    const address = addressParts.join(', ');

    return (
        <div className="bg-slate-100 min-h-screen pb-20">
            {/* NO-PRINT CONTROLS */}
            <div className="print:hidden bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                                <ArrowLeft className="text-slate-600" size={24} />
                            </button>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">Generador de Contrato</h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                            {/* Ajustes en caliente */}
                            <div className="flex gap-3 items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shrink-0">
                                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={exclusivity}
                                        onChange={(e) => setExclusivity(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                    />
                                    Exclusiva
                                </label>
                                {exclusivity && (
                                    <>
                                        <div className="h-4 w-px bg-slate-300"></div>
                                        <select
                                            value={months}
                                            onChange={(e) => setMonths(parseInt(e.target.value))}
                                            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                                        >
                                            <option value={3}>3 mes.</option>
                                            <option value={6}>6 mes.</option>
                                            <option value={12}>12 mes.</option>
                                        </select>
                                    </>
                                )}

                                <div className="h-4 w-px bg-slate-300"></div>

                                {isRental ? (
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-slate-500">Hon:</span>
                                        <select
                                            value={comission}
                                            onChange={(e) => setComission(parseFloat(e.target.value))}
                                            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer max-w-[80px]"
                                        >
                                            <option value={0}>0 €</option>
                                            <option value={0.5}>Media</option>
                                            <option value={1}>1 mes</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-slate-500">Hon:</span>
                                        <input
                                            type="number"
                                            value={comission}
                                            onChange={(e) => setComission(parseFloat(e.target.value))}
                                            className="w-10 bg-transparent text-xs font-bold text-slate-700 focus:outline-none text-right"
                                            step="0.5"
                                        />
                                        <span className="text-xs font-bold text-slate-700">%</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    if (!acceptedPrivacy || !acceptedMarketing) {
                                        alert("🛑 ACCESO DENEGADO: El propietario DEBE aceptar primero la Política de Privacidad y el Consentimiento para poder firmar.");
                                        return;
                                    }
                                    setShowSigModal(true);
                                }}
                                className={`px-3 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 transition-all border shrink-0 ${signature ? 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50' : 'bg-slate-800 text-white border-transparent hover:bg-slate-700'}`}
                            >
                                <FileSignature size={16} />
                                <span className="hidden sm:inline">{signature ? 'Modificar Firma' : 'Firma Digital'}</span>
                                <span className="sm:hidden">{signature ? 'Firma' : 'Firmar'}</span>
                            </button>

                            <button onClick={handleShare} disabled={generatingPdf} className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 transition-colors shrink-0">
                                {generatingPdf ? <Loader2 className="animate-spin" size={16} /> : <Share2 size={16} />}
                                <span className="hidden sm:inline">Firmar y Enviar</span>
                                <span className="sm:hidden">Enviar</span>
                            </button>

                            <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 transition-colors shrink-0">
                                <Printer size={16} />
                                <span className="hidden sm:inline">Imprimir / PDF</span>
                                <span className="sm:hidden">Imprimir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PRINTABLE DINA4 AREA */}
            <div className="container mx-auto px-4 py-8 max-w-4xl print:p-0 print:max-w-full">
                {/* Warning if owner is missing */}
                {!owner && (
                    <div className="print:hidden bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200 mb-6 font-medium text-sm flex items-center gap-2">
                        ⚠️ Esta propiedad no tiene un Propietario asignado. El documento tendrá espacios en blanco. Vuelve al panel y asocia un propietario para autocompletar.
                    </div>
                )}

                <div id="contract-content" className="bg-white p-12 print:p-8 shadow-xl print:shadow-none rounded-2xl print:rounded-none min-h-[29.7cm] max-w-[21cm] mx-auto text-[13px] text-slate-800 leading-relaxed font-serif relative">

                    {/* Header */}
                    <header className="flex justify-between items-start mb-10 border-b border-slate-200 pb-6">
                        <div>
                            <img src="/logo.png" alt="Alros Inmobiliaria" className="h-16 mb-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ALROS INVESTMENTS, S.L.</h2>
                            <p className="text-slate-500 text-xs">Agencia Inmobiliaria</p>
                            <p className="text-slate-500 text-xs">Avenida Juan Luis Peralta 22 - 29639 Benalmádena Pueblo, Málaga</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-lg font-bold text-blue-900 uppercase">HOJA DE ENCARGO</h1>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase">PROPERTY CAPTURE AGREEMENT</h3>
                            <div className="mt-4 bg-slate-50 p-3 rounded border border-slate-200 text-left inline-block">
                                <div className="font-bold text-slate-700">Fecha / Date: <span className="font-normal">{new Date().toLocaleDateString('es-ES')}</span></div>
                                <div className="font-bold text-slate-700">Ref: <span className="font-normal">{property.reference_id || property.referencia || property.id.substring(0, 8).toUpperCase()}</span></div>
                            </div>
                        </div>
                    </header>

                    {/* Parties */}
                    <div className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-lg">
                        <p className="mb-2">Por el presente documento, <strong>D./Dª {owner?.nombre_completo || '_____________________________________________'}</strong> con DNI/NIE <strong>{owner?.documento_identidad || '________________'}</strong>,</p>
                        <p className="mb-2 text-xs italic text-slate-500">Hereby authorizes owner <strong>{owner?.nombre_completo || '_____________________________________________'}</strong> with ID <strong>{owner?.documento_identidad || '________________'}</strong>,</p>

                        <p className="mb-2 mt-4">En adelante EL PROPIETARIO, autoriza a <strong>Alros Investments, S.L.</strong> a gestionar {exclusivity ? <span className="font-bold underline">EN EXCLUSIVA</span> : 'sin exclusividad'} la <strong>{isRental ? 'ALQUILER' : 'VENTA'}</strong> del inmueble situado en:</p>
                        <p className="mb-2 text-xs italic text-slate-500">Hereinafter THE OWNER, authorizes <strong>Alros Investments, S.L.</strong> to manage {exclusivity ? <span className="font-bold underline">EXCLUSIVELY</span> : 'without exclusivity'} the <strong>{isRental ? 'RENT' : 'SALE'}</strong> of the property located at:</p>

                        <div className="mt-4 p-3 bg-white border border-slate-200 rounded text-sm font-semibold text-center uppercase tracking-wide">
                            {address || '__________________________________________________________________________'}
                        </div>
                        {property.internal_location_notes && (
                            <div className="mt-2 p-2 bg-orange-50/50 border border-orange-100 rounded text-[11px] text-orange-900 text-center italic">
                                {property.internal_location_notes}
                            </div>
                        )}
                    </div>

                    {/* Clauses grid (ES / EN) */}
                    <div className="space-y-6 mb-8 text-justify text-xs">

                        {/* Clause 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:break-inside-avoid">
                            {/* Español */}
                            <div className="space-y-4 pr-4 border-r border-slate-100">
                                <p><strong>1. AUTORIZACIÓN Y CAPACIDAD:</strong> Por el presente documento el propietario autoriza a Alros Investments, S.L. a gestionar {isRental ? <><span className="lowercase">el</span> <strong>ALQUILER</strong></> : <><span className="lowercase">la</span> <strong>VENTA</strong></>} del inmueble descrito, facultándole expresamente para recibir cantidades a cuenta en concepto de señal o depósito por la {isRental ? 'reserva' : 'venta'} del mismo, que serán depositadas en la cuenta de clientes de Alros Investments, S.L. o de sus representantes legales hasta la {isRental ? 'firma del contrato de arrendamiento' : 'finalización de la compraventa'}.</p>
                                <p>El propietario manifiesta que tiene capacidad legal suficiente para otorgar {isRental ? 'el contrato de arrendamiento' : 'escritura pública de compraventa'} de la propiedad a que se refiere este acuerdo, {isRental ? 'manifestando que se encuentra en condiciones de habitabilidad y con los suministros al día' : 'libre de toda carga y gravamen, con las construcciones y edificaciones debidamente inscritas en el registro de la propiedad'} y de acuerdo con sus dimensiones y volúmenes actuales. La propiedad asegura que no existe por su parte ninguna omisión en las condiciones de la propiedad que sea relevante.</p>
                            </div>
                            {/* English */}
                            <div className="space-y-4 pl-0 md:pl-4 italic text-slate-600">
                                <p><strong>1. AUTHORIZATION AND CAPACITY:</strong> By this document, the owner authorizes Alros Investments, S.L. to manage the <strong>{isRental ? 'RENTAL' : 'SALE'}</strong> of the described property, expressly authorizing it to receive amounts on account as a deposit or reservation for the {isRental ? 'lease' : 'sale'} thereof, which will be held in Alros Investments' client account until the {isRental ? 'signing of the lease agreement' : 'completion of the sale'}.</p>
                                <p>The owner declares that they have sufficient legal capacity to grant the {isRental ? 'lease agreement' : 'public deed of sale'} of the property, {isRental ? 'stating that it is in habitable condition with utilities up to date' : 'free of all charges and encumbrances, with buildings duly registered in the land registry'} and in accordance with its current dimensions and volumes. The owner ensures there is no relevant omission regarding the property conditions.</p>
                            </div>
                        </div>

                        {/* Clause 2 */}
                        {exclusivity && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:break-inside-avoid">
                                <div className="space-y-2 pr-4 border-r border-slate-100">
                                    <p><strong>2. EXCLUSIVIDAD DE COMERCIALIZACIÓN:</strong> El propietario autoriza a la agencia, con carácter de exclusiva, a gestionar {isRental ? <>el <strong>ALQUILER</strong></> : <>la <strong>VENTA</strong></>} del inmueble descrito durante el plazo de <strong>{months} meses</strong>. Durante dicho periodo, el propietario se compromete a no encomendar la {isRental ? 'comercialización' : 'venta'} a otras agencias ni a comercializar directamente el inmueble por su cuenta. En caso de que la {isRental ? 'operación' : 'venta'} se formalice durante la vigencia, ya sea mediante un inquilino/comprador presentado por la agencia o directamente por el propietario o terceros, la agencia tendrá derecho a los honorarios pactados.</p>
                                    <p><strong>RESCISIÓN:</strong> Cualquiera de las partes podrá dar por finalizada la presente autorización antes de la fecha de vencimiento comunicándolo por escrito con un preaviso mínimo de <strong>{isRental ? '15' : '30'} días naturales</strong>. La rescisión no afectará a los derechos de intermediación si la {isRental ? 'operación' : 'venta'} se formaliza con un cliente gestionado durante la vigencia.</p>
                                </div>
                                <div className="space-y-2 pl-0 md:pl-4 italic text-slate-600">
                                    <p><strong>2. MARKETING EXCLUSIVITY:</strong> The owner authorizes the agency, on an exclusive basis, to manage the <strong>{isRental ? 'RENTAL' : 'SALE'}</strong> of the property described for a period of <strong>{months} months</strong>. During this period, the owner agrees not to entrust the {isRental ? 'marketing' : 'sale'} to other agencies or market it directly. If the {isRental ? 'transaction' : 'sale'} is completed during the term, through a tenant/buyer introduced by the agency or directly by the owner or third parties, the agency shall be entitled to the agreed fees.</p>
                                    <p><strong>TERMINATION:</strong> Either party may terminate this authorization before the expiration date by written notice with a minimum of <strong>{isRental ? '15' : '30'} calendar days</strong>. Termination shall not affect brokerage rights if the {isRental ? 'transaction' : 'sale'} is completed with a client managed during the term.</p>
                                </div>
                            </div>
                        )}

                        {/* Clause 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:break-inside-avoid">
                            <div className="pr-4 border-r border-slate-100 h-full">
                                <div className="p-3 bg-blue-50/30 border border-blue-100 rounded h-full flex flex-col justify-center">
                                    <p className="mb-2"><strong>{exclusivity ? '3' : '2'}. ACUERDO ECONÓMICO:</strong> El propietario fija un precio de {isRental ? 'alquiler' : 'venta'} de <strong className="text-sm">{new Intl.NumberFormat('es-ES').format(property.price)} €</strong> y acuerda pagar a Alros Investments, S.L. la cantidad de:</p>
                                    <div className="text-center font-bold text-lg text-blue-900 border-b border-blue-200 pb-2 mb-2">
                                        {comission} {isRental ? 'MENSUALIDAD(ES)' : '%'} MÁS IVA
                                    </div>
                                    <p className="text-[10px] leading-tight text-slate-600">Dichos honorarios serán pagados a la {isRental ? 'firma del contrato de arrendamiento' : 'finalización de la compraventa en Notaría'}. Asimismo, si la {isRental ? 'operación' : 'venta'} se realizara dentro de los 6 meses posteriores a la finalización de esta autorización con un cliente gestionado durante la vigencia, la agencia tendrá derecho a percibir los honorarios.</p>
                                </div>
                            </div>
                            <div className="pl-0 md:pl-4 italic text-slate-600 h-full">
                                <div className="p-3 bg-blue-50/10 border border-blue-100/50 rounded h-full flex flex-col justify-center">
                                    <p className="mb-2"><strong>{exclusivity ? '3' : '2'}. FINANCIAL AGREEMENT:</strong> The owner sets a {isRental ? 'rental' : 'sale'} price of <strong className="text-sm">{new Intl.NumberFormat('en-GB').format(property.price)} €</strong> and agrees to pay Alros Investments, S.L. the amount of:</p>
                                    <div className="text-center font-bold text-lg text-blue-800/80 border-b border-blue-100 pb-2 mb-2">
                                        {comission} {isRental ? 'MONTH(S)' : '%'} PLUS VAT
                                    </div>
                                    <p className="text-[10px] leading-tight text-slate-500">Fees shall be paid upon {isRental ? 'signing the lease agreement' : 'completion of the sale at the Notary'}. Likewise, if the {isRental ? 'transaction' : 'sale'} is carried out within 6 months after this authorization ends with a client introduced during the term, the agency shall be entitled to the fees.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Data Protection (RGPD current) */}
                    {isRental && (
                        <div className="mt-8 pt-6 border-t border-slate-200 print:break-inside-avoid">
                            <h4 className="font-bold text-[11px] uppercase text-slate-800 mb-2">🛡️ Información Legal y Protección de Datos (RGPD y D.I.A.)</h4>
                            <div className="text-[10px] text-justify text-slate-500 columns-1 sm:columns-2 gap-6 space-y-2">
                                <p><strong>1. DECRETO 218/2005 (D.I.A.):</strong> Para cumplir con la ley andaluza de protección al consumidor, el Propietario se compromete a facilitar inmediatamente: Copia simple del Registro (Nota Simple), Copia de Escritura, Certificado Energético vigente y últimos recibos de IBI y Basura. Sin estos, el Inmueble no podrá publicitarse públicamente según el art. 10 de la Ley.</p>
                                <p><strong>2. LEY VIVIENDA 12/2023:</strong> En caso de Alquiler Residencial, la ley estipula que los gastos de gestión e intermediación deben recaer sobre el arrendador, condicion cubierta en este mismo mandato legal. En alquiler de locales o temporal se regirá por la LAU o código civil según proceda.</p>
                                <p><strong>3. RGPD Y LOPDGDD 3/2018:</strong> El Responsable del tratamiento es ALROS INVESTMENTS, S.L. Finalidad: Ejecución del presente contrato de mediación inmobiliaria y elaboración del D.I.A. Legitimación: Relación contractual e Interés Legítimo. No se cederán datos a terceros salvo imperativo legal. Derechos: Acceso, rectificación, supresión y oposición escribiendo a Isaac.alros@gmail.com.</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 border-t border-slate-100 pt-4">
                        <div className="pt-2 text-slate-800 font-bold flex flex-col gap-2">
                            <label className={`flex items-start gap-2 cursor-pointer p-2 rounded transition-colors ${!acceptedPrivacy ? 'bg-red-50 border border-red-200' : 'bg-green-50/50 border border-green-200'}`}>
                                <input
                                    type="checkbox"
                                    checked={acceptedPrivacy}
                                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                                    className="mt-0.5 print:appearance-none print:w-3 print:h-3 print:border print:border-black rounded-sm"
                                />
                                <span>He leído y acepto la Política de Privacidad para la tramitación de esta gestión.</span>
                            </label>
                            <label className={`flex items-start gap-2 cursor-pointer p-2 rounded transition-colors ${!acceptedMarketing ? 'bg-red-50 border border-red-200' : 'bg-green-50/50 border border-green-200'}`}>
                                <input
                                    type="checkbox"
                                    checked={acceptedMarketing}
                                    onChange={(e) => setAcceptedMarketing(e.target.checked)}
                                    className="mt-0.5 print:appearance-none print:w-3 print:h-3 print:border print:border-black rounded-sm"
                                />
                                <span>Consiento expresamente recibir otras comunicaciones y ofertas de Alros.</span>
                            </label>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="mt-16 flex justify-center pt-8">
                        <div className="text-center relative w-full max-w-sm">
                            <p className="font-bold text-sm text-slate-800 mb-8 uppercase">Firma del Propietario / THE OWNER Signature</p>
                            <div className="h-28 w-full flex justify-center items-end pb-2">
                                {signature ? (
                                    <img src={signature} alt="Firma del Propietario" className="max-h-24 max-w-full object-contain mb-[-10px]" />
                                ) : (
                                    <div className="text-slate-300 italic py-10">Pendiente de firma digital</div>
                                )}
                            </div>
                            <div className="border-t border-slate-400 pt-3 text-xs flex flex-col gap-1">
                                <span className="font-bold text-slate-900">{owner?.nombre_completo || '___________________________'}</span>
                                <span className="text-slate-500 uppercase">DNI/NIE: {owner?.documento_identidad || '_________'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SIGNATURE MODAL */}
            {showSigModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                            <div className="text-white">
                                <h3 className="font-bold text-lg">Firma del Propietario</h3>
                                <p className="text-xs text-slate-300">D./Dª {owner?.nombre_completo}</p>
                            </div>
                            <button onClick={() => setShowSigModal(false)} className="text-slate-300 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="px-8 py-6 bg-slate-50">
                            <p className="text-sm font-medium text-slate-600 mb-4 text-center">
                                Por favor, firme en el recuadro blanco usando el dedo o un ratón. Esta firma será integrada legalmente en el contrato.
                            </p>
                            <div className="border-2 border-dashed border-slate-300 bg-white rounded-xl shadow-inner relative flex justify-center w-full">
                                <SignatureCanvas
                                    penColor="black"
                                    canvasProps={{ className: 'sigCanvas rounded-xl cursor-crosshair h-[300px] w-full max-w-[600px]' }}
                                    ref={sigPad}
                                />
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none opacity-20">
                                    <div className="w-2/3 border-b-2 border-black" />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center">
                            <button
                                onClick={clearSignature}
                                className="px-6 py-2 rounded-lg font-medium text-slate-600 border border-slate-300 hover:bg-slate-100 transition-colors"
                            >
                                Borrar y Repetir
                            </button>
                            <button
                                onClick={saveSignature}
                                disabled={savingSig}
                                className="px-8 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                {savingSig ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Confirmar Firma
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
