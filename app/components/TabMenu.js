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

/*  Category slug */
const slugifyCategory = (name) =>
  name?.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "";

/*  Normalize Brand → คืน slug ที่ถูกต้อง */
const normalizeBrandSlug = (name) => {
  if (!name) return '';
  const cleaned = name.toLowerCase().trim();
  const mapping = {
    huawel: 'huawei',
    huwei: 'huawei',
    huwail: 'huawei',
    hweai: 'huawei',
    huawei: 'huawei',
    growatt: 'growatt',
    growwat: 'growatt',
    growat: 'growatt',
    deye: 'deye',
    daye: 'deye',
    sinclare: 'sinclair',
    sinclair: 'sinclair',
  };
  return mapping[cleaned] || cleaned.replace(/\s+/g, "-");
};

export default function TabMenu() {
  const { messages, locale } = useLocale();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [activeProductSlug, setActiveProductSlug] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState([]);

  const timeoutRef = useRef(null);

  /*  เช็ค Active ของเมนู */
  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const isInProductsSection = pathname.startsWith('/products');

  /* =========================================================
     รวม useEffect → เหลือแค่ 1 อันตามที่ขอ
  ========================================================= */
  useEffect(() => {
    //  โหลดข้อมูล Product Header
    const cached = sessionStorage.getItem('menuProducts');
    if (cached) {
      setProducts(JSON.parse(cached));
    } else {
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
              const uniqueBrands = item.Brand?.filter((b) => {
                if (seen.has(b.productbrandname)) return false;
                seen.add(b.productbrandname);
                return true;
              }) || [];

              return {
                slug: slugifyCategory(item.producttypenameEN),
                name: {
                  th: item.producttypenameTH?.trim() || '',
                  en: item.producttypenameEN?.trim() || '',
                },
                brands: uniqueBrands.map((b) => ({
                  slug: normalizeBrandSlug(b.productbrandname),
                  name: b.productbrandname.trim(),
                })),
              };
            });

            setProducts(formatted);
            sessionStorage.setItem('menuProducts', JSON.stringify(formatted));
          }
        } catch (err) {
          console.error('Error loading menu products:', err);
        }
      };
      fetchProducts();
    }

    //  เช็ค mobile
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 991px)').matches);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  /* ============================
     Hover บน Desktop
  ============================ */
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

  /* =========================================================
     RENDER START
  ========================================================= */
  return (
    <nav className="navbar">
      <button
        className="hamburger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <IoMenu />
      </button>

      <nav id="navmenu" className={`navmenu ${open ? 'active' : ''}`}>
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
              >
                {messages.serviceproduct}
              </Link>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setServiceOpen((prev) => !prev);
                }}
                className="dropdown-toggle-button"
              >
                {serviceOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </button>
            </div>

            {/* Dropdown */}
            {serviceOpen && (
              <ul className="dropdown-menu level-1">
                {products.map((product) => {
                  const isOpen = activeProductSlug === product.slug;

                  return (
                    <li
                      key={product.slug}
                      className="dropdown-item"
                      onMouseEnter={() => !isMobile && setActiveProductSlug(product.slug)}
                      onMouseLeave={() => !isMobile && setActiveProductSlug(null)}
                    >
                      <div className="dropdown-header">
                        <Link
                          href={`/products?categories=${product.slug}`}
                          onClick={handleLinkClick}
                          className={`${isOpen ? 'hovered' : ''}`}
                        >
                          {locale === 'th' ? product.name.th : product.name.en}
                        </Link>

                        {isMobile && product.brands.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleBrandSubmenu(product.slug);
                            }}
                            className="dropdown-toggle-button"
                          >
                            {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                          </button>
                        )}
                      </div>

                      {isOpen && product.brands.length > 0 && (
                        <ul className="brand-submenu">
                          {product.brands.map((brand, index) => (
                            <li key={`${product.slug}-${brand.slug}-${index}`}>
                              <Link
                                href={`/products?categories=${product.slug}&brands=${brand.slug}`}
                                onClick={handleLinkClick}
                              >
                                {brand.name}
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

          {/* Other Menus */}
          <li>
            <Link href="/Faqsolar" className={isActive('/Faqsolar') ? 'active' : ''} onClick={handleLinkClick}>
              {messages.faq}
            </Link>
          </li>
          <li>
            <Link href="/portfolio" className={isActive('/portfolio') ? 'active' : ''} onClick={handleLinkClick}>
              {messages.portfolio}
            </Link>
          </li>
          <li>
            <Link href="/review" className={isActive('/review') ? 'active' : ''} onClick={handleLinkClick}>
              {messages.review}
            </Link>
          </li>
          <li>
            <Link href="/editorialsolar" className={isActive('/editorialsolar') ? 'active' : ''} onClick={handleLinkClick}>
              {messages.editorial}
            </Link>
          </li>
        </ul>
      </nav>
    </nav>
  );
}
