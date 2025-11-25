'use client';

import React from 'react';
import SkeletonCard from './SkeletonCard';
import PortfolioCard from './PortfolioCard';

export default function PortfolioGrid({
  isLoading,
  paginatedProjects,
  locale,
  baseUrl,
  apiKey,
  itemsPerPage,
  showContent
}) {
  return (
    <div className={`portfolio-grid ${showContent ? 'fade-in' : ''}`}>
      {isLoading ? (
        // 🟡 Loading State - ใช้ skeleton
        Array.from({ length: itemsPerPage }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))
      ) : paginatedProjects.length === 0 ? (
        // 🔴 ไม่มีข้อมูล
        <p className="no-data-text">
          {locale === 'th' ? 'ไม่พบข้อมูลผลงาน' : 'No projects found'}
        </p>
      ) : (
        // 🟢 แสดงรายการจริง
        paginatedProjects.map((proj, index) => {
          // สร้าง key ที่ปลอดภัย (ไม่ซ้ำแน่นอน)
          const safeKey = `${proj.portfolio_id || proj.id}-${index}`;

          return (
            <PortfolioCard
              key={safeKey}    // 👈 แก้ตรงนี้
              proj={proj}
              locale={locale}
              baseUrl={baseUrl}
              apiKey={apiKey}
            />
          );
        })
      )}
    </div>
  );
}
