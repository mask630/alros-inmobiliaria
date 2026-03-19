'use client';

import { useEffect } from 'react';

export default function PrintController() {
    useEffect(() => {
        // Wait a tiny bit for images and fonts to render, then trigger print dialog
        const timeout = setTimeout(() => {
            window.print();
        }, 800);

        return () => clearTimeout(timeout);
    }, []);

    return null;
}
