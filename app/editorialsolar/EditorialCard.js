'use client';

import Image from 'next/image';
import { FaArrowRightLong } from 'react-icons/fa6';
import { getImageUrl, parseDescription } from './utils';
import { handleLogClick } from './handleLogClick';
import { useRouter } from 'next/navigation';

export default function EditorialCard({ item, locale }) {
  const router = useRouter();

  const title = locale === 'en' ? item.editoria_titieEN : item.editoria_titieTH;
  const description = locale === 'en'
    ? item.editoria_descriptionEN
    : item.editoria_descriptionTH;

  return (
    <div
      className="editorial-card"
      onClick={async () => {
        await handleLogClick(item);
        router.push(`/editorialsolar/${item.editoria_num}`); // แก้ path ถูกแล้ว
      }}
    >
      <div className="card-image-wrapper">
        <Image
          src={getImageUrl(item.editoria_gallary)}
          alt={title}
          fill
          className="card-image"
          unoptimized
        />
      </div>

      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p
          className="card-snippet"
          dangerouslySetInnerHTML={{ __html: parseDescription(description) }}
        />
        <p className="read-more">
          {locale === 'en' ? 'Read more' : 'อ่านเพิ่มเติม'} <FaArrowRightLong />
        </p>
      </div>
    </div>
  );
}
