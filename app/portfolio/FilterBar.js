"use client";
import { IoIosArrowDown } from "react-icons/io";
import { useLocale } from "../Context/LocaleContext";

export default function FilterBar({ types, filter, setFilter, setCurrentPage }) {
  const { locale } = useLocale();

  return (
    <div className="portfolio-filters">
      <label htmlFor="filter-select" className="filter-label">
        {locale === "th" ? "เลือกประเภทผลงาน :" : "Select Portfolio Type:"}
      </label>
      <div className="filter-row">
        <div className="select-wrapper">
          <select
            id="filter-select"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-dropdown"
          >
            <option value="ทั้งหมด">
              {locale === "th" ? "ผลงานทั้งหมด" : "All Portfolios"}
            </option>

            {types.map((type) => (
              <option key={type.portfoliotypeID} value={type.portfoliotypeID}>
                {locale === "th"
                  ? type.portfoliotypenameTH
                  : type.portfoliotypenameEN}
              </option>
            ))}
          </select>
          <IoIosArrowDown className="dropdown-icon" />
        </div>
      </div>
    </div>
  );
}
