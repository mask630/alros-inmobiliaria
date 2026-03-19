'use client';

import { useState, useEffect, useRef } from 'react';
import { Share2, Link as LinkIcon, Facebook, Twitter, Phone as WhatsappIcon, Printer, Check, Mail } from 'lucide-react';

interface PropertyShareButtonProps {
    propertyTitle: string;
    propertyRef: string;
    propertyId: string;
    locale?: string;
}

export function PropertyShareButton({ propertyTitle, propertyRef, propertyId, locale = 'es' }: PropertyShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = locale === 'en' 
        ? `Check out this property: ${propertyTitle} (Ref: ${propertyRef})`
        : `Mira esta propiedad: ${propertyTitle} (Ref: ${propertyRef})`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' - ' + shareUrl)}`, '_blank');
        setIsOpen(false);
    };

    const handleFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        setIsOpen(false);
    };

    const handleTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        setIsOpen(false);
    };

    const handleEmail = () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(propertyTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        setIsOpen(false);
    };

    const handlePrintA4 = () => {
        window.open(`/propiedades/${propertyId}/print?format=a4`, '_blank');
        setIsOpen(false);
    };

    const handlePrintA3 = () => {
        window.open(`/propiedades/${propertyId}/print?format=a3`, '_blank');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-500'}`}
                title={locale === 'en' ? 'Share property' : 'Compartir inmueble'}
            >
                <Share2 className="h-5 w-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <button
                        onClick={handleCopyLink}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700 transition-colors"
                    >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4 text-slate-400" />}
                        {copied ? (locale === 'en' ? 'Link copied!' : '¡Enlace copiado!') : (locale === 'en' ? 'Copy link' : 'Copiar enlace')}
                    </button>

                    <div className="h-px bg-slate-100 my-1"></div>

                    <button
                        onClick={handleWhatsApp}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center gap-3 text-sm text-slate-700 transition-colors"
                    >
                        <WhatsappIcon className="h-4 w-4 text-[#25D366]" fill="currentColor" />
                        WhatsApp
                    </button>

                    <button
                        onClick={handleFacebook}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-sm text-slate-700 transition-colors"
                    >
                        <Facebook className="h-4 w-4 text-[#1877F2]" fill="currentColor" />
                        Facebook
                    </button>

                    <button
                        onClick={handleTwitter}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700 transition-colors"
                    >
                        <Twitter className="h-4 w-4 text-[#1DA1F2]" fill="currentColor" />
                        X / Twitter
                    </button>

                    <button
                        onClick={handleEmail}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700 transition-colors"
                    >
                        <Mail className="h-4 w-4 text-slate-600" />
                        Email
                    </button>

                    <div className="h-px bg-slate-100 my-1"></div>

                    <button
                        onClick={handlePrintA4}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center gap-3 text-sm text-slate-700 transition-colors"
                        title={locale === 'en' ? "Print Window Card (A4 Portrait)" : "Imprimir tarjeta (A4 Vertical)"}
                    >
                        <Printer className="h-4 w-4 text-amber-600" />
                        Window Card (A4)
                    </button>

                    <div className="h-px bg-slate-100 my-1"></div>
                    <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modelos Escaparate A3</div>

                    <button
                        onClick={() => window.open(`/propiedades/${propertyId}/print?format=a3&model=1`, '_blank')}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center gap-3 text-sm text-slate-700 transition-colors"
                    >
                        <Printer className="h-4 w-4 text-amber-500" />
                        Modelo 1: Burgundy Pro
                    </button>

                    <button
                        onClick={() => window.open(`/propiedades/${propertyId}/print?format=a3&model=2`, '_blank')}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center gap-3 text-sm text-slate-700 transition-colors"
                    >
                        <Printer className="h-4 w-4 text-amber-500" />
                        Modelo 2: Rejilla Lujo
                    </button>

                    <button
                        onClick={() => window.open(`/propiedades/${propertyId}/print?format=a3&model=3`, '_blank')}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center gap-3 text-sm text-slate-700 transition-colors"
                    >
                        <Printer className="h-4 w-4 text-amber-500" />
                        Modelo 3: Lujo Cinematográfico
                    </button>

                    <button
                        onClick={() => window.open(`/propiedades/${propertyId}/print?format=a3&model=4`, '_blank')}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center gap-3 text-sm text-slate-700 transition-colors"
                    >
                        <Printer className="h-4 w-4 text-amber-500" />
                        Modelo 4: Revista Elegante
                    </button>

                    <button
                        onClick={() => window.open(`/propiedades/${propertyId}/print?format=a3&model=5`, '_blank')}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center gap-3 text-sm text-slate-700 transition-colors"
                    >
                        <Printer className="h-4 w-4 text-amber-500" />
                        Modelo 5: Diamante Luminoso
                    </button>
                </div>
            )}
        </div>
    );
}
