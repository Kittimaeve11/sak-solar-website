// app/portfolio/components/SkeletonCard.js
'use client';

import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="portfolio-card skeletonportfolio-card">
      <div className="portfolio-image-wrapper">
        <div className="skeleton-portfoliobanner">
          <div className="skeleton-logoportfolio"></div>
          <div className="skeleton-bannertextportfolio"></div>
        </div>
        <div className="skeleton skeletonportfolio-image" />
      </div>

      <div className="portfolio-content">
        <div className="skeleton skeletonportfolio-title" />

        {[1, 2, 3].map((_, i) => (
          <div className="skeleton-rowportfolio" key={i}>
            <div className="skeleton-line-leftportfolio"></div>
            <div className="skeleton-line-rightportfolio"></div>
          </div>
        ))}

        <div className="skeleton-line-fullportfolio"></div>
      </div>
    </div>
  );
}
