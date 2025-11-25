'use client';

import Image from 'next/image';

export default function BannerSection({ banners, isMobile, loadingBanner, baseUrl }) {
  if (loadingBanner) {
    return <div className="skeleton skeleton-banner fade-in"></div>;
  }

  return banners.map((b) => {
    const imgSrc = isMobile
      ? `${baseUrl}/${b.brander_pictureMoblie}`
      : `${baseUrl}/${b.brander_picturePC}`;

    return (
      <div key={b.brander_ID} className="banner-container">
        <Image
          src={imgSrc}
          alt={b.brander_name}
          fill
          className="banner-image fade-in"
          priority
          unoptimized
          sizes="100vw"
        />
      </div>
    );
  });
}
