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
   ฟังก์ชัน Helper — แปลงชื่อ category/brand เป็น slug
========================================================= */
const slugify = (name) =>
  name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

/* =========================================================
   ฟังก์ชันแก้ชื่อ brand ให้เป็นรูปแบบมาตรฐาน (กันพิมพ์ผิด)
========================================================= */
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

  // ถ้ามีใน mapping → ใช้ชื่อนั้น
  // ถ้าไม่มีก็ปรับเป็นตัวใหญ่ตัวแรก เช่น "abc" → "Abc"
  return mapping[cleaned] || cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

/* =========================================================
   ฟังก์ชันสร้าง URL รูปภาพอย่างปลอดภัย
========================================================= */
const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return '/images/no-image.jpg';
  if (path.startsWith('http')) return path;

  try {
    return new URL(path, baseUrl ?? window.location.origin).toString();
  } catch (e) {
    return '/images/no-image.jpg';
  }
};
/* =========================================================
   ฟังก์ชันส่ง Log เมื่อกดดูสินค้าแต่ละตัว
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
        actionType: '1', // 1 = ดูสินค้า
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
   Skeleton — เวลาโหลดข้อมูลยังไม่มา
========================================================= */
function ProductSkeleton({ count }) {
  return (
    <div className="skeletonGridservices">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeletonCardservices">
          <div className="skeleton skeletonImageservices"></div>
          <div className="skeleton skeletonTextservices title"></div>
          <div className="skeleton skeletonTextservices subTitle"></div>
          <div className="skeleton skeletonTextservices price"></div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   Cache ข้อมูลสินค้า (ลดจำนวนเรียก API)
========================================================= */
let productsCache = {
  categories: null,
  products: null,
  brands: null,
  timestamp: 0,
};


/* =========================================================
   Component หลัก — หน้า Products
========================================================= */
export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);

  const rowsPerPage = 6;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ---------- สร้าง State ทั้งหมด ---------- */
  const [products, setProducts] = useState([]);           // รายการสินค้า
  const [categories, setCategories] = useState([]);       // หมวดหมู่
  const [brands, setBrands] = useState([]);               // ยี่ห้อทั้งหมด
  const [filteredBrands, setFilteredBrands] = useState([]); // ยี่ห้อหลัง filter

  const [selectedCategories, setSelectedCategories] = useState([]); // category ที่เลือก
  const [selectedBrands, setSelectedBrands] = useState([]);         // brand ที่เลือก

  const [loading, setLoading] = useState(true);           // สถานะโหลดข้อมูล
  const [isFading, setIsFading] = useState(false);        // เอฟเฟกต์ fade เวลาเปลี่ยนหน้า
  const [currentPage, setCurrentPage] = useState(1);      // หน้าปัจจุบันของ pagination

  const [columns, setColumns] = useState(4);              // จำนวนคอลัมน์สินค้า
  const [itemsPerPage, setItemsPerPage] = useState(20);   // จำนวนสินค้าต่อหน้า

  useEffect(() => {
    setMounted(true);

    /* ============================
       📌 คำนวณ Columns (Responsive)
       และอัปเดต itemsPerPage ภายใน
    ============================ */
    const handleResize = () => {
      const usable = window.innerWidth - 260 - 64;
      let newColumns = 1;

      if (usable >= 1500) newColumns = 5;
      else if (usable >= 1150) newColumns = 4;
      else if (usable >= 780) newColumns = 3;
      else newColumns = 2;

      // ⭐ อัปเดต columns และ itemsPerPage พร้อมกัน
      setColumns(prev => {
        if (prev === newColumns) return prev;
        setItemsPerPage(newColumns * rowsPerPage); // ⬅ set ตรงนี้เลย
        return newColumns;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    /* ============================
       📦 โหลดข้อมูลครั้งเดียว
    ============================ */
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
            headers: { "X-API-KEY": apiKey }
          }),
          fetch(`${baseUrl}/api/productpageapi?offset=0&limit=9999`, {
            headers: { "X-API-KEY": apiKey }
          })
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

        // === Group Brand ===
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

      // 🎯 Apply URL Filter (ไม่ loop)
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

      setSelectedCategories(prev =>
        JSON.stringify(prev) === JSON.stringify(sCat) ? prev : sCat
      );

      setSelectedBrands(prev =>
        JSON.stringify(prev) === JSON.stringify(sBrand) ? prev : sBrand
      );

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

    // ⭐ กลับไปหน้าแรกเมื่อ filter/load เสร็จ
    setCurrentPage(1);

    return () => window.removeEventListener("resize", handleResize);
  }, [searchParams, locale]);
  /* =========================================================
     Filtering — ฟิลเตอร์สินค้าแบบ realtime
     ใช้ useMemo เพื่อให้คำนวณเฉพาะตอนที่ products,
     selectedCategories หรือ selectedBrands เปลี่ยนจริง ๆ
     ลดการ re-render ไม่ให้หน้าเว็บช้า
  ========================================================= */
  const filteredItems = useMemo(() => {

    return products.filter((item) => {

      /* ------------------------------------------------------
         เงื่อนไข 1) ตรวจสอบว่า item อยู่ในหมวดหมู่ที่เลือกไหม
         - ถ้าไม่มีเลือก category แปลว่าแสดงทุก category
         - ถ้ามีเลือกต้องมี categoryId ที่ตรงกับ item.categoryId
      ------------------------------------------------------ */
      const inCat =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.categoryId);

      /* ------------------------------------------------------
         เงื่อนไข 2) ตรวจสอบว่า item อยู่ใน brand ที่เลือกไหม
         - ถ้าไม่มีเลือกแบรนด์ แสดงทุก brand
         - ถ้ามีเลือก ชื่อต้องตรงกับแบรนด์ที่เลือก
      ------------------------------------------------------ */
      const inBrand =
        selectedBrands.length === 0 ||
        selectedBrands.includes(normalizeBrandName(item.brandName));

      /* ------------------------------------------------------
         ถ้าผ่านทั้ง 2 เงื่อนไขแสดงสินค้าได้
      ------------------------------------------------------ */
      return inCat && inBrand;
    });

  }, [products, selectedCategories, selectedBrands]);
  // useMemo จะรันใหม่เมื่อมีสินค้าหรือ filter เปลี่ยนเท่านั้น
  // ทำให้หน้าเร็วขึ้นมาก ไม่ filter ทุกครั้งที่ re-render


  /* =========================================================
     Pagination — คำนวณจำนวนหน้าทั้งหมด
     เช่น ถ้า filteredItems มี 63 รายการ และ itemsPerPage = 20
     totalPages = 4
  ========================================================= */
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);


  /* =========================================================
     currentItems — ดึงเฉพาะสินค้าของหน้าปัจจุบัน
     ตัวอย่าง:
     - currentPage = 1 เอาสินค้า index 0–19
     - currentPage = 2 เอาสินค้า index 20–39
  ========================================================= */
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,   // index เริ่มต้น
    currentPage * itemsPerPage          // index สิ้นสุด (ไม่รวม)
  );

  /* =========================================================
     เปลี่ยนหน้า (Pagination)
  ========================================================= */
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
     Update URL หลังเลือก category / brand
     ใช้เพื่ออัปเดต query ใน URL โดยไม่ต้องรีเฟรชหน้า
  ========================================================= */
  const updateUrl = (newCategories, newBrands) => {
    const params = new URLSearchParams();

    /* --- จัดการ query ของ categories --- */
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

    /* --- จัดการ query ของ brands --- */
    if (newBrands.length > 0) {
      params.set(
        "brands",
        newBrands
          .map((b) => slugify(normalizeBrandName(b))) // ⭐ Normalize ก่อน slugify
          .join(",")
      );
    }

    /* --- อัปเดต URL ใหม่แบบไม่โหลดหน้าใหม่ --- */
    router.replace(`/products${params.size ? `?${params}` : ""}`, {
      shallow: true,
    });
  };

  /* =========================================================
     Toggle Category (เลือก / เอาออก)
     กดแล้วสลับสถานะหมวดหมู่ — เพิ่มหรือเอาออกจาก filter
  ========================================================= */
  const toggleCategory = (id) => {

    // ถ้าเลือกอยู่ → เอาออก, ถ้ายังไม่ถูกเลือก → เพิ่มเข้าไป
    const newCat = selectedCategories.includes(id)
      ? selectedCategories.filter((x) => x !== id)
      : [...selectedCategories, id];

    // อัปเดต state ของหมวดหมู่ที่เลือก
    setSelectedCategories(newCat);

    /* --------------------------------------------------------
       อัปเดต list ของแบรนด์ — ให้แสดงเฉพาะแบรนด์ที่อยู่ใน
       category ที่ถูกเลือกจริง ๆ
       ถ้าเลือกหลายหมวด → รวมแบรนด์ที่อยู่ในหมวดเหล่านั้น
    -------------------------------------------------------- */
    const fb = brands.filter((b) =>
      newCat.some((c) => b.categoryIds.includes(c))
    );

    setFilteredBrands(fb);

    // เวลาเปลี่ยน category ให้กลับไปหน้าแรกของ pagination
    setCurrentPage(1);

    // อัปเดต URL ให้สะท้อนค่าที่เลือก
    updateUrl(newCat, selectedBrands);
  };

  /* =========================================================
     Toggle Brand (เลือก / เอาออก)
     สลับสถานะของแบรนด์ — ถ้าเลือกอยู่ก็เอาออก / ถ้ายังไม่เลือกก็เพิ่มเข้าไป
  ========================================================= */
  const toggleBrand = (name) => {
    // แปลงชื่อแบรนด์ให้เป็นรูปแบบมาตรฐานก่อนเทียบ (กันผิดพลาด เช่น huawel → Huawei)
    const normalized = normalizeBrandName(name);

    // ถ้าแบรนด์ถูกเลือกอยู่แล้ว > เอาออก
    // ถ้ายังไม่ถูกเลือก > เพิ่มเข้าไป
    const newBrand = selectedBrands.includes(normalized)
      ? selectedBrands.filter((b) => b !== normalized)
      : [...selectedBrands, normalized];

    // อัปเดต state ของแบรนด์ที่เลือกปัจจุบัน
    setSelectedBrands(newBrand);

    // เปลี่ยนหน้า pagination กลับไปหน้าแรกทุกครั้งที่ filter เปลี่ยน
    setCurrentPage(1);

    // อัปเดต URL ให้ตรงกับ filter ใหม่ โดยไม่รีเฟรชหน้า
    updateUrl(selectedCategories, newBrand);
  };

  const resetFilter = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setFilteredBrands(brands); // รีเซ็ตกลับทั้งหมด
    setCurrentPage(1);

    router.replace("/products", { shallow: true }); // ลบ query ออกจาก URL
  };


  /* =========================================================
     PAGE UI START — ส่วนแสดงผลหน้ารวมสินค้า
  ========================================================= */
  return (
    <main className="servicesproducts-container page-fullwidth">

      {/* ================= Sidebar (ตัวกรอง) ================ */}
      <aside className={`servicesproducts-sidebar ${isSidebarOpen ? "open" : "closed"}`}>

        {/* Header — ติดบนสุดตลอดเวลา */}
        <div
          className="sidebar-header"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          คัดกรองสินค้า
        </div>

        {/* เนื้อหาที่พับ/คลี่ได้ */}
        <div className="sidebar-body">

          {/* หมวดหมู่สินค้า */}
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
                    {locale === "en"
                      ? cat.producttypenameEN
                      : cat.producttypenameTH}
                  </label>
                ))
              )}
            </div>
          </section>

          {/* ยี่ห้อ */}
          {selectedCategories.length > 0 && (
            <>
              <hr className="divider" />
              <section>
                <h3 className="font-500orange">ยี่ห้อ</h3>
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

          {/* ปุ่มรีเซ็ต */}
          {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
            <button className="resetbutton" onClick={resetFilter}>
              รีเซ็ตการกรองสินค้า
            </button>
          )}
        </div>
      </aside>


      {/* ================= Product List — รายการสินค้า ================ */}
      <section className="servicesproducts-list">
        <h2>
          {loading
            ? "กำลังโหลดข้อมูลสินค้า..."
            : `สินค้าทั้งหมด ${filteredItems.length} รายการ`}
        </h2>

        {/* ========== Skeleton ระหว่างโหลด ========== */}
        {loading ? (
          <ProductSkeleton count={itemsPerPage} />

        ) : currentItems.length === 0 ? (
          /* กรณีไม่มีสินค้า */
          <p className="no-products">ไม่มีสินค้าในตอนนี้</p>

        ) : (
          <>
            {/* ================= Grid สินค้า ================= */}
            <div className="servicesproducts-grid">
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

                /* ============ Card สินค้าแต่ละตัว ============ */
                return (
                  <Link
                    key={`${item.num}-${index}-${currentPage}`}
                    href={`/products/${typeSlug}/${brandSlug}/${item.num}`}
                    className="servicesproduct-card fade-inproduck"
                    onClick={() => handleLogClick(item)} // log การคลิกสินค้า
                  >
                    {/* รูปสินค้า */}
                    <div className="servicesproduct-image-wrapper">
                      <Image
                        src={getImageUrl(item.mainImage)}
                        alt={item.model || item.solarpanel}
                        width={300}
                        height={300}
                        style={{ objectFit: "cover" }}
                      />


                      {/* ป้ายลดราคา */}
                      {item.isPromotion === "1" && item.discountPercent && (
                        <div className="servicesproduct-promo-ribbon">
                          - {item.discountPercent}
                        </div>
                      )}
                    </div>

                    {/* ข้อมูลสินค้า */}
                    <div className="servicesproduct-info">
                      <h3>{item.modelair || item.model || item.solarpanel}</h3>

                      {item.battery && (
                        <h6 style={{ marginTop: '-0.5rem' }}>รุ่นแบตเตอรี่ {item.battery} kWh</h6>
                      )}

                      {/* แสดงขนาด */}
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

                      {/* แสดงราคา */}
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
                                textDecoration: "line-through", // ขีดฆ่าราคาเดิม เพื่อแสดงว่ามีส่วนลด
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

            {/* ================= Pagination ================= */}
            {totalPages > 1 && (
              <div
                className="pagination-controls"
                style={{ marginTop: "1.5rem" }}
              >
                <div className="page-buttons">

                  {/* ปุ่มย้อนกลับ */}
                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="btn-with-arrow"
                    >
                      <IoIosArrowBack className="arrow-icon" />
                    </button>
                  )}

                  {/* เลขหน้า */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? "active-page" : ""}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {/* ปุ่มหน้าถัดไป */}
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
