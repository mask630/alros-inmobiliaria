'use client';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

export default function QRCodeDynamic({ size = 100 }: { size?: number }) {
    const [url, setUrl] = useState('');

    useEffect(() => {
        // Run only in browser
        setUrl(window.location.href.replace('/print', '').split('?')[0]);
    }, []);

    if (!url) return null;

    return (
        <QRCodeSVG value={url} size={size} level="H" includeMargin={false} />
    );
}
