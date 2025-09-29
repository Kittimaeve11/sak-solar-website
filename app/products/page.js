'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MdOutlineElectricBolt } from "react-icons/md";
import { TbCurrencyBaht } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useLocale } from '@/app/Context/LocaleContext';
import '@/styles/products.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function ProductsPage() {
  const { locale } = useLocale();
  const params = useParams();

  const slug = params?.slug || [];
  const typeId = slug?.[0] ? Number(slug[0]) : null;
  const brandSlug = slug?.[1] || null;

  // States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  /* ===================== Helper ===================== */
  const getImageUrl = (path) => {
    if (!path) return '/images/no-image.jpg';
    if (path.startsWith('http')) return path;
    try {
      return new URL(path, baseUrl).toString();
    } catch {
      return '/images/no-image.jpg';
    }
  };

  const normalizeBrandName = (name) => {
    if (!name) return "";
    let cleaned = name.trim().toLowerCase();

    const mapping = {
      "huawel": "Huawei",
      "huawei": "Huawei",
      "deye": "Deye",
      "growatt": "Growatt",
      "sinclair": "Sinclair"
    };

    return mapping[cleaned] || cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  /* ===================== โหลด API ===================== */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Header API
        const resHeader = await fetch(`${baseUrl}/api/productHeaderapi`, {
          headers: { 'X-API-KEY': apiKey }
        });
        const headerData = await resHeader.json();
        if (headerData.status && Array.isArray(headerData.result)) {
          setCategories(headerData.result);
        }

        // Products API
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
            } catch { mainImage = ""; }

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
              categoryId: Number(p.protypeID),
              brandName: normalizeBrandName(p.BrandProduct_name),
              brandOrder: p.BrandProduct_order ? Number(p.BrandProduct_order) : 9999,
              product_pin: p.product_pin || "0",

              // ✅ เพิ่ม field เกี่ยวกับโปรโมชั่น
              isPromotion: p.productpro_ispromotion,
              discountPercent: p.productpro_percent,
              promoPrice: p.productpro_discountorice
                ? parseFloat(p.productpro_discountorice)
                : null,
            };
          });

          setProducts(formatted);

          // ดึงยี่ห้อทั้งหมดจาก product list
          const brandMap = new Map();
          formatted.forEach(item => {
            if (!brandMap.has(item.brandName)) {
              brandMap.set(item.brandName, {
                brandName: item.brandName,
                categoryIds: [item.categoryId],
                order: item.brandOrder
              });
            } else {
              const exist = brandMap.get(item.brandName);
              if (!exist.categoryIds.includes(item.categoryId)) {
                exist.categoryIds.push(item.categoryId);
              }
            }
          });

          // เรียงยี่ห้อตาม order
          const sortedBrands = Array.from(brandMap.values()).sort((a, b) => a.order - b.order);
          setBrands(sortedBrands);
        }
      } catch (err) {
        console.error("API Error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===================== Filter จาก params ===================== */
  useEffect(() => {
    if (categories.length > 0 && brands.length > 0) {
      if (typeId) {
        setSelectedCategories([typeId]);
        let filtered = brands.filter(b => b.categoryIds.includes(typeId));
        setFilteredBrands(filtered);
      }
      if (brandSlug) {
        setSelectedBrands([normalizeBrandName(brandSlug)]);
      }
    }
  }, [categories, brands, typeId, brandSlug]);

  /* ===================== Filter Logic ===================== */
  const filteredItems = useMemo(() => {
    return products.filter(item => {
      const inCategory =
        selectedCategories.length === 0 || selectedCategories.includes(item.categoryId);

      const inBrand =
        selectedBrands.length === 0 || selectedBrands.includes(item.brandName);

      return inCategory && inBrand;
    });
  }, [products, selectedCategories, selectedBrands]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  /* ===================== Event Handlers ===================== */
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      let newCategories;
      if (prev.includes(categoryId)) {
        newCategories = prev.filter(c => c !== categoryId);
      } else {
        newCategories = [...prev, categoryId];
      }

      let filtered = [];
      if (newCategories.length === 0) {
        filtered = [];
      } else {
        filtered = brands.filter(b => b.categoryIds.some(cid => newCategories.includes(cid)));
      }

      setFilteredBrands(filtered);

      setSelectedBrands(prevBrands =>
        prevBrands.filter(bName =>
          filtered.some(fb => fb.brandName === bName)
        )
      );

      setCurrentPage(1);
      return newCategories;
    });
  };

  const toggleBrand = (brandName) => {
    setSelectedBrands(prev =>
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
    setCurrentPage(1);
  };

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

  /* ===================== SEO ===================== */
  useEffect(() => {
    const loc = typeof locale === 'string' ? locale.toLowerCase() : 'th';
    const isThai = loc.startsWith('th');

    document.title = isThai
      ? 'บริการและผลิตภัณฑ์ | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด'
      : 'Products & Services | Sak Siam Solar Energy Co., Ltd.';

    const metaDescription = document.querySelector("meta[name='description']");
    const content = isThai
      ? 'บริการและผลิตภัณฑ์ของบริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด ครบวงจรโซลาร์เซลล์'
      : 'Products & services from Sak Siam Solar Energy Co., Ltd. - Solar panels, inverters, batteries, and full solar solutions';
    if (metaDescription) {
      metaDescription.setAttribute('content', content);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = content;
      document.head.appendChild(meta);
    }
  }, [locale]);

  /* ===================== Render ===================== */
  if (loading) return <p>กำลังโหลด...</p>;
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
                  checked={selectedCategories.includes(Number(cat.producttypeID))}
                  onChange={() => toggleCategory(Number(cat.producttypeID))}
                />
                {locale === 'en' ? cat.producttypenameEN : cat.producttypenameTH}
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
                <label key={b.brandName} className="checkbox-item">
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
        )}

        {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
          <button
            className="resetbutton"
            style={{ display: 'block', margin: '16px auto 0 auto' }}
            onClick={() => {
              setSelectedCategories([]);
              setSelectedBrands([]);
              setFilteredBrands([]);
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
              {currentItems.map((item, index) => {
                // ✅ คำนวณราคาส่วนลด
                let finalPrice = null;
                if (item.isprice === "1" && item.price) {
                  if (item.isPromotion === "1" && item.discountPercent) {
                    const discountPercent = parseFloat(item.discountPercent) || 0;
                    finalPrice = item.price - (item.price * discountPercent / 100);
                  } else {
                    finalPrice = item.price;
                  }
                }

                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.categoryId}/${item.brandName}/${item.id}`}
                    className="product-card fade-in"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div className="product-image-wrapper" style={{ position: "relative" }}>
                      <Image
                        src={getImageUrl(item.mainImage)}
                        alt={item.model || item.solarpanel}
                        width={285}
                        height={285}
                        unoptimized
                      />

                      {/* ริบบิ้นโปรโมชั่น */}
                      {item.isPromotion === "1" && item.discountPercent && (
                        <div className="product-promo-ribbon">
                          - {item.discountPercent}
                        </div>
                      )}
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">
                        {item.modelair || item.model || item.solarpanel}
                      </h3>

                      {item.battery && (
                        <h6 className="product-battery">รุ่นแบตเตอรี่ {item.battery} kWh</h6>
                      )}

                      {item.isprice === "0" && item.size && (
                        <p style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
                          <MdOutlineElectricBolt size={25} color="#ffc300" /> {item.size}
                        </p>
                      )}

                      {item.isprice === "1" && item.price && (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          {item.isPromotion === "1" && item.discountPercent ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              {/* ราคาหลังหักส่วนลด */}
                              <p style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0px",
                                fontWeight: 600,
                                fontSize: "20px",
                                margin: 0
                              }}>
                                <TbCurrencyBaht size={25} color="#000000ff" />{" "}
                                {Number(finalPrice).toLocaleString()} บาท
                              </p>

                              {/* ราคาจริงขีดฆ่า */}
                              <span style={{
                                fontSize: "14px",
                                color: "#888",
                                textDecoration: "line-through"
                              }}>
                                {Number(item.price).toLocaleString()} บาท
                              </span>
                            </div>
                          ) : (
                            <p style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0px",
                              fontWeight: 600
                            }}>
                              <TbCurrencyBaht size={25} color="#000000ff" />{" "}
                              {Number(item.price).toLocaleString()} บาท
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls" style={{ marginTop: '1.5rem' }}>
                <div className="page-buttons">
                  {currentPage > 1 && (
                    <button onClick={() => handlePageChange(currentPage - 1)} className="btn-with-arrow">
                      <IoIosArrowBack className="arrow-icon" />
                    </button>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
            )}
          </>
        )}
      </section>
    </main>
  );
}
