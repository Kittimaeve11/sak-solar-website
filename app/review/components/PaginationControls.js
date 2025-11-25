'use client';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

export default function PaginationControls({ currentPage, totalPages, handlePageChange, titleRef }) {
  if (totalPages <= 1) return null;

  const onPageClick = (page) => {
    handlePageChange(page);

    setTimeout(() => {
      if (titleRef?.current) {
        const y = titleRef.current.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 80);
  };

  return (
    <div className="pagination-controls">
      <div className="page-buttons">

        {currentPage > 1 && (
          <button className="btn-with-arrow" onClick={() => onPageClick(currentPage - 1)}>
            <IoIosArrowBack />
          </button>
        )}

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i + 1}
            className={currentPage === i + 1 ? 'active-page' : ''}
            onClick={() => onPageClick(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        {currentPage < totalPages && (
          <button className="btn-with-arrow" onClick={() => onPageClick(currentPage + 1)}>
            <IoIosArrowForward />
          </button>
        )}
      </div>
    </div>
  );
}
