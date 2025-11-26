'use client';

import Image from 'next/image';

export default function BannerContact({ brander, loading, isMobile, baseUrl }) {
  if (loading) {
    return <div className="skeleton skeleton-banner fade-in"></div>;
  }

  if (!brander || brander.length === 0) return null;

  return (
    <>
      {brander.map((b) => {
        const imgSrc = isMobile
          ? `${baseUrl}/${b.brander_pictureMoblie}`
          : `${baseUrl}/${b.brander_picturePC}`;

        return (
          <div key={b.brander_ID} className="banner-container fade-in">
            <Image
              src={imgSrc}
              alt={b.brander_name}
              fill
              priority
              unoptimized
              sizes="100vw"
              className="banner-image"
            />
          </div>
        );
      })}
    </>
  );
}
