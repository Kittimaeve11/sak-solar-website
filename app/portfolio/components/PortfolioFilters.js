'use client';

import React from 'react';
import { IoIosArrowDown } from 'react-icons/io';

export default function PortfolioFilters({ locale, filter, setFilter, types, setCurrentPage }) {
  return (
    <div className="portfolio-filters">
      <label htmlFor="filter-select" className="filter-label">
        {locale === 'th' ? 'เลือกประเภทผลงาน :' : 'Select Portfolio Type:'}
      </label>

      <div className="filter-row">
        <div className="select-wrapper">
          <select
            id="filter-select"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1); // reset หน้า
            }}
            className="filter-dropdown"
          >
            <option value="ทั้งหมด">
              {locale === 'th' ? 'ผลงานทั้งหมด' : 'All Portfolios'}
            </option>

            {types.map((type) => (
              <option key={type.portfoliotypeID} value={type.portfoliotypeID}>
                {locale === 'th' ? type.portfoliotypenameTH : type.portfoliotypenameEN}
              </option>
            ))}
          </select>

          <IoIosArrowDown className="dropdown-icon" />
        </div>
      </div>
    </div>
  );
}
