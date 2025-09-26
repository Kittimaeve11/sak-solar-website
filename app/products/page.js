'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MdOutlineElectricBolt } from "react-icons/md";
import { TbCurrencyBaht } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Link from 'next/link';
import { useLocale } from '@/app/Context/LocaleContext';
import '@/styles/products.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function ProductsPage() {
  const { locale } = useLocale();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fade effect state
  const [isFading, setIsFading] = useState(false);

  /* ====== Helper: รูปภาพ ====== */
  const getImageUrl = (path) => {
    if (!path) return '/images/no-image.jpg';
    if (path.startsWith('http')) return path;
    try {
      return new URL(path, baseUrl).toString();
    } catch {
      return '/images/no-image.jpg';
    }
  };

  /* ====== โหลดข้อมูล API ====== */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // โหลด Header (หมวดหมู่ + ยี่ห้อ)
        const resHeader = await fetch(`${baseUrl}/api/productHeaderapi`, {
          headers: { 'X-API-KEY': apiKey }
        });
        const headerData = await resHeader.json();
        if (headerData.status && Array.isArray(headerData.result)) {
          setCategories(headerData.result);
          const allBrands = headerData.result.flatMap(cat => cat.Brand || []);
          setBrands(allBrands);
          setFilteredBrands(allBrands);
        }

        // โหลดสินค้าทั้งหมด
        const resProducts = await fetch(`${baseUrl}/api/productpageapi?offset=0&limit=9999`, {
          headers: { 'X-API-KEY': apiKey }
        });
        const data = await resProducts.json();

        if (data.status && Array.isArray(data.result?.data)) {
          const formatted = data.result.data.map(p => {
            let mainImage = "";
            try {
              const gallery = JSON.parse(p.gallery || "[]");
              mainImage = gallery[0] || "";
            } catch {
              mainImage = "";
            }

            return {
              id: p.product_ID,
              num: p.product_num,
              model: p.modelname,
              modelair: p.modelairname,
              solarpanel: p.solarpanel,
              size: p.installationsize,
              price: parseFloat(p.price) || null,
              isprice: p.isprice,
              battery: p.battery,
              mainImage,
              categoryId: p.protypeID,
              brandId: p.probrandID,
              product_pin: p.product_pin || "0",
            };
          });

          setProducts(formatted);
        }
      } catch (err) {
        console.error("API Error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ====== Toggle Category (แก้ใหม่) ====== */
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      let newCategories;
      if (prev.includes(categoryId)) {
        newCategories = prev.filter(c => c !== categoryId);
      } else {
        newCategories = [...prev, categoryId];
      }

      // ฟิลเตอร์ยี่ห้อทันที
      let filtered = [];
      if (newCategories.length === 0) {
        filtered = brands;
      } else {
        filtered = categories
          .filter(cat => newCategories.includes(cat.producttypeID))
          .flatMap(cat => cat.Brand || []);
      }
      setFilteredBrands(filtered);

      // เคลียร์ selectedBrands ที่ไม่เกี่ยวข้อง
      setSelectedBrands(prevBrands =>
        prevBrands.filter(b => filtered.some(fb => fb.productbrandID === b))
      );

      setCurrentPage(1);
      return newCategories;
    });
  };

  /* ====== Toggle Brand ====== */
  const toggleBrand = (brandId) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(b => b !== brandId)
        : [...prev, brandId]
    );
    setCurrentPage(1);
  };

  /* ====== Filtered Items ====== */
  const filteredItems = products.filter(item => {
    const matchCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.categoryId);
    const matchBrand =
      selectedBrands.length === 0 ||
      selectedBrands.includes(item.brandId);
    return matchCategory && matchBrand;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <p>กำลังโหลด...</p>;

  // handlePageChange with fade-in + scroll top (ไม่เห็นการเลื่อน)
  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setIsFading(true);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        setCurrentPage(page);
        setIsFading(false);
      }, 300);
    }
  };

  return (
    <main className="products-container">
      {/* Sidebar */}
      <aside className="products-sidebar">
        <div className="sidebar-header">คัดกรองสินค้า</div>

        {/* Categories */}
        <section>
          <h3>หมวดหมู่สินค้า</h3>
          <div className="filter-box">
            {categories.map(cat => (
              <label key={cat.producttypeID} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.producttypeID)}
                  onChange={() => toggleCategory(cat.producttypeID)}
                />
                {locale === 'en'
                  ? cat.producttypenameEN
                  : cat.producttypenameTH}
              </label>
            ))}
          </div>
        </section>
        <hr className="divider" />

        {/* Brands */}
        {selectedCategories.length > 0 && (
          <section>
            <h3>ยี่ห้อ</h3>
            <div className="filter-box">
              {filteredBrands.map(b => (
                <label key={b.productbrandID} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b.productbrandID)}
                    onChange={() => toggleBrand(b.productbrandID)}
                  />
                  {b.productbrandname}
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Reset */}
        {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
          <button
            className="resetbutton"
            style={{ display: 'block', margin: '16px auto 0 auto' }}
            onClick={() => {
              setSelectedCategories([]);
              setSelectedBrands([]);
              setFilteredBrands(brands);
              setCurrentPage(1);
            }}
          >
            รีเซ็ตการกรองสินค้า
          </button>
        )}
      </aside>

      {/* Products */}
      <section className="products-list">
        <h2>{`สินค้าทั้งหมด ${filteredItems.length} รายการ`}</h2>

        {currentItems.length === 0 ? (
          <p className="no-products">ไม่มีสินค้าในตอนนี้</p>
        ) : (
          <>
            <div className={`products-grid ${isFading ? 'fade' : ''}`}>
              {currentItems.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/products/${item.categoryId}/${item.brandId}/${item.id}`}
                  className="product-card fade-in"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Image */}
                  {item.mainImage && (
                    <div className="product-image-wrapper" style={{ position: "relative" }}>
                      <Image
                        src={getImageUrl(item.mainImage)}
                        alt={item.model || item.solarpanel}
                        width={285}
                        height={285}
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="product-info">
                    <h3 className="product-name">
                      {item.modelair || item.model || item.solarpanel}
                    </h3>

                    {item.battery && (
                      <h6 className="product-battery">
                        รุ่นแบตเตอรี่ {item.battery} kWh
                      </h6>
                    )}

                    {item.isprice === "0" && item.size && (
                      <p style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
                        <MdOutlineElectricBolt size={25} color="#ffc300" /> {item.size}
                      </p>
                    )}

                    {item.isprice === "1" && item.price && (
                      <p style={{ display: "inline-flex", alignItems: "center", fontWeight: 600, fontSize: "20px", margin: 0 }}>
                        <TbCurrencyBaht size={25} /> {Number(item.price).toLocaleString()} บาท
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-controls" style={{ marginTop: '1.5rem' }}>
                <div className="page-buttons">
                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="btn-with-arrow"
                    >
                      <IoIosArrowBack className="arrow-icon" />
                    </button>
                  )}

                  {(() => {
                    const pages = [];
                    const totalNumbers = 5;
                    const totalBlocks = totalNumbers + 2;

                    if (totalPages > totalBlocks) {
                      const startPage = Math.max(2, currentPage - 2);
                      const endPage = Math.min(totalPages - 1, currentPage + 2);

                      if (1 < startPage)
                        pages.push(
                          <button
                            key={1}
                            onClick={() => handlePageChange(1)}
                            className={currentPage === 1 ? "active-page" : ""}
                          >
                            1
                          </button>
                        );

                      if (startPage > 2)
                        pages.push(<span key="start-ellipsis">...</span>);

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={currentPage === i ? "active-page" : ""}
                          >
                            {i}
                          </button>
                        );
                      }

                      if (endPage < totalPages - 1)
                        pages.push(<span key="end-ellipsis">...</span>);

                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className={currentPage === totalPages ? "active-page" : ""}
                        >
                          {totalPages}
                        </button>
                      );
                    } else {
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={currentPage === i ? "active-page" : ""}
                          >
                            {i}
                          </button>
                        );
                      }
                    }

                    return pages;
                  })()}

                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="btn-with-arrow"
                    >
                      <IoIosArrowForward className="arrow-icon" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}