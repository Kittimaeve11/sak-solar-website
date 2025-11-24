"use client";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function Pagination({ currentPage, totalPages, handlePageChange }) {
  const pages = [];

  if (currentPage > 1) {
    pages.push(
      <button key="prev" className="btn-with-arrow" onClick={() => handlePageChange(currentPage - 1)}>
        <IoIosArrowBack />
      </button>
    );
  }

  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      <button
        key={i}
        className={i === currentPage ? "active-page" : ""}
        onClick={() => handlePageChange(i)}
      >
        {i}
      </button>
    );
  }

  if (currentPage < totalPages) {
    pages.push(
      <button key="next" className="btn-with-arrow" onClick={() => handlePageChange(currentPage + 1)}>
        <IoIosArrowForward />
      </button>
    );
  }

  return <div className="page-buttons">{pages}</div>;
}
