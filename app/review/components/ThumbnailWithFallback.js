'use client';
import Image from 'next/image';
import { useState } from 'react';

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
      unoptimized
      sizes="(max-width: 768px) 100vw, 330px"
      className="thumbnail"
      onError={() => {
        if (srcIndex < urls.length - 1) setSrcIndex(srcIndex + 1);
      }}
    />
  );
}
