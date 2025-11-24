'use client';

import EditorialCard from './EditorialCard';

export default function EditorialGrid({ paginatedArticles, shouldAnimate, locale }) {
  return (
    <div className={`editorial-grid ${shouldAnimate ? 'fade-in' : ''}`}>
      {paginatedArticles.map((item) => (
        <EditorialCard key={item.editoria_num} item={item} locale={locale} />
      ))}
    </div>
  );
}
