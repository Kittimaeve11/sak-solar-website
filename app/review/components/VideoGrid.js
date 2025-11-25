'use client';

import VideoCard from './VideoCard';

export default function VideoGrid({ paginated, loading, itemsPerPage, locale }) {
  if (loading) {
    return (
      <div className="video-grid">
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <div key={i} className="skeletonvideo-card skeleton fade-in">
            <div className="skeletonvideo-image skeleton" />
            <div className="skeletonvideo-title skeleton" />
            <div className="skeletonvideo-line skeleton" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="video-grid">
      {paginated.map((review) => (
        <VideoCard key={review.vedio_id} review={review} locale={locale} />
      ))}
    </div>
  );
}
