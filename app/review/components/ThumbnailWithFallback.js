'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ThumbnailWithFallback({ videoId, alt }) {
    const [srcIndex, setSrcIndex] = useState(0);

    const urls = [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    ];

    return (
        <Image
            src={urls[srcIndex]}
            alt={alt}
            fill
            className="thumbnail"
            onError={() => srcIndex < urls.length - 1 && setSrcIndex(srcIndex + 1)}
            unoptimized
            priority
        />
    );
}
