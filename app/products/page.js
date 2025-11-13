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

/* =========================================================
   Helper
========================================================= */
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
    "sinclair": "Sinclair",
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

/* =========================================================
   Log
========================================================= */
const handleLogClick = async (item) => {
  try {
    await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({
        actionType: '1',
        actionDetail: `หน้าผลิตภัณฑ์ รหัส: ${item.id} หมายเลขผลิตภัณฑ์: ${item.num}`,
        typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
        datatype: 'ผลิตภัณฑ์',
        dataID: item.id ?? '0',
        datatypeID: item.categoryId ?? '0',
        brandtype: item.brandId ?? '0',
        dataname: item.num ?? '-',
      }),
    });
  } catch (e) { }
};

/* =========================================================
   Skeleton
========================================================= */
function ProductSkeleton({ count }) {
  return (
    <div className="skeletonGrid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeletonCard">
          <div className="skeleton skeletonImage"></div>
          <div className="skeleton skeletonText title"></div>
          <div className="skeleton skeletonText subTitle"></div>
          <div className="skeleton skeletonText price"></div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   Cache
========================================================= */
let productsCache = {
  categories: null,
  products: null,
  brands: null,
  timestamp: 0,
};

/* =========================================================
   Component
========================================================= */
export default function ProductsPage() {
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  /* States */
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [columns, setColumns] = useState(4);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  /* =========================================================
     useEffect เดียว (โหลดข้อมูล + คำนวณคอลัมน์)
  ========================================================== */
  useEffect(() => {
    const handleResize = () => {
      const usable = window.innerWidth - 260 - 64;
      if (usable >= 1500) setColumns(5);
      else if (usable >= 1150) setColumns(4);
      else if (usable >= 780) setColumns(3);
      else setColumns(2);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const loadData = async () => {
      let categoriesData, productsData, brandsData;

      const cacheAge = Date.now() - productsCache.timestamp;
      const useCache =
        productsCache.products &&
        productsCache.categories &&
        productsCache.brands &&
        cacheAge < 1000 * 60 * 15;

      if (useCache) {
        categoriesData = productsCache.categories;
        productsData = productsCache.products;
        brandsData = productsCache.brands;
      } else {
        setLoading(true);

        const [resHeader, resProducts] = await Promise.all([
          fetch(`${baseUrl}/api/productHeaderapi`, {
            headers: { "X-API-KEY": apiKey },
          }),
          fetch(`${baseUrl}/api/productpageapi?offset=0&limit=9999`, {
            headers: { "X-API-KEY": apiKey },
          }),
        ]);

        const headerJSON = await resHeader.json();
        const productJSON = await resProducts.json();

        categoriesData = headerJSON.result;

        const formatted = productJSON.result.data.map((p) => {
          let mainImage = "";
          try {
            const g = JSON.parse(p.gallery || "[]");
            mainImage = g[0] || "";
          } catch { }

          return {
            id: p.product_ID,
            num: p.product_num,
            model: p.modelname,
            modelair: p.modelairname,
            solarpanel: p.solarpanel,
            size: p.installationsize,
            price: parseFloat(p.price),
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

        productsData = formatted;

        const brandMap = new Map();
        formatted.forEach((item) => {
          const normalized = normalizeBrandName(item.brandName);

          if (!brandMap.has(normalized)) {
            brandMap.set(normalized, {
              brandName: normalized,
              brandId: item.brandId,
              categoryIds: [item.categoryId],
              order: item.brandOrder,
            });
          } else {
            const ex = brandMap.get(normalized);
            if (!ex.categoryIds.includes(item.categoryId)) {
              ex.categoryIds.push(item.categoryId);
            }
          }
        });

        brandsData = Array.from(brandMap.values()).sort(
          (a, b) => a.order - b.order
        );

        productsCache = {
          categories: categoriesData,
          products: productsData,
          brands: brandsData,
          timestamp: Date.now(),
        };
      }

      setCategories(categoriesData);
      setProducts(productsData);
      setBrands(brandsData);

      /* URL parameters */
      const catParam = searchParams.get("categories");
      const brandParam = searchParams.get("brands");

      let sCat = [];
      let sBrand = [];

      if (catParam) {
        const sl = catParam.split(",");
        sCat = categoriesData
          .filter((c) => sl.includes(slugify(c.producttypenameEN)))
          .map((c) => Number(c.producttypeID));
      }

      if (brandParam) {
        const bl = brandParam.split(",");
        sBrand = brandsData
          .filter((b) => bl.includes(slugify(b.brandName)))
          .map((b) => b.brandName);
      }

      setSelectedCategories(sCat);
      setSelectedBrands(sBrand);

      const fb =
        sCat.length > 0
          ? brandsData.filter((b) =>
            sCat.some((id) => b.categoryIds.includes(id))
          )
          : brandsData;

      setFilteredBrands(fb);

      setLoading(false);
    };

    loadData();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* =========================================================
     Items per page ตาม columns
  ========================================================== */
  useEffect(() => {
    if (columns === 5) setItemsPerPage(20);
    else if (columns === 4) setItemsPerPage(20);
    else if (columns === 3) setItemsPerPage(15);
    else setItemsPerPage(10);

    setCurrentPage(1);
  }, [columns]);

  /* =========================================================
     Filtering
  ========================================================== */
  const filteredItems = useMemo(() => {
    return products.filter((item) => {
      const inCat =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.categoryId);

      const inBrand =
        selectedBrands.length === 0 ||
        selectedBrands.includes(normalizeBrandName(item.brandName));

      return inCat && inBrand;
    });
  }, [products, selectedCategories, selectedBrands]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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


  /* =========================================================
     Update Query
  ========================================================== */
  const updateUrl = (newCategories, newBrands) => {
    const params = new URLSearchParams();

    if (newCategories.length > 0) {
      params.set(
        "categories",
        newCategories
          .map((id) => {
            const c = categories.find((x) => Number(x.producttypeID) === id);
            return c ? slugify(c.producttypenameEN) : null;
          })
          .filter(Boolean)
          .join(",")
      );
    }

    if (newBrands.length > 0) {
      params.set(
        "brands",
        newBrands.map((b) => slugify(b)).join(",")
      );
    }

    router.replace(`/products${params.size ? `?${params}` : ""}`, {
      shallow: true,
    });
  };

  /* =========================================================
     Toggle Category
  ========================================================== */
  const toggleCategory = (id) => {
    const newCat = selectedCategories.includes(id)
      ? selectedCategories.filter((x) => x !== id)
      : [...selectedCategories, id];

    setSelectedCategories(newCat);

    const fb = brands.filter((b) =>
      newCat.some((c) => b.categoryIds.includes(c))
    );
    setFilteredBrands(fb);
    setCurrentPage(1);

    updateUrl(newCat, selectedBrands);
  };

  /* =========================================================
     Toggle Brand
  ========================================================== */
  const toggleBrand = (name) => {
    const normalized = normalizeBrandName(name);

    const newBrand = selectedBrands.includes(normalized)
      ? selectedBrands.filter((b) => b !== normalized)
      : [...selectedBrands, normalized];

    setSelectedBrands(newBrand);
    setCurrentPage(1);

    updateUrl(selectedCategories, newBrand);
  };

  /* =========================================================
     PAGE UI START
  ========================================================== */
  return (
    <main className="products-container page-fullwidth">
      {/* ================= Sidebar ================ */}
      <aside className="products-sidebar">
        <div className="sidebar-header">คัดกรองสินค้า</div>

        <section>
          <h3 className="font-500orange">หมวดหมู่สินค้า</h3>
          <div className="filter-box">
            {loading ? (
              <p style={{ color: "#888", fontSize: 14 }}>กำลังโหลดหมวดหมู่...</p>
            ) : (
              categories.map((cat) => (
                <label key={cat.producttypeID} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(Number(cat.producttypeID))}
                    onChange={() => toggleCategory(Number(cat.producttypeID))}
                  />
                  {locale === "en"
                    ? cat.producttypenameEN
                    : cat.producttypenameTH}
                </label>
              ))
            )}
          </div>
        </section>

        {/* BRAND FILTER */}
        {selectedCategories.length > 0 && !loading && (
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

        {(selectedCategories.length > 0 || selectedBrands.length > 0) &&
          !loading && (
            <button
              className="resetbutton"
              onClick={() => {
                setSelectedCategories([]);
                setSelectedBrands([]);
                setFilteredBrands(brands);
                setCurrentPage(1);
                router.replace("/products", { shallow: true });
              }}
            >
              รีเซ็ตการกรองสินค้า
            </button>
          )}
      </aside>

      {/* ================= Product List ================ */}
      <section className="products-list">
        <h2>
          {loading
            ? "กำลังโหลดข้อมูลสินค้า..."
            : `สินค้าทั้งหมด ${filteredItems.length} รายการ`}
        </h2>

        {/* ========== Skeleton ========== */}
        {loading ? (
          <ProductSkeleton count={itemsPerPage} />
        ) : currentItems.length === 0 ? (
          <p className="no-products">ไม่มีสินค้าในตอนนี้</p>
        ) : (
          <>
            <div className="products-grid">
              {currentItems.map((item, index) => {
                const discount =
                  item.isPromotion === "1"
                    ? parseFloat(item.discountPercent)
                    : 0;

                const finalPrice =
                  discount > 0
                    ? item.price - item.price * (discount / 100)
                    : item.price;

                const typeSlug = slugify(
                  categories.find(
                    (c) => Number(c.producttypeID) === item.categoryId
                  )?.producttypenameEN || ""
                );

                const brandSlug = slugify(item.brandName);

                /* 
                 ================ 
                 ส่วนแสดงผลสินค้า 
                 ================ 
                 Eve บอก "ไม่ต้องตัด" 
                */

                return (
                  <Link
                    key={item.num}
                    href={`/products/${typeSlug}/${brandSlug}/${item.num}`}
                    className="product-card fade-inproduck"
                    onClick={() => handleLogClick(item)}
                  >
                    <div className="product-image-wrapper">
                      <Image
                        src={getImageUrl(item.mainImage)}
                        alt={item.model || item.solarpanel}
                        fill
                        unoptimized
                        priority={index === 0}
                        style={{ objectFit: "cover" }}
                      />

                      {item.isPromotion === "1" && item.discountPercent && (
                        <div className="product-promo-ribbon">
                          - {item.discountPercent}%
                        </div>
                      )}
                    </div>

                    <div className="product-info">
                      <h3>{item.modelair || item.model || item.solarpanel}</h3>

                      {item.battery && (
                        <h6>รุ่นแบตเตอรี่ {item.battery} kWh</h6>
                      )}

                      {item.isprice === "0" && item.size && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            fontWeight: 600,
                            fontSize: 20,
                            color: "#000",
                          }}
                        >
                          <MdOutlineElectricBolt size={25} color="#ffc300" />
                          {item.size}
                        </div>
                      )}

                      {item.isprice === "1" && item.price && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontWeight: 600,
                            fontSize: 20,
                            color: "#000",
                          }}
                        >
                          <TbCurrencyBaht size={25} />
                          {Number(finalPrice).toLocaleString()} บาท
                          {discount > 0 && (
                            <span
                              style={{
                                marginLeft: 4,
                                fontSize: 14,
                                textDecoration: "line-through",
                                color: "#999",
                              }}
                            >
                              {Number(item.price).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ========== Pagination ========== */}
            {totalPages > 1 && (
              <div className="pagination-controls" style={{ marginTop: "1.5rem" }}>
                <div className="page-buttons">

                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="btn-with-arrow"
                    >
                      <IoIosArrowBack className="arrow-icon" />
                    </button>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={currentPage === page ? "active-page" : ""}
                    >
                      {page}
                    </button>
                  ))}

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
