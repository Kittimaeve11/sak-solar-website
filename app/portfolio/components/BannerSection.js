'use client';

import Image from 'next/image';
import React from 'react';

export default function BannerSection({ brander, loadingBanner, isMobile, baseUrl }) {
  if (loadingBanner) {
    return <div className="skeleton skeleton-banner fade-in"></div>;
  }

  return brander.map((item) => {
    const src = isMobile
      ? `${baseUrl}/${item.brander_pictureMoblie}`
      : `${baseUrl}/${item.brander_picturePC}`;

    return (
      <div key={item.brander_ID} className="banner-container fade-in">
        <Image
          src={src}
          alt={item.brander_name || 'Banner'}
          fill
          className="banner-image"
          sizes="100vw"
          unoptimized
          priority
        />
      </div>
    );
  });
}
