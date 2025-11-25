'use client';

export default function SkeletonEditorial({ count = 15 }) {
  return (
    <div className="editorial-grid fade-in">
      {Array.from({ length: count }).map((_, idx) => (
        <div className="skeleton-card" key={idx}>
          <div className="skeleton skeleton-image"></div>
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-line"></div>
          <div className="skeleton skeleton-line"></div>
        </div>
      ))}
    </div>
  );
}
