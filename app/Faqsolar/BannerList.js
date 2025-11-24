'use client';

import Image from 'next/image';

export default function BannerList({ banners, baseUrl, isMobile }) {
  return banners.map((b) => {
    const imgSrc = isMobile
      ? `${baseUrl}/${b.brander_pictureMoblie}`
      : `${baseUrl}/${b.brander_picturePC}`;

    return (
      <div key={b.brander_ID} className="banner-container fade-in">
        <Image
          src={imgSrc}
          alt={b.brander_name}
          fill
          className="banner-image"
          unoptimized
          priority
          sizes="100vw"
        />
      </div>
    );
  });
}
