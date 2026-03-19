'use client';

import { useState } from "react";

interface PropertyGalleryProps {
    images: string[];
    locale?: 'es' | 'en';
}

export function PropertyGallery({ images, locale = 'es' }: PropertyGalleryProps) {
    const [showAllPhotos, setShowAllPhotos] = useState(false);

    const t = {
        es: {
            fullGallery: "Galería Completa",
            back: "Volver a la vista normal",
            viewAll: "Ver todas las fotos",
            photo: "Foto"
        },
        en: {
            fullGallery: "Full Photo Gallery",
            back: "Back to normal view",
            viewAll: "View all photos",
            photo: "Photo"
        }
    }[locale];

    if (showAllPhotos) {
        return (
            <div className="fixed inset-0 z-[1000] bg-white overflow-y-auto animate-in fade-in duration-300">
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-900">{t.fullGallery}</h2>
                    <button
                        onClick={() => setShowAllPhotos(false)}
                        className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all active:scale-95"
                    >
                        {t.back}
                    </button>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {images.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt={`${t.photo} ${i}`}
                                className="w-full rounded-3xl shadow-lg border border-slate-100"
                                referrerPolicy="no-referrer"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Mobile Carousel (Horizontal Scroll) */}
            <div className="md:hidden">
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-3xl h-[350px] gap-2">
                    {images.map((img, i) => (
                        <div key={i} className="min-w-full h-full snap-center relative">
                            <img
                                src={img}
                                alt={`${t.photo} ${i}`}
                                className="w-full h-full object-cover"
                                onClick={() => setShowAllPhotos(true)}
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                                {i + 1} / {images.length}
                            </div>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={() => setShowAllPhotos(true)}
                    className="w-full mt-4 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                >
                    Ver todas las fotos ({images.length})
                </button>
            </div>

            {/* Desktop Grid (Original but polished) */}
            <div className="hidden md:grid grid-cols-4 gap-3 h-[600px] rounded-[2.5rem] overflow-hidden group/gallery">
                <div className="col-span-2 row-span-2 relative overflow-hidden">
                    <img
                        src={images[0]}
                        alt="Main"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
                        referrerPolicy="no-referrer"
                        onClick={() => setShowAllPhotos(true)}
                    />
                </div>
                {images.slice(1, 5).map((img, i) => (
                    <div key={i} className="relative overflow-hidden">
                        <img
                            src={img}
                            alt={`Interior ${i + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 cursor-pointer"
                            referrerPolicy="no-referrer"
                            onClick={() => setShowAllPhotos(true)}
                        />
                        {i === 3 && images.length > 5 && (
                            <div
                                onClick={() => setShowAllPhotos(true)}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors cursor-pointer text-white font-black text-lg backdrop-blur-[2px]"
                            >
                                + {images.length - 5} {t.photo}s
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
