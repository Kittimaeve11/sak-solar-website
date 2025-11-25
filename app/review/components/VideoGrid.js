'use client';

import VideoCard from './VideoCard';

export default function VideoGrid({ paginated, loading, locale, itemsPerPage }) {
  return (
    <div className="video-grid">
      {loading
        ? Array.from({ length: itemsPerPage }).map((_, i) => (
            <div key={i} className="skeletonvideo-card skeleton fade-in">
              <div className="skeletonvideo-image skeleton" />
              <div className="skeletonvideo-title skeleton" />
              <div className="skeletonvideo-line skeleton" />
            </div>
          ))
        : paginated.map((review) => (
            <VideoCard key={review.vedio_id} review={review} locale={locale} />
          ))}
    </div>
  );
}
