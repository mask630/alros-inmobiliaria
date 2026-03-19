import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, Star, RotateCw } from 'lucide-react';


interface SortableImageProps {
    id: string;
    url: string;
    index: number;
    onRemove: (id: string) => void;
    onRotate?: (id: string, direction: 'right') => void;
}

export function SortableImage({ id, url, index, onRemove, onRotate }: SortableImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isMain = index === 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${isMain ? 'ring-2 ring-blue-500 col-span-2 row-span-2' : ''}`}
        >
            {/* Image */}
            <div className="aspect-square w-full h-full relative">
                <img src={url} alt={`Photo ${index}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 p-1.5 bg-white/80 rounded-md cursor-grab active:cursor-grabbing hover:bg-white text-slate-600"
            >
                <GripVertical size={16} />
            </div>

            {/* Remove Button */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-md hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X size={16} />
            </button>

            {/* Rotate Button */}
            {onRotate && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRotate(id, 'right'); }}
                    className="absolute top-2 right-10 p-1.5 bg-blue-500/80 rounded-md hover:bg-blue-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Rotar a la derecha"
                >
                    <RotateCw size={16} />
                </button>
            )}

            {/* Labels */}
            {isMain && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded flex items-center gap-1 shadow-sm">
                    <Star size={12} fill="white" />
                    Portada Principal
                </div>
            )}
            {!isMain && index < 5 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded backdrop-blur-sm">
                    Destacada {index}
                </div>
            )}
        </div>
    );
}
