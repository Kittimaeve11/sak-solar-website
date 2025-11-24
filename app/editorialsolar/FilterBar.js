'use client';

import { IoIosArrowDown } from 'react-icons/io';

export default function FilterBar({ types, filter, setFilter, locale }) {
  return (
    <div className="portfolio-filters">
      <label className="filter-label">
        {locale === 'en' ? 'Select Editorial Type:' : 'เลือกประเภทบทความ :'}
      </label>
      <div className="filter-row">
        <div className="select-wrapper">
          <select
            value={filter}
            onChange={(e) => {
              const value = e.target.value;
              // ตอนนี้ setFilter ถูกส่งมาจาก page.js เป็น handleFilterChange()
              // ซึ่งภายในมันจะจัดการ reset หน้า + scrollToTitle ให้แล้ว
              setFilter(value);
            }}
            className="filter-dropdown"
          >
            <option value="ทั้งหมด">
              {locale === 'en' ? 'All Editorials' : 'บทความทั้งหมด'}
            </option>

            {types.map((t) => (
              <option key={t.TypeEditoria_id} value={t.TypeEditoria_id}>
                {locale === 'en'
                  ? t.TypeEditoria_nameEN || t.TypeEditoria_nameTH
                  : t.TypeEditoria_nameTH}
              </option>
            ))}
          </select>
          <IoIosArrowDown className="dropdown-icon" />
        </div>
      </div>
    </div>
  );
}
