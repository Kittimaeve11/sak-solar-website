'use client';

import Link from 'next/link';
import { IoPlayCircleOutline } from 'react-icons/io5';
import ThumbnailWithFallback from './ThumbnailWithFallback';
import { extractVideoId } from './ExtractVideoId';

export default function VideoCard({ review, locale }) {
  const id = extractVideoId(review?.vedio_link);
  if (!id) return null;

  const title =
    locale === 'en'
      ? review.nameEN_Vedio || review.nameTH_Vedio
      : review.nameTH_Vedio || review.nameEN_Vedio;

  return (
    <Link href={review.vedio_link} target="_blank" className="video-card fade-in">
      <div className="thumbnail-placeholder">
        <ThumbnailWithFallback videoId={id} alt={title} />
        <IoPlayCircleOutline className="play-icon" />
      </div>
      <div className="infovideo">
        <div className="titlevideo">{title}</div>
        <div className="datevideo">
          {new Date(review.vedio_creationdate).toLocaleDateString(
            locale === 'en' ? 'en-US' : 'th-TH',
            { year: 'numeric', month: 'long', day: 'numeric' }
          )}
        </div>
      </div>
    </Link>
  );
}
