import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableImage } from './SortableImage';

interface ImageGalleryProps {
    images: string[];
    onChange: (newImages: string[]) => void;
}

export function ImageGallery({ images, onChange }: ImageGalleryProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = images.indexOf(active.id.toString());
            const newIndex = images.indexOf(over.id.toString());
            onChange(arrayMove(images, oldIndex, newIndex));
        }
    };

    const handleRemove = (id: string) => {
        onChange(images.filter(img => img !== id));
    };

    const handleRotate = async (urlToRotate: string, direction: 'right') => {
        const originalUrl = urlToRotate.split('?')[0];

        // Optimistic UI update or disable visually could be done here, but let's keep it simple
        try {
            const res = await fetch('/api/rotate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: originalUrl, direction })
            });
            const data = await res.json();

            if (data.success && data.url) {
                // Replace the exact string (which might have had an old ?t=) with the new one
                const newImages = images.map(img => img === urlToRotate ? data.url : img);
                onChange(newImages);
            } else {
                alert("Error al rotar: " + (data.error || 'Desconocido'));
            }
        } catch (e) {
            console.error(e);
            alert("Error al comunicar con el servidor para rotar la imagen.");
        }
    };

    if (images.length === 0) {
        return (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
                <p>No hay imágenes seleccionadas.</p>
                <p className="text-sm mt-1">Usa Buscar Fotos o añade URLs manualmente.</p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={images}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    {images.map((url, index) => (
                        <SortableImage
                            key={url}
                            id={url}
                            url={url}
                            index={index}
                            onRemove={handleRemove}
                            onRotate={handleRotate}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
