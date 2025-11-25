'use client';
import Image from 'next/image';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API || '';

export default function BannerList({ banners, isMobile }) {
  return banners.map((b) => {
    const imgPath = isMobile ? b.brander_pictureMoblie : b.brander_picturePC;

    const imgSrc = imgPath?.startsWith('http')
      ? imgPath
      : `${baseUrl}/${imgPath?.replace(/^\/+/, '')}`;

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
  });
}
