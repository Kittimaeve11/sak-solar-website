'use client';

import React from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

export default function PaginationControls({
  currentPage,
  totalPages,
  handlePageChange,
}) {
  if (totalPages <= 1) return null; // 👉 ถ้ามีหน้าเดียว ไม่ต้องแสดง

  const pages = [];
  const siblings = 2;
  const range = [1];
  const start = Math.max(2, currentPage - siblings);
  const end = Math.min(totalPages - 1, currentPage + siblings);

  if (start > 2) range.push('start-ellipsis');
  for (let i = start; i <= end; i++) range.push(i);
  if (end < totalPages - 1) range.push('end-ellipsis');
  if (totalPages > 1) range.push(totalPages);

  return (
    <div className="pagination-controls">
      <div className="page-buttons">
        {/* ⬅ ปุ่มย้อนกลับ */}
        {currentPage > 1 && (
          <button
            className="btn-with-arrow"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <IoIosArrowBack className="arrow-icon" />
          </button>
        )}

        {/* 🔢 ปุ่มตัวเลข */}
        {range.map((item, idx) =>
          item === 'start-ellipsis' || item === 'end-ellipsis' ? (
            <span key={item + idx} className="ellipsis">
              ...
            </span>
          ) : (
            <button
              key={`page-${item}`}
              className={currentPage === item ? 'active-page' : 'page-btn'}
              onClick={() => handlePageChange(item)}
            >
              {item}
            </button>
          )
        )}

        {/* ➡ ปุ่มไปหน้าถัดไป */}
        {currentPage < totalPages && (
          <button
            className="btn-with-arrow"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <IoIosArrowForward className="arrow-icon" />
          </button>
        )}
      </div>
    </div>
  );
}
