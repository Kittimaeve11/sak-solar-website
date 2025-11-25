'use client';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

export default function PaginationControls({ currentPage, totalPages, handlePageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-controls">
      <div className="page-buttons">
        {currentPage > 1 && (
          <button onClick={() => handlePageChange(currentPage - 1)}>
            <IoIosArrowBack />
          </button>
        )}

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i + 1}
            className={currentPage === i + 1 ? 'active-page' : ''}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        {currentPage < totalPages && (
          <button onClick={() => handlePageChange(currentPage + 1)}>
            <IoIosArrowForward />
          </button>
        )}
      </div>
    </div>
  );
}
