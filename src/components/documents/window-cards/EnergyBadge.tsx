import React from 'react';

interface EnergyBadgeProps {
    property: any;
    variant?: 'full' | 'compact' | 'inline';
    dark?: boolean;
}

const ENERGY_COLORS: Record<string, string> = {
    'A': '#166534',
    'B': '#22c55e',
    'C': '#84cc16',
    'D': '#facc15',
    'E': '#fb923c',
    'F': '#ea580c',
    'G': '#dc2626',
};

/**
 * Mandatory energy efficiency badge for window cards.
 * Required by RD 390/2021 for all real estate advertising.
 */
export function EnergyBadge({ property, variant = 'compact', dark = false }: EnergyBadgeProps) {
    const rawValue = (property.certificado_energetico || property.energy_consumption || '').toString();
    const normalized = rawValue.toLowerCase().trim().replace(/_/g, ' ').replace(/-/g, ' ');
    const isEnTramite = normalized.includes('tramit') || normalized.includes('pendient') || normalized === 'en tramite';
    const isExento = normalized.includes('exent');
    const letter = isEnTramite || isExento ? null : rawValue.toUpperCase().charAt(0);
    const color = letter ? ENERGY_COLORS[letter] || '#94a3b8' : '#94a3b8';

    const labelColor = dark ? 'text-white/50' : 'text-slate-400';
    const textColor = dark ? 'text-white/70' : 'text-slate-500';

    if (variant === 'inline') {
        return (
            <div className="flex items-center gap-2">
                <span className={`text-[8px] font-bold uppercase tracking-widest ${labelColor}`}>Energía</span>
                {letter ? (
                    <div className="w-7 h-7 rounded-sm flex items-center justify-center text-white text-sm font-black" style={{ backgroundColor: color }}>
                        {letter}
                    </div>
                ) : (
                    <span className={`text-[9px] font-bold ${textColor}`}>{isExento ? 'EXENTO' : 'EN TRÁMITE'}</span>
                )}
            </div>
        );
    }

    if (variant === 'full') {
        return (
            <div className="flex flex-col items-center gap-1">
                <p className={`text-[9px] font-bold tracking-[0.15em] uppercase ${labelColor}`}>Certificado Energético</p>
                <div className="flex items-center gap-2">
                    {letter ? (
                        <>
                            <div className="flex flex-col items-center">
                                <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[14px]"
                                    style={{ borderBottomColor: color }} />
                                <div className="w-9 h-8 flex items-center justify-center text-white text-lg font-black rounded-b-sm"
                                    style={{ backgroundColor: color }}>
                                    {letter}
                                </div>
                            </div>
                        </>
                    ) : (
                        <span className={`text-[10px] font-bold ${textColor}`}>{isExento ? 'EXENTO' : 'EN TRÁMITE'}</span>
                    )}
                </div>
            </div>
        );
    }

    // Default: compact 
    return (
        <div className="flex items-center gap-2">
            <div className={`text-[8px] font-bold uppercase tracking-widest border-r pr-2 ${labelColor} ${dark ? 'border-white/10' : 'border-slate-200'}`}>
                Eficiencia
            </div>
            {letter ? (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-black" style={{ backgroundColor: color }}>
                    {letter}
                </div>
            ) : (
                <span className={`text-[9px] font-bold ${textColor}`}>{isExento ? 'EXENTO' : 'TRÁMITE'}</span>
            )}
        </div>
    );
}
