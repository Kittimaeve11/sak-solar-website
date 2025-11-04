'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '../Context/LocaleContext';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { IoMenu } from 'react-icons/io5';
import '../../styles/tabmenu.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// --- helper: slugify ---
const slugify = (name) =>
  name
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // เว้นวรรค -> -
    .replace(/[^a-z0-9-]/g, ''); // ลบตัวอักษรพิเศษ

export default function TabMenu() {
  const { messages, locale } = useLocale();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [activeProductSlug, setActiveProductSlug] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState([]);

  const timeoutRef = useRef(null);

  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const isInProductsSection = pathname.startsWith('/products');

  /* ---------------- โหลด API ครั้งแรก ---------------- */
  useEffect(() => {
    const cached = sessionStorage.getItem("menuProducts");
    if (cached) {
      setProducts(JSON.parse(cached));
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/productHeaderapi`, {
          headers: { 'X-API-KEY': apiKey },
        });

        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        if (data.status && Array.isArray(data.result)) {
          const formatted = data.result.map((item) => {
            const seen = new Set();
            const uniqueBrands =
              item.Brand?.filter((b) => {
                if (seen.has(b.productbrandname)) return false;
                seen.add(b.productbrandname);
                return true;
              }) || [];

            return {
              slug: slugify(item.producttypenameEN),
              name: {
                th: item.producttypenameTH?.trim() || '',
                en: item.producttypenameEN?.trim() || '',
              },
              brands: uniqueBrands.map((b) => ({
                slug: slugify(b.productbrandname),
                name: b.productbrandname,
              })),
            };
          });

          setProducts(formatted);
          sessionStorage.setItem("menuProducts", JSON.stringify(formatted));
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  /* ---------------- handle resize ---------------- */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 991px)').matches);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  /* ---------------- mouse hover menu ---------------- */
  const handleMouseEnter = () => {
    if (!isMobile) {
      clearTimeout(timeoutRef.current);
      setServiceOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setServiceOpen(false);
        setActiveProductSlug(null);
      }, 200);
    }
  };

  const toggleBrandSubmenu = (slug) => {
    setActiveProductSlug((prev) => (prev === slug ? null : slug));
  };

  const handleLinkClick = () => {
    setOpen(false);
    setServiceOpen(false);
    setActiveProductSlug(null);
    clearTimeout(timeoutRef.current);
  };

  return (
    <nav className="navbar">
      {/* Hamburger button */}
      <button
        className="hamburger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <IoMenu />
      </button>

      <nav
        id="navmenu"
        className={`navmenu ${open ? 'active' : ''}`}
        role="navigation"
      >
        <ul className="nav-root">
          {/* Home */}
          <li>
            <Link
              href="/"
              className={isActive('/') ? 'active' : ''}
              onClick={handleLinkClick}
            >
              {messages.home}
            </Link>
          </li>

          {/* Products */}
          <li
            className={`dropdown ${isInProductsSection ? 'active' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="dropdown-header">
              <Link
                href="/products"
                className={isInProductsSection ? 'active' : ''}
                onClick={handleLinkClick}
                style={{ flexGrow: 1, textDecoration: 'none' }}
              >
                {messages.serviceproduct}
              </Link>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setServiceOpen((prev) => !prev);
                }}
                aria-label="Toggle submenu"
                aria-expanded={serviceOpen}
                className="dropdown-toggle-button"
              >
                {serviceOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </button>
            </div>

            {serviceOpen && (
              <ul className="dropdown-menu level-1">
                {products.map((product) => {
                  const isOpen = activeProductSlug === product.slug;

                  return (
                    <li
                      key={product.slug}
                      className="dropdown-item"
                      onMouseEnter={() =>
                        !isMobile && setActiveProductSlug(product.slug)
                      }
                      onMouseLeave={() =>
                        !isMobile && setActiveProductSlug(null)
                      }
                    >
                      <div
                        className="dropdown-header"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {/*  หมวดหมู่: เมื่อผู้ใช้คลิกหมวดหมู่ จะส่ง query ?categories=... ไปยังหน้า products */}
                        <Link
                          href={`/products?categories=${product.slug}`} //  กำหนดลิงก์ไปยังหน้าสินค้าตาม slug ของหมวดหมู่
                          className={`dropdown-toggle ${isOpen ? 'hovered' : ''}`} //  เพิ่มคลาสเมื่อเมนูเปิด เพื่อเปลี่ยนสไตล์
                          onClick={handleLinkClick} //  ฟังก์ชันที่จัดการเหตุการณ์เมื่อคลิกลิงก์ (เช่น ปิดเมนู dropdown)
                          style={{ flexGrow: 1, textDecoration: 'none' }} //  ทำให้ลิงก์ขยายเต็มพื้นที่และตัดเส้นใต้ข้อความ
                        >
                          {/*  แสดงชื่อหมวดหมู่: สลับภาษาไทย/อังกฤษ ตาม locale ปัจจุบัน */}
                          {locale === 'th'
                            ? product.name.th  
                            : product.name.en} 
                        </Link>

                        {/*  ปุ่มลูกศรเปิด/ปิดเมนูยี่ห้อ (เฉพาะบนมือถือเท่านั้น) */}
                        {isMobile && product.brands.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault(); //  ป้องกันการรีเฟรชหน้าเมื่อคลิก
                              toggleBrandSubmenu(product.slug); //  เปิด/ปิดเมนูย่อยของยี่ห้อในหมวดหมู่นี้
                            }}
                            aria-label="Toggle brand submenu" //  เพิ่มคำอธิบายเพื่อช่วยการเข้าถึง (Accessibility)
                            aria-expanded={isOpen} //  ระบุสถานะเปิด/ปิดของเมนู
                            className="dropdown-toggle-button" //  ใช้คลาสสำหรับสไตล์ปุ่มลูกศร
                          >
                            {/*  สลับไอคอนขึ้น/ลงตามสถานะเปิดเมนู */}
                            {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                          </button>
                        )}
                      </div>

                      {/*  เมนูย่อยแสดง “ยี่ห้อสินค้า” (brand submenu) เมื่อเปิดอยู่ */}
                      {isOpen && product.brands.length > 0 && (
                        <ul className="brand-submenu">
                          {product.brands.map((brand, index) => (
                            <li key={`${product.slug}-${brand.slug}-${index}`}>
                              {/*  เมื่อคลิกยี่ห้อ จะส่ง query ทั้งหมวดหมู่และยี่ห้อไปยังหน้า /products */}
                              <Link
                                href={`/products?categories=${product.slug}&brands=${brand.slug}`} //  ตัวอย่าง: /products?categories=solar-rooftop&brands=huawei
                                onClick={handleLinkClick} // ปิด dropdown หลังจากคลิก
                              >
                                {brand.name} {/*  แสดงชื่อยี่ห้อ */}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Faq */}
          <li>
            <Link
              href="/Faq"
              className={isActive('/Faq') ? 'active' : ''}
              onClick={handleLinkClick}
            >
              {messages.faq}
            </Link>
          </li>

          {/* Portfolio */}
          <li>
            <Link
              href="/portfolio"
              className={isActive('/portfolio') ? 'active' : ''}
              onClick={handleLinkClick}
            >
              {messages.portfolio}
            </Link>
          </li>

          {/* Review */}
          <li>
            <Link
              href="/review"
              className={isActive('/review') ? 'active' : ''}
              onClick={handleLinkClick}
            >
              {messages.review}
            </Link>
          </li>

          {/* Editorial */}
          <li>
            <Link
              href="/editorial"
              className={isActive('/editorial') ? 'active' : ''}
              onClick={handleLinkClick}
            >
              {messages.editorial}
            </Link>
          </li>
        </ul>
      </nav>
    </nav>
  );
}
