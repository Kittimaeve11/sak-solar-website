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

// --- helper: slugify ---
const slugify = (name) =>
  name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

// --- helper: normalize brand name ---
const normalizeBrandName = (name) => {
  if (!name) return "";
  const cleaned = name.trim().toLowerCase();
  const mapping = {
    "huawel": "Huawei",
    "huawei": "Huawei",
    "deye": "Deye",
    "growatt": "Growatt",
    "sinclair": "Sinclair"
  };
  return mapping[cleaned] || cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

// --- helper: get image url ---
const getImageUrl = (path) => {
  if (!path) return '/images/no-image.jpg';
  if (path.startsWith('http')) return path;
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return '/images/no-image.jpg';
  }
};

// --- Skeleton ---
function ProductSkeleton({ count = 8 }) {
  return (
    <div className="skeletonGrid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeletonCard">
          <div className="skeletonImage"></div>
          <div className="skeletonText title"></div>
          <div className="skeletonText subTitle"></div>
          <div className="skeletonText price"></div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const { locale } = useLocale();
  const params = useParams();
  const typeParam = params?.typeID ? decodeURIComponent(params.typeID) : null;
  const brandParam = params?.brandID ? decodeURIComponent(params.brandID) : null;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // --- โหลด API ---
  useEffect(() => {
    if (products.length > 0 && categories.length > 0) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [resHeader, resProducts] = await Promise.all([
          fetch(`${baseUrl}/api/productHeaderapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/productpageapi?offset=0&limit=9999`, { headers: { 'X-API-KEY': apiKey } })
        ]);

        const headerData = await resHeader.json();
        const productData = await resProducts.json();

        if (headerData?.status && Array.isArray(headerData.result)) {
          setCategories(headerData.result);
        }

        if (productData?.status && Array.isArray(productData.result?.data)) {
          const formatted = productData.result.data.map(p => {
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
              brandId: Number(p.probrandID),
              brandName: normalizeBrandName(p.BrandProduct_name),
              brandOrder: p.BrandProduct_order ? Number(p.BrandProduct_order) : 9999,
              product_pin: p.product_pin || "0",
              isPromotion: p.productpro_ispromotion,
              discountPercent: p.productpro_percent,
              promoPrice: p.productpro_discountorice
                ? parseFloat(p.productpro_discountorice)
                : null,
            };
          });

          setProducts(formatted);

          // build brand list
          const brandMap = new Map();
          formatted.forEach(item => {
            const normalized = normalizeBrandName(item.brandName);
            if (!brandMap.has(normalized)) {
              brandMap.set(normalized, {
                brandName: normalized,
                brandId: item.brandId,
                categoryIds: [item.categoryId],
                order: item.brandOrder
              });
            } else {
              const exist = brandMap.get(normalized);
              if (!exist.categoryIds.includes(item.categoryId)) {
                exist.categoryIds.push(item.categoryId);
              }
            }
          });

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
  }, [products.length, categories.length]);

  // --- Sync filter จาก params ---
  useEffect(() => {
    if (categories.length === 0 || products.length === 0) return;

    let typeIdMap = {};
    let brandIdMap = {};

    categories.forEach(cat => {
      typeIdMap[slugify(cat.producttypenameEN)] = Number(cat.producttypeID);
      cat.Brand?.forEach(b => {
        brandIdMap[slugify(b.productbrandname)] = Number(b.productbrandID);
      });
    });

    const matchedTypeId = typeParam ? typeIdMap[typeParam] : null;
    const matchedBrandId = brandParam ? brandIdMap[brandParam] : null;

    if (matchedTypeId) {
      setSelectedCategories([matchedTypeId]);
      setFilteredBrands(brands.filter(b => b.categoryIds.includes(matchedTypeId)));
    } else {
      setSelectedCategories([]);
      setFilteredBrands(brands);
    }

    if (matchedBrandId) {
      const matchedBrand = brands.find(b => b.brandId === matchedBrandId);
      if (matchedBrand) {
        setSelectedBrands([matchedBrand.brandName]);
      }
    } else {
      setSelectedBrands([]);
    }

    setCurrentPage(1);
  }, [typeParam, brandParam, locale, categories, products, brands]);

  // --- filter items ---
  const filteredItems = useMemo(() => {
    return products.filter(item => {
      const inCategory = selectedCategories.length === 0 || selectedCategories.includes(item.categoryId);
      const inBrand = selectedBrands.length === 0 || selectedBrands.includes(normalizeBrandName(item.brandName));
      return inCategory && inBrand;
    });
  }, [products, selectedCategories, selectedBrands]);

  // --- pagination ---
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- handlers ---
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      let newCategories = prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId];

      let filtered = [];
      if (newCategories.length > 0) {
        filtered = brands.filter(b => b.categoryIds.some(cid => newCategories.includes(cid)));
      }

      setFilteredBrands(filtered);
      setSelectedBrands(prevBrands => prevBrands.filter(bName => filtered.some(fb => fb.brandName === bName)));
      setCurrentPage(1);
      return newCategories;
    });
  };

  const toggleBrand = (brandName) => {
    const normalized = normalizeBrandName(brandName);
    setSelectedBrands(prev =>
      prev.includes(normalized)
        ? prev.filter(b => b !== normalized)
        : [...prev, normalized]
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

  // --- render ---
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

        {loading ? (
          <ProductSkeleton count={8} />
        ) : currentItems.length === 0 ? (
          <p className="no-products">ไม่มีสินค้าในตอนนี้</p>
        ) : (
          <>
            <div className={`products-grid ${isFading ? 'fade' : ''}`}>
              {currentItems.map((item, index) => {
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
                    key={item.num}
                    href={`/products/${item.categoryId}/${item.brandId}/${item.num}`}
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
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <p style={{
                              display: "inline-flex",
                              alignItems: "center",
                              fontWeight: 600,
                              fontSize: "20px",
                              margin: 0,
                            }}>
                              <TbCurrencyBaht size={25} color="#000" />{" "}
                              {Number(item.isPromotion === "1" && item.discountPercent ? finalPrice : item.price).toLocaleString()} บาท
                            </p>

                            {item.isPromotion === "1" && item.discountPercent && (
                              <span style={{
                                fontSize: "14px",
                                color: "#888",
                                textDecoration: "line-through",
                              }}>
                                {Number(item.price).toLocaleString()} บาท
                              </span>
                            )}
                          </div>
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

