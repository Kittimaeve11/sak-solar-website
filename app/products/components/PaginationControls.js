'use client';
import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function PaginationControls({ totalPages, currentPage, handlePageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-controls" style={{ marginTop: "1.5rem" }}>
      <div className="page-buttons">
        {currentPage > 1 && (
          <button onClick={() => handlePageChange(currentPage - 1)} className="btn-with-arrow">
            <IoIosArrowBack className="arrow-icon" />
          </button>
        )}

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={currentPage === page ? "active-page" : ""}
          >
            {page}
          </button>
        ))}

        {currentPage < totalPages && (
          <button onClick={() => handlePageChange(currentPage + 1)} className="btn-with-arrow">
            <IoIosArrowForward className="arrow-icon" />
          </button>
        )}
      </div>
    </div>
  );
}
