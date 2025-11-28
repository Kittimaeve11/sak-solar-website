'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from '@/app/Context/LocaleContext';
import '@/styles/products.css';

// 🧩 ใช้ Components ที่แยกไว้
import SidebarFilters from './components/SidebarFilters';
import ProductGrid from './components/ProductGrid';
import PaginationControls from './components/PaginationControls';
import ProductSkeleton from './components/ProductSkeleton';

// 🧠 ใช้ utils ที่แยกไว้
import { slugify, normalizeBrandName, getImageUrl } from './components/utils';
import { handleLogClick } from './components/handleLogClick';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* =========================================================
   Cache ข้อมูลสินค้า (ลด API เรียกซ้ำ)
========================================================= */
let productsCache = {
  categories: null,
  products: null,
  brands: null,
  timestamp: 0,
};

/* =========================================================
   Component หลัก — ProductsClient
========================================================= */
export default function ProductsClient() {
  const rowsPerPage = 6;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  /** State หลักที่ใช้ในระบบสินค้า */
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
     Responsive + โหลดข้อมูลครั้งเดียว
  ========================================================= */
  useEffect(() => {
    const handleResize = () => {
      const usable = window.innerWidth - 260 - 64;
      let newColumns = 1;
      if (usable >= 1500) newColumns = 5;
      else if (usable >= 1150) newColumns = 4;
      else if (usable >= 780) newColumns = 3;
      else newColumns = 2;

      setColumns(prev => {
        if (prev === newColumns) return prev;
        setItemsPerPage(newColumns * rowsPerPage);
        return newColumns;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    const API_ENABLED = false;

    // ถ้า API ปิด → ใช้ Static Fallback
    if (!API_ENABLED) {
      setProducts([]);
      setCategories([]);
      setBrands([]);
      setSelectedCategories([]);
      setSelectedBrands([]);
      setFilteredBrands([]);
      setLoading(false);
      return;
    }
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
          fetch(`${baseUrl}/api/productHeaderapi`, { headers: { "X-API-KEY": apiKey } }),
          fetch(`${baseUrl}/api/productpageapi?offset=0&limit=9999`, { headers: { "X-API-KEY": apiKey } })
        ]);

        const headerJSON = await resHeader.json();
        const productJSON = await resProducts.json();

        categoriesData = headerJSON.result;

        //  จัดรูปสินค้าจาก API
        productsData = productJSON.result.data.map((p) => {
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

        // 🎯 Group Brand
        const brandMap = new Map();
        productsData.forEach((item) => {
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

        brandsData = Array.from(brandMap.values()).sort((a, b) => a.order - b.order);

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

      // 🎯 URL Filter
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

      setFilteredBrands(
        sCat.length > 0
          ? brandsData.filter((b) => sCat.some((id) => b.categoryIds.includes(id)))
          : brandsData
      );

      setLoading(false);
      setCurrentPage(1);
    };

    loadData();
    return () => window.removeEventListener("resize", handleResize);
  }, [searchParams, locale]);

  /* =========================================================
     Filter
  ========================================================= */
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

  /* =========================================================
     Pagination
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
     Update URL
  ========================================================= */
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
        newBrands.map((b) => slugify(normalizeBrandName(b))).join(",")
      );
    }

    router.replace(`/products${params.size ? `?${params}` : ""}`, { shallow: true });
  };

  /* =========================================================
     Toggle Category / Brand / Reset
  ========================================================= */
  const toggleCategory = (id) => {
    const newCat = selectedCategories.includes(id)
      ? selectedCategories.filter((x) => x !== id)
      : [...selectedCategories, id];

    setSelectedCategories(newCat);
    setFilteredBrands(
      brands.filter((b) => newCat.some((c) => b.categoryIds.includes(c)))
    );
    setCurrentPage(1);
    updateUrl(newCat, selectedBrands);
  };

  const toggleBrand = (name) => {
    const normalized = normalizeBrandName(name);
    const newBrand = selectedBrands.includes(normalized)
      ? selectedBrands.filter((b) => b !== normalized)
      : [...selectedBrands, normalized];

    setSelectedBrands(newBrand);
    setCurrentPage(1);
    updateUrl(selectedCategories, newBrand);
  };

  const resetFilter = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setFilteredBrands(brands);
    setCurrentPage(1);
    router.replace("/products", { shallow: true });
  };

  /* =========================================================
     UI Render
  ========================================================= */
  return (
    <main className="servicesproducts-container page-fullwidth">
      <SidebarFilters
        categories={categories}
        filteredBrands={filteredBrands}
        selectedCategories={selectedCategories}
        selectedBrands={selectedBrands}
        loading={loading}
        locale={locale}
        toggleCategory={toggleCategory}
        toggleBrand={toggleBrand}
        resetFilter={resetFilter}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <section className="servicesproducts-list">
        <h2>
          {loading
            ? "กำลังโหลดข้อมูลสินค้า..."
            : `สินค้าทั้งหมด ${filteredItems.length} รายการ`}
        </h2>

        {loading ? (
          <ProductSkeleton count={itemsPerPage} />
        ) : currentItems.length === 0 ? (
          <p className="no-products">ไม่มีสินค้าในตอนนี้</p>
        ) : (
          <>
            <ProductGrid
              items={currentItems}
              categories={categories}
              handleLogClick={handleLogClick}
              slugify={slugify}
              getImageUrl={getImageUrl}
            />

            <PaginationControls
              totalPages={totalPages}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </main>
  );
}
