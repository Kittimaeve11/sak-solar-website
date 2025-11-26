'use client';
import React from "react";

export default function SidebarFilters({
  categories,
  filteredBrands,
  selectedCategories,
  selectedBrands,
  loading,
  locale,
  toggleCategory,
  toggleBrand,
  resetFilter,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  return (
    <aside className={`servicesproducts-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        คัดกรองสินค้า
      </div>

      <div className="sidebar-body">
        <section>
          <h3 className="font-500orange">หมวดหมู่สินค้า</h3>
          <div className="filter-box">
            {loading ? (
              <p style={{ color: "#888", fontSize: 14 }}>กำลังโหลดหมวดหมู่สินค้า...</p>
            ) : (
              categories.map((cat) => (
                <label key={cat.producttypeID} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(Number(cat.producttypeID))}
                    onChange={() => toggleCategory(Number(cat.producttypeID))}
                  />
                  {locale === "en" ? cat.producttypenameEN : cat.producttypenameTH}
                </label>
              ))
            )}
          </div>
        </section>

        {selectedCategories.length > 0 && (
          <>
            <hr className="divider" />
            <section>
              <h3 className="font-500orange">ยี่ห้อ</h3>
              <div className="filter-box">
                {filteredBrands.map((b) => (
                  <label key={b.brandId} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b.brandName)}
                      onChange={() => toggleBrand(b.brandName)}
                    />
                    {b.brandName}
                  </label>
                ))}
              </div>
            </section>
          </>
        )}

        {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
          <button className="resetbutton" onClick={resetFilter}>
            รีเซ็ตการกรองสินค้า
          </button>
        )}
      </div>
    </aside>
  );
}
