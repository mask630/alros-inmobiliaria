import React from 'react';

interface LegalFooterProps {
    variant?: 'light' | 'dark' | 'onImage';
    compact?: boolean;
}

/**
 * Texto legal obligatorio para Window Cards.
 * 
 * OBLIGATORIO por:
 * - Decreto 218/2005 de la Junta de Andalucía (D.I.A.)
 * - RD 390/2021 (Certificado Energético en publicidad)
 */
export function LegalFooter({ variant = 'light', compact = false }: LegalFooterProps) {
    const colorClass = variant === 'dark' 
        ? 'text-white/40' 
        : variant === 'onImage' 
            ? 'text-white/50' 
            : 'text-slate-400';

    const fullText = `Información sujeta a posibles errores u omisiones. No tiene valor contractual. El consumidor tiene derecho a recibir una copia del Documento Informativo Abreviado (D.I.A.) conforme al Decreto 218/2005 de la Junta de Andalucía. El precio indicado no incluye impuestos, gastos de notaría, registro ni otros costes asociados a la compraventa. Certificado de eficiencia energética disponible para consulta según RD 390/2021.`;

    const compactText = `Info sin valor contractual. D.I.A. disponible (Decreto 218/2005, Junta de Andalucía). Precio sin impuestos ni gastos de compraventa. Cert. energético disponible (RD 390/2021).`;

    return (
        <p className={`text-[7px] leading-relaxed font-light text-justify ${colorClass}`}>
            {compact ? compactText : fullText}
        </p>
    );
}
