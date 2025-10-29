'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MdOutlineElectricBolt } from "react-icons/md";
import { TbCurrencyBaht } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useLocale } from '@/app/Context/LocaleContext';
import '@/styles/products.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// ===== Helper Functions =====
const slugify = (name) =>
  name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

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

const getImageUrl = (path) => {
  if (!path) return '/images/no-image.jpg';
  if (path.startsWith('http')) return path;
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return '/images/no-image.jpg';
  }
};

// ===== Skeleton Loader =====
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

// ===== Main Component =====
export default function ProductsPage() {
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // ===== โหลด API =====
  useEffect(() => {
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
              isPromotion: p.productpro_ispromotion,
              discountPercent: p.productpro_percent,
            };
          });

          setProducts(formatted);

          // รวม brand ทั้งหมด
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
  }, []);

  // ===== อ่านค่า filter จาก URL =====
  useEffect(() => {
    const catParam = searchParams.get('categories');
    const brandParam = searchParams.get('brands');

    if (categories.length > 0 && brands.length > 0) {
      if (catParam) {
        const catSlugs = catParam.split(',');
        const matched = categories
          .filter(c => catSlugs.includes(slugify(c.producttypenameEN)))
          .map(c => Number(c.producttypeID));
        setSelectedCategories(matched);
        setFilteredBrands(brands.filter(b => matched.some(id => b.categoryIds.includes(id))));
      } else {
        setSelectedCategories([]);
        setFilteredBrands(brands);
      }

      if (brandParam) {
        const brandSlugs = brandParam.split(',');
        const matched = brands
          .filter(b => brandSlugs.includes(slugify(b.brandName)))
          .map(b => b.brandName);
        setSelectedBrands(matched);
      } else {
        setSelectedBrands([]);
      }
    }
  }, [searchParams, categories, brands]);

  // ===== อัปเดต URL เมื่อเลือก filter =====
  const updateUrl = (newCategories, newBrands) => {
    const params = new URLSearchParams();

    if (newCategories.length > 0) {
      const catSlugs = newCategories
        .map(id => {
          const cat = categories.find(c => Number(c.producttypeID) === id);
          return cat ? slugify(cat.producttypenameEN) : null;
        })
        .filter(Boolean);
      params.set('categories', catSlugs.join(','));
    }

    if (newBrands.length > 0) {
      const brandSlugs = newBrands.map(b => slugify(b));
      params.set('brands', brandSlugs.join(','));
    }

    const query = params.toString();
    router.replace(`/products${query ? `?${query}` : ''}`, { shallow: true });
  };

  // ===== Handler: toggle category =====
  const toggleCategory = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);
    const filtered = brands.filter(b => newCategories.some(id => b.categoryIds.includes(id)));
    setFilteredBrands(filtered);
    setCurrentPage(1);

    updateUrl(newCategories, selectedBrands);
  };

  // ===== Handler: toggle brand =====
  const toggleBrand = (brandName) => {
    const normalized = normalizeBrandName(brandName);
    const newBrands = selectedBrands.includes(normalized)
      ? selectedBrands.filter(b => b !== normalized)
      : [...selectedBrands, normalized];

    setSelectedBrands(newBrands);
    setCurrentPage(1);

    updateUrl(selectedCategories, newBrands);
  };

  // ===== ฟิลเตอร์ข้อมูล =====
  const filteredItems = useMemo(() => {
    return products.filter(item => {
      const inCategory =
        selectedCategories.length === 0 || selectedCategories.includes(item.categoryId);
      const inBrand =
        selectedBrands.length === 0 || selectedBrands.includes(normalizeBrandName(item.brandName));
      return inCategory && inBrand;
    });
  }, [products, selectedCategories, selectedBrands]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setIsFading(true);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrentPage(page);
        setIsFading(false);
      }, 250);
    }
  };

  // ===== Render =====
  return (
    <main className="products-container">
      {/* Sidebar */}
      <aside className="products-sidebar">
        <div className="sidebar-header">คัดกรองสินค้า</div>

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

        {selectedCategories.length > 0 && (
          <>
            <hr className="divider" />
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
          </>
        )}

        {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
          <button
            className="resetbutton"
            onClick={() => {
              setSelectedCategories([]);
              setSelectedBrands([]);
              setFilteredBrands(brands);
              setCurrentPage(1);
              router.replace('/products', { shallow: true });
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
                const discount = item.isPromotion === "1" ? parseFloat(item.discountPercent) : 0;
                const finalPrice = discount > 0
                  ? item.price - (item.price * discount / 100)
                  : item.price;

                return (
                  <Link
                    key={item.num}
                    href={`/products/${item.categoryId}/${item.brandId}/${item.num}`}
                    className="product-card fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
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
                        <div className="product-promo-ribbon">- {item.discountPercent}</div>
                      )}
                    </div>

                    <div className="product-info">
                      <h3>{item.modelair || item.model || item.solarpanel}</h3>
                      {item.battery && <h6>รุ่นแบตเตอรี่ {item.battery} kWh</h6>}

                      {item.isprice === "0" && item.size && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: 600,
                            fontSize: 20,
                            marginTop: '0',
                            color: '#000',
                            gap: 2,
                          }}
                        >
                          <MdOutlineElectricBolt size={25} color="#ffc300" />
                          {item.size}
                        </div>
                      )}

                      {item.isprice === "1" && item.price && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: 600,
                            fontSize: 20,
                            marginTop: '0',
                            color: '#000',
                            gap: 0,
                          }}
                        >

                          <TbCurrencyBaht size={25} color="#000" />{" "}
                          {Number(finalPrice).toLocaleString()} บาท

                          {discount > 0 && (
                            <span
                              style={{
                                fontSize: 14,
                                color: '#888',
                                textDecoration: 'line-through',
                                marginLeft: '0.5rem',
                              }}
                            >
                              {Number(item.price).toLocaleString()} บาท
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
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
