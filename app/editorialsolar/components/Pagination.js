'use client';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-controls">
      <div className="page-buttons">

        {/* Previous */}
        {currentPage > 1 && (
          <button className="btn-with-arrow" onClick={() => onPageChange(currentPage - 1)}>
            <IoIosArrowBack />
          </button>
        )}

        {/* Page numbers */}
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? 'active-page' : ''}
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        {/* Next */}
        {currentPage < totalPages && (
          <button className="btn-with-arrow" onClick={() => onPageChange(currentPage + 1)}>
            <IoIosArrowForward />
          </button>
        )}
      </div>
    </div>
  );
}
